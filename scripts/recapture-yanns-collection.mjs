// Re-captura "Nouvelle Collection" do site local (localhost:8000), forçando a
// aba LE MAILLOT (carrossel auto-rotativo, pausa no mouseenter / tab 0).
// Atualiza showcase home (01) + collections (04) e o #boutique do craft detail 04.
import puppeteer from "puppeteer-core";
import path from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://localhost:8000";
const SHOTS = "/Users/carloslima/linkando-design/public/projects/yanns/shots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function mkPage(b, vp) {
  const p = await b.newPage();
  // rastreia apenas os setInterval da PÁGINA (para matar o autoplay sem tocar nos
  // intervals internos do CDP/puppeteer)
  await p.evaluateOnNewDocument(() => {
    const real = window.setInterval;
    window.__iv = [];
    window.setInterval = function () { const id = real.apply(this, arguments); window.__iv.push(id); return id; };
  });
  await p.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: vp.dsf, isMobile: !!vp.mobile, hasTouch: !!vp.mobile });
  await p.setCookie({ name: "yanns_lang", value: "fr", domain: "localhost", path: "/" });
  return p;
}
async function autoScroll(p) {
  await p.evaluate(async () => {
    await new Promise((res) => { let y = 0; const t = setInterval(() => { window.scrollBy(0, 500); y += 500; if (y >= document.body.scrollHeight + innerHeight) { clearInterval(t); res(); } }, 90); });
  });
  await sleep(400);
}
// mata o autoplay do carrossel (todos os intervalos) e ativa a aba LE MAILLOT (índice 0)
async function forceLeMaillot(p) {
  await p.evaluate(() => { document.querySelector("[data-boutique-carousel]")?.scrollIntoView({ block: "center" }); });
  await sleep(300);
  await p.evaluate(async () => {
    (window.__iv || []).forEach((id) => clearInterval(id)); // mata o autoplay atual
    window.setInterval = () => 0; // impede o startAutoplay() do clique de recriar o autoplay
    document.querySelector('[data-boutique-tab="0"]')?.click(); // showCollection(0)
    await new Promise((r) => setTimeout(r, 300));
    // espera só as imagens VISÍVEIS (as ocultas com loading=lazy nunca disparam load → hang)
    const vis = [...document.querySelectorAll("#boutique img")].filter((i) => !i.hidden && i.getClientRects().length);
    await Promise.race([
      Promise.all(vis.map((i) => (i.complete && i.naturalWidth) ? 1 : new Promise((res) => { i.addEventListener("load", res, { once: true }); i.addEventListener("error", res, { once: true }); }))),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
  });
  await sleep(800);
}

const b = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--hide-scrollbars", "--force-color-profile=srgb", "--no-sandbox"] });

const viewports = [
  { kind: "desktop", w: 1440, h: 900, dsf: 2 },
  { kind: "mobile", w: 390, h: 844, dsf: 3, mobile: true },
];

for (const vp of viewports) {
  // HOME (com LE MAILLOT forçado antes do fullPage)
  let p = await mkPage(b, vp);
  await p.goto(BASE + "/", { waitUntil: "networkidle2", timeout: 30000 });
  await sleep(600);
  await autoScroll(p);
  await forceLeMaillot(p);
  await p.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
  await p.screenshot({ path: path.join(SHOTS, vp.kind, "01-home.png"), fullPage: true });
  console.log(`✓ ${vp.kind}/01-home.png (LE MAILLOT)`);
  await p.close();

  // COLLECTIONS (MaillotBanner é estático)
  p = await mkPage(b, vp);
  await p.goto(BASE + "/collections", { waitUntil: "networkidle2", timeout: 30000 });
  await sleep(600);
  await autoScroll(p);
  await p.screenshot({ path: path.join(SHOTS, vp.kind, "04-collections.png"), fullPage: true });
  console.log(`✓ ${vp.kind}/04-collections.png`);
  await p.close();
}

// #boutique isolado (craft detail 04) — full element com LE MAILLOT, para revisão
for (const vp of [{ kind: "desktop", w: 1600, h: 1000, dsf: 2 }, { kind: "mobile", w: 390, h: 844, dsf: 3, mobile: true }]) {
  const p = await mkPage(b, vp);
  await p.goto(BASE + "/", { waitUntil: "networkidle2", timeout: 30000 });
  await sleep(600);
  await forceLeMaillot(p);
  const el = await p.$("#boutique");
  const box = await el.boundingBox();
  console.log(`#boutique ${vp.kind}: ${Math.round(box.width)}x${Math.round(box.height)}`);
  await el.screenshot({ path: `/tmp/boutique-${vp.kind === "desktop" ? "d" : "m"}.png` });
  await p.close();
}

await b.close();
console.log("captura concluída");
