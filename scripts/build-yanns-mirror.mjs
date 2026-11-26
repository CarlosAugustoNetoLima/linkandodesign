import { mkdir, writeFile, rm, cp } from "node:fs/promises";
import { execSync } from "node:child_process";

const SRC = "/Users/carloslima/yanns/public";
const DEST = "/Users/carloslima/linkando-design/public/yanns";
const BASE = "http://localhost:8000";

const routes = [
  { url: "/", file: "index.html" },
  { url: "/musique", file: "musique.html" },
  { url: "/dates", file: "dates.html" },
  { url: "/collections", file: "collections.html" },
  { url: "/biographie", file: "biographie.html" },
  { url: "/produto?id=12616", file: "produto.html" },
];

await rm(DEST, { recursive: true, force: true });
await mkdir(DEST, { recursive: true });
await cp(`${SRC}/assets`, `${DEST}/assets`, { recursive: true });
await cp(`${SRC}/favicon.ico`, `${DEST}/favicon.ico`);
console.log("assets + favicon copiados");

function rewrite(html) {
  return html
    .replaceAll('="/assets/', '="/yanns/assets/')
    .replaceAll('="assets/', '="/yanns/assets/')
    .replaceAll("url(/assets/", "url(/yanns/assets/")
    .replaceAll("url(assets/", "url(/yanns/assets/")
    .replaceAll("url('/assets/", "url('/yanns/assets/")
    .replaceAll('url("/assets/', 'url("/yanns/assets/')
    .replaceAll('href="/favicon.ico"', 'href="/yanns/favicon.ico"')
    .replaceAll('href="/"', 'href="/yanns/index.html"')
    .replaceAll('href="/musique"', 'href="/yanns/musique.html"')
    .replaceAll('href="/dates"', 'href="/yanns/dates.html"')
    .replaceAll('href="/collections"', 'href="/yanns/collections.html"')
    .replaceAll('href="/biographie"', 'href="/yanns/biographie.html"')
    .replace(/href="\/produto\?id=\d+"/g, 'href="/yanns/produto.html"')
    .replace(/href="[^"]*\?lang=[a-z]{2}"/g, 'href="#"');
}

for (const r of routes) {
  const html = execSync(`curl -s --cookie "yanns_lang=fr" "${BASE}${r.url}"`, { maxBuffer: 50 * 1024 * 1024 }).toString();
  await writeFile(`${DEST}/${r.file}`, rewrite(html));
  console.log(`✓ ${r.file} (${html.length} bytes)`);
}
console.log("mirror pronto em public/yanns/");
