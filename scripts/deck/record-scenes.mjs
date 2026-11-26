
import { chromium } from 'playwright';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, rm, stat, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const TMP = path.join(process.env.DECK_TMP || path.join(os.tmpdir(), 'deck-frames'));
const SW_ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const DEVICES = {
  desktop: { viewport: { width: 1280, height: 800 }, dpr: 1, frame: [1280, 800], encodeW: 1280, maxBytes: 4 * 1024 * 1024 },
  'desktop-hd': { viewport: { width: 1440, height: 900 }, dpr: 1, frame: [1440, 900], encodeW: 1440, maxBytes: 4 * 1024 * 1024 },
  'desktop-fhd': { viewport: { width: 1920, height: 1200 }, dpr: 1, frame: [1920, 1200], encodeW: 1600, maxBytes: 4 * 1024 * 1024 },
  'desktop-hd2': {
    viewport: { width: 1440, height: 900 }, dpr: 2, frame: [2880, 1800], encodeW: 960, maxBytes: 4 * 1024 * 1024,
    native: true, windowH: 987, quality: 75,
  },
  'desktop-43': {
    viewport: { width: 1200, height: 900 }, dpr: 2, frame: [2400, 1800], encodeW: 960, maxBytes: 4 * 1024 * 1024,
    native: true, windowH: 987, quality: 75,
  },
  'desktop-43w': { viewport: { width: 1440, height: 1080 }, dpr: 1, frame: [1440, 1080], encodeW: 960, maxBytes: 4 * 1024 * 1024 },
  'tablet-hd2': {
    viewport: { width: 820, height: 900 }, dpr: 2, frame: [1640, 1800], encodeW: 960, maxBytes: 4 * 1024 * 1024,
    native: true, windowH: 987, quality: 75,
  },
  mobile: {
    viewport: { width: 390, height: 844 }, dpr: 2, frame: [390, 844], encodeW: 520,
    maxBytes: 2.5 * 1024 * 1024, mobile: true, ua: IPHONE_UA,
  },
};
const FPS = 30;
const CRF_START = 26;
const CRF_MAX = 30;
const MIN_FPS = 8;
const MIN_LUMA = 10;
const NET_TRIES = 3;
const POINTER_OPS = new Set(['move', 'hover', 'click', 'drag', 'orbit', 'seekHit']);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pace = (t) => sleep(Math.max(0, t - Date.now()));
const easeInOut = (t) => (1 - Math.cos(Math.PI * t)) / 2;
const dragEase = (t) => (t < 0.2 ? (t * t) / 0.4 : 0.1 + (t - 0.2)) / 0.9;
const lerp = (a, b, k) => a + (b - a) * k;
const r2 = (n) => Math.round(n * 100) / 100;


function scrollTargetFn(spec) {
  if (typeof spec === 'number') return spec;
  const el = document.querySelector(spec.selector);
  if (!el) throw new Error('scroll: seletor não encontrado: ' + spec.selector);
  const box = el.parentElement && el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el;
  const r = box.getBoundingClientRect();
  const vh = window.innerHeight;
  const base = spec.at === 'bottom' ? r.bottom + window.scrollY - vh : r.top + window.scrollY;
  const max = document.documentElement.scrollHeight - vh;
  const y = base + (spec.offsetVh || 0) * vh + (spec.offsetPx || 0);
  return Math.round(Math.min(max, Math.max(0, y)));
}

function scrollAnimFn({ from, to, ms, ease }) {
  return new Promise((resolve) => {
    const go = (y) => window.scrollTo({ top: y, behavior: 'instant' });
    if (!ms) { go(to); resolve(); return; }
    const a = 0.06;
    const soft = (t) => (t <= a ? (t * t) / (2 * a) / (1 - a)
      : t <= 1 - a ? (a / 2 + (t - a)) / (1 - a)
        : 1 - ((1 - t) * (1 - t)) / (2 * a) / (1 - a));
    const k = ease === 'soft' ? soft : (t) => (1 - Math.cos(Math.PI * t)) / 2;
    const t0 = performance.now();
    const guard = setTimeout(() => { go(to); resolve(); }, ms + 1500);
    const step = (now) => {
      const t = Math.min(1, Math.max(0, (now - t0) / ms));
      go(from + (to - from) * k(t));
      if (t < 1) requestAnimationFrame(step);
      else { clearTimeout(guard); resolve(); }
    };
    requestAnimationFrame(step);
  });
}

function hitFn({ selector, cls }) {
  return !!document.querySelector(selector)?.classList.contains(cls);
}


class Recorder {
  constructor(cdp, dir, [maxWidth, maxHeight], quality = 90) {
    this.quality = quality;
    this.cdp = cdp;
    this.dir = dir;
    this.size = { maxWidth, maxHeight };
    this.active = false;
    this.seq = 0;
    this.frames = [];
    this.writes = [];
    this.t0 = 0;
    this.t1 = 0;
    cdp.on('Page.screencastFrame', (f) => this.onFrame(f));
  }

