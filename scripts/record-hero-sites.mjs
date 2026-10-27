// Grava o scroll-through DESKTOP dos sites que aparecem no card de vidro do
// hero (components/sections/HeroShowcase3D.tsx).
//
// Por que existe: os mp4 de festivalcrato/wauw/jsynq tinham sido gerados por
// scripts/generate-mockups.mjs, que compõe uma CENA (moldura de browser +
// celular sobre fundo colorido + domínio embaixo). Dentro do card de vidro isso
// vira mockup dentro de mockup, e o celular não tem lugar ali. O alvo é o
// yanns.mp4: gravação desktop pura, sangrando de borda a borda.
//
// Mesmo molde do scripts/record-yanns-home.mjs (puppeteer + screencast), só que
// apontando para os sites no ar em vez do mirror local.
//
//   node scripts/record-hero-sites.mjs            # os três
//   node scripts/record-hero-sites.mjs wauw       # um só
//
// Saída: public/projects/<name>.mp4 (o -mockup.mp4 antigo fica preservado ao
// lado, ver REPLACE em scripts/README.md).
import puppeteer from "puppeteer-core";
import { execFileSync } from "node:child_process";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const ROOT = "/Users/carloslima/linkando-design";

const TARGETS = [
  { name: "festivalcrato", url: "https://www.festivalcrato.pt/" },
  { name: "wauw", url: "https://wauw.cv/" },
  { name: "jsynq", url: "https://jsynq.com/" },
];

// Viewport de gravação: fonte nítida. A entrega sai reduzida (ver ENCODE_W):
// a textura do vídeo é enviada para a GPU todo frame, e 1280 de largura é bem
// mais do que o card ocupa na tela.
const VP = { width: 1280, height: 800, deviceScaleFactor: 1 };
const ENCODE_W = 960;
const ENCODE_H = 600;
const SCROLL_MS = 14000;

// Quantas alturas de viewport o scroll percorre. NÃO rolar a página inteira:
// festivalcrato.pt tem ~14.000px, o que daria ~1000px/s e o vídeo passa
// voando, caindo em faixas escuras/vazias entre as seções. Limitando ao topo
// (a parte mais rica de qualquer um desses sites) o movimento fica legível.
const SCROLL_VIEWPORTS = 6;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const only = process.argv[2];
const list = only ? TARGETS.filter((t) => t.name === only) : TARGETS;
if (!list.length) {
  console.error(`alvo desconhecido: ${only} (use: ${TARGETS.map((t) => t.name).join(", ")})`);
  process.exit(1);
}

// Fecha banner de cookies pelo texto EXATO do botão. Nunca por substring: "OK"
// casa com títulos de card e abre modais por cima da gravação inteira (essa
// armadilha já queimou uma rodada, ver scripts/README.md).
async function dismissCookies(p) {
  const clicked = await p
    .evaluate(() => {
      const RE = /^\s*(rejeitar tudo|rejeitar|recusar|reject all|reject|decline|aceitar tudo|aceitar|accept all|accept|concordo|entendi|got it|ok)\s*$/i;
      const els = [...document.querySelectorAll("button, [role=button], a")];
      for (const el of els) {
        const t = (el.innerText || el.textContent || "").trim();
        const visible = el.offsetParent !== null && el.getClientRects().length > 0;
        if (visible && RE.test(t)) {
          el.click();
          return t;
        }
      }
      return null;
    })
    .catch(() => null);
  await sleep(600);
  await p.keyboard.press("Escape").catch(() => {});
  await sleep(300);
  return clicked;
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: [
    "--hide-scrollbars",
    "--force-color-profile=srgb",
    "--no-sandbox",
    "--mute-audio",
    "--autoplay-policy=no-user-gesture-required",
  ],
});

