import { createRequire } from 'module';
const require = createRequire('/Users/carloslima/linkando-design/package.json');
const { chromium } = require('playwright');

const [url, json, wArg, hArg] = process.argv.slice(2);
const W = Number(wArg || 1280), H = Number(hArg || 800);
const targets = JSON.parse(json);
const browser = await chromium.launch({ channel: 'chrome', args: [`--window-size=${W},${H}`] });
const page = await (await browser.newContext({ viewport: { width: W, height: H } })).newPage();
await page.goto(url, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(8000);
for (const [name, sel] of Object.entries(targets)) {
  const els = page.locator(sel);
  const n = await els.count();
  const rows = [];
  for (let i = 0; i < Math.min(n, 4); i++) {
    const b = await els.nth(i).boundingBox();
    if (b) rows.push(`x${(((b.x + b.width / 2) / W) * 100).toFixed(1)} y${(((b.y + b.height / 2) / H) * 100).toFixed(1)} w${((b.width / W) * 100).toFixed(1)} h${((b.height / H) * 100).toFixed(1)}`);
  }
  console.log(name.padEnd(12), `(${n})`, rows.join(' | '));
}
await browser.close();
