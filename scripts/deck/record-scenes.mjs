// Grava as cenas de um site para os decks de portfólio (ver scripts/deck/README.md).
//
//   node scripts/deck/record-scenes.mjs <site> [cena ...] [--sw]
//
// Lê scripts/deck/scenes/<site>.json e grava cada cena com o Chrome do sistema
// (channel 'chrome'). A captura é por CDP (Page.startScreencast), não por
// recordVideo: o recordVideo baixa qualidade e descarta frames em site pesado.
// --sw força SwiftShader. Sem a flag, a cena tenta a GPU e só recai para
// SwiftShader se sair com fps < 8 ou preta.

import { chromium } from 'playwright';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const TMP = path.join(process.env.DECK_TMP || path.join(os.tmpdir(), 'deck-frames'));
const SW_ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
// frame = tamanho máximo do screencast. O Chrome só entrega o frame inteiro
// quando --window-size bate com o viewport (senão corta a base ou reduz), e a
// janela é por instância: por isso um browser por dispositivo.
// O mobile sai 1x (390 de largura): o screencast não entrega device pixels.
const DEVICES = {
  desktop: { viewport: { width: 1280, height: 800 }, dpr: 1, frame: [1280, 800], encodeW: 1280, maxBytes: 4 * 1024 * 1024 },
  // mesma proporção (16:10) do desktop, para efeitos que só aparecem em telas maiores
  'desktop-hd': { viewport: { width: 1440, height: 900 }, dpr: 1, frame: [1440, 900], encodeW: 1440, maxBytes: 4 * 1024 * 1024 },
  // 16:10 em tela larga (1920), para ver menus e layouts que só cabem em monitores grandes
  'desktop-fhd': { viewport: { width: 1920, height: 1200 }, dpr: 1, frame: [1920, 1200], encodeW: 1600, maxBytes: 4 * 1024 * 1024 },
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
// arrasto: acelera nos primeiros 20% e solta em velocidade constante, para o
// pointerup chegar com velocidade (é o que dá inércia no tour e na fachada)
const dragEase = (t) => (t < 0.2 ? (t * t) / 0.4 : 0.1 + (t - 0.2)) / 0.9;
const lerp = (a, b, k) => a + (b - a) * k;
const r2 = (n) => Math.round(n * 100) / 100;

// ---------- funções executadas dentro da página (sem closures) ----------

// alvo do scroll: número (px) ou { selector, at, offsetVh, offsetPx }.
// offsets positivos descem a vista. Elemento pinado (GSAP) vive dentro de
// .pin-spacer: a extensão real do trecho é a do spacer, não a do elemento.
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

// timeline de scroll por rAF (easeInOutSine). Guarda de tempo: se o rAF
// parar, a promessa resolve mesmo assim.
function scrollAnimFn({ from, to, ms }) {
  return new Promise((resolve) => {
    const go = (y) => window.scrollTo({ top: y, behavior: 'instant' });
    if (!ms) { go(to); resolve(); return; }
    const t0 = performance.now();
    const guard = setTimeout(() => { go(to); resolve(); }, ms + 1500);
    const step = (now) => {
      const t = Math.min(1, Math.max(0, (now - t0) / ms));
      go(from + (to - from) * (1 - Math.cos(Math.PI * t)) / 2);
      if (t < 1) requestAnimationFrame(step);
      else { clearTimeout(guard); resolve(); }
    };
    requestAnimationFrame(step);
  });
}

function hitFn({ selector, cls }) {
  return !!document.querySelector(selector)?.classList.contains(cls);
}

// ---------- captura ----------

// Captura por CDP. Um frame só chega quando algo muda na tela, então a duração
// de cada frame vai do próprio timestamp até o próximo (ver timeline()).
class Recorder {
  constructor(cdp, dir, [maxWidth, maxHeight]) {
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

  // reinicia a captura e descarta o que já tinha. Necessário no commit de uma
  // navegação: o screencast não sobrevive à troca de documento.
  async restart() {
    this.frames = [];
    this.t0 = Date.now() / 1000;
    await this.cdp.send('Page.stopScreencast').catch(() => {});
    await this.cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, everyNthFrame: 1, ...this.size });
  }

  async stop() {
    if (!this.active) return;
    this.active = false;
    this.t1 = Date.now() / 1000;
    await this.cdp.send('Page.stopScreencast').catch(() => {});
    await Promise.all(this.writes);
  }
}