  onFrame(f) {
    this.cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
    const ts = f.metadata?.timestamp ?? Date.now() / 1000;
    if (!this.active || ts < this.t0) return;
    const file = path.join(this.dir, `f_${String(++this.seq).padStart(6, '0')}.jpg`);
    this.frames.push({ file, ts });
    this.writes.push(writeFile(file, Buffer.from(f.data, 'base64')));
  }

  async start() {
    this.active = true;
    await this.restart();
  }

  async restart() {
    this.frames = [];
    this.t0 = Date.now() / 1000;
    await this.cdp.send('Page.stopScreencast').catch(() => {});
    await this.cdp.send('Page.startScreencast', { format: 'jpeg', quality: this.quality, everyNthFrame: 1, ...this.size });
  }

  async stop() {
    if (!this.active) return;
    this.active = false;
    this.t1 = Date.now() / 1000;
    await this.cdp.send('Page.stopScreencast').catch(() => {});
    await Promise.all(this.writes);
  }
}


function skipped(op, env, motivo) {
  env.warnings.push(`${op.op} pulado (${motivo}): ${JSON.stringify(op).slice(0, 120)}`);
}

async function boxOf(page, selector, nth = 0) {
  const loc = page.locator(selector).nth(nth);
  await loc.waitFor({ state: 'visible', timeout: 20000 });
  const box = await loc.boundingBox();
  if (!box) throw new Error(`sem caixa para ${selector}`);
  return box;
}

async function resolve(t, env) {
  if (t.var !== undefined) return env.vars[t.var] ?? null;
  if (typeof t.x === 'number') return { x: t.x, y: t.y };
  if (!t.selector) throw new Error('alvo sem selector nem x,y: ' + JSON.stringify(t));
  const b = await boxOf(env.page, t.selector, t.nth);
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}

async function fire(env, promise) {
  env.inflight.push(promise);
  if (env.inflight.length > 3) await env.inflight.shift();
}
async function flush(env) {
  await Promise.all(env.inflight.splice(0));
}

async function step(env, at, last, send) {
  await pace(at);
  if (!last && Date.now() - at > 16) return;
  await fire(env, send());
}

async function moveMouse(env, to, ms) {
  const from = env.mouse ?? to;
  const n = Math.max(1, Math.round(ms / 16));
  const t0 = Date.now();
  for (let i = 1; i <= n; i++) {
    const k = easeInOut(i / n);
    await step(env, t0 + (i * ms) / n, i === n,
      () => env.page.mouse.move(lerp(from.x, to.x, k), lerp(from.y, to.y, k)));
  }
  await flush(env);
  env.mouse = to;
}

