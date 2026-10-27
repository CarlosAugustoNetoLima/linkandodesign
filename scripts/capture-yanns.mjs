// Varredura de capturas do site YANNS (servido em 127.0.0.1:8010) para o portfólio.
// Full-page, desktop + mobile, idioma FR. Usa o Chrome do sistema via puppeteer-core.
//
// Uso: node scripts/capture-yanns.mjs [rota]   (sem arg = todas)
import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://127.0.0.1:8010";
const OUT = "/Users/carloslima/linkando-design/public/projects/yanns/shots";

const ROUTES = [
  { name: "01-home", path: "/" },
  { name: "02-musique", path: "/musique" },
  { name: "03-dates", path: "/dates" },
  { name: "04-collections", path: "/collections" },
  { name: "05-biographie", path: "/biographie" },
  { name: "06-produto", path: "/produto?id=12616" },
];

const VIEWPORTS = [
  { kind: "desktop", width: 1440, height: 900, dsf: 2, mobile: false },
  { kind: "mobile", width: 390, height: 844, dsf: 3, mobile: true },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const step = 400;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        total += step;
        if (total >= document.body.scrollHeight + window.innerHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 80);
    });
  });
  await sleep(500);
}

async function run() {
  const only = process.argv[2];
  const routes = only ? ROUTES.filter((r) => r.name.includes(only) || r.path === only) : ROUTES;

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--hide-scrollbars", "--force-color-profile=srgb", "--no-sandbox"],
  });

  for (const vp of VIEWPORTS) {
    const dir = path.join(OUT, vp.kind);
    await mkdir(dir, { recursive: true });

    const page = await browser.newPage();
    await page.setViewport({
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.dsf,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
    });
    // idioma FR via cookie antes de navegar
    await page.setCookie({
      name: "yanns_lang",
      value: "fr",
      domain: "127.0.0.1",
      path: "/",
    });

    for (const route of routes) {
      const url = BASE + route.path;
      try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
        await sleep(800);
        await autoScroll(page);
        const file = path.join(dir, `${route.name}.png`);
        await page.screenshot({ path: file, fullPage: true });
        console.log(`✓ ${vp.kind}/${route.name}.png`);
      } catch (e) {
        console.log(`✗ ${vp.kind}/${route.name} — ${e.message}`);
      }
    }
    await page.close();
  }

  await browser.close();
  console.log("done");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
