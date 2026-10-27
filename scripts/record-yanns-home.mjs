// Grava um scroll-through da HOME do YANNS (localhost:8000, FR) para o hero do
// case. Screencast (puppeteer) → webm; depois ffmpeg converte para mp4 1280x800.
import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://localhost:8000";
// arg: "desktop" (padrão) ou "mobile"
const KIND = process.argv[2] === "mobile" ? "mobile" : "desktop";
const VP = KIND === "mobile"
  ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
  : { width: 1280, height: 800, deviceScaleFactor: 1 };
const OUT_WEBM = `/tmp/yanns-rec-${KIND}.webm`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const b = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars", "--force-color-profile=srgb", "--no-sandbox", "--mute-audio", "--autoplay-policy=no-user-gesture-required"],
});
const p = await b.newPage();
await p.evaluateOnNewDocument(() => {
  const real = window.setInterval;
  window.__iv = [];
  window.setInterval = function () { const id = real.apply(this, arguments); window.__iv.push(id); return id; };
});
await p.setViewport(VP);
await p.setCookie({ name: "yanns_lang", value: "fr", domain: "localhost", path: "/" });
await p.goto(BASE + "/", { waitUntil: "networkidle2", timeout: 30000 });
await sleep(800);

// pré-carrega imagens (scroll completo) e congela a coleção em LE MAILLOT
await p.evaluate(async () => {
  await new Promise((res) => { let y = 0; const t = setInterval(() => { window.scrollBy(0, 600); y += 600; if (y >= document.body.scrollHeight) { clearInterval(t); res(); } }, 60); });
});
await sleep(500);
await p.evaluate(async () => {
  document.querySelector("[data-boutique-carousel]")?.scrollIntoView({ block: "center" });
  await new Promise((r) => setTimeout(r, 200));
  (window.__iv || []).forEach((id) => clearInterval(id));
  window.setInterval = () => 0;
  document.querySelector('[data-boutique-tab="0"]')?.click();
});
await sleep(700);
await p.evaluate(() => window.scrollTo(0, 0));
await sleep(700);
// garante o vídeo do hero tocando
await p.evaluate(() => { document.querySelectorAll("video").forEach((v) => { v.muted = true; v.play?.().catch(() => {}); }); });
await sleep(400);

// ---- grava ----
const recorder = await p.screencast({ path: OUT_WEBM, fps: 30 });
// scroll suave do topo ao fim em ~14s
await p.evaluate(async () => {
  const dur = 14000;
  const maxY = document.body.scrollHeight - window.innerHeight;
  const start = performance.now();
  await new Promise((res) => {
    function step(now) {
      const t = Math.min(1, (now - start) / dur);
      // ease-in-out
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      window.scrollTo(0, Math.round(e * maxY));
      if (t < 1) requestAnimationFrame(step); else res();
    }
    requestAnimationFrame(step);
  });
});
await sleep(800);
await recorder.stop();
await b.close();
console.log("gravado:", OUT_WEBM, KIND);
