import { createRequire } from 'module';
import { mkdirSync, writeFileSync } from 'fs';
const require = createRequire('/Users/carloslima/linkando-design/package.json');
const { chromium } = require('playwright');

const [url, out, wArg, hArg, only] = process.argv.slice(2);
const W = Number(wArg || 1440), H = Number(hArg || 900);
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, reducedMotion: process.env.REDUCE ? 'reduce' : 'no-preference' });
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) problems.push(`[${m.type()}] ${m.text().slice(0, 200)}`); });
page.on('pageerror', (e) => problems.push(`[pageerror] ${String(e).slice(0, 200)}`));
page.on('response', (r) => { if (r.status() >= 400) problems.push(`[${r.status()}] ${r.url().slice(0, 140)}`); });
await page.goto(url, { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(2500);
const cdp = await ctx.newCDPSession(page);
const shot = async (name) => {
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 72 });
  writeFileSync(`${out}/${name}.jpg`, Buffer.from(data, 'base64'));
};
const chapters = await page.evaluate(() => [...document.querySelectorAll('section[data-chapter]')].map((s) => ({
  id: s.id, top: s.getBoundingClientRect().top + scrollY, h: s.offsetHeight,
})));
console.log('chapters:', chapters.map((c) => `${c.id}(${Math.round(c.h)})`).join(' '));
for (const c of chapters) {
  if (only && !only.split(',').includes(c.id)) continue;
  const span = Math.max(0, c.h - H);
  const fr = span > H * 1.2 ? [0.04, 0.35, 0.7, 0.97] : [0, span > 60 ? 0.6 : 0];
  let i = 0;
  for (const f of fr) {
    // rolagem gradual até o ponto (dispara IO/whileInView pelo caminho)
    const target = Math.round(c.top + span * f);
    const cur = await page.evaluate(() => scrollY);
    const steps = 6;
    for (let s = 1; s <= steps; s++) { await page.evaluate((y) => window.scrollTo(0, y), Math.round(cur + ((target - cur) * s) / steps)); await page.waitForTimeout(110); }
    await page.waitForTimeout(2600);
    await shot(`${c.id}-${i++}`);
  }
}
const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
console.log('overflow-x:', overflowX);
console.log('problems:', problems.length ? '\n' + [...new Set(problems)].join('\n') : 'none');
await browser.close();
