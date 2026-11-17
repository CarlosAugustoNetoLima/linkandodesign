import { createRequire } from 'module';
const require = createRequire('/Users/carloslima/linkando-design/package.json');
const { chromium } = require('playwright');
const [url, wArg, hArg] = process.argv.slice(2);
const W = Number(wArg || 1440), H = Number(hArg || 900);
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: W, height: H } });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(2500);
const chapters = await page.evaluate(() => [...document.querySelectorAll('section[data-chapter]')].map((s) => ({ id: s.id, top: s.getBoundingClientRect().top + scrollY })));
const state = () => page.evaluate(() => {
  const r = [];
  document.querySelectorAll('[aria-label]').forEach((el) => {
    const spans = el.querySelectorAll('span[aria-hidden] > span');
    if (!spans.length) return;
    const rect = el.getBoundingClientRect();
    const stuck = [...spans].filter((s) => { const m = getComputedStyle(s).transform.match(/matrix\(([^)]+)\)/); return m && Math.abs(parseFloat(m[1].split(',')[5])) > 1; }).length;
    r.push({ t: el.getAttribute('aria-label').slice(0, 34), inView: rect.top < innerHeight * 0.9 && rect.bottom > innerHeight * 0.1, stuck, n: spans.length });
  });
  return r;
});
for (const c of chapters) {
  const cur = await page.evaluate(() => scrollY);
  for (let s = 1; s <= 8; s++) { await page.evaluate((y) => window.scrollTo(0, y), Math.round(cur + ((c.top - cur) * s) / 8)); await page.waitForTimeout(120); }
  await page.waitForTimeout(2600);
  const st = (await state()).filter((x) => x.inView && x.stuck > 0);
  console.log(c.id.padEnd(12), st.length ? 'ESCONDIDO: ' + st.map((x) => `"${x.t}" ${x.stuck}/${x.n}`).join('; ') : 'ok');
}
await browser.close();
