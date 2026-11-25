#!/usr/bin/env node
// Verifica se um deck segue o padrão de portfólio da Linkando (skill add-portfolio-project).
// Uso: node scripts/deck/check-standard.mjs <slug | --all> [--net]
//   --net  também confere o link real (SSO da Vercel, erro HTTP) e os links extras.
// Saída: ✔ ok · ⚠ aviso (não bloqueia) · ✖ falha (exit 1).
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(path.join(root, 'package.json'));
const ts = require('typescript');

const args = process.argv.slice(2);
const net = args.includes('--net');
const target = args.find((a) => !a.startsWith('--'));
if (!target && !args.includes('--all')) {
  console.error('uso: node scripts/deck/check-standard.mjs <slug | --all> [--net]');
  process.exit(2);
}

// ---------- carrega os dossiês (TS → objeto) ----------
const NAO_DECK = new Set(['index', 'types', 'fonts', 'stage', 'showcase']);
const decksDir = path.join(root, 'lib/decks');
const indexSrc = readFileSync(path.join(decksDir, 'index.ts'), 'utf8');
const showcaseSrc = readFileSync(path.join(decksDir, 'showcase.ts'), 'utf8');

function load(file) {
  const src = readFileSync(path.join(decksDir, file + '.ts'), 'utf8');
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const m = { exports: {} };
  new Function('exports', 'require', 'module', js)(m.exports, () => ({}), m);
  const [exportName, deck] = Object.entries(m.exports).find(([, v]) => v && v.chapters) ?? [];
  return deck ? { file, exportName, deck } : null;
}
const all = readdirSync(decksDir)
  .filter((f) => f.endsWith('.ts'))
  .map((f) => f.slice(0, -3))
  .filter((f) => !NAO_DECK.has(f))
  .map(load)
  .filter(Boolean);

const picked = target ? all.filter((d) => d.deck.slug === target || d.file === target) : all;
if (!picked.length) {
  console.error(`deck não encontrado: ${target}. Dossiês existentes: ${all.map((d) => d.deck.slug).join(', ')}`);
  process.exit(2);
}

// ---------- utilitários ----------
const pub = (src) => path.join(root, 'public', src);
const MB = 1024 * 1024;
const probeCache = new Map();
function probe(file) {
  if (probeCache.has(file)) return probeCache.get(file);
  let r = null;
  try {
    const j = JSON.parse(
      execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,avg_frame_rate:format=duration,size', '-of', 'json', file], { encoding: 'utf8' }),
    );
    const [n, d] = (j.streams[0].avg_frame_rate || '0/1').split('/').map(Number);
    r = { w: j.streams[0].width, h: j.streams[0].height, fps: d ? n / d : 0, seconds: Number(j.format.duration), bytes: Number(j.format.size) };
  } catch {
    r = null;
  }
  probeCache.set(file, r);
  return r;
}
function strings(o, acc = []) {
  if (typeof o === 'string') acc.push(o);
  else if (Array.isArray(o)) o.forEach((x) => strings(x, acc));
  else if (o && typeof o === 'object') Object.values(o).forEach((x) => strings(x, acc));
  return acc;
}
function medias(o, acc = []) {
  if (o && typeof o === 'object') {
    if (o.src && o.poster) acc.push(o);
    Object.values(o).forEach((x) => medias(x, acc));
  }
  return acc;
}

