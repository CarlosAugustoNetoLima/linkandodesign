import { chromium } from "playwright";
import { writeFileSync } from "fs";

const ROOT = "/Users/carloslima/linkando-design";

const projects = [
  { name: "yanns", domain: "yannsmusic.com", accent: "#B11226" },
  { name: "festivalcrato", domain: "festivalcrato.pt", accent: "#E63329" },
  { name: "wauw", domain: "wauw.cv", accent: "#FF2E7E" },
  { name: "jsynq", domain: "jsynq.com", accent: "#34B27B" },
];

const html = (p) => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1600px; height: 1000px; overflow: hidden;
    font-family: -apple-system, 'Helvetica Neue', sans-serif; }
  .stage {
    position: relative; width: 1600px; height: 1000px;
    background:
      radial-gradient(1000px 750px at 85% 5%, ${p.accent}40, transparent 65%),
      radial-gradient(800px 650px at 5% 100%, ${p.accent}26, transparent 60%),
      linear-gradient(135deg, #28282c 0%, #1b1b1f 100%);
  }
  .dots {
    position: absolute; inset: 0;
    background-image: radial-gradient(rgba(255,255,255,0.06) 1.5px, transparent 1.5px);
    background-size: 34px 34px;
    mask-image: radial-gradient(1200px 800px at 50% 45%, black, transparent 85%);
  }

  /* frame de vidro — borda espessa translúcida com blur */
  .glass {
    position: absolute;
    background: linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05) 55%, rgba(255,255,255,0.12));
    backdrop-filter: blur(26px) saturate(1.3);
    box-shadow:
      0 60px 120px rgba(0,0,0,0.55),
      0 16px 40px rgba(0,0,0,0.4),
      inset 0 1px 0 rgba(255,255,255,0.28),
      inset 0 -1px 0 rgba(255,255,255,0.08),
      0 0 0 1px rgba(255,255,255,0.12);
  }

  .desktop {
    top: 96px; left: 84px; width: 1140px;
    padding: 22px; border-radius: 30px;
  }
  .desktop img {
    display: block; width: 100%; height: 686px;
    object-fit: cover; object-position: top;
    border-radius: 14px;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.35);
  }

  .phone {
    right: 92px; top: 169px; width: 272px; height: 556px;
    padding: 14px; border-radius: 30px;
  }
  .phone img {
    display: block; width: 100%; height: 100%;
    object-fit: cover; object-position: top;
    border-radius: 16px;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.35);
  }

  .domain {
    position: absolute; left: 88px; bottom: 52px;
    color: rgba(255,255,255,0.5); font-size: 19px; letter-spacing: 0.32em;
    text-transform: uppercase; font-weight: 600;
  }
  .domain b { color: ${p.accent}; font-weight: 600; }
</style></head>
<body>
  <div class="stage">
    <div class="dots"></div>
    <div class="glass desktop">
      <img src="file://${ROOT}/reference/screens-raw/${p.name}.png">
    </div>
    <div class="glass phone">
      <img src="file://${ROOT}/reference/screens-raw/${p.name}-mobile.png">
    </div>
    <div class="domain"><b>●</b>&nbsp;&nbsp;${p.domain}</div>
  </div>
</body></html>`;

const b = await chromium.launch();
for (const p of projects) {
  writeFileSync(`/tmp/mock-${p.name}.html`, html(p));
  const page = await b.newPage({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 2,
  });
  await page.goto(`file:///tmp/mock-${p.name}.html`);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${ROOT}/public/projects/${p.name}.png` });
  await page.close();
  console.log("mockup ok:", p.name);
}
await b.close();