// ---------- ops ----------

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

// alvo: { selector, nth? } | { x, y } | { var } (ponto guardado por seekHit)
async function resolve(t, env) {
  if (t.var !== undefined) return env.vars[t.var] ?? null;
  if (typeof t.x === 'number') return { x: t.x, y: t.y };
  if (!t.selector) throw new Error('alvo sem selector nem x,y: ' + JSON.stringify(t));
  const b = await boxOf(env.page, t.selector, t.nth);
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}

// eventos de entrada não esperam o próprio roundtrip: em página pesada ele
// chega a 20–150 ms e o passo de 16 ms atrasaria o relógio. O pacing é o
// relógio; no máximo 3 eventos em voo (o Playwright mantém a ordem).
async function fire(env, promise) {
  env.inflight.push(promise);
  if (env.inflight.length > 3) await env.inflight.shift();
}
async function flush(env) {
  await Promise.all(env.inflight.splice(0));
}

// passo agendado pelo relógio. Se o roundtrip atrasou o passo (página pesada),
// descarta o intermediário: o último sempre sai, então a duração gravada bate
// com `ms` em vez de acumular atraso.
async function step(env, at, last, send) {
  await pace(at);
  if (!last && Date.now() - at > 16) return;
  await fire(env, send());
}

// move o mouse em trajetória suave (easeInOutSine, passos de ~16ms)
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
    // gravando: reinicia o screencast no commit e descarta o about:blank anterior
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
    await env.page.evaluate(scrollAnimFn, { from, to, ms: op.ms ?? 0 });
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

  // arrasto: sem `from`, continua de onde o mouse está (encadear dois arrastos)
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

  // digita no elemento com foco (clique no campo antes). delay em ms por tecla.
  async type(op, env) {
    await env.page.keyboard.type(op.text, { delay: op.delay ?? 70 });
  },

  // injeta uma <style> na página (esconde partes da interface numa cena). Vale em
  // setup e em record; some no próximo goto, que troca o documento.
  async css(op, env) {
    await env.page.addStyleTag({ content: op.text });
  },

  // mouse circulando em volta de um elemento (CTA magnético). Elipse que passa
  // `pad` px além das bordas do elemento.
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

  // procura um ponto de hover que acerte: move (sem clicar) pelos offsets até o
  // canvas ganhar a classe hitClass (o site marca is-hit quando há unidade sob
  // o ponteiro). Guarda o ponto em vars[as] para um click { var }.
  async seekHit(op, env) {
    const b = await boxOf(env.page, op.selector);
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;
    const offsets = op.offsets ?? [[0, 0], [-80, 0], [80, 0], [0, -80], [0, 80], [-80, 80]];
    for (let i = 0; i < offsets.length; i++) {
      const p = { x: cx + offsets[i][0], y: cy + offsets[i][1] };
      await moveMouse(env, p, op.moveMs ?? 220);
      // o site só recalcula o hover a cada 90ms: espera e toca de novo no ponto
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
    await fn(op, env);
  }
}

// ---------- ffmpeg ----------

// duração de cada frame: do próprio timestamp até o próximo. O primeiro começa
// em t0 (início da gravação); o último vai até t1 (fim da gravação). Os
// timestamps vêm do compositor e nem sempre chegam em ordem: ordena e prende
// em [t0, t1], senão a soma das durações infla (o tour saiu 30% mais longo).
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

// -t corta na duração gravada: o concat estende a última entrada (repetida sem
// duration, ver a instrução do concat) em ~0,2–0,5s a mais.
async function encode(list, dev, out, crf, dir, seconds) {
  const lines = [];
  for (const it of list) lines.push(`file '${it.file}'`, `duration ${it.dur.toFixed(4)}`);
  lines.push(`file '${list[list.length - 1].file}'`); // repetição do último file (bug do concat)
  const listFile = path.join(dir, 'list.txt');
  await writeFile(listFile, lines.join('\n') + '\n');
  await run('ffmpeg', [
    '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', listFile,
    '-vf', `fps=${FPS},scale=${dev.encodeW}:-2:flags=lanczos,format=yuv420p`,
    '-t', seconds.toFixed(3),
    '-c:v', 'libx264', '-crf', String(crf), '-preset', 'slow', '-movflags', '+faststart', '-an', out,
  ], { maxBuffer: 16 * 1024 * 1024 });
}

