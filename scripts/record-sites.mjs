import { chromium } from 'playwright';
import { readdirSync, renameSync, rmSync, mkdirSync } from 'fs';

// Grava a navegação real de cada site em desktop e mobile.
// Saída: /tmp/live/<name>-<kind>.webm  → depois cortado por scripts/trim-by-marker.sh
//                                      → e convertido em webp por scripts/webm-to-webp.sh

const OUT = '/tmp/live';

const sites = [
  { url: 'https://yannsmusic.com/', name: 'yanns', capD: 3200, capM: 2800 },
  { url: 'https://yannsmusic.com/collections', name: 'yanns-collections', capD: 3600, capM: 3200 },
  { url: 'https://www.festivalcrato.pt/', name: 'festivalcrato', capD: 3000, capM: 2600 },
  { url: 'https://wauw.cv/', name: 'wauw', capD: 3000, capM: 2600 },
  { url: 'https://jsynq.com/', name: 'jsynq', capD: 3000, capM: 2600 },
];

// Timeline única executada via rAF dentro da página: scroll a 60Hz sem jitter.
// Começa e termina no topo para o webp animado fechar o loop sem salto.
const T = { holdTop: 700, down: 5200, holdBottom: 700, up: 3000, end: 200 };

async function runTimeline(p, cap) {
  await p.evaluate(({ cap, T }) => new Promise((resolve) => {
    // Ponto invisível girando: força repaint constante para o encoder
    // capturar em cadência estável mesmo em trechos sem movimento.
    const dot = document.createElement('div');
    dot.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;background:#000;opacity:0.01;z-index:2147483647;pointer-events:none';
    document.body.appendChild(dot);
    let spin = 0;
    const doc = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const dist = Math.max(0, Math.min(doc - innerHeight, cap));
    const total = T.holdTop + T.down + T.holdBottom + T.up + T.end;
    const t0 = performance.now();
    // easing suave nas pontas: evita o "arranque" seco do scroll linear
    const ease = (x) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    function frame(now) {
      const e = now - t0;
      spin += 7;
      dot.style.transform = 'rotate(' + spin + 'deg)';
      let y;
      if (e < T.holdTop) y = 0;
      else if (e < T.holdTop + T.down) y = dist * ease((e - T.holdTop) / T.down);
      else if (e < T.holdTop + T.down + T.holdBottom) y = dist;
      else if (e < T.holdTop + T.down + T.holdBottom + T.up) y = dist * (1 - ease((e - T.holdTop - T.down - T.holdBottom) / T.up));
      else y = 0;
      // 'instant' fura o scroll-behavior:smooth de sites como o jsynq
      window.scrollTo({ top: y, behavior: 'instant' });
      if (e >= total) { dot.remove(); resolve(); return; }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }), { cap, T });
}

// Overlay magenta: marca o tempo-zero e o fim da timeline no vídeo,
// para o corte por marcador achar os limites exatos depois.
async function marker(p, ms) {
  await p.evaluate(() => {
    const d = document.createElement('div');
    d.id = '__mk';
    d.style.cssText = 'position:fixed;inset:0;background:#ff00ff;z-index:2147483647';
    document.body.appendChild(d);
  }).catch(() => {});
  await p.waitForTimeout(ms);
  await p.evaluate(() => document.getElementById('__mk')?.remove()).catch(() => {});
}

// Busca o botão do banner de cookies pelo NOME ACESSÍVEL EXATO.
// Nunca usar getByText(..., {exact:false}): "OK" casa com o card de vídeo
// "YANNS - TOKÉ TOKÉ" e abre o modal do YouTube por cima da gravação inteira.
const COOKIE_BTN = /^\s*(rejeitar tudo|rejeitar|recusar|reject all|reject|decline|aceitar tudo|aceitar|accept all|accept|concordo|entendi|got it|ok)\s*$/i;

async function dismissCookies(p) {
  try {
    const btn = p.getByRole('button', { name: COOKIE_BTN }).first();
    if (await btn.isVisible({ timeout: 2000 })) {
      await btn.click({ timeout: 1500 });
      await p.waitForTimeout(600);
    }
  } catch {}
  // rede de segurança: fecha qualquer overlay que tenha aberto sem querer
  await p.keyboard.press('Escape').catch(() => {});
  await p.waitForTimeout(300);
}

async function record(b, { url, name }, kind, viewport, opts, cap) {
  const dir = `${OUT}/rec-${name}-${kind}`;
  rmSync(dir, { recursive: true, force: true });
  const ctx = await b.newContext({
    viewport,
    recordVideo: { dir, size: viewport },
    reducedMotion: 'no-preference',
    ...opts,
  });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(4500); // fontes, vídeo de hero e animações de entrada
  await dismissCookies(p);
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await p.waitForTimeout(400);

  await marker(p, 300);
  await runTimeline(p, cap);
  await marker(p, 300);

  await p.waitForTimeout(500);
  await ctx.close(); // fecha o contexto para o webm ser finalizado

  const f = readdirSync(dir).find((x) => x.endsWith('.webm'));
  renameSync(`${dir}/${f}`, `${OUT}/${name}-${kind}.webm`);
  rmSync(dir, { recursive: true, force: true });
  console.log('rec ok:', name, kind);
}

const only = process.argv[2]; // opcional: rodar um site só
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
for (const site of sites) {
  if (only && site.name !== only) continue;
  await record(b, site, 'desktop', { width: 1280, height: 800 }, {}, site.capD);
  await record(b, site, 'mobile', { width: 390, height: 844 }, {
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  }, site.capM);
}
await b.close();
console.log('todas as gravações concluídas');
