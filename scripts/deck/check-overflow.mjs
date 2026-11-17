import { createRequire } from 'module';
const require = createRequire('/Users/carloslima/linkando-design/package.json');
const { chromium } = require('playwright');
const [url, wArg] = process.argv.slice(2);
const W = Number(wArg || 390);
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: W, height: 844 } });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(3000);
const res = await page.evaluate(() => {
  const out = {};
  document.querySelectorAll('section[data-chapter]').forEach((sec) => {
    const bad = [];
    sec.querySelectorAll('*').forEach((el) => {
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed' || el.closest('svg') || el.tagName === 'VIDEO' && false) return;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > innerWidth + 2 && r.left < innerWidth) bad.push(`${el.tagName.toLowerCase()}.${(el.className && el.className.baseVal === undefined ? String(el.className) : '').split(' ')[0].slice(0, 28)} →${Math.round(r.right)}`);
    });
    if (bad.length) out[sec.id] = bad.slice(0, 4);
  });
  return out;
});
const keys = Object.keys(res);
console.log(keys.length ? 'ESTOURAM A LARGURA (' + W + 'px):' : 'nenhum elemento ultrapassa ' + W + 'px');
keys.forEach((k) => console.log(' ', k, '\n     ', res[k].join('\n      ')));
await browser.close();
