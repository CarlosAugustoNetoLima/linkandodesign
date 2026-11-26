import { createRequire } from "module";
const require = createRequire(new URL("../../package.json", import.meta.url));
const { chromium } = require("playwright");
const BASE = process.env.DECK_BASE || "http://localhost:3010";
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : ["cinnamon-studio","az-car-rental","collision-auto-pros","hubber-reels","hubber","in-the-level","jsynq-marca","jsynq-workspace","station-one","tickett","viva-o-samba","yanns","jsynq"];
const browser = await chromium.launch({ channel: "chrome" });
let total = 0;
const detect = () => {
  const out = [];
  const seen = new Set();
  const label = (el) => `${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.split(/\s+/).filter(Boolean).slice(0, 3).join(".") : ""}`;
  const chap = (el) => (el.closest("section[id], [id]")?.id) || "?";
  const textRects = (el) => {
    const rs = [];
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      if (!n.textContent.trim() || n.parentElement?.closest(".sr-only")) continue;
      const rg = document.createRange(); rg.selectNodeContents(n);
      for (const r of rg.getClientRects()) if (r.width > 0 && r.height > 0) rs.push({ r, t: n.textContent.trim().slice(0, 40) });
    }
    return rs;
  };
  const push = (kind, el, extra) => {
    const key = kind + chap(el) + label(el) + extra;
    if (seen.has(key)) return; seen.add(key);
    out.push({ kind, chapter: chap(el), el: label(el), extra });
  };
  for (const el of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    if (el.closest(".sr-only")) continue;
    const rect = el.getBoundingClientRect();
    if (cs.textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth + 1) push("reticencias", el, el.textContent.trim().slice(0, 50));
    if ((cs.webkitLineClamp && cs.webkitLineClamp !== "none") && el.scrollHeight > el.clientHeight + 1) push("line-clamp", el, el.textContent.trim().slice(0, 50));
    const hid = (v) => v === "hidden" || v === "clip";
    if ((hid(cs.overflowX) || hid(cs.overflowY)) && rect.width > 0 && rect.height > 0 && !["VIDEO", "IMG", "CANVAS", "SVG"].includes(el.tagName.toUpperCase())) {
      for (const { r, t } of textRects(el)) {
        const ix = Math.min(r.right, rect.right) - Math.max(r.left, rect.left);
        const iy = Math.min(r.bottom, rect.bottom) - Math.max(r.top, rect.top);
        if (ix <= 0 || iy <= 0) continue;
        const dTop = rect.top - r.top, dBot = r.bottom - rect.bottom, dL = rect.left - r.left, dR = r.right - rect.right;
        const clipY = hid(cs.overflowY) && (dTop > 1.5 || dBot > 1.5);
        const clipX = hid(cs.overflowX) && (dL > 1.5 || dR > 1.5);
        if (clipY || clipX) { push("cortado", el, `"${t}" topo${Math.round(dTop)} base${Math.round(dBot)} esq${Math.round(dL)} dir${Math.round(dR)}`); break; }
      }
    }
  }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const p = n.parentElement; if (!p || !n.textContent.trim() || p.closest(".sr-only")) continue;
    const cs = getComputedStyle(p); if (cs.display === "none" || cs.visibility === "hidden") continue;
    const rg = document.createRange(); rg.selectNodeContents(n);
    for (const r of rg.getClientRects()) if (r.width > 0 && (r.right > innerWidth + 1 || r.left < -1) && r.top > -50) { push("fora-da-tela", p, `"${n.textContent.trim().slice(0, 40)}" dir${Math.round(r.right - innerWidth)}`); break; }
  }
  return out;
};
for (const slug of slugs) {
  for (const [W, H] of [[1440, 900], [1280, 720], [375, 812]]) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, ...(W < 700 ? { hasTouch: true, isMobile: true } : {}) });
    const page = await ctx.newPage();
    const errors = []; page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(`${BASE}/apresentacoes/${slug}`, { waitUntil: "load", timeout: 280000 });
    await page.waitForTimeout(1800);
    const total_h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total_h; y += Math.round(H * 0.7)) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(220); }
    await page.waitForTimeout(3500);
    const found = await page.evaluate(detect);
    total += found.length;
    console.log(`${slug} ${W}x${H}: ${found.length} achado(s)${errors.length ? " ERRO " + errors[0] : ""}`);
    for (const f of found) console.log(`   ${f.kind} [${f.chapter}] ${f.el} ${f.extra}`);
    await ctx.close();
  }
}
console.log(total ? `${total} ACHADO(S) NO TOTAL` : "NADA CORTADO");
await browser.close();
process.exit(total ? 1 : 0);
