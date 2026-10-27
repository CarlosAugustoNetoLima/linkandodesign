import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await puppeteer.launch({ executablePath: CHROME, headless:"new", args:["--no-sandbox"] });
const p = await b.newPage();
await p.setViewport({ width:1440, height:900, deviceScaleFactor:2 });
await p.setCookie({ name:"yanns_lang", value:"fr", domain:"127.0.0.1", path:"/" });
// HOME → seção boutique
await p.goto("http://127.0.0.1:8010/", { waitUntil:"networkidle2", timeout:30000 });
await p.evaluate(async()=>{const s=document.querySelector('#boutique');s?.scrollIntoView();await new Promise(r=>setTimeout(r,400));});
await new Promise(r=>setTimeout(r,1200));
const boutique = await p.$('#boutique');
if (boutique) await boutique.screenshot({ path:"/tmp/live-home-boutique.png" });
console.log("boutique:", !!boutique);
// COLLECTIONS → banner
await p.goto("http://127.0.0.1:8010/collections", { waitUntil:"networkidle2", timeout:30000 });
await new Promise(r=>setTimeout(r,1000));
const banner = await p.$('.maillot-banner');
if (banner) await banner.screenshot({ path:"/tmp/live-collections-banner.png" });
console.log("banner:", !!banner);
await b.close(); console.log("ok");
