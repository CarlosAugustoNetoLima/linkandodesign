// Captura de ESTADOS interativos do YANNS (evidência dos efeitos como stills).
// Menu mobile, modal de carrinho, modal de vídeo, lang switcher. FR.
import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://127.0.0.1:8010";
const OUT = "/Users/carloslima/linkando-design/public/projects/yanns/shots/states";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function newPage(browser, vp) {
  const page = await browser.newPage();
  await page.setViewport({
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: 2,
    isMobile: !!vp.mobile,
    hasTouch: !!vp.mobile,
  });
  await page.setCookie({ name: "yanns_lang", value: "fr", domain: "127.0.0.1", path: "/" });
  return page;
}

async function run() {
  await mkdir(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--hide-scrollbars", "--force-color-profile=srgb", "--no-sandbox", "--mute-audio"],
  });

  const shot = async (page, name) => {
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    console.log(`✓ states/${name}.png`);
  };
  const tryClick = async (page, sel) => {
    const el = await page.$(sel);
    if (!el) throw new Error(`no element ${sel}`);
    await el.click();
  };

  // 1) Menu mobile aberto
  try {
    const page = await newPage(browser, { width: 390, height: 844, mobile: true });
    await page.goto(BASE + "/", { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(700);
    await tryClick(page, ".header-menu-toggle");
    await sleep(800);
    await shot(page, "mobile-menu-open");
    await page.close();
  } catch (e) { console.log("✗ mobile-menu-open —", e.message); }

  // 2) Modal de carrinho (desktop)
  try {
    const page = await newPage(browser, { width: 1440, height: 900 });
    await page.goto(BASE + "/", { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(700);
    await tryClick(page, "[data-cart-open]");
    await sleep(1500);
    await shot(page, "desktop-cart-modal");
    await page.close();
  } catch (e) { console.log("✗ desktop-cart-modal —", e.message); }

  // 3) Modal de vídeo (desktop, /musique)
  try {
    const page = await newPage(browser, { width: 1440, height: 900 });
    await page.goto(BASE + "/musique", { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(900);
    await tryClick(page, ".card-youtube");
    await sleep(2500); // iframe do YouTube carrega
    await shot(page, "desktop-video-modal");
    await page.close();
  } catch (e) { console.log("✗ desktop-video-modal —", e.message); }

  // 4) Lang switcher aberto (desktop)
  try {
    const page = await newPage(browser, { width: 1440, height: 900 });
    await page.goto(BASE + "/", { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(700);
    const opened = await page.evaluate(() => {
      const sw = document.querySelector(".lang-switcher");
      const btn = sw && sw.querySelector("button");
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (!opened) throw new Error("lang-switcher button not found");
    await sleep(500);
    await shot(page, "desktop-lang-switcher");
    await page.close();
  } catch (e) { console.log("✗ desktop-lang-switcher —", e.message); }

  await browser.close();
  console.log("done");
}

run().catch((e) => { console.error(e); process.exit(1); });