async function probe(file) {
  const { stdout } = await run('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', file,
  ]);
  const j = JSON.parse(stdout);
  return { width: j.streams[0].width, height: j.streams[0].height, seconds: r2(Number(j.format.duration)) };
}

// luma média (YAVG, 0–255) de até 6 frames espaçados. Frame preto fica abaixo de ~10.
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

// ---------- cena ----------

function needsPointer(scene) {
  return [...(scene.setup ?? []), ...scene.record].some((op) => POINTER_OPS.has(op.op));
}

async function capture(cfg, scene, dev, dir, browser) {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  const context = await browser.newContext({
    viewport: dev.viewport,
    deviceScaleFactor: dev.dpr,
    isMobile: !!dev.mobile,
    hasTouch: !!dev.mobile,
    locale: 'pt-BR',
    ...(dev.ua ? { userAgent: dev.ua } : {}),
  });
  // cookies opcionais do site (ex.: aceite essencial do banner de consentimento)
  // (a cena com "noCookies": true começa sem eles, para mostrar o banner de verdade)
  if (cfg.cookies?.length && !scene.noCookies) await context.addCookies(cfg.cookies);
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  const cdp = await context.newCDPSession(page);
  const rec = new Recorder(cdp, dir, dev.frame);
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
    if (!scene.recordFromStart) await rec.start();
    await runOps(scene.record, env);
    await rec.stop();
    return { frames: rec.frames, t0: rec.t0, t1: rec.t1, warnings: env.warnings, pageErrors: pageErrors.length };
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
  try { m = JSON.parse(await readFile(file, 'utf8')); } catch { /* primeiro run */ }
  m.files = m.files.filter((f) => f.name !== entry.name);
  m.files.push(entry);
  const order = (n) => cfg.scenes.findIndex((s) => s.name === n);
  m.files.sort((a, b) => order(a.name) - order(b.name));
  await writeFile(file, JSON.stringify(m, null, 2) + '\n');
}

// o documento novo pode pintar branco antes do CSS (commit da navegação): corta
// os primeiros frames brancos e começa a contar no primeiro frame escuro
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
      const ok = fps >= MIN_FPS && luma >= MIN_LUMA;
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
    for (;;) {
      await encode(list, dev, out, crf, best.dir, gravado);
      const bytes = (await stat(out)).size;
      if (bytes <= dev.maxBytes || crf >= CRF_MAX) break;
      console.log(`   ${(bytes / 1048576).toFixed(2)} MB com crf ${crf}, subindo o crf`);
      crf = Math.min(CRF_MAX, crf + 2);
    }
    const info = await probe(out);
    const bytes = (await stat(out)).size;
    if (Math.abs(info.seconds - gravado) > 0.25) {
      console.log(`   aviso: mp4 com ${info.seconds}s, gravação com ${gravado.toFixed(2)}s`);
    }
    await run('ffmpeg', [
      '-y', '-v', 'error', '-ss', String((info.seconds * 0.35).toFixed(2)), '-i', out,
      '-frames:v', '1', '-vf', `scale=${info.width}:-2`, '-q:v', '5', path.join(outDir, `${scene.name}.jpg`),
    ]);
    const entry = {
      name: scene.name, device: scene.device ?? 'desktop', file: `${scene.name}.mp4`, poster: `${scene.name}.jpg`,
      width: info.width, height: info.height, seconds: info.seconds, bytes, crf, modo: best.mode,
      fps: r2(best.fps),
    };
    await updateManifest(outDir, cfg, entry);
    return entry;
  } finally {
    for (const t of tries) await rm(t.dir, { recursive: true, force: true });
  }
}

// ---------- main ----------

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
    const winSize = `--window-size=${dev.viewport.width},${dev.viewport.height}`;
    pool[key] ??= await chromium.launch({
      channel: 'chrome', headless: true, args: [...(sw ? SW_ARGS : []), winSize],
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
