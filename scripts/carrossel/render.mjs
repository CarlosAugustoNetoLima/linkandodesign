// Renderiza o carrossel do Instagram (9 slides 1080×1350, 4:5) em PNG e monta a folha de conferência.
// Uso: node scripts/carrossel/render.mjs <slug>   (ex.: cinnamon-studio)
// Lê scripts/carrossel/projects/<slug>.json; as imagens vêm de data.frames (relativo à raiz do repo).
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const slug = process.argv[2];
if (!slug) {
  console.error("Uso: node scripts/carrossel/render.mjs <slug>");
  process.exit(1);
}

const data = JSON.parse(readFileSync(join(here, "projects", `${slug}.json`), "utf8"));
const framesDir = join(root, data.frames);
const logo = readFileSync(join(root, "public/logo-ink.svg"), "utf8");
const IMG = /\.(jpe?g|png|webp)$/i;

// troca todo nome de imagem do JSON por file:// absoluto dentro da pasta de frames
function absolutize(v) {
  if (Array.isArray(v)) return v.map(absolutize);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, absolutize(x)]));
  return typeof v === "string" && IMG.test(v) ? pathToFileURL(join(framesDir, v)).href : v;
}

const outDir = join(root, "exports/carrossel", slug);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
page.on("pageerror", (e) => console.error(slug, "pageerror", e.message));
await page.goto(pathToFileURL(join(here, "carrossel.html")).href, { waitUntil: "load", timeout: 120000 });
const n = await page.evaluate(([d, l]) => window.build(d, l), [absolutize(data), logo]);

// a janela sem interface limita a altura visível: força a tela de 1080×1350 e recorta exato (como no reels)
const cdp = await page.context().newCDPSession(page);
await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1080, height: 1350, deviceScaleFactor: 1, mobile: false });
const clip = { x: 0, y: 0, width: 1080, height: 1350, scale: 1 };

for (let i = 0; i < n; i++) {
  await page.evaluate((k) => window.show(k), i);
  const { data: png } = await cdp.send("Page.captureScreenshot", { format: "png", clip, captureBeyondViewport: true });
  writeFileSync(join(outDir, `${String(i + 1).padStart(2, "0")}.png`), Buffer.from(png, "base64"));
}
await browser.close();

execFileSync("ffmpeg", [
  "-y", "-v", "error", "-pattern_type", "glob", "-i", join(outDir, "0*.png"),
  "-vf", "scale=360:-1,tile=3x3:padding=12:color=white", "-frames:v", "1", join(outDir, "folha.png"),
], { stdio: "inherit" });

console.log(slug, "ok", n, "slides ->", outDir);