const OPS = {
  async goto(op, env) {
    const url = op.url ?? env.cfg.url;
    if (!env.rec.active) {
      await env.page.goto(url, { waitUntil: 'load', timeout: 60000 });
      return;
    }
    await env.page.goto(url, { waitUntil: 'commit', timeout: 60000 });
    await env.rec.restart();
    await env.page.waitForLoadState('load', { timeout: 60000 });
  },

  async wait(op) {
    await sleep(op.ms);
  },

  async waitFor(op, env) {
    await env.page.waitForSelector(op.selector, { state: 'attached', timeout: op.timeout ?? 30000 });
  },

  async scroll(op, env) {
    const to = await env.page.evaluate(scrollTargetFn, op.to);
    const from = await env.page.evaluate(() => window.scrollY);
    const ms = op.speed ? (Math.abs(to - from) / op.speed) * 1000 : op.ms ?? 0;
    await env.page.evaluate(scrollAnimFn, { from, to, ms, ease: op.ease });
  },

  async move(op, env) {
    const p = await resolve(op.to, env);
    if (!p) return skipped(op, env, 'alvo indisponível');
    await moveMouse(env, p, op.ms ?? 600);
  },

  async hover(op, env) {
    const p = await resolve(op, env);
    if (!p) return skipped(op, env, 'alvo indisponível');
    await moveMouse(env, p, op.moveMs ?? 400);
    await sleep(op.ms ?? 500);
  },

  async click(op, env) {
    const p = await resolve(op, env);
    if (!p) return skipped(op, env, 'alvo indisponível');
    await moveMouse(env, p, op.moveMs ?? 400);
    await env.page.mouse.down();
    await sleep(60);
    await env.page.mouse.up();
  },

  async drag(op, env) {
    const { page, cdp } = env;
    let from = env.mouse;
    if (op.from) {
      from = await resolve(op.from, env);
      if (!from) return skipped(op, env, 'alvo indisponível');
      await moveMouse(env, from, op.moveMs ?? 400);
    }
    if (!from) throw new Error('drag sem origem: informe from ou mova o mouse antes');
    const to = { x: from.x + op.by.dx, y: from.y + op.by.dy };
    const ms = op.ms ?? 1000;
    const n = Math.max(1, Math.round(ms / 16));
    const t0 = Date.now();
    if (op.touch) {
      const tp = (p) => [{ x: p.x, y: p.y, id: 1 }];
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp(from) });
      for (let i = 1; i <= n; i++) {
        const k = dragEase(i / n);
        await step(env, t0 + (i * ms) / n, i === n, () => cdp.send('Input.dispatchTouchEvent', {
          type: 'touchMove', touchPoints: tp({ x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k) }),
        }));
      }
      await flush(env);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else {
      await page.mouse.down();
      for (let i = 1; i <= n; i++) {
        const k = dragEase(i / n);
        await step(env, t0 + (i * ms) / n, i === n,
          () => page.mouse.move(lerp(from.x, to.x, k), lerp(from.y, to.y, k)));
      }
      await flush(env);
      await page.mouse.up();
    }
    env.mouse = to;
  },

  async press(op, env) {
    await env.page.keyboard.press(op.key);
  },

  async type(op, env) {
    await env.page.keyboard.type(op.text, { delay: op.delay ?? 70 });
  },

  async css(op, env) {
    await env.page.addStyleTag({ content: op.text });
  },

  async orbit(op, env) {
    const b = await boxOf(env.page, op.selector, op.nth);
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;
    const pad = op.pad ?? 24;
    const rx = b.width / 2 + pad;
    const ry = b.height / 2 + pad;
    const at = (a) => ({ x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) });
    const a0 = -Math.PI / 2;
    await moveMouse(env, at(a0), op.moveMs ?? 400);
    const ms = op.ms ?? 2500;
    const n = Math.round(ms / 16);
    const t0 = Date.now();
    for (let i = 1; i <= n; i++) {
      const p = at(a0 + 2 * Math.PI * (op.turns ?? 1) * (i / n));
      await step(env, t0 + (i * ms) / n, i === n, () => env.page.mouse.move(p.x, p.y));
    }
    await flush(env);
    env.mouse = at(a0 + 2 * Math.PI * (op.turns ?? 1));
  },

  async seekHit(op, env) {
    const b = await boxOf(env.page, op.selector);
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;
    const offsets = op.offsets ?? [[0, 0], [-80, 0], [80, 0], [0, -80], [0, 80], [-80, 80]];
    for (let i = 0; i < offsets.length; i++) {
      const p = { x: cx + offsets[i][0], y: cy + offsets[i][1] };
      await moveMouse(env, p, op.moveMs ?? 220);
      await sleep(120);
      await env.page.mouse.move(p.x, p.y);
      if (await env.page.evaluate(hitFn, { selector: op.selector, cls: op.hitClass })) {
        env.vars[op.as] = p;
        env.log(`seekHit ${op.as}: acerto na tentativa ${i + 1}`);
        return;
      }
    }
    env.warnings.push(`seekHit ${op.as}: nenhum ponto com .${op.hitClass} em ${offsets.length} tentativas`);
  },
};

async function runOps(list, env) {
  for (const op of list ?? []) {
    const fn = OPS[op.op];
    if (!fn) throw new Error(`op desconhecida: ${op.op}`);
    const t = Date.now();
    await fn(op, env);
    if (process.env.DECK_TRACE) console.log(`   ${Date.now() - t}ms ${JSON.stringify(op).slice(0, 90)}`);
  }
}


const SOFT_A = 0.06;
const softEase = (t) => (t <= SOFT_A ? (t * t) / (2 * SOFT_A) / (1 - SOFT_A)
  : t <= 1 - SOFT_A ? (SOFT_A / 2 + (t - SOFT_A)) / (1 - SOFT_A)
    : 1 - ((1 - t) * (1 - t)) / (2 * SOFT_A) / (1 - SOFT_A));
const sineEase = (t) => (1 - Math.cos(Math.PI * t)) / 2;
const CALIB_FRAMES = 30;


const CHAT_STATE = () => {
  const input = document.querySelector('textarea[name="diag-reply"]');
  const send = document.querySelector('button.muse-diag__send');
  const ai = [...document.querySelectorAll('.muse-bubble--ai')];
  const last = ai.at(-1);
  const choices = [...document.querySelectorAll('.muse-diag__choices > button')].map((b, i) => ({
    i,
    text: (b.textContent || '').trim(),
    forbidden: /aplic|apply|enviar|submit|contato|e-?mail|telefone|whats|phone|agendar|book/i.test(
      (b.textContent || '') + ' ' + b.outerHTML.slice(0, 300),
    ),
  }));
  return {
    rows: ai.length,
    lastText: last ? (last.textContent || '') : '',
    inputEnabled: !!input && !input.disabled,
    sendEnabled: !!send && !send.disabled,
    choices,
    finish: choices.some((c) => /pode mostrar o diagn/i.test(c.text)),
    solution: !!document.querySelector('.muse-diag__row--sol .muse-diag__map'),
  };
};

