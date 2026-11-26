import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const base = opt("--base", "http://localhost:3011");
const fps = Number(opt("--fps", 30));
const preview = args.includes("--preview");
const outDir = join(root, "exports/reels");
const slugs = args.filter((a, i) => !a.startsWith("--") && !["--base", "--fps"].includes(args[i - 1]));

const configs = JSON.parse(readFileSync(join(here, "configs.json"), "utf8"));
const html = readFileSync(join(here, "reel.html"), "utf8");
const logo = readFileSync(join(root, "public/logo-ink.svg"), "utf8");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", args: ["--autoplay-policy=no-user-gesture-required"] });

for (const cfg of configs.filter((c) => !slugs.length || slugs.includes(c.slug))) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => console.error(cfg.slug, "pageerror", e.message));
  await page.route(base + "/__reel", (r) => r.fulfill({ contentType: "text/html", body: html }));
  await page.goto(base + "/__reel", { waitUntil: "load", timeout: 120000 });
  const info = await page.evaluate(([c, l]) => window.setup(c, l), [cfg, logo]);
  if (info.missing.length) console.warn(cfg.slug, "vídeos sem carregar:", info.missing);
  const total = Math.round(info.duration * fps);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1080, height: 1350, deviceScaleFactor: 1, mobile: false });
  const shot = { clip: { x: 0, y: 0, width: 1080, height: 1350, scale: 1 }, captureBeyondViewport: true };
  const t0 = Date.now();

  if (preview) {
    const dir = join(outDir, "_preview", cfg.slug);
    mkdirSync(dir, { recursive: true });
    for (let t = 0; t < info.duration; t += 0.5) {
      await page.evaluate((x) => window.frame(x), t);
      const { data } = await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 70, ...shot });
      writeFileSync(join(dir, `${String(Math.round(t * 10)).padStart(4, "0")}.jpg`), Buffer.from(data, "base64"));
    }
    console.log(cfg.slug, "preview ok", dir);
  } else {
    await page.evaluate((x) => window.frame(x), 0.6);
    const cover = await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 95, ...shot });
    writeFileSync(join(outDir, `${cfg.slug}-capa.jpg`), Buffer.from(cover.data, "base64"));
    const file = join(outDir, `${cfg.slug}.mp4`);
    const ff = spawn("ffmpeg", ["-y", "-v", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
      "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-profile:v", "high", "-pix_fmt", "yuv420p",
      "-r", String(fps), "-movflags", "+faststart", file], { stdio: ["pipe", "inherit", "inherit"] });
    ff.stdin.on("error", (e) => console.error(cfg.slug, "ffmpeg", e.message));
    for (let i = 0; i < total; i++) {
      await page.evaluate((x) => window.frame(x), i / fps);
      const { data } = await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 95, ...shot });
      if (!ff.stdin.write(Buffer.from(data, "base64"))) await new Promise((r) => ff.stdin.once("drain", r));
      if (i % 150 === 0) console.log(cfg.slug, `${i}/${total}`);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on("close", r));
    console.log(cfg.slug, "ok", file, `${info.duration.toFixed(1)} s`, `${((Date.now() - t0) / 1000).toFixed(0)} s de render`);
  }
  await page.close();
}
await browser.close();
