// Simula UM turno do visitante contra /api/chat (mesmo contrato do ChatAgent), para testar o
// diagnóstico com personas (ver docs/chat-diagnostico.md).
// Uso: node scripts/chat/chat-turn.mjs <id-da-sessao> "<mensagem>" [pt|en]
//      node scripts/chat/chat-turn.mjs <id-da-sessao> --show     (imprime a conversa)
// Precisa do servidor de pé (CHAT_URL, padrão http://localhost:3011/api/chat). Não chama
// /api/chat/lead: nenhum e-mail sai. A conversa fica em CHAT_SIM_DIR (padrão: pasta
// temporária do sistema) como <id>.json. A saudação do site NÃO é enviada (a rota descarta
// mensagens iniciais do assistente), igual ao app real.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const DIR = process.env.CHAT_SIM_DIR || join(tmpdir(), "linkando-chat-sim");
mkdirSync(DIR, { recursive: true });
const BASE = process.env.CHAT_URL || "http://localhost:3011/api/chat";
const [id, msg, loc] = process.argv.slice(2);
if (!id) { console.error("uso: node chat-turn.mjs <id> \"<mensagem>\" [pt|en]"); process.exit(2); }
const file = join(DIR, `${id}.json`);
const s = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : { id, locale: loc === "en" ? "en" : "pt", messages: [], fails: 0, done: false, ts: Date.now() };

if (msg === "--show") {
  for (const m of s.messages) console.log(`${m.role === "user" ? "VISITANTE" : "ASSISTENTE"}: ${m.content}\n`);
  console.log(`[fim do diagnóstico: ${s.done ? "SIM" : "não"} | falhas da API: ${s.fails}]`);
  process.exit(0);
}
if (!msg) { console.error("falta a mensagem"); process.exit(2); }

const DONE_RE = /\[\[\s*diagnostico-completo\s*\]\]/i;
const OUT_RE = /\[\[\s*diagnostico-fora\s*\]\]/i;
const strip = (t) => t.replace(/\[\[[^\]]*\]\]/g, "").replace(/\[\[[^\]]*$/, "").trim();
const ipN = [...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 250, 7);

s.messages.push({ role: "user", content: msg });
let text = "", ok = false;
for (let attempt = 0; attempt < 4 && !ok; attempt++) {
  try {
    const res = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": `10.60.${ipN}.${(attempt % 200) + 1}` },
      body: JSON.stringify({ locale: s.locale, messages: s.messages }),
      signal: AbortSignal.timeout(60_000),
    });
    if (res.ok) { text = await res.text(); ok = text.trim().length > 0; }
    if (!ok) { s.fails++; await new Promise((r) => setTimeout(r, 4000 * (attempt + 1))); }
  } catch { s.fails++; await new Promise((r) => setTimeout(r, 4000)); }
}
if (!ok) {
  s.messages.pop(); // não registra o turno que falhou: o visitante simulado pode reenviar
  writeFileSync(file, JSON.stringify(s, null, 2));
  console.log("[API INDISPONÍVEL: o chat real mostraria o script offline. Reenvie a mesma mensagem em alguns segundos.]");
  process.exit(0);
}
const truncated = /problema de conex/.test(text);
const done = DONE_RE.test(text);
const out = OUT_RE.test(text);
const clean = strip(text);
s.messages.push({ role: "assistant", content: clean, ...(done ? { marker: true } : {}), ...(out ? { outMarker: true } : {}), ...(truncated ? { truncated: true } : {}) });
if (done) s.done = true;
if (out) s.out = true;
writeFileSync(file, JSON.stringify(s, null, 2));
console.log(clean);
if (done) console.log("\n[DIAGNÓSTICO FECHADO: o assistente encerrou. Pare aqui.]");
if (out) console.log("\n[ENCERRADO COMO FORA DO PERFIL: o site mandaria a conversa com status out. Pare aqui.]");
