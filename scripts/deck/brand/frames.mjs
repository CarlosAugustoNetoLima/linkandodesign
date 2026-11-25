// Folha de contato de uma página animada em instantes fixos (?t=).
//   node scripts/deck/brand/frames.mjs <slug/pagina.html[?extra]> <w> <h> <t1,t2,…> <saida.jpg>
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const [pg, w, h, ts, out] = process.argv.slice(2);
const dir = mkdtempSync(path.join(os.tmpdir(), 'frames-'));
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const list = ts.split(',');
const files = [];
for (const [i, t] of list.entries()) {
  const sep = pg.includes('?') ? '&' : '?';
  await p.goto(`http://127.0.0.1:8030/${pg}${sep}t=${t}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  const f = path.join(dir, `f${i}.png`); await p.screenshot({ path: f }); files.push(f);
}
await b.close();
const cols = +w > +h ? 3 : 6;
const sw = +w > +h ? 640 : 260;
const inputs = files.flatMap((f) => ['-i', f]);
const sc = files.map((_, i) => `[${i}]scale=${sw}:-1[s${i}]`).join(';');
const rows = Math.ceil(files.length / cols);
const sh = Math.round(sw * +h / +w);
const layout = files.map((_, i) => `${(i % cols) * sw}_${Math.floor(i / cols) * sh}`).join('|');
execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', `${sc};${files.map((_, i) => `[s${i}]`).join('')}xstack=inputs=${files.length}:layout=${layout}:fill=gray`, out]);
console.log(out, rows);