async function runChat(op, env, frame, fps) {
  const { page } = env;
  const input = op.input ?? 'textarea[name="diag-reply"]';
  const sendSel = op.send ?? 'button.muse-diag__send';
  const messages = op.messages ?? [];
  const maxTurns = op.maxTurns ?? 10;
  const timeoutMs = op.replyTimeoutMs ?? 240000;
  const state = () => page.evaluate(CHAT_STATE);
  const clickChoice = (i) => page.evaluate((idx) => document.querySelectorAll('.muse-diag__choices > button')[idx]?.click(), i);
  let answered = 0;
  for (let turn = 0; turn < maxTurns; turn++) {
    const s = await state();
    if (s.finish) {
      const fin = s.choices.find((c) => /pode mostrar o diagn/i.test(c.text));
      await clickChoice(fin.i);
      env.log(`chat: pediu o diagnóstico após ${turn} turnos`);
      break;
    }
    if (!s.inputEnabled) {
      const safe = s.choices.find((c) => !c.forbidden);
      if (!safe) throw new Error('chat: sem campo e sem opção segura');
      await clickChoice(safe.i);
    } else {
      const text = messages[answered] ?? 'Pode seguir, por favor.';
      answered++;
      await page.focus(input);
      for (const ch of text) {
        await page.keyboard.type(ch);
        await frame();
        await frame();
      }
      await page.evaluate((sel) => document.querySelector(sel)?.click(), sendSel);
      env.log(`chat: turno ${turn + 1} enviado (${text.length} caracteres)`);
    }
    const before = (await state()).lastText;
    const t0 = Date.now();
    for (;;) {
      if (Date.now() - t0 > timeoutMs) throw new Error('chat: a resposta não começou no tempo limite');
      await sleep(250);
      const cur = await state();
      if (cur.lastText !== before) break;
    }
    let changed = Date.now();
    let last = '';
    for (;;) {
      if (Date.now() - t0 > timeoutMs * 2) throw new Error('chat: a resposta não terminou no tempo limite');
      await frame();
      const cur = await state();
      if (cur.lastText !== last) { last = cur.lastText; changed = Date.now(); }
      if ((cur.inputEnabled || cur.finish) && Date.now() - changed > 800) break;
    }
    for (let i = 0; i < Math.round(((op.holdMs ?? 800) * fps) / 1000); i++) await frame();
    const done = await state();
    env.log(`chat: IA (${done.lastText.length} car.): ${done.lastText.slice(-160).replace(/\s+/g, ' ')} | opções: ${done.choices.map((c) => c.text).join(' / ') || '-'}`);
  }
  const t1 = Date.now();
  while (!(await state()).solution) {
    if (Date.now() - t1 > (op.solutionTimeoutMs ?? 240000)) throw new Error('chat: o mapa da solução não apareceu');
    await sleep(300);
  }
}

