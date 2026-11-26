import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = join(root, "docs/playbook-diagnostico.md");
const OUT = join(root, "lib/playbook.generated.ts");

const SECTIONS = {
  comum: "all",
  marca: "brand",
  "redesign de identidade": "identity",
  site: "site",
  "redesign de site": "siteRedesign",
  "landing page": "landing",
  "sistema interno": "system",
};
const RESERVED = new Set(["name", "email", "phone"]);

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const errors = [];
const warnings = [];

const lines = readFileSync(SRC, "utf8").split("\n");
let section = null;
let list = null;
const fields = new Map();
const alerts = new Map();
const seenInSection = new Set();

lines.forEach((raw, i) => {
  const n = i + 1;
  const line = raw.trim();
  if (line.startsWith("## ")) {
    const key = norm(line.slice(3));
    if (!(key in SECTIONS)) {
      errors.push(`linha ${n}: seção desconhecida "${line.slice(3).trim()}" (use: ${Object.keys(SECTIONS).join(", ")})`);
      section = null;
    } else section = SECTIONS[key];
    list = null;
    return;
  }
  if (line.startsWith("### ")) {
    const key = norm(line.slice(4));
    list = key.startsWith("obrigat") ? "required" : key.startsWith("bom saber") ? "nice" : key.startsWith("alerta") ? "alert" : null;
    if (!list) errors.push(`linha ${n}: subtítulo desconhecido "${line.slice(4).trim()}" (use: Obrigatório antes do e-mail, Bom saber, Alerta)`);
    return;
  }
  if (!/^[-*]\s*\[/.test(line)) return;
  const m = line.match(/^[-*]\s*\[([^\]]*)\]\s*(.+)$/);
  if (!m) return errors.push(`linha ${n}: formato esperado "- [id] Pergunta | Question"`);
  const id = m[1].trim();
  const [pt, en] = m[2].split("|").map((s) => s.trim());
  if (!/^[a-z][a-z0-9_]*$/.test(id)) return errors.push(`linha ${n}: id "${id}" inválido (minúsculas, números e _)`);
  if (RESERVED.has(id)) return errors.push(`linha ${n}: o id "${id}" é reservado (nome, e-mail e telefone ficam no código)`);
  if (!pt) return errors.push(`linha ${n}: falta o texto em português`);
  if (!section) return errors.push(`linha ${n}: item fora de uma seção (## Comum, ## Marca...)`);
  if (!list) return errors.push(`linha ${n}: item fora de uma lista (### Obrigatório antes do e-mail, ### Bom saber, ### Alerta)`);
  const key = `${section}:${id}`;
  if (seenInSection.has(key)) return errors.push(`linha ${n}: o id "${id}" aparece duas vezes na mesma seção`);
  seenInSection.add(key);

  if (list === "alert") {
    if (fields.has(id)) return errors.push(`linha ${n}: o id "${id}" já é uma pergunta; use outro id para o alerta`);
    const a = alerts.get(id) ?? { id, text: { pt, en: en || pt }, types: new Set() };
    a.types.add(section);
    alerts.set(id, a);
    return;
  }
  if (alerts.has(id)) return errors.push(`linha ${n}: o id "${id}" já é um alerta; use outro id para a pergunta`);
  if (!en) warnings.push(`linha ${n}: [${id}] sem texto em inglês; o chat em inglês usa o português como base`);
  const f = fields.get(id) ?? { id, question: { pt, en: en || pt }, types: new Set(), required: new Set(), line: n };
  if (fields.has(id) && f.question.pt !== pt)
    warnings.push(`linha ${n}: [${id}] tem texto diferente da linha ${f.line}; vale o da linha ${f.line}`);
  f.types.add(section);
  if (list === "required") f.required.add(section);
  fields.set(id, f);
});

if (![...fields.values()].some((f) => f.required.has("all"))) errors.push(`a seção "## Comum" precisa de pelo menos um item obrigatório`);

for (const w of warnings) console.warn(`[playbook] aviso: ${w}`);
if (errors.length) {
  console.error(`[playbook] ${SRC} tem ${errors.length} erro(s):\n${errors.map((e) => `  - ${e}`).join("\n")}`);
  process.exit(1);
}

const typesOf = (set) => (set.has("all") ? '"all"' : JSON.stringify([...set]));
const fieldRows = [...fields.values()].map(
  (f) =>
    `  { id: ${JSON.stringify(f.id)}, question: { pt: ${JSON.stringify(f.question.pt)}, en: ${JSON.stringify(f.question.en)} }, types: ${typesOf(f.types)}, required: ${typesOf(f.required)} },`,
);
const alertRows = [...alerts.values()].map(
  (a) => `  { id: ${JSON.stringify(a.id)}, text: { pt: ${JSON.stringify(a.text.pt)}, en: ${JSON.stringify(a.text.en)} }, types: ${typesOf(a.types)} },`,
);

const out = `export type PlaybookType = "brand" | "identity" | "site" | "landing" | "siteRedesign" | "system";

export type PlaybookField = {
  id: string;
  question: { pt: string; en: string };
  types: PlaybookType[] | "all";
  required: PlaybookType[] | "all";
};

export type PlaybookAlert = {
  id: string;
  text: { pt: string; en: string };
  types: PlaybookType[] | "all";
};

export const PLAYBOOK_FIELDS: PlaybookField[] = [
${fieldRows.join("\n")}
];

export const PLAYBOOK_ALERTS: PlaybookAlert[] = [
${alertRows.join("\n")}
];
`;

const current = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
if (process.argv.includes("--check")) {
  if (current !== out) {
    console.error("[playbook] lib/playbook.generated.ts está desatualizado: rode npm run playbook");
    process.exit(1);
  }
  console.log("[playbook] ok: o arquivo gerado está em dia");
  process.exit(0);
}
if (current !== out) writeFileSync(OUT, out);
const req = [...fields.values()].filter((f) => f.required.size).length;
console.log(
  `[playbook] ${fields.size} perguntas (${req} obrigatórias em algum tipo), ${alerts.size} alertas → lib/playbook.generated.ts${current === out ? " (sem mudança)" : ""}`,
);
