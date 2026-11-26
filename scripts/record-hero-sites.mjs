import puppeteer from "puppeteer-core";
import { execFileSync } from "node:child_process";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const ROOT = "/Users/carloslima/linkando-design";

const TARGETS = [
  { name: "festivalcrato", url: "https://www.festivalcrato.pt/" },
  { name: "wauw", url: "https://wauw.cv/" },
  { name: "jsynq", url: "https://jsynq.com/" },
];

const VP = { width: 1280, height: 800, deviceScaleFactor: 1 };
const ENCODE_W = 960;
const ENCODE_H = 600;
const SCROLL_MS = 14000;

const SCROLL_VIEWPORTS = 6;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const only = process.argv[2];
const list = only ? TARGETS.filter((t) => t.name === only) : TARGETS;
if (!list.length) {
  console.error(`alvo desconhecido: ${only} (use: ${TARGETS.map((t) => t.name).join(", ")})`);
  process.exit(1);
}

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
  await sleep(4000);

  const btn = await dismissCookies(p);
  console.log(`   cookies: ${btn ? `fechado via "${btn}"` : "nenhum banner"}`);

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

  const maxY = await p.evaluate(
    (vp) => Math.min(document.body.scrollHeight - window.innerHeight, vp * window.innerHeight),
    SCROLL_VIEWPORTS
  );
  await p.mouse.move(VP.width / 2, VP.height / 2);

  const rec = await p.screencast({ path: webm, fps: 30 });
  const t0 = Date.now();
  let prev = 0;
  for (;;) {
    const t = Math.min(1, (Date.now() - t0) / SCROLL_MS);
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const target = Math.round(e * maxY);
    if (target > prev) await p.mouse.wheel({ deltaY: target - prev });
    prev = target;
    if (t >= 1) break;
    await sleep(16);
  }
  await sleep(700);
  await rec.stop();

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