async function recordOne({ name, url }) {
  const webm = `/tmp/hero-rec-${name}.webm`;
  const out = `${ROOT}/public/projects/${name}.mp4`;
  console.log(`\n=== ${name} — ${url}`);

  const p = await browser.newPage();
  await p.setViewport(VP);
  try {
    await p.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  } catch {
    console.log("   (networkidle2 estourou, seguindo com o que carregou)");
  }
  await sleep(4000); // fontes, vídeo de hero, animações de entrada

  const btn = await dismissCookies(p);
  console.log(`   cookies: ${btn ? `fechado via "${btn}"` : "nenhum banner"}`);

  // pré-carrega tudo (lazy-load/reveal on scroll) e volta ao topo, senão a
  // gravação mostra buracos e imagens entrando no meio do movimento
  await p.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const t = setInterval(() => {
        window.scrollBy(0, 600);
        y += 600;
        if (y >= document.body.scrollHeight) {
          clearInterval(t);
          res();
        }
      }, 60);
    });
  });
  await sleep(1200);
  await p.evaluate(() => window.scrollTo(0, 0));
  await sleep(1000);
  await p.evaluate(() => {
    document.querySelectorAll("video").forEach((v) => {
      v.muted = true;
      v.play?.().catch(() => {});
    });
  });
  await sleep(500);

  // O scroll é dirigido por EVENTOS DE RODA reais, não por window.scrollTo.
  // Motivo: festivalcrato.pt e jsynq.com usam scroll suavizado por JS, que roda
  // o próprio rAF e reescreve a posição todo frame — o scrollTo era desfeito
  // antes de pintar e a gravação saía 100% parada (scrollY ficava em 0 nos 181
  // frames medidos, com a página tendo 13866px de curso). A roda entra pelo
  // pipeline de input, que essas bibliotecas respeitam.
  //
  // O alvo é recalculado pelo RELÓGIO a cada passo, então a latência do
  // round-trip com o browser não atrasa a timeline: um passo lento só gera um
  // delta maior no seguinte.
  const maxY = await p.evaluate(
    (vp) => Math.min(document.body.scrollHeight - window.innerHeight, vp * window.innerHeight),
    SCROLL_VIEWPORTS
  );
  await p.mouse.move(VP.width / 2, VP.height / 2); // a roda vai para o elemento sob o cursor

  const rec = await p.screencast({ path: webm, fps: 30 });
  const t0 = Date.now();
  let prev = 0;
  for (;;) {
    const t = Math.min(1, (Date.now() - t0) / SCROLL_MS);
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // ease-in-out
    const target = Math.round(e * maxY);
    if (target > prev) await p.mouse.wheel({ deltaY: target - prev });
    prev = target;
    if (t >= 1) break;
    await sleep(16);
  }
  await sleep(700);
  await rec.stop();

  // Guarda-costas: uma gravação parada é um bug silencioso — o arquivo sai com
  // tamanho plausível e só se percebe olhando frame a frame.
  const endY = await p.evaluate(() => window.scrollY);
  const covered = maxY > 0 ? endY / maxY : 0;
  console.log(`   scroll: 0 -> ${endY} de ${maxY} (${(covered * 100).toFixed(0)}% da página)`);
  if (covered < 0.5) console.log(`   AVISO: a página quase não rolou — gravação provavelmente estática`);
  await p.close();

  execFileSync(
    "ffmpeg",
    ["-y", "-i", webm, "-vf", `scale=${ENCODE_W}:${ENCODE_H}:flags=lanczos`, "-r", "25",
     "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-pix_fmt", "yuv420p",
     "-movflags", "+faststart", "-an", out],
    { stdio: ["ignore", "ignore", "inherit"] }
  );
  console.log(`   -> ${out}`);
}

// Cada alvo é independente: numa rodada anterior o renderizador do wauw morreu
// no meio ("Target closed") e derrubou o processo inteiro, levando junto o
// jsynq, que nem chegou a gravar. Uma falha agora custa só o próprio alvo.
const failed = [];
for (const target of list) {
  try {
    await recordOne(target);
  } catch (err) {
    console.log(`   FALHOU: ${err?.message?.split("\n")[0] ?? err}`);
    failed.push(target.name);
  }
}

await browser.close();
if (failed.length) {
  console.log(`\nFALHARAM: ${failed.join(", ")} — os mp4 desses alvos ficaram como estavam.`);
  process.exit(1);
}
console.log("\npronto.");
