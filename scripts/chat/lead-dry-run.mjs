// Gera o e-mail do lead (alertas, respostas do briefing, pré-proposta, notas internas e conversa) de
// uma conversa simulada com chat-turn.mjs, SEM enviar nada: grava .txt e .html.
// Uso: node scripts/chat/lead-dry-run.mjs <id-da-sessao> [partial|out]
// (sem modo: "out" se a conversa terminou com [[diagnostico-fora]], senão "complete")
// Lê a conversa de CHAT_SIM_DIR/<id>.json (o mesmo de chat-turn.mjs) e grava em
// LEAD_DRY_RUN_DIR (padrão: pasta temporária do sistema/linkando-lead).
// Usa GEMINI_API_KEY, PRICING_BASE e as envs da pré-proposta do .env.local (só lê; o SMTP é apagado do
// ambiente deste processo, então não há como sair e-mail).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);
const jiti = require("jiti")(import.meta.url, { alias: { "@": root }, interopDefault: true });

// .env.local → process.env (sem sobrescrever o que já existe), menos o SMTP
const envFile = join(root, ".env.local");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}
for (const k of ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "MAIL_TO"]) delete process.env[k];

const [id, mode] = process.argv.slice(2);
if (!id) {
  console.error("uso: node scripts/chat/lead-dry-run.mjs <id-da-sessao> [partial]");
  process.exit(2);
}
const simDir = process.env.CHAT_SIM_DIR || join(tmpdir(), "linkando-chat-sim");
const sim = JSON.parse(readFileSync(join(simDir, `${id}.json`), "utf8"));
const turns = sim.messages.map((m) => ({ role: m.role, content: m.content }));
const email = [...turns].reverse().find((m) => m.role === "user" && /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/.test(m.content));
const contact = email?.content.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/)[0] ?? "";
const status = mode === "partial" ? "partial" : mode === "out" || sim.out ? "out" : "complete";
if (!contact && status !== "out") {
  console.error("a conversa não tem e-mail do visitante");
  process.exit(1);
}

const { prepareLeadExtras, buildLeadEmail, missingRequired } = jiti(join(root, "lib/lead-proposal.ts"));
const input = { contact, locale: sim.locale, status, turns };
const t0 = Date.now();
const extras = await prepareLeadExtras(input);
const mail = buildLeadEmail(input, extras);

const outDir = process.env.LEAD_DRY_RUN_DIR || join(tmpdir(), "linkando-lead");
mkdirSync(outDir, { recursive: true });
const base = join(outDir, `${id}-${input.status}`);
writeFileSync(`${base}.txt`, `Assunto: [Site] ${mail.subject}\n\n${mail.text}`);
writeFileSync(`${base}.html`, mail.html);
writeFileSync(
  `${base}.json`,
  JSON.stringify(
    { cls: extras.cls, briefing: extras.briefing, draft: extras.draft, options: extras.proposal?.options ?? null, urgencyPct: extras.proposal?.urgencyPct ?? null, band: extras.band, warning: extras.warning },
    null,
    2,
  ),
);
console.log(`gravado: ${base}.txt (.html, .json) em ${Math.round((Date.now() - t0) / 1000)}s; nada foi enviado`);
if (input.status !== "partial") console.log(`tipos: ${extras.briefing?.types.join(", ") ?? "-"} | obrigatórios sem resposta: ${extras.briefing ? missingRequired(extras.briefing, { contact: true }).join(", ") || "nenhum" : "extração falhou"}`);
console.log(`classe: ${extras.cls ?? "-"} | alertas da IA: ${extras.briefing?.alerts.map((a) => a.id).join(", ") || "nenhum"}`);
if (extras.proposal) console.log(`opções: ${extras.proposal.options.map((o) => `${o.name} R$ ${o.price.toLocaleString("pt-BR")} (IA ${o.suggested ?? "-"}, ${o.hours ?? "-"}h)`).join(" | ")}${extras.proposal.urgencyPct ? ` | urgência ${extras.proposal.urgencyPct}%` : ""}`);
if (extras.warning) console.log(extras.warning);
