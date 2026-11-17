// Mede o equilíbrio das seções lado a lado: diferença entre o centro vertical da mídia
// (primeiro <video>/<canvas> do capítulo) e o do bloco de texto (pai do primeiro título).
// Uso: node scripts/deck/check-balance.mjs <url> [largura] [altura]   (limite: 40 px)
import { createRequire } from 'module';
const require = createRequire('/Users/carloslima/linkando-design/package.json');
const { chromium } = require('playwright');
const [url, wArg, hArg] = process.argv.slice(2);
const W = Number(wArg || 1440), H = Number(hArg || 900);
const browser = await chromium.launch({ channel: 'chrome' });
const page = await (await browser.newContext({ viewport: { width: W, height: H } })).newPage();
await page.goto(url, { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(3000);
const rows = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('section[data-chapter]').forEach((sec) => {
    const media = sec.querySelector('video, canvas');
    const h = sec.querySelector('h1, h2');
    if (!media || !h) return;
    const col = h.closest('div');
    const mr = media.getBoundingClientRect(), tr = col.getBoundingClientRect();
    if (mr.width < 200 || tr.width < 200) return;
    const side = Math.abs(mr.left - tr.left) > 100 && Math.abs(mr.top + mr.height / 2 - (tr.top + tr.height / 2)) < 2000;
    out.push({ id: sec.id, mediaH: Math.round(mr.height), textH: Math.round(tr.height), dy: Math.round((mr.top + mr.height / 2) - (tr.top + tr.height / 2)) });
  });
  return out;
});
for (const r of rows) console.log(r.id.padEnd(14), `mídia ${String(r.mediaH).padStart(4)} px | texto ${String(r.textH).padStart(4)} px | desvio do centro ${String(r.dy).padStart(5)} px`, Math.abs(r.dy) > 40 ? ' ⚠ desequilibrado' : '');
await browser.close();