async function runStepped(list, env, fps, dev) {
  const { page, cdp } = env;
  const dir = env.rec.dir;
  const frames = [];
  const writes = [];
  const calib = [];
  const st = { ms: 0, rate: 1 };
  await cdp.send('Animation.enable').catch(() => {});
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  const frame = async (pre) => {
    const t0 = Date.now();
    if (pre) await pre();
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(1)))));
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
    const file = path.join(dir, `s_${String(frames.length + 1).padStart(6, '0')}.jpg`);
    writes.push(writeFile(file, Buffer.from(data, 'base64')));
    frames.push({ file, ts: frames.length / fps });
    const dt = Date.now() - t0;
    st.ms += dt;
    if (frames.length <= CALIB_FRAMES) calib.push(dt);
    if (frames.length === CALIB_FRAMES) {
      const mean = calib.reduce((a, b) => a + b, 0) / calib.length;
      st.rate = (1000 / fps) / mean;
      await cdp.send('Animation.setPlaybackRate', { playbackRate: st.rate }).catch(() => {});
    }
  };
  const framesFor = (ms) => Math.max(1, Math.round((ms * fps) / 1000));
  try {
    for (const op of list ?? []) {
      if (op.op === 'wait') {
        for (let i = 0; i < framesFor(op.ms); i++) await frame();
      } else if (op.op === 'scroll') {
        let from, to;
        if (op.container) {
          const r = await page.evaluate(([c, sel, off]) => {
            const box = document.querySelector(c);
            const el = document.querySelector(sel);
            if (!box || !el) return null;
            const max = box.scrollHeight - box.clientHeight;
            const y = box.scrollTop + el.getBoundingClientRect().top - box.getBoundingClientRect().top - off;
            return { from: box.scrollTop, to: Math.max(0, Math.min(max, Math.round(y))) };
          }, [op.container, op.to.selector, op.to.offsetPx ?? 0]);
          if (!r) throw new Error(`scroll: container ou alvo não encontrado: ${op.container}`);
          ({ from, to } = r);
        } else {
          to = await page.evaluate(scrollTargetFn, op.to);
          from = await page.evaluate(() => window.scrollY);
        }
        const n = op.speed ? framesFor((Math.abs(to - from) / op.speed) * 1000) : framesFor(op.ms ?? 0);
        const k = op.ease === 'soft' ? softEase : sineEase;
        for (let i = 1; i <= n; i++) {
          const y = Math.round(from + (to - from) * k(i / n));
          if (op.container) {
            await frame(() => page.evaluate(([c, v]) => { document.querySelector(c).scrollTop = v; return 1; }, [op.container, y]));
          } else {
            await frame(() => page.evaluate((v) => { window.scrollTo({ top: v, behavior: 'instant' }); return 1; }, y));
          }
        }
      } else if (op.op === 'carousel') {
        const exists = await page.evaluate((sel) => !!document.querySelector(sel), op.next);
        if (!exists) throw new Error(`carousel: botão não encontrado: ${op.next}`);
        const per = framesFor(op.perItemMs ?? 1200);
        for (let it = 1; it <= (op.items ?? 1); it++) {
          if (it > 1) {
            const ok = await page.evaluate((sel) => {
              const b = document.querySelector(sel);
              if (!b || b.disabled || b.getAttribute('aria-disabled') === 'true') return false;
              b.click();
              return true;
            }, op.next);
            if (!ok) { env.log(`carousel: botão desabilitado no item ${it}, parando`); break; }
          }
          for (let i = 0; i < per; i++) await frame();
        }
      } else if (op.op === 'move' || op.op === 'click') {
        const p = await resolve(op.to ?? op, env);
        if (!p) throw new Error(`${op.op}: alvo indisponível`);
        const from = env.mouse ?? p;
        const n = framesFor(op.moveMs ?? 500);
        for (let i = 1; i <= n; i++) {
          const k = easeInOut(i / n);
          await frame(() => page.mouse.move(lerp(from.x, p.x, k), lerp(from.y, p.y, k)));
        }
        env.mouse = p;
        if (op.op === 'click') {
          await frame(() => page.mouse.down());
          await frame(() => page.mouse.up());
        }
      } else if (op.op === 'chat') {
        await runChat(op, env, frame, fps);
      } else if (op.op === 'press') {
        await frame(() => page.keyboard.press(op.key));
      } else if (op.op === 'css') {
        await OPS.css(op, env);
      } else {
        throw new Error(`op ${op.op} não suportada no modo stepped`);
      }
    }
  } finally {
    await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 }).catch(() => {});
  }
  await Promise.all(writes);
  const real = frames.length / (st.ms / 1000);
  env.log(`captura: ${frames.length} quadros, ${(st.ms / frames.length).toFixed(1)} ms por quadro (~${real.toFixed(1)} quadros/s reais), taxa de animações CSS ${st.rate.toFixed(3)}`);
  return frames;
}


function timeline(frames, t0, t1) {
  if (!frames.length) throw new Error('nenhum frame capturado');
  const sorted = [...frames].sort((a, b) => a.ts - b.ts);
  const clamp = (ts) => Math.min(Math.max(ts, t0), t1);
  return sorted.map((f, i) => {
    const start = i === 0 ? t0 : clamp(f.ts);
    const last = i + 1 === sorted.length;
    const end = last ? t1 : clamp(sorted[i + 1].ts);
    return { file: f.file, dur: last ? Math.max(0.04, end - start) : Math.max(0.001, end - start) };
  });
}

async function encode(list, dev, out, crf, dir, seconds, crop, { fps = FPS, endFade = 0, seq = false } = {}) {
  let input;
  if (seq) {
    const seqDir = path.join(dir, `seq-${crf}`);
    await mkdir(seqDir, { recursive: true });
    for (let i = 0; i < list.length; i++) await symlink(list[i].file, path.join(seqDir, `seq_${String(i + 1).padStart(6, '0')}.jpg`));
    input = ['-framerate', String(fps), '-i', path.join(seqDir, 'seq_%06d.jpg')];
  } else {
    const lines = [];
    for (const it of list) lines.push(`file '${it.file}'`, `duration ${it.dur.toFixed(4)}`);
    lines.push(`file '${list[list.length - 1].file}'`);
    const listFile = path.join(dir, 'list.txt');
    await writeFile(listFile, lines.join('\n') + '\n');
    input = ['-f', 'concat', '-safe', '0', '-i', listFile];
  }
  let vf = `fps=${fps},scale=${dev.encodeW}:-2:flags=lanczos,format=yuv420p`;
  if (crop) {
    const { stdout } = await run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width', '-of', 'csv=p=0', list[0].file]);
    const k = Number(stdout.trim()) / dev.viewport.width;
    const cw = Math.round(crop.w * k), ch = Math.round(crop.h * k);
    const cx = Math.max(0, Math.round(crop.x * k)), cy = Math.max(0, Math.round(crop.y * k));
    vf = `fps=${fps},crop=${cw}:${ch}:${cx}:${cy},scale=960:720:flags=lanczos:in_range=full:out_range=limited,format=yuv420p`;
    console.log(`   crop ${cw}x${ch}+${cx}+${cy} (escala ${k}x)`);
  }
  const body = endFade ? out.replace(/\.mp4$/, '.body.mp4') : out;
  await run('ffmpeg', [
    '-y', '-v', 'error', ...input,
    '-vf', vf,
    '-t', seconds.toFixed(3),
    '-c:v', 'libx264', '-crf', String(crf), '-preset', 'slow', '-movflags', '+faststart', '-an', body,
  ], { maxBuffer: 16 * 1024 * 1024 });
  if (endFade) await fadeToStart(body, out, endFade, fps, crf, dir);
}

