import type { Locale } from "@/lib/i18n";
import { SERVICE_LABEL, type ServiceKey } from "@/lib/pricing-base";
import { PLAYBOOK_ALERTS, PLAYBOOK_FIELDS } from "@/lib/playbook.generated";

// Lista oficial das perguntas do diagnóstico. A FONTE é o playbook que o Carlos edita,
// docs/playbook-diagnostico.md: scripts/chat/build-playbook.mjs o converte em
// lib/playbook.generated.ts (no `prebuild` e com `npm run playbook`). Este módulo só
// junta os dados gerados com os campos de contato e oferece as consultas.
//
// Quem usa:
//   lib/chat-context.ts   → monta a lista de perguntas do roteiro da IA
//   lib/lead-proposal.ts  → valida as respostas e os alertas extraídos da conversa (JSON)
//   app/api/chat/route.ts → portão: não deixa pedir contato nem resumir com obrigatório faltando
//
// `types` = para quais tipos de projeto o campo vale ("all" = todos).
// `required` = em quais tipos a IA precisa perguntar antes de pedir contato ("all" =
// todos; [] = só "bom saber"). "Não sei" ou "prefiro conversar" contam como resposta.
// `contact` = só no fim (nome e e-mail); fica no código porque o fluxo depende dele.

export type ProjectType = ServiceKey | "unsure";

export const PROJECT_TYPES: ProjectType[] = [
  "brand",
  "identity",
  "site",
  "landing",
  "siteRedesign",
  "system",
  "unsure",
];

export const PROJECT_TYPE_LABEL: Record<ProjectType, string> = {
  ...SERVICE_LABEL,
  unsure: "Ainda não sabe",
};

export type BriefingField = {
  id: string;
  question: Record<Locale, string>;
  types: ProjectType[] | "all";
  required: ProjectType[] | "all";
  contact?: boolean; // pedido só no fim, depois de todas as outras perguntas
};

export type BriefingAlert = {
  id: string;
  text: Record<Locale, string>;
  types: ProjectType[] | "all";
};

const CONTACT_FIELDS: BriefingField[] = [
  {
    id: "name",
    question: { pt: "Qual é o seu nome?", en: "What is your name?" },
    types: "all",
    required: "all",
    contact: true,
  },
  {
    id: "email",
    question: { pt: "Qual é o seu e-mail?", en: "What is your email?" },
    types: "all",
    required: "all",
    contact: true,
  },
  {
    id: "phone",
    question: { pt: "Tem um WhatsApp, se preferir?", en: "Do you have a WhatsApp number, if you prefer?" },
    types: "all",
    required: [],
    contact: true,
  },
];

export const BRIEFING_FIELDS: BriefingField[] = [...PLAYBOOK_FIELDS, ...CONTACT_FIELDS];
export const BRIEFING_ALERTS: BriefingAlert[] = PLAYBOOK_ALERTS;

// Alertas que o servidor calcula sozinho (a IA não avalia): o orçamento contra a base
// interna de valores, que o modelo nunca vê.
export const SERVER_ALERTS = new Set(["budget_low"]);

export const FIELD_IDS = BRIEFING_FIELDS.map((f) => f.id);

const hits = (list: ProjectType[] | "all", types: ProjectType[]) =>
  list === "all" || list.some((t) => types.includes(t));

// Campos que valem para os tipos dados. Sem tipo definido ainda, só os comuns.
export function fieldsFor(types: ProjectType[]): BriefingField[] {
  return BRIEFING_FIELDS.filter((f) => hits(f.types, types));
}

export function isRequired(f: BriefingField, types: ProjectType[]): boolean {
  return hits(f.required, types);
}

export function requiredFor(types: ProjectType[], opts: { contact?: boolean } = {}): BriefingField[] {
  return fieldsFor(types).filter((f) => isRequired(f, types) && (opts.contact ? true : !f.contact));
}

export function alertsFor(types: ProjectType[]): BriefingAlert[] {
  return BRIEFING_ALERTS.filter((a) => hits(a.types, types));
}

export function isProjectType(v: unknown): v is ProjectType {
  return typeof v === "string" && (PROJECT_TYPES as string[]).includes(v);
}

// Texto da lista para o prompt: comuns + um bloco por tipo, marcando obrigatório e
// "bom saber". Os campos de contato ficam fora (o prompt tem a regra própria do fim).
export function checklistText(locale: Locale): string {
  const pt = locale === "pt";
  const req = pt ? "obrigatório" : "required";
  const opt = pt ? "bom saber: só se a conversa estiver fluindo" : "nice to know: only if the conversation flows";
  const line = (f: BriefingField, t: ProjectType) =>
    `- [${f.id}] ${f.question[locale]} (${isRequired(f, [t]) ? req : opt})`;
  const common = BRIEFING_FIELDS.filter((f) => f.types === "all" && !f.contact).map((f) =>
    line(f, "unsure"),
  );
  const typeName: Record<ProjectType, string> = pt
    ? {
        brand: "Marca (criação)",
        identity: "Redesign de identidade",
        site: "Site",
        landing: "Landing page",
        siteRedesign: "Redesign de site",
        system: "Sistema interno",
        unsure: "Ainda não sabe",
      }
    : {
        brand: "Brand (new)",
        identity: "Identity redesign",
        site: "Website",
        landing: "Landing page",
        siteRedesign: "Website redesign",
        system: "Internal system",
        unsure: "Not sure yet",
      };
  const blocks = PROJECT_TYPES.filter((t) => t !== "unsure").map((t) => {
    const own = BRIEFING_FIELDS.filter((f) => f.types !== "all" && f.types.includes(t)).map((f) => line(f, t));
    return `${typeName[t]}:\n${own.join("\n")}`;
  });
  return `${pt ? "Para todos os projetos" : "For every project"}:\n${common.join("\n")}\n\n${blocks.join("\n\n")}`;
}
