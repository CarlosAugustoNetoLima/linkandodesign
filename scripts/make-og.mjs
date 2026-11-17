// Gera public/og-image.jpg (1200x630), a imagem de compartilhamento do site.
// Uso: node scripts/make-og.mjs  (usa o Chrome do sistema via Playwright e precisa de internet para as fontes)
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logoSvg = fs.readFileSync(path.join(root, "public/logo-dark.svg"), "utf8");
const out = path.join(root, "public/og-image.jpg");

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800&family=Inter:wght@600&display=swap">
<style>
  * { margin: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; background: #27272B; }
  .card { position: relative; width: 1200px; height: 630px; color: #FFFFFF; }
  .logo { position: absolute; top: 72px; left: 72px; width: 240px; }
  .logo svg { display: block; width: 240px; height: auto; }
  .hero { position: absolute; left: 72px; right: 72px; bottom: 130px; text-align: center; }
  h1 { font-family: "Bricolage Grotesque", sans-serif; font-weight: 800; font-size: 64px; line-height: 0.95; white-space: nowrap; }
  h1 span { display: block; color: #EEFB6E; }
  .sub { margin-top: 28px; font-family: Inter, sans-serif; font-weight: 600; font-size: 26px; line-height: 1.2; color: rgba(255,255,255,0.6); white-space: nowrap; }
  .url { position: absolute; right: 72px; bottom: 72px; font-family: Inter, sans-serif; font-weight: 600; font-size: 24px; line-height: 1; color: #EEFB6E; }
</style>
</head>
<body>
<div class="card">
  <div class="logo">${logoSvg}</div>
  <div class="hero">
    <h1>O DIGITAL DA SUA EMPRESA<span>NÃO PRECISA SER COMPLICADO.</span></h1>
    <p class="sub">Interfaces, sites e marcas · 9 anos · clientes em 4 países</p>
  </div>
  <div class="url">linkandodesign.com</div>
</div>
</body>
</html>`;

const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(async () => {
    await document.fonts.load('800 64px "Bricolage Grotesque"');
    await document.fonts.load("600 24px Inter");
    await document.fonts.ready;
  });
  // Sem essa checagem, uma falha de rede deixaria o fallback do sistema sem aviso.
  const loaded = await page.evaluate(() =>
    [...document.fonts].filter((f) => f.status === "loaded").map((f) => `${f.family} ${f.weight}`)
  );
  if (!loaded.some((f) => f.includes("Bricolage Grotesque 800")) || !loaded.some((f) => f.includes("Inter 600"))) {
    throw new Error(`Fontes não carregaram (sem internet?). Carregadas: ${loaded.join(", ") || "nenhuma"}`);
  }
  await page.screenshot({ path: out, type: "jpeg", quality: 90 });
  console.log(`og-image gerada: ${out}`);
} finally {
  await browser.close();
}