async function fadeToStart(body, out, endFade, fps, crf, dir) {
  const { seconds: d } = await probe(body);
  const f = endFade / 1000;
  const still = path.join(dir, 'first.png');
  await run('ffmpeg', ['-y', '-v', 'error', '-i', body, '-frames:v', '1', still]);
  await run('ffmpeg', [
    '-y', '-v', 'error', '-i', body, '-loop', '1', '-framerate', String(fps), '-t', f.toFixed(3), '-i', still,
    '-filter_complex',
    `[0:v]fps=${fps},format=yuv420p[a];[1:v]fps=${fps},format=yuv420p,setsar=1[b];` +
    `[a][b]xfade=transition=fade:duration=${f.toFixed(3)}:offset=${(d - f).toFixed(3)},format=yuv420p[v]`,
    '-map', '[v]',
    '-c:v', 'libx264', '-crf', String(crf), '-preset', 'slow', '-movflags', '+faststart', '-an', out,
  ], { maxBuffer: 16 * 1024 * 1024 });
  await rm(body, { force: true });
}

async function probe(file) {
  const { stdout } = await run('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', file,
  ]);
  const j = JSON.parse(stdout);
  return { width: j.streams[0].width, height: j.streams[0].height, seconds: r2(Number(j.format.duration)) };
}

async function meanLuma(files) {
  const step = Math.max(1, Math.floor(files.length / 6));
  const sample = files.filter((_, i) => i % step === 0).slice(0, 6);
  const vals = [];
  for (const f of sample) {
    const { stdout } = await run('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-i', f,
      '-vf', 'signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-', '-f', 'null', '-',
    ], { maxBuffer: 1024 * 1024 });
    const m = stdout.match(/lavfi\.signalstats\.YAVG=([\d.]+)/);
    if (m) vals.push(Number(m[1]));
  }
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}


const CURSOR_SCRIPT = `(() => {
  const montar = () => {
    if (document.getElementById('__deck-cursor')) return;
    const c = document.createElement('div');
    c.id = '__deck-cursor';
    c.setAttribute('popover', 'manual');
    c.style.cssText = 'position:fixed;inset:auto;left:0;top:0;margin:0;padding:0;width:22px;height:22px;border-radius:50%;' +
      'background:rgba(255,255,255,.92);border:2px solid rgba(0,0,0,.55);box-shadow:0 2px 10px rgba(0,0,0,.35);' +
      'pointer-events:none;z-index:2147483647;transform:translate(-100px,-100px);transition:scale .12s;overflow:visible';
    document.documentElement.appendChild(c);
    const topo = () => { try { c.hidePopover(); c.showPopover(); } catch {} };
    topo();
    addEventListener('mousemove', (e) => { c.style.transform = 'translate(' + (e.clientX - 11) + 'px,' + (e.clientY - 11) + 'px)'; }, true);
    addEventListener('mousedown', () => { c.style.scale = '0.75'; }, true);
    addEventListener('mouseup', () => { c.style.scale = '1'; setTimeout(topo, 60); setTimeout(topo, 400); }, true);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar); else montar();
})();`;

function needsPointer(scene) {
  return [...(scene.setup ?? []), ...scene.record].some((op) => POINTER_OPS.has(op.op));
}

