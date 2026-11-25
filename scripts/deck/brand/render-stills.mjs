// Renderiza os mockups de marca em imagem (jpg), uma por cena.
//   node scripts/deck/brand/render-stills.mjs <slug> <cena[,cena…]> [--out <pasta>] [--w 1600 --h 1000 --dpr 1.5] [--page mockups.html]
// Precisa do servidor estático em http://127.0.0.1:8030 apontando para scripts/deck/brand
// (python3 -m http.server 8030 --bind 127.0.0.1, rodado dentro de scripts/deck/brand).
// Saída padrão: public/decks/<slug>/mockup-<cena>.jpg
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const [slug, list] = args;
const out = path.resolve(ROOT, opt('--out', `public/decks/${slug}`));
const w = Number(opt('--w', 1600));
const h = Number(opt('--h', 1000));
const dpr = Number(opt('--dpr', 1.5));
const pageName = opt('--page', 'mockups.html');
const prefix = opt('--prefix', 'mockup-');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
for (const s of list.split(',')) {
  await page.goto(`http://127.0.0.1:8030/${slug}/${pageName}?s=${s}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const png = path.join(out, `${prefix}${s}.png`);
  await page.screenshot({ path: png });
  const jpg = path.join(out, `${prefix}${s}.jpg`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-q:v', '3', jpg]);
  rmSync(png);
  console.log('ok', path.relative(ROOT, jpg));
}
await browser.close();