const LIBS = /\b(GSAP|ScrollTrigger|SplitText|Lenis|Three\.js|React|Next\.js|Tailwind|Bootstrap|jQuery|Framer|next-intl|Chatbase|reCAPTCHA|Playwright|ffmpeg|Composer)\b/;
const ARQUIVO = /[\w-]+\.(php|css|js|jsx|tsx|ts|json|mjs|md|html|py|woff2?|mp4|webp|jpg|png|yml)\b/i;
const CODIGO = /`|<\/?[a-z]+>|=>|\{\s*\w+:|::|\(\)\s*\{|\bconst\b|\bfunction\b/;

// ---------- checagens de um deck ----------
async function check({ file, exportName, deck }) {
  const out = [];
  const ok = (m) => out.push(['ok', m]);
  const warn = (m) => out.push(['warn', m]);
  const fail = (m) => out.push(['fail', m]);

  // dossiê
  if (!deck.flags?.length) fail('sem bandeira (`flags`): uma por país, 🌍 só se atende o mundo todo');
  else ok(`bandeiras: ${deck.flags.join(' ')}`);
  for (const k of ['name', 'client', 'sector', 'location', 'tagline', 'summary']) if (!deck[k]) fail(`campo vazio no dossiê: ${k}`);
  if (!/^https:\/\//.test(deck.liveUrl ?? '')) fail('liveUrl ausente ou sem https');
  if (!deck.seo?.title || !deck.seo?.description) fail('seo.title e seo.description são obrigatórios');

  // registro
  const imp = indexSrc.match(new RegExp(`import \\{ (\\w+) \\} from "\\./${file}"`));
  const arr = (indexSrc.match(/decks: Deck\[\] = \[([^\]]*)\]/) || [])[1] ?? '';
  const nomes = arr.split(',').map((s) => s.trim()).filter(Boolean);
  if (!imp) fail('não está importado em lib/decks/index.ts');
  else if (!nomes.includes(imp[1])) fail(`importado mas fora da lista \`decks\` em lib/decks/index.ts`);
  else {
    ok('registrado em lib/decks/index.ts');
    if (nomes.indexOf(imp[1]) + 1 !== deck.index) warn(`\`index\` do dossiê é ${deck.index}, mas a posição no hub é ${nomes.indexOf(imp[1]) + 1}`);
  }
  if (new RegExp(`"${deck.slug}"`).test(showcaseSrc)) ok('citado em serviceProofs (aparece em "onde isso foi feito")');
  else out.push(['info', 'fora de serviceProofs (a seção "onde isso foi feito" da home só usa 6 dos projetos; é escolha editorial)']);

  // vitrine desktop = deck.cover
  const cover = deck.cover;
  const coverFile = cover?.src ? pub(cover.src) : null;
  if (!coverFile || !existsSync(coverFile)) fail(`capa do card sem arquivo: ${cover?.src}`);
  else {
    const nome = path.basename(cover.src);
    if (!nome.startsWith('vitrine-desktop')) warn(`a capa é \`${nome}\`: o padrão é \`vitrine-desktop.mp4\`, uma gravação do site inteiro em ação (ver skill add-portfolio-project)`);
    else ok('capa = vitrine-desktop');
    const p = probe(coverFile);
    if (p) {
      if (p.seconds < 6) fail(`capa com ${p.seconds.toFixed(1)} s (mínimo 16 s no padrão)`);
      else if (p.seconds < 16 || p.seconds > 30) warn(`capa com ${p.seconds.toFixed(1)} s (padrão: 16 a 30 s)`);
      else ok(`capa com ${p.seconds.toFixed(1)} s`);
      if (p.bytes > 4 * MB) warn(`capa com ${(p.bytes / MB).toFixed(1)} MB (padrão: até 4 MB)`);
      if (!((p.w === 1280 && p.h === 800) || (p.w === 1440 && p.h === 900))) warn(`capa em ${p.w}×${p.h} (padrão: 1280×800)`);
      if (p.fps && p.fps < 20) warn(`capa com ${p.fps.toFixed(0)} fps efetivos (padrão: 20 ou mais)`);
    } else warn('ffprobe indisponível: não medi a capa');
    if (!existsSync(pub(cover.poster))) fail(`pôster da capa sem arquivo: ${cover.poster}`);
  }

  // vitrine mobile = hero-mobile (nome fixo, lido por getShowcase)
  if (cover?.src) {
    const dir = cover.src.slice(0, cover.src.lastIndexOf('/') + 1);
    const mob = pub(dir + 'hero-mobile.mp4');
    if (!existsSync(mob)) fail(`falta ${dir}hero-mobile.mp4 (a home e o capítulo Celular o procuram)`);
    else {
      const p = probe(mob);
      if (p) {
        if (p.seconds < 9 || p.seconds > 20) warn(`hero-mobile com ${p.seconds.toFixed(1)} s (padrão: 10 a 20 s)`);
        else ok(`hero-mobile com ${p.seconds.toFixed(1)} s`);
        if (p.bytes > 2.5 * MB) warn(`hero-mobile com ${(p.bytes / MB).toFixed(1)} MB (padrão: até 2,5 MB)`);
        if (p.w !== 520 || p.h !== 1126) warn(`hero-mobile em ${p.w}×${p.h} (padrão: 520×1126)`);
      }
      if (!existsSync(pub(dir + 'hero-mobile.jpg'))) fail(`falta ${dir}hero-mobile.jpg`);
    }
  }

  // capítulos e mídias
  const ch = deck.chapters ?? [];
  if (ch[0]?.type !== 'cover') fail('o primeiro capítulo deve ser `cover`');
  if (ch[ch.length - 1]?.type !== 'cta') fail('o último capítulo deve ser `cta`');
  const ids = ch.map((c) => c.id);
  if (new Set(ids).size !== ids.length) fail('há ids de capítulo repetidos');
  const features = ch.filter((c) => c.type === 'feature' && c.media);
  if (features.length < 3) warn(`só ${features.length} efeito(s) com gravação (padrão: 3 a 5 efeitos-assinatura)`);
  else ok(`${features.length} efeitos com gravação, ${ch.length} capítulos`);
  let semArquivo = 0;
  let dimErrada = 0;
  for (const m of medias(deck)) {
    const f = pub(m.src);
    if (!existsSync(f) || !existsSync(pub(m.poster))) {
      semArquivo++;
      fail(`mídia sem arquivo: ${m.src}`);
      continue;
    }
    const p = probe(f);
    if (p && (p.w !== m.width || p.h !== m.height)) {
      dimErrada++;
      warn(`dimensões do dossiê (${m.width}×${m.height}) diferem do arquivo (${p.w}×${p.h}): ${m.src}`);
    }
  }
  if (!semArquivo && !dimErrada) ok('todas as mídias existem e batem com as dimensões');

  // texto público: sem biblioteca, nome de arquivo ou código fora de Desenvolvimento/Qualidade/Animações
  let achados = 0;
  for (const c of ch) {
    if (/desenvolv|qualidade/.test(c.id)) continue;
    for (const s of strings({ ...c, media: undefined, backdrop: undefined, desktop: undefined, mobile: undefined })) {
      if (/^\/decks\//.test(s) || /^https?:/.test(s) || /^</.test(s) || /^\.[a-z]/.test(s)) continue; // SVG e CSS dos ícones não são texto
      if (LIBS.test(s) || ARQUIVO.test(s) || CODIGO.test(s)) {
        achados++;
        warn(`texto técnico fora de Desenvolvimento (${c.id}): ${s.slice(0, 80)}`);
      }
    }
  }
  if (!achados) ok('texto público sem biblioteca, nome de arquivo ou código');

  // links reais
  if (net) {
    const urls = [deck.liveUrl, ...(deck.extraLinks ?? []).map((l) => l.url)].filter(Boolean);
    for (const u of urls) {
      try {
        const r = await fetch(u, { method: 'HEAD', redirect: 'manual' });
        const loc = r.headers.get('location') ?? '';
        if (/vercel\.com\/sso-api/.test(loc)) fail(`SSO da Vercel ligado (visitante cai no login): ${u}`);
        else if (r.status >= 400) fail(`HTTP ${r.status}: ${u}`);
        else ok(`link no ar (${r.status}): ${u}`);
      } catch (e) {
        fail(`link inacessível: ${u} (${e.message})`);
      }
    }
  }
  return out;
}

// ---------- relatório ----------
const ICONE = { ok: '✔', warn: '⚠', fail: '✖', info: '·' };
let falhas = 0;
for (const d of picked) {
  const res = await check(d);
  const f = res.filter(([l]) => l === 'fail').length;
  const w = res.filter(([l]) => l === 'warn').length;
  falhas += f;
  console.log(`\n${d.deck.slug}  —  ${f ? `${f} falha(s)` : 'sem falhas'}${w ? `, ${w} aviso(s)` : ''}`);
  for (const [l, m] of res) console.log(`  ${ICONE[l]} ${m}`);
}
console.log(falhas ? `\n✖ ${falhas} falha(s) no total` : '\n✔ nenhuma falha');
process.exit(falhas ? 1 : 0);