async function capture(cfg, scene, dev, dir, browser) {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  const context = await browser.newContext({
    ...(dev.native ? { viewport: null } : { viewport: dev.viewport, deviceScaleFactor: dev.dpr }),
    isMobile: !!dev.mobile,
    hasTouch: !!dev.mobile,
    locale: 'pt-BR',
    ...(dev.ua ? { userAgent: dev.ua } : {}),
  });
  if (cfg.cookies?.length && !scene.noCookies) await context.addCookies(cfg.cookies);
  if (!dev.mobile && (scene.cursor ?? cfg.cursor)) await context.addInitScript(CURSOR_SCRIPT);
  if (scene.initScript) await context.addInitScript(scene.initScript);
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  const cdp = await context.newCDPSession(page);
  const rec = new Recorder(cdp, dir, dev.frame, dev.quality);
  const env = {
    cfg, page, cdp, rec, mouse: null, vars: {}, warnings: [], inflight: [],
    log: (m) => console.log(`   ${m}`),
  };
  try {
    if (!dev.mobile && needsPointer(scene)) {
      const c = { x: dev.viewport.width / 2, y: dev.viewport.height / 2 };
      await page.mouse.move(c.x, c.y);
      env.mouse = c;
    }
    if (scene.recordFromStart) await rec.start();
    await runOps(scene.setup, env);
    let crop = null;
    if (scene.crop) {
      const c = scene.crop;
      const b = c.selector ? await boxOf(page, c.selector) : { x: 0, y: 0 };
      crop = { x: b.x + (c.x ?? 0), y: b.y + (c.y ?? 0), w: c.w, h: c.w * 3 / 4 };
    }
    if (scene.stepped) {
      const sfps = scene.fps ?? FPS;
      const frames = await runStepped(scene.record, env, sfps, dev);
      return { frames, crop, t0: 0, t1: frames.length / sfps, warnings: env.warnings, pageErrors: pageErrors.length };
    }
    if (!scene.recordFromStart) await rec.start();
    await runOps(scene.record, env);
    await rec.stop();
    return { frames: rec.frames, crop, t0: rec.t0, t1: rec.t1, warnings: env.warnings, pageErrors: pageErrors.length };
  } finally {
    await rec.stop().catch(() => {});
    await context.close().catch(() => {});
  }
}

async function captureWithRetry(cfg, scene, dev, dir, browser) {
  for (let i = 1; ; i++) {
    try {
      return await capture(cfg, scene, dev, dir, browser);
    } catch (err) {
      if (i < NET_TRIES && /net::ERR_/.test(err.message)) {
        console.log(`[${scene.name}] rede caiu (tentativa ${i}/${NET_TRIES}), tentando de novo`);
        await sleep(3000);
        continue;
      }
      throw err;
    }
  }
}

async function updateManifest(outDir, cfg, entry) {
  const file = path.join(outDir, 'manifest.json');
  let m = { site: cfg.site, files: [] };
  try { m = JSON.parse(await readFile(file, 'utf8')); } catch 
  m.files = m.files.filter((f) => f.name !== entry.name);
  m.files.push(entry);
  const order = (n) => cfg.scenes.findIndex((s) => s.name === n);
  m.files.sort((a, b) => order(a.name) - order(b.name));
  await writeFile(file, JSON.stringify(m, null, 2) + '\n');
}

async function trimLeadingWhite(cap) {
  cap.frames.sort((a, b) => a.ts - b.ts);
  let k = 0;
  while (k < Math.min(10, cap.frames.length - 1) && (await meanLuma([cap.frames[k].file])) > 235) k++;
  if (k) {
    cap.frames = cap.frames.slice(k);
    cap.t0 = cap.frames[0].ts;
    console.log(`   aviso: ${k} frame(s) brancos no início descartados`);
  }
}

async function recordScene(cfg, scene, outDir, browsers) {
  const dev = DEVICES[scene.device ?? 'desktop'];
  if (!dev) throw new Error(`device desconhecido: ${scene.device}`);
  const modes = browsers.forceSw ? ['sw'] : ['gpu', 'sw'];
  const tries = [];
  try {
    for (const mode of modes) {
      const dir = path.join(TMP, scene.name, mode);
      const browser = await browsers.get(mode === 'sw', scene.device ?? 'desktop');
      const cap = await captureWithRetry(cfg, scene, dev, dir, browser);
      const seconds = cap.t1 - cap.t0;
      const fps = cap.frames.length / seconds;
      const luma = await meanLuma(cap.frames.map((f) => f.file));
      const ok = fps >= (scene.minFps ?? MIN_FPS) && luma >= MIN_LUMA;
      console.log(
        `[${scene.name}] ${mode}: ${cap.frames.length} frames em ${seconds.toFixed(1)}s, ` +
        `${fps.toFixed(1)} fps efetivos, luma ${luma.toFixed(0)}${ok ? '' : ' (reprova)'}`,
      );
      for (const w of cap.warnings) console.log(`   aviso: ${w}`);
      if (cap.pageErrors) console.log(`   ${cap.pageErrors} erro(s) de página`);
      tries.push({ mode, cap, fps, luma, ok, dir });
      if (ok) break;
    }
    const best = tries.find((t) => t.ok) ?? tries.reduce((a, b) => (b.fps > a.fps ? b : a));
    if (!best.ok) {
      throw new Error(
        `reprovada nos modos ${tries.map((t) => t.mode).join(' e ')}: ` +
        `fps ${best.fps.toFixed(1)} (mín ${MIN_FPS}), luma ${best.luma.toFixed(0)} (mín ${MIN_LUMA})`,
      );
    }

    await trimLeadingWhite(best.cap);
    const list = timeline(best.cap.frames, best.cap.t0, best.cap.t1);
    const gravado = best.cap.t1 - best.cap.t0;
    const out = path.join(outDir, `${scene.name}.mp4`);
    let crf = CRF_START;
    const outFps = scene.fps ?? FPS;
    for (;;) {
      await encode(list, dev, out, crf, best.dir, gravado, best.cap.crop, { fps: outFps, endFade: scene.endFade ?? 0, seq: !!scene.stepped });
      const bytes = (await stat(out)).size;
      if (bytes <= (best.cap.crop ? 1.4 * 1048576 : (scene.maxBytes ?? dev.maxBytes)) || crf >= CRF_MAX) break;
      console.log(`   ${(bytes / 1048576).toFixed(2)} MB com crf ${crf}, subindo o crf`);
      crf = Math.min(CRF_MAX, crf + 2);
    }
    const info = await probe(out);
    const bytes = (await stat(out)).size;
    if (Math.abs(info.seconds - gravado) > 0.25) {
      console.log(`   aviso: mp4 com ${info.seconds}s, gravação com ${gravado.toFixed(2)}s`);
    }
    const posterAt = scene.endFade ? 0 : info.seconds * 0.35;
    await run('ffmpeg', [
      '-y', '-v', 'error', '-ss', String(posterAt.toFixed(2)), '-i', out,
      '-frames:v', '1', '-vf', `scale=${info.width}:-2`, '-q:v', '5', path.join(outDir, `${scene.name}.jpg`),
    ]);
    const entry = {
      name: scene.name, device: scene.device ?? 'desktop', file: `${scene.name}.mp4`, poster: `${scene.name}.jpg`,
      width: info.width, height: info.height, seconds: info.seconds, bytes, crf, modo: best.mode,
      fps: r2(best.fps), outFps,
    };
    await updateManifest(outDir, cfg, entry);
    return entry;
  } finally {
    for (const t of tries) await rm(t.dir, { recursive: true, force: true });
  }
}


const [site, ...rest] = process.argv.slice(2);
if (!site) {
  console.error('uso: node scripts/deck/record-scenes.mjs <site> [cena ...] [--sw]');
  process.exit(2);
}
const forceSw = rest.includes('--sw');
const names = rest.filter((a) => !a.startsWith('--'));
const cfg = JSON.parse(await readFile(path.join(ROOT, 'scripts', 'deck', 'scenes', `${site}.json`), 'utf8'));
const scenes = names.length
  ? names.map((n) => cfg.scenes.find((s) => s.name === n) ?? (() => { console.error(`cena desconhecida: ${n}`); process.exit(2); })())
  : cfg.scenes;
const outDir = path.join(ROOT, cfg.outDir);
await mkdir(outDir, { recursive: true });

const pool = {};
const browsers = {
  forceSw,
  async get(sw, deviceName) {
    const dev = DEVICES[deviceName];
    const key = `${deviceName}-${sw ? 'sw' : 'gpu'}`;
    const winSize = `--window-size=${dev.viewport.width},${dev.windowH ?? dev.viewport.height}`;
    pool[key] ??= await chromium.launch({
      channel: 'chrome', headless: true, args: [...(sw ? SW_ARGS : []), winSize, ...(dev.native ? [`--force-device-scale-factor=${dev.dpr}`] : [])],
    });
    return pool[key];
  },
};

const results = [];
for (const scene of scenes) {
  const t = Date.now();
  console.log(`\n=== ${scene.name} (${scene.device ?? 'desktop'})`);
  try {
    const e = await recordScene(cfg, scene, outDir, browsers);
    results.push({ ...e, status: 'ok', secs: (Date.now() - t) / 1000 });
    console.log(`[${scene.name}] ok: ${e.seconds}s, ${e.width}x${e.height}, ${(e.bytes / 1048576).toFixed(2)} MB, crf ${e.crf}, modo ${e.modo}`);
  } catch (err) {
    results.push({ name: scene.name, status: 'FALHOU', error: err.message.split('\n')[0], secs: (Date.now() - t) / 1000 });
    console.log(`[${scene.name}] FALHOU: ${err.message.split('\n')[0]}`);
  }
}
await Promise.all(Object.values(pool).map((b) => b.close().catch(() => {})));

console.log('\ncena                 status   dur(s)  fps    MB     modo  erro');
for (const r of results) {
  const mb = r.bytes ? (r.bytes / 1048576).toFixed(2) : '-';
  console.log(
    `${r.name.padEnd(20)} ${r.status.padEnd(8)} ${String(r.seconds ?? '-').padEnd(7)} ${String(r.fps ?? '-').padEnd(6)} ${mb.padEnd(6)} ${String(r.modo ?? '-').padEnd(5)} ${r.error ?? ''}`,
  );
}
process.exitCode = results.every((r) => r.status === 'ok') ? 0 : 1;
