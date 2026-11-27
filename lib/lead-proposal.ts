import {
  BRIEFING_FIELDS,
  PROJECT_TYPE_LABEL,
  SERVER_ALERTS,
  alertsFor,
  fieldsFor,
  isProjectType,
  requiredFor,
  type ProjectType,
} from "@/lib/briefing-fields";
import { getDictionary, type Locale } from "@/lib/i18n";
import { generate, type Turn } from "@/lib/llm";
import { esc, isEmail } from "@/lib/mail";
import {
  SERVICE_LABEL,
  bandLine,
  fmt,
  moneyIn,
  priceBand,
  qualificationLine,
  qualify,
  type Band,
  type Modifiers,
  type Qualification,
  type ServiceKey,
} from "@/lib/pricing-base";


export type AnswerStatus = "respondido" | "parcial" | "nao-sabe" | "sem-resposta";
export type Answer = { status: AnswerStatus; value: string };
export type RaisedAlert = { id: string; reason: string };
export type Signals = {
  decider: "decide" | "identificado" | "nao-identificado";
  deadline: "viavel" | "sem-data" | "urgente-aceita" | "urgente-sem-resposta" | "urgente-recusa";
  budgetFlexible: boolean | null;
  naming: boolean;
  siteAdvanced: boolean;
};
export type BriefingAnswers = {
  types: ProjectType[];
  answers: Record<string, Answer>;
  alerts: RaisedAlert[];
  signals: Signals;
};

const DEADLINES_PT =
  "Landing page: 1–2 semanas. Site completo: 4–8 semanas. Branding completo: 3–6 semanas. Sistemas: depende do escopo. Mais de um serviço: as faixas se somam como ponto de partida.";

const transcriptOf = (turns: Turn[]) =>
  turns.map((m) => `${m.role === "user" ? "Visitante" : "Assistente"}: ${m.content}`).join("\n\n");

const typesOrUnsure = (b: BriefingAnswers): ProjectType[] => (b.types.length ? b.types : ["unsure"]);

function extractionPrompt(): string {
  const fields = BRIEFING_FIELDS.map(
    (f) =>
      `- ${f.id}: ${f.question.pt} (vale para: ${f.types === "all" ? "todos" : f.types.join(", ")})`,
  ).join("\n");
  const alerts = alertsFor(["brand", "identity", "site", "landing", "siteRedesign", "system", "unsure"])
    .filter((a) => !SERVER_ALERTS.has(a.id))
    .map((a) => `- ${a.id}: ${a.text.pt} (vale para: ${a.types === "all" ? "todos" : a.types.join(", ")})`)
    .join("\n");
  return `Você extrai as respostas de um diagnóstico de projeto a partir da conversa entre um visitante e o assistente do estúdio Linkando Design. Use só o que o VISITANTE disse (o assistente pode resumir, mas vale o que o visitante confirmou). Não invente nada.

Tipos de projeto possíveis (ids): brand (marca nova), identity (redesign de marca existente), site (site novo), landing (landing page), siteRedesign (redesign de site existente), system (sistema interno ou painel), unsure (ainda não sabe). Se a pessoa trocou de escopo durante a conversa (por exemplo, começar por uma landing em vez do site), use o escopo final.

Campos (id: pergunta):
${fields}

Para cada campo, devolva:
- status "respondido" com o valor resumido em PT, numa frase curta, fiel ao que o visitante disse;
- status "respondido" com value "não se aplica: <motivo>" quando uma resposta anterior torna o campo sem sentido (ex.: registro do nome quando o nome ainda vai ser criado);
- status "parcial" SÓ nos itens de acesso (${PARTIAL_IDS.join(", ")}) quando a resposta não diz onde está registrado (ou com quem está) e quem tem o acesso, ou se está livre (ex.: "o domínio é nosso", "tenho hospedagem"); value: o que ele disse;
- status "nao-sabe" quando o visitante disse que não sabe, que prefere conversar ou que ainda vai definir (value: o que ele disse);
- status "sem-resposta" quando o assunto não apareceu (value: "").
Campos que não valem para os tipos do projeto também vão como "sem-resposta".
O campo decision só é "respondido" quando o visitante disse quem decide a CONTRATAÇÃO (ele, um sócio, a diretoria). Quem usa ou vê o sistema ("eu e meu irmão vemos tudo") não responde a decision: aí vai "sem-resposta".

Alertas (id: quando acende). Acenda só os que valem para os tipos do projeto e só com base no que o visitante disse; em "reason", diga em uma frase curta, em PT, o fato que acendeu o alerta:
${alerts}
Prazos típicos, para o alerta e o sinal de prazo: ${DEADLINES_PT}

Sinais (em "signals"):
- decider: "decide" se quem conversa disse que decide a contratação sozinho; "identificado" se disse que a decisão é dividida ou de outra pessoa e quem é (nome ou cargo); "nao-identificado" se o assunto da decisão de contratação não apareceu com clareza (quem usa ou vê o sistema não conta).
- deadline: "viavel" se a data pedida é igual ou maior que a faixa típica; "sem-data" se não há data; "urgente-aceita" se a data é menor que a faixa típica e a pessoa aceitou a taxa de urgência ou um prazo maior; "urgente-recusa" se é menor e ela recusou; "urgente-sem-resposta" se é menor e o assunto ficou sem resposta.
- budgetFlexible: true se a pessoa disse que pode aumentar o investimento ou topou começar por uma parte menor; false se disse que não tem flexibilidade; null se o assunto não apareceu.
- naming: true se o nome da marca ainda vai ser criado.
- siteAdvanced: true se o site pede 3D, efeitos ou animações pesadas, ou mais de um idioma.

Responda SÓ com JSON, sem texto antes ou depois, neste formato:
{"types":["site"],"answers":{"business":{"status":"respondido","value":"..."}},"alerts":[{"id":"deadline_short","reason":"..."}],"signals":{"decider":"decide","deadline":"viavel","budgetFlexible":null,"naming":false,"siteAdvanced":false}}
Inclua todos os ids de campo em "answers". Sem alerta, devolva "alerts":[].`;
}

function parseJson(text: string): unknown {
  const body = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(body.slice(start, end + 1));
  } catch {
    return null;
  }
}

const oneOf = <T extends string>(v: unknown, list: readonly T[], fallback: T): T =>
  typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : fallback;

export function normalizeAnswers(raw: unknown): BriefingAnswers | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { types?: unknown; answers?: unknown; alerts?: unknown; signals?: unknown };
  const types = Array.from(new Set((Array.isArray(r.types) ? r.types : []).filter(isProjectType)));
  const src = (r.answers && typeof r.answers === "object" ? r.answers : {}) as Record<string, unknown>;
  const answers: Record<string, Answer> = {};
  for (const f of BRIEFING_FIELDS) {
    const a = src[f.id] as { status?: unknown; value?: unknown } | undefined;
    const value = typeof a?.value === "string" ? a.value.trim().slice(0, 600) : "";
    const status: AnswerStatus =
      a?.status === "respondido" && value
        ? "respondido"
        : a?.status === "parcial" && value
          ? PARTIAL_IDS.includes(f.id) ? "parcial" : "respondido"
          : a?.status === "nao-sabe"
            ? "nao-sabe"
            : "sem-resposta";
    answers[f.id] = { status, value: status === "sem-resposta" ? "" : value };
  }
  const allowed = new Set(alertsFor(types.length ? types : ["unsure"]).map((a) => a.id));
  const alerts: RaisedAlert[] = [];
  for (const a of Array.isArray(r.alerts) ? r.alerts : []) {
    const id = typeof a?.id === "string" ? a.id : "";
    if (!allowed.has(id) || SERVER_ALERTS.has(id) || alerts.some((x) => x.id === id)) continue;
    alerts.push({ id, reason: typeof a.reason === "string" ? a.reason.trim().slice(0, 300) : "" });
  }
  const sg = (r.signals && typeof r.signals === "object" ? r.signals : {}) as Record<string, unknown>;
  const signals: Signals = {
    decider: oneOf(sg.decider, ["decide", "identificado", "nao-identificado"] as const, "nao-identificado"),
    deadline: oneOf(sg.deadline, ["viavel", "sem-data", "urgente-aceita", "urgente-sem-resposta", "urgente-recusa"] as const, "sem-data"),
    budgetFlexible: typeof sg.budgetFlexible === "boolean" ? sg.budgetFlexible : null,
    naming: sg.naming === true,
    siteAdvanced: sg.siteAdvanced === true,
  };
  return { types, answers, alerts, signals };
}

export async function extractBriefing(turns: Turn[], opts: { deadlineMs?: number } = {}): Promise<BriefingAnswers | null> {
  const out = await generate(
    extractionPrompt(),
    [{ role: "user", content: `Conversa:\n\n${transcriptOf(turns)}` }],
    {
      json: true,
      temperature: 0.1,
      maxTokens: 8192,
      timeoutScale: 2,
      deadlineMs: opts.deadlineMs ?? 30_000,
      label: "extração do briefing",
      accept: (t) => normalizeAnswers(parseJson(t)) !== null,
    },
  );
  return out ? normalizeAnswers(parseJson(out)) : null;
}

export const PARTIAL_IDS = ["site_domain", "site_hosting", "brand_availability"];
const DIG_WORDS = /(acesso|registrad|com quem|quem tem|quem cuida|onde est|livre|dispon[ií]v|access|registered|who has|where is|available)/i;
const PARTIAL_TOPIC: Record<string, RegExp> = {
  site_domain: /dom[ií]nio|domain/i,
  site_hosting: /hospedagem|hosting|servidor/i,
  brand_availability: /@|arroba|redes|instagram|handle|dom[ií]nio|domain/i,
};
function dugDeeper(id: string, turns: Turn[]): boolean {
  return turns.some((t) => t.role === "assistant" && PARTIAL_TOPIC[id]?.test(t.content) && DIG_WORDS.test(t.content));
}

export function missingRequired(b: BriefingAnswers, opts: { contact?: boolean; turns?: Turn[] } = {}): string[] {
  const turns = opts.turns;
  return requiredFor(typesOrUnsure(b), opts)
    .filter((f) => {
      const st = b.answers[f.id]?.status;
      if (st === "sem-resposta") return true;
      if (!turns) return false;
      if (st === "parcial") return !dugDeeper(f.id, turns);
      if (f.id === "decision") return b.signals.decider === "nao-identificado" && st !== "nao-sabe";
      return false;
    })
    .map((f) => f.id);
}

const numberEnv = (name: string) => {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const listEnv = (name: string) => {
  const values = (process.env[name] ?? "")
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
  return values.length ? values : [100];
};

export const HOURLY_MIN = numberEnv("HOURLY_MIN");
const HOURLY_MAX = numberEnv("HOURLY_MAX");
export const URGENCY_PCT = {
  min: numberEnv("URGENCY_MIN"),
  max: numberEnv("URGENCY_MAX"),
  default: numberEnv("URGENCY_DEFAULT"),
};
export const PAYMENT = {
  smallUpTo: numberEnv("PAYMENT_SMALL_UPTO"),
  small: listEnv("PAYMENT_SMALL"),
  large: listEnv("PAYMENT_LARGE"),
  pixDiscountPct: numberEnv("PIX_DISCOUNT_PCT"),
  cardNoInterest: numberEnv("CARD_NO_INTEREST"),
  cardWithInterest: numberEnv("CARD_WITH_INTEREST"),
};
const REVISION_ROUNDS = numberEnv("REVISION_ROUNDS");

const brl = (n: number) => fmt({ amount: n, currency: "BRL" });
const round100 = (n: number) => Math.round(n / 100) * 100;
const ceil100 = (n: number) => Math.ceil(n / 100) * 100;

export function priceFloor(): number {
  return ceil100(numberEnv("PRICE_FLOOR"));
}

function validityDays(): number {
  return Math.floor(numberEnv("PROPOSAL_VALIDITY_DAYS"));
}

export const OPTION_NAMES = ["Essencial", "Recomendado", "Completo"] as const;
export type OptionName = (typeof OPTION_NAMES)[number];

export type PricedOption = {
  name: OptionName;
  scope: string;
  deadline: string;
  hours: number | null;
  suggested: number | null;
  base: number;
  price: number;
};

export function priceOptions(
  raw: { name?: string; scope?: string; deadline?: string; hours?: unknown; price?: unknown }[],
  band: Band | null,
  urgencyPct: number | null,
): { options: PricedOption[]; lower: number; upper: number | null; notes: string[] } {
  const notes: string[] = [];
  const lower = Math.max(priceFloor(), band ? ceil100(band.min) : 0);
  const upper = band?.max ? Math.max(lower, round100(band.max)) : null;
  const clamp = (n: number) => Math.min(upper ?? Infinity, Math.max(lower, round100(n)));
  const num = (v: unknown) => {
    const n = typeof v === "number" ? v : typeof v === "string" ? Number(v.replace(/[^\d]/g, "")) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  };
  const fallbackFor = (i: number) => {
    const top = upper ?? lower * 2;
    return [lower, (lower + top) / 2, top][i];
  };
  const options: PricedOption[] = OPTION_NAMES.map((name, i) => {
    const r = raw.find((o) => (o.name ?? "").toLowerCase().startsWith(name.toLowerCase().slice(0, 5))) ?? raw[i] ?? {};
    const suggested = num(r.price);
    const hours = num(r.hours);
    let base = suggested ?? fallbackFor(i);
    if (suggested === null) notes.push(`${name}: a IA não devolveu valor; o servidor usou ${brl(round100(base))}.`);
    if (hours && hours * HOURLY_MIN > base) {
      notes.push(`${name}: ${hours}h × R$ ${HOURLY_MIN} = ${brl(hours * HOURLY_MIN)} passa do valor sugerido (${brl(base)}); valor elevado.`);
      base = ceil100(hours * HOURLY_MIN);
    }
    const clamped = clamp(base);
    if (clamped !== round100(base))
      notes.push(`${name}: ${brl(round100(base))} fora da faixa (${brl(lower)} a ${upper ? brl(upper) : "sem teto"}); ajustado para ${brl(clamped)}.`);
    return { name, scope: (r.scope ?? "").trim(), deadline: (r.deadline ?? "").trim(), hours, suggested, base: clamped, price: clamped };
  });
  const sorted = options.map((o) => o.base).sort((a, b) => a - b);
  options.forEach((o, i) => (o.base = sorted[i]));
  if (new Set(sorted).size < 3) notes.push("Duas opções ficaram com o mesmo valor (a faixa limitou): diferencie o escopo ou o valor antes de encaminhar.");
  if (urgencyPct !== null) for (const o of options) o.price = round100(o.base * (1 + urgencyPct / 100));
  return { options, lower, upper, notes };
}

export type Installment = { label: string; pct: number; amount: number };

export function pixTotal(price: number): number {
  return Math.floor((price * (100 - PAYMENT.pixDiscountPct)) / 100 / 10) * 10;
}

export function paymentPlan(price: number, locale: Locale): Installment[] {
  const pt = locale === "pt";
  const labels = price <= PAYMENT.smallUpTo
    ? pt ? ["na assinatura do contrato", "na entrega"] : ["when the contract is signed", "on delivery"]
    : pt ? ["na assinatura do contrato", "na aprovação do design", "na entrega"] : ["when the contract is signed", "on design approval", "on delivery"];
  const pcts = price <= PAYMENT.smallUpTo ? PAYMENT.small : PAYMENT.large;
  const parts = pcts.map((pct, i) => ({ label: labels[i], pct, amount: (price * pct) / 100 }));
  parts[parts.length - 1].amount = price - parts.slice(0, -1).reduce((s, p) => s + p.amount, 0);
  return parts;
}

export function checkPaymentPlan(price: number, plan: Installment[]): string | null {
  const minEntry = price <= PAYMENT.smallUpTo ? PAYMENT.small[0] : PAYMENT.large[0];
  if (plan[0].pct < minEntry) return `entrada abaixo de ${minEntry}%`;
  if (plan.reduce((s, p) => s + p.amount, 0) !== price) return "as parcelas não somam o total";
  if (plan.some((p) => p.amount <= 0)) return "parcela sem valor";
  if (!PAYMENT.cardNoInterest || !PAYMENT.cardWithInterest) return "limites de parcelamento não configurados";
  return null;
}

export type ProposalDraft = {
  title: string;
  understanding: string;
  steps: { n: string; deliverable: string }[];
  deadline: string;
  options: { name: string; scope: string; deadline: string; hours: unknown; price: unknown }[];
  differences: string;
  urgencyPct: unknown;
  priceFactors: string[];
  notes: { pricePosition: string; risks: string[]; openPoints: string[]; questions: string[] };
};

const str = (v: unknown, max = 1500) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const strList = (v: unknown, limit: number) =>
  (Array.isArray(v) ? v : []).map((x) => str(x, 400)).filter(Boolean).slice(0, limit);

export function normalizeDraft(raw: unknown): ProposalDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const notes = (r.notes && typeof r.notes === "object" ? r.notes : {}) as Record<string, unknown>;
  const steps = (Array.isArray(r.steps) ? r.steps : [])
    .map((s) => {
      const o = (s ?? {}) as Record<string, unknown>;
      const n = str(o.step ?? o.n, 40).match(/0?([1-7])/)?.[1];
      return n ? { n: `0${n}`, deliverable: str(o.deliverable, 500) } : null;
    })
    .filter((s): s is { n: string; deliverable: string } => Boolean(s?.deliverable))
    .filter((s, i, all) => all.findIndex((x) => x.n === s.n) === i)
    .sort((a, b) => a.n.localeCompare(b.n));
  const options = (Array.isArray(r.options) ? r.options : []).slice(0, 3).map((o) => {
    const x = (o ?? {}) as Record<string, unknown>;
    return { name: str(x.name, 40), scope: str(x.scope, 600), deadline: str(x.deadline, 200), hours: x.hours, price: x.price };
  });
  const understanding = str(r.understanding);
  if (!understanding || !steps.length || options.length < 3) return null;
  return {
    title: str(r.title, 160),
    understanding,
    steps,
    deadline: str(r.deadline, 800),
    options,
    differences: str(r.differences, 400),
    urgencyPct: r.urgencyPct,
    priceFactors: strList(r.priceFactors, 3),
    notes: {
      pricePosition: str(notes.pricePosition, 800),
      risks: strList(notes.risks, 8),
      openPoints: strList(notes.openPoints, 8),
      questions: strList(notes.questions, 8),
    },
  };
}

function proposalPrompt(locale: Locale, band: Band | null, urgent: boolean, fit: string): string {
  const steps = getDictionary(locale)
    .home.method.steps.map((s) => `${s.n} ${s.title}: ${s.text}`)
    .join("\n");
  const lang = locale === "pt" ? "português do Brasil" : "inglês";
  const lower = Math.max(priceFloor(), band?.min ?? 0);
  return `Você é o planejador comercial do Linkando Design, estúdio de marca e desenvolvimento web (9 anos, clientes em 5 países). A partir do diagnóstico abaixo (respostas do briefing em JSON e a conversa completa), prepare:
(1) o conteúdo de uma PRÉ-PROPOSTA escrita PARA O CLIENTE, em ${lang}, tratando-o por "você", em tom profissional e claro, com TRÊS OPÇÕES: Essencial (o mínimo que resolve o problema), Recomendado (o que você sugere) e Completo (o escopo mais amplo). O Carlos, dono do estúdio, revisa e encaminha;
(2) notas internas, em português, só para o Carlos.

Serviços do estúdio: Desenvolvimento de Marca (identidade do zero: naming, logo, sistema de design), Redesign de Identidade, Criação de Site (pesquisa, prototipação, design, desenvolvimento), Landing Page (foco em conversão), Redesign de Site, Sistemas Internos (diagnóstico do gargalo, arquitetura da informação, design das telas e acompanhamento).

Processo (7 etapas, cada uma validada com o cliente):
${steps}

Prazos típicos (estimativas, contadas do início efetivo):
${DEADLINES_PT}

Valores (campo "price" de cada opção): um valor FECHADO em reais, número inteiro, SEM a taxa de urgência (o código acrescenta).
${bandLine(band)} Piso absoluto: ${brl(lower)}. Cada opção fica dentro da faixa: Essencial perto do mínimo, Completo perto do teto.
Estime pelo mercado brasileiro de estúdios de design e desenvolvimento e pela complexidade (número de páginas, integrações, idiomas, produção de conteúdo, número de usuários e perfis, migração de dados, naming e sistema de design).
Conferência por horas: estime as horas de cada opção ("hours") e confira com R$ ${HOURLY_MIN} a R$ ${HOURLY_MAX} por hora. Se horas × R$ ${HOURLY_MIN} passar do valor, suba o valor (dentro da faixa).
Estime pelo escopo, como se não soubesse o investimento declarado: não copie nem arredonde para o número que o cliente disse. Qualificação do investimento declarado: ${fit}
${urgent ? `O prazo pedido é menor que a faixa típica: informe em "urgencyPct" a taxa de urgência, entre ${URGENCY_PCT.min} e ${URGENCY_PCT.max} (por cento), conforme o aperto.` : 'O prazo não pede urgência: "urgencyPct": 0.'}

Regras:
- Não invente fatos sobre o cliente: o que não foi dito vai nas notas, em "openPoints".
- Não prometa resultado nem data de entrega. O prazo é uma faixa em semanas, contada do início efetivo. Não diga que a faixa "atende", "é ideal" ou "garante" a data do cliente: diga, como estimativa, se ela termina antes da data pedida contando a partir de um início próximo.
- NÃO escreva condições de pagamento, entrada, parcelas, percentuais, descontos, rodadas de ajuste nem valores em dinheiro nos textos: o código acrescenta isso. Os únicos valores são os campos "price".
- Textos simples, sem markdown, com acentuação correta.

Responda SÓ com JSON, neste formato:
{
  "title": "nome curto do projeto, ex.: Redesign do site da Clínica X",
  "understanding": "2 a 4 frases para o cliente: objetivo e contexto do projeto",
  "steps": [{"step": "01", "deliverable": "o que o cliente recebe nesta etapa na opção Recomendado, em 1 frase"}],
  "deadline": "1 ou 2 frases sobre o prazo da opção Recomendado diante da data que o cliente pediu",
  "options": [
    {"name": "Essencial", "scope": "1 ou 2 frases: o que entra", "deadline": "x a y semanas", "hours": 0, "price": 0},
    {"name": "Recomendado", "scope": "...", "deadline": "...", "hours": 0, "price": 0},
    {"name": "Completo", "scope": "...", "deadline": "...", "hours": 0, "price": 0}
  ],
  "differences": "uma frase explicando a diferença entre as três opções",
  "urgencyPct": 0,
  "priceFactors": ["2 ou 3 itens curtos, para o cliente, sobre o que pesou no valor"],
  "notes": {
    "pricePosition": "onde cada opção cai na faixa e por quê, com as horas estimadas",
    "risks": ["riscos do projeto"],
    "openPoints": ["pontos em aberto"],
    "questions": ["perguntas para confirmar com o cliente antes do contrato"]
  }
}
Em "steps", use só as etapas (01 a 07) que se aplicam a este projeto.`;
}

export async function generateDraft(
  turns: Turn[],
  b: BriefingAnswers | null,
  locale: Locale,
  band: Band | null,
  urgent: boolean,
  fit: string,
  opts: { deadlineMs?: number } = {},
): Promise<ProposalDraft | null> {
  const input = `Respostas do briefing (JSON):\n${JSON.stringify(b ?? { aviso: "extração falhou" }, null, 2)}\n\nConversa completa:\n\n${transcriptOf(turns)}`;
  const out = await generate(proposalPrompt(locale, band, urgent, fit), [{ role: "user", content: input }], {
    json: true,
    temperature: 0.3,
    maxTokens: 8192,
    timeoutScale: 2,
    deadlineMs: opts.deadlineMs ?? 35_000,
    label: "pré-proposta",
    accept: (t) => normalizeDraft(parseJson(t)) !== null,
  });
  return out ? normalizeDraft(parseJson(out)) : null;
}

const PAYMENT_WORDS = /\b(parcel\w*|juros|à vista|a vista|entrada|sinal|desconto|rodadas?|install?ments?|interest|upfront|down payment|discount|revision rounds?)\b|%/i;
function cleanForClient(text: string, removed: { n: number }): string {
  return text
    .split(/(?<=[.!?])\s+/)
    .filter((s) => {
      const bad = moneyIn(s, "BRL").length > 0 || PAYMENT_WORDS.test(s);
      if (bad) removed.n++;
      return !bad;
    })
    .join(" ")
    .trim();
}

export type ClientProposal = {
  subject: string;
  text: string;
  options: PricedOption[];
  urgencyPct: number | null;
  lower: number;
  upper: number | null;
  notes: string[];
  removed: number;
};

function buildClientProposal(
  locale: Locale,
  name: string,
  services: ServiceKey[],
  band: Band | null,
  urgent: boolean,
  draft: ProposalDraft,
): ClientProposal {
  const pt = locale === "pt";
  const removed = { n: 0 };
  const aiPct = Number(draft.urgencyPct);
  const urgencyPct = urgent
    ? Math.min(URGENCY_PCT.max, Math.max(URGENCY_PCT.min, Number.isFinite(aiPct) && aiPct > 0 ? Math.round(aiPct) : URGENCY_PCT.default))
    : null;
  const priced = priceOptions(draft.options, band, urgencyPct);
  const notes = [...priced.notes];
  if (urgent && !(aiPct >= URGENCY_PCT.min && aiPct <= URGENCY_PCT.max))
    notes.push(`Taxa de urgência da IA (${draft.urgencyPct ?? "nenhuma"}) fora de ${URGENCY_PCT.min}–${URGENCY_PCT.max}%: usada ${urgencyPct}%.`);
  const steps = getDictionary(locale).home.method.steps;
  const first = name.split(/\s+/)[0] ?? "";
  const project = draft.title || services.map((k) => SERVICE_LABEL[k]).join(" + ") || (pt ? "seu projeto" : "your project");
  const understanding = cleanForClient(draft.understanding, removed);
  const deadline = cleanForClient(draft.deadline, removed);
  const differences = cleanForClient(draft.differences, removed);
  const factors = draft.priceFactors.map((f) => cleanForClient(f, removed)).filter(Boolean);
  for (const o of priced.options) {
    o.scope = cleanForClient(o.scope, removed);
    o.deadline = cleanForClient(o.deadline, removed);
  }
  const scope = draft.steps
    .map((s) => {
      const d = cleanForClient(s.deliverable, removed);
      const title = steps.find((x) => x.n === s.n)?.title ?? "";
      return d ? `${s.n} ${title}: ${d}` : "";
    })
    .filter(Boolean);
  const days = validityDays();
  const optLabel = (n: OptionName) =>
    pt ? (n === "Recomendado" ? "Recomendado (sugerido)" : n) : ({ Essencial: "Essential", Recomendado: "Recommended (suggested)", Completo: "Complete" } as const)[n];
  const plans = priced.options.map((o) => {
    const plan = paymentPlan(o.price, locale);
    const problem = checkPaymentPlan(o.price, plan);
    if (problem) notes.push(`Plano de pagamento de ${o.name} reprovado (${problem}): confira antes de encaminhar.`);
    return { o, plan };
  });
  const pix = (n: number) => brl(pixTotal(n));
  const digital = services.some((k) => k === "site" || k === "siteRedesign" || k === "landing" || k === "system");
  const brandish = services.some((k) => k === "brand" || k === "identity");
  const join = (xs: string[], and: string) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} ${and} ${xs[xs.length - 1]}` : xs[0]);
  const L = pt
    ? {
        title: `Proposta para ${name || "você"}: ${project}`,
        hello: first ? `Olá, ${first}!` : "Olá!",
        intro: "Agradeço pela conversa no diagnóstico do Linkando Design. Segue a proposta para o seu projeto, com três opções.",
        h: ["ENTENDIMENTO DO PROJETO", "ESCOPO E ENTREGÁVEIS (opção Recomendado)", "OPÇÕES", "PRAZO ESTIMADO", "O QUE PESOU NO VALOR", "CONDIÇÕES DE PAGAMENTO", "CONTRATO", "PRÓXIMO PASSO"],
        opt: (o: PricedOption) => `${optLabel(o.name)}: ${brl(o.price)}\n${o.scope}${o.deadline ? ` Prazo estimado: ${o.deadline}.` : ""}`.replace(/\.\./g, "."),
        urgency: (p: number) => `Os valores incluem taxa de urgência de ${p}%, porque o prazo pedido é menor que a faixa típica deste tipo de projeto.`,
        deadlineNote: "Os prazos contam a partir do início efetivo do projeto (contrato assinado, entrada paga e materiais entregues).",
        pay: [
          ...plans.map(({ o, plan }) => `${o.name} (${brl(o.price)}): ${join(plan.map((p) => `${p.pct}% (${brl(p.amount)}) ${p.label}`), "e")}.`),
          "A entrada é paga junto com a assinatura do contrato e pode ser maior que a indicada, nunca menor.",
          `Pix à vista: ${PAYMENT.pixDiscountPct}% de desconto sobre o total (${priced.options.map((o) => `${o.name} ${pix(o.price)}`).join(", ")}).`,
          `Parcelamento só no cartão de crédito: até ${PAYMENT.cardNoInterest}x sem juros ou até ${PAYMENT.cardWithInterest}x com os juros da operadora.`,
          "Formas de pagamento: Pix ou cartão de crédito.",
        ],
        contract: [
          "O projeto começa após a assinatura do contrato e o pagamento da entrada.",
          digital && brandish
            ? "Os arquivos finais da marca, o manual, o domínio e os acessos são liberados com o pagamento quitado."
            : digital
              ? "Os arquivos finais, o domínio e os acessos são liberados com o pagamento quitado."
              : "Os arquivos finais da marca e o manual são liberados com o pagamento quitado.",
          digital
            ? "O prazo depende da entrega de conteúdo e acessos da sua parte."
            : "O prazo depende da entrega de informações e das aprovações da sua parte.",
          `Cada etapa tem ${REVISION_ROUNDS} rodadas de ajuste. O que passar disso ou sair do escopo é orçado à parte.`,
          `Esta proposta é válida por ${days} dias a partir da data de envio.`,
        ],
        next: "Para seguir, é só responder este e-mail dizendo qual opção prefere, que enviamos o contrato.",
        sign: "Um abraço,\nCarlos Lima\nLinkando Design",
        subject: `Proposta Linkando Design: ${project}`,
      }
    : {
        title: `Proposal for ${name || "you"}: ${project}`,
        hello: first ? `Hi ${first},` : "Hi,",
        intro: "Thank you for the conversation in the Linkando Design diagnosis. Here is the proposal for your project, with three options.",
        h: ["PROJECT UNDERSTANDING", "SCOPE AND DELIVERABLES (Recommended option)", "OPTIONS", "ESTIMATED TIMELINE", "WHAT SHAPED THE PRICE", "PAYMENT TERMS", "CONTRACT", "NEXT STEP"],
        opt: (o: PricedOption) => `${optLabel(o.name)}: ${brl(o.price)}\n${o.scope}${o.deadline ? ` Estimated timeline: ${o.deadline}.` : ""}`.replace(/\.\./g, "."),
        urgency: (p: number) => `Prices include a ${p}% rush fee, because the requested timeline is shorter than the typical range for this type of project.`,
        deadlineNote: "Timelines count from the actual start of the project (contract signed, down payment made and materials delivered).",
        pay: [
          ...plans.map(({ o, plan }) => `${optLabel(o.name)} (${brl(o.price)}): ${join(plan.map((p) => `${p.pct}% (${brl(p.amount)}) ${p.label}`), "and")}.`),
          "The down payment is made together with signing the contract and can be larger than indicated, never smaller.",
          `Pix upfront: ${PAYMENT.pixDiscountPct}% discount on the total.`,
          `Instalments by credit card only: up to ${PAYMENT.cardNoInterest} interest-free or up to ${PAYMENT.cardWithInterest} with the card issuer's interest.`,
          "Payment methods: Pix or credit card.",
        ],
        contract: [
          "The project starts once the contract is signed and the down payment is made.",
          digital && brandish
            ? "Final brand files, the brand manual, domain and access are released once payment is complete."
            : digital
              ? "Final files, domain and access are released once payment is complete."
              : "Final brand files and the brand manual are released once payment is complete.",
          digital
            ? "The timeline depends on you delivering content and access."
            : "The timeline depends on you providing information and approvals.",
          `Each stage includes ${REVISION_ROUNDS} rounds of revisions. Anything beyond that or outside the scope is quoted separately.`,
          `This proposal is valid for ${days} days from the date it is sent.`,
        ],
        next: "To move forward, just reply to this email with the option you prefer and we will send you the contract.",
        sign: "Best regards,\nCarlos Lima\nLinkando Design",
        subject: `Linkando Design proposal: ${project}`,
      };
  const bullets = (xs: string[]) => xs.map((x) => `- ${x}`).join("\n");
  const text = [
    L.title,
    `${L.hello}\n\n${L.intro}`,
    `${L.h[0]}\n${understanding}`,
    `${L.h[1]}\n${scope.join("\n")}`,
    `${L.h[2]}\n${priced.options.map(L.opt).join("\n\n")}${differences ? `\n\n${differences}` : ""}${urgencyPct ? `\n\n${L.urgency(urgencyPct)}` : ""}`,
    `${L.h[3]}\n${deadline ? `${deadline} ` : ""}${L.deadlineNote}`,
    ...(factors.length ? [`${L.h[4]}\n${bullets(factors)}`] : []),
    `${L.h[5]}\n${bullets(L.pay)}`,
    `${L.h[6]}\n${bullets(L.contract)}`,
    `${L.h[7]}\n${L.next}`,
    L.sign,
  ].join("\n\n");
  return { subject: L.subject, text, options: priced.options, urgencyPct, lower: priced.lower, upper: priced.upper, notes, removed: removed.n };
}

export function forwardLink(to: string, p: ClientProposal, locale: Locale, name: string): { href: string; full: boolean } {
  const first = name.split(/\s+/)[0] ?? "";
  const full = false;
  const body = locale === "pt"
      ? `${first ? `Olá, ${first}!` : "Olá!"}\n\nSegue a proposta abaixo.\n\n`
      : `${first ? `Hi ${first},` : "Hi,"}\n\nPlease find the proposal below.\n\n`;
  return {
    href: `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(p.subject)}&body=${encodeURIComponent(body)}`,
    full,
  };
}

export type LeadClass = "Qualificado" | "A avaliar" | "Fora do perfil";
type Mark = "✅" | "⚠️" | "❌";
export type Score = { label: string; mark: Mark; note: string };

function servicesOf(b: BriefingAnswers | null, q: Qualification): ServiceKey[] {
  const fromAnswers = (b?.types ?? []).filter((t): t is ServiceKey => t !== "unsure");
  return fromAnswers.length ? fromAnswers : q.services;
}

function modifiersOf(b: BriefingAnswers | null): Modifiers {
  return { naming: Boolean(b?.signals.naming), siteAdvanced: Boolean(b?.signals.siteAdvanced) };
}

function leadQualification(input: { turns: Turn[]; locale: Locale }, b: BriefingAnswers | null): Qualification {
  const extracted = (b?.types ?? []).filter((t): t is ServiceKey => t !== "unsure");
  const visitor = input.turns.filter((m) => m.role === "user").map((m) => m.content);
  const first = qualify(visitor, input.locale, extracted);
  if (!b?.signals.naming) return first;
  const naming = (priceBand(first.services, { naming: true })?.min ?? 0) - (priceBand(first.services)?.min ?? 0);
  return naming > 0 ? qualify(visitor, input.locale, extracted, naming) : first;
}

export function scorecard(status: LeadInput["status"], b: BriefingAnswers | null, q: Qualification): { cls: LeadClass; scores: Score[] } {
  const s = b?.signals;
  const budget: Score =
    q.fit === "ok"
      ? { label: "Investimento", mark: "✅", note: `${q.budget ? fmt(q.budget) : ""} ≥ mínimo da opção Essencial` }
      : q.fit === "abaixo"
        ? status !== "out" && s?.budgetFlexible !== false
          ? {
              label: "Investimento",
              mark: "⚠️",
              note: `${q.budget ? fmt(q.budget) : ""} abaixo do mínimo da opção Essencial; ${s?.budgetFlexible ? "a pessoa disse ter flexibilidade" : "flexibilidade não foi perguntada"}`,
            }
          : { label: "Investimento", mark: "❌", note: `${q.budget ? fmt(q.budget) : ""} abaixo do mínimo da opção Essencial${q.minSum ? ` (${fmt({ amount: q.minSum, currency: q.budget?.currency ?? "BRL" })})` : ""}, sem flexibilidade` }
        : q.fit === "sem-base"
          ? { label: "Investimento", mark: "⚠️", note: `${q.budget ? fmt(q.budget) : "declarado"}, sem base para comparar` }
          : { label: "Investimento", mark: "⚠️", note: "não declarado (aceito: a classe sai pelos outros sinais)" };
  const decider: Score = !s
    ? { label: "Decisor", mark: "⚠️", note: "sem extração" }
    : s.decider === "decide"
      ? { label: "Decisor", mark: "✅", note: "quem conversa decide" }
      : s.decider === "identificado"
        ? { label: "Decisor", mark: "✅", note: "decisão dividida, decisor identificado" }
        : { label: "Decisor", mark: "❌", note: "quem decide não foi identificado" };
  const deadline: Score = !s
    ? { label: "Prazo", mark: "⚠️", note: "sem extração" }
    : {
        viavel: { label: "Prazo", mark: "✅" as Mark, note: "viável dentro da faixa típica" },
        "sem-data": { label: "Prazo", mark: "✅" as Mark, note: "sem data fixa" },
        "urgente-aceita": { label: "Prazo", mark: "✅" as Mark, note: "menor que a faixa típica; aceita urgência ou prazo maior" },
        "urgente-sem-resposta": { label: "Prazo", mark: "⚠️" as Mark, note: "menor que a faixa típica; não respondeu sobre a taxa de urgência" },
        "urgente-recusa": { label: "Prazo", mark: "❌" as Mark, note: "menor que a faixa típica e recusou a taxa de urgência" },
      }[s.deadline];
  const missing = b ? missingRequired(b) : null;
  const clarity: Score =
    missing === null
      ? { label: "Clareza do escopo", mark: "⚠️", note: "sem extração" }
      : missing.length === 0
        ? { label: "Clareza do escopo", mark: "✅", note: "todos os obrigatórios do playbook respondidos" }
        : { label: "Clareza do escopo", mark: missing.length <= 2 ? "⚠️" : "❌", note: `${missing.length} obrigatório(s) sem resposta: ${missing.join(", ")}` };
  const scores = [budget, decider, deadline, clarity];
  const budgetPass = budget.mark === "✅" || (budget.mark === "⚠️" && q.fit !== "abaixo");
  const cls: LeadClass =
    status === "out" || budget.mark === "❌"
      ? "Fora do perfil"
      : budgetPass && decider.mark === "✅" && deadline.mark === "✅"
        ? "Qualificado"
        : "A avaliar";
  return { cls, scores };
}

const COPY_START = "========== PRÉ-PROPOSTA: copie daqui até o fim do bloco ==========";
const COPY_END = "========== fim do bloco ==========";
export type LeadInput = {
  contact: string;
  locale: Locale;
  status: "partial" | "complete" | "out";
  turns: Turn[];
};

export type LeadExtras = {
  briefing: BriefingAnswers | null;
  draft: ProposalDraft | null;
  proposal: ClientProposal | null;
  services: ServiceKey[];
  band: Band | null;
  cls: LeadClass | null;
  warning: string | null;
};

export async function prepareLeadExtras(input: LeadInput): Promise<LeadExtras> {
  const empty: LeadExtras = { briefing: null, draft: null, proposal: null, services: [], band: null, cls: null, warning: null };
  if (input.status === "partial") return empty;
  let briefing: BriefingAnswers | null = null;
  let draft: ProposalDraft | null = null;
  try {
    briefing = await extractBriefing(input.turns, { deadlineMs: 20_000 });
  } catch (err) {
    console.error("[lead] extração falhou:", err);
  }
  const q = leadQualification(input, briefing);
  const services = servicesOf(briefing, q);
  const band = priceBand(services, modifiersOf(briefing));
  const { cls } = scorecard(input.status, briefing, q);
  const urgent = Boolean(briefing?.signals.deadline.startsWith("urgente"));
  if (cls !== "Fora do perfil") {
    try {
      draft = await generateDraft(input.turns, briefing, input.locale, band, urgent, qualificationLine(q), { deadlineMs: 30_000 });
    } catch (err) {
      console.error("[lead] pré-proposta falhou:", err);
    }
  }
  const name = briefing?.answers.name?.status === "respondido" ? briefing.answers.name.value : "";
  const proposal = draft ? buildClientProposal(input.locale, name, services, band, urgent, draft) : null;
  const fails = [!briefing && "as respostas do briefing", cls !== "Fora do perfil" && !draft && "a pré-proposta"].filter(Boolean);
  return {
    briefing,
    draft,
    proposal,
    services,
    band,
    cls,
    warning: fails.length
      ? `Aviso: a IA não conseguiu gerar ${fails.join(" nem ")} (provedor indisponível ou resposta inválida). Monte a partir da conversa abaixo.`
      : null,
  };
}

function briefingRows(b: BriefingAnswers): { id: string; question: string; status: AnswerStatus; value: string; required: boolean }[] {
  const types = typesOrUnsure(b);
  const requiredIds = new Set(requiredFor(types, { contact: true }).map((f) => f.id));
  return fieldsFor(types).map((f) => ({
    id: f.id,
    question: f.question.pt,
    status: b.answers[f.id]?.status ?? "sem-resposta",
    value: b.answers[f.id]?.value ?? "",
    required: requiredIds.has(f.id),
  }));
}

const STATUS_LABEL: Record<AnswerStatus, string> = {
  respondido: "",
  parcial: "(parcial) ",
  "nao-sabe": "(não sabe) ",
  "sem-resposta": "SEM RESPOSTA",
};

function leadAlerts(input: LeadInput, extras: LeadExtras, q: Qualification): string[] {
  const out: string[] = [];
  const b = extras.briefing;
  const types: ProjectType[] = b ? typesOrUnsure(b) : ["unsure"];
  const defined = new Map(alertsFor(types).map((a) => [a.id, a.text.pt]));
  for (const a of b?.alerts ?? []) out.push(`${defined.get(a.id) ?? a.id}${a.reason ? `: ${a.reason}` : ""}`);
  if (defined.has("budget_low") && q.fit === "abaixo") out.push(`${defined.get("budget_low")}: ${qualificationLine(q)}`);
  const rec = extras.proposal?.options.find((o) => o.name === "Recomendado")?.price;
  if (rec && q.budget?.currency === "BRL" && q.budget.amount < rec)
    out.push(`Opção Recomendado (${brl(rec)}) acima do investimento declarado (${brl(q.budget.amount)}): a Essencial sai por ${brl(extras.proposal!.options[0].price)}.`);
  const missing = b ? missingRequired(b, { contact: input.status === "complete" }) : [];
  if (missing.length && input.status === "complete") out.push(`Obrigatórios do playbook sem resposta: ${missing.join(", ")}`);
  if (input.locale === "en" && extras.proposal)
    out.push("Cliente da versão em inglês: o chat disse que os valores vêm em dólar, e a pré-proposta está em R$. Converta antes de encaminhar.");
  if (extras.warning) out.push(extras.warning);
  return out;
}

function internalNotes(extras: LeadExtras): string[] {
  const d = extras.draft;
  const p = extras.proposal;
  const lines: string[] = [bandLine(extras.band)];
  if (p) {
    lines.push(`Limites aplicados: ${brl(p.lower)} a ${p.upper ? brl(p.upper) : "sem teto"}${p.urgencyPct ? `, mais ${p.urgencyPct}% de urgência por cima` : ""}.`);
    for (const o of p.options)
      lines.push(`${o.name}: ${brl(o.price)} (IA sugeriu ${o.suggested ? brl(o.suggested) : "nada"}${o.hours ? `, ${o.hours}h ≈ ${brl(o.hours * HOURLY_MIN)} a ${brl(o.hours * HOURLY_MAX)}` : ""}).`);
    lines.push(...p.notes);
    if (p.removed) lines.push(`${p.removed} frase(s) da IA com valor, percentual ou condição de pagamento saíram da pré-proposta (essas partes são fixas no código).`);
  }
  if (!d) return lines;
  const sec = (t: string, xs: string[]) => (xs.length ? [`${t}:`, ...xs.map((x) => `- ${x}`)] : []);
  if (d.notes.pricePosition) lines.push(`Posição dos valores: ${d.notes.pricePosition}`);
  lines.push(...sec("Riscos", d.notes.risks), ...sec("Pontos em aberto", d.notes.openPoints), ...sec("Perguntas para confirmar com o cliente", d.notes.questions));
  return lines;
}

export function buildLeadEmail(input: LeadInput, extras: LeadExtras): { subject: string; text: string; html: string } {
  const { turns } = input;
  const contact = input.contact || "sem contato";
  const status = input.status;
  const full = status !== "partial";
  const title =
    status === "complete"
      ? "Diagnóstico pelo chat (completo)"
      : status === "out"
        ? "Diagnóstico pelo chat (encerrado: fora do perfil, sem proposta)"
        : "Diagnóstico pelo chat (incompleto: a conversa foi interrompida)";
  const lang = input.locale === "en" ? "English" : "Português";
  const q = leadQualification(input, extras.briefing);
  const fit = qualificationLine(q);
  const { cls, scores } = scorecard(status, extras.briefing, q);
  const transcript = transcriptOf(turns);
  const rows = extras.briefing ? briefingRows(extras.briefing) : [];
  const types = extras.briefing?.types.map((t) => PROJECT_TYPE_LABEL[t]).join(", ") || "não identificado";
  const missing = extras.briefing ? missingRequired(extras.briefing, { contact: status === "complete" }) : [];
  const alerts = full ? leadAlerts(input, extras, q) : [];
  const notes = full && extras.proposal ? internalNotes(extras) : full ? [bandLine(extras.band)] : [];
  const b = extras.briefing;
  const clientEmail = b?.answers.email?.status === "respondido" && isEmail(b.answers.email.value) ? b.answers.email.value : isEmail(contact) ? contact : "";
  const clientName = b?.answers.name?.status === "respondido" ? b.answers.name.value : "";
  const fwd = extras.proposal && clientEmail ? forwardLink(clientEmail, extras.proposal, input.locale, clientName) : null;
  const fwdNote = fwd
    ? fwd.full
      ? "O link abre o e-mail já preenchido com a pré-proposta."
      : "O link abre o e-mail com a saudação; cole abaixo dela o bloco da pré-proposta."
    : "";
  const noProposal =
    status === "out" || cls === "Fora do perfil"
      ? "Sem pré-proposta: lead fora do perfil (investimento abaixo do mínimo, sem flexibilidade)."
      : "Não gerada.";
  const placar = scores.map((s) => `${s.mark} ${s.label}: ${s.note}`);

  const parts = [`${title}\nContato informado: ${contact}\nIdioma do site: ${lang}`];
  if (full) {
    parts.push(
      `1. Alertas\n${alerts.length ? alerts.map((a) => `- ${a}`).join("\n") : "Nenhum alerta."}\n\nPlacar\n${placar.join("\n")}`,
    );
    parts.push(`2. Qualificação: ${cls.toUpperCase()}\n${fit}`);
    parts.push(
      extras.briefing
        ? `3. Respostas do briefing (extraídas pela IA; tipo: ${types})\n${
            missing.length ? `Obrigatórios sem resposta: ${missing.join(", ")}\n` : "Todos os obrigatórios respondidos.\n"
          }\n${rows
            .map((r) => `- [${r.id}${r.required ? "*" : ""}] ${r.question}: ${r.status === "sem-resposta" ? STATUS_LABEL[r.status] : STATUS_LABEL[r.status] + r.value}`)
            .join("\n")}\n(* obrigatório)`
        : "3. Respostas do briefing: não geradas.",
    );
    parts.push(
      extras.proposal
        ? `4. PRÉ-PROPOSTA PARA O CLIENTE (revise e encaminhe; o cliente não recebeu nada)\n${
            fwd ? `Encaminhar ao cliente: ${fwd.href}\n${fwdNote}\n` : "Sem e-mail válido do cliente para o link de encaminhar.\n"
          }\n${COPY_START}\n\n${extras.proposal.text}\n\n${COPY_END}`
        : `4. PRÉ-PROPOSTA PARA O CLIENTE: ${noProposal}`,
    );
    parts.push(`5. Notas internas (só para você)\n${notes.length ? notes.join("\n") : "Nenhuma."}`);
    parts.push(`6. Conversa\n\n${transcript}`);
  } else {
    parts.push(`Qualificação interna (automática, confira na conversa): ${fit}`);
    parts.push(`Conversa\n\n${transcript}`);
  }
  const text = parts.join("\n\n---\n\n") + "\n";

  const h2 = (t: string) => `<h3 style="margin:24px 0 8px;font-size:16px">${esc(t)}</h3>`;
  const box = "padding:8px 12px;border-radius:8px";
  const br = (t: string) => esc(t).replace(/\n/g, "<br>");
  const proposalHtml = extras.proposal
    ? extras.proposal.text
        .split("\n\n")
        .map((block) => {
          const [head, ...rest] = block.split("\n");
          const isHeading = head === head.toUpperCase() && /[A-ZÀ-Ú]/.test(head) && rest.length > 0;
          return isHeading
            ? `<p style="margin:0 0 12px"><strong>${esc(head)}</strong><br>${br(rest.join("\n"))}</p>`
            : `<p style="margin:0 0 12px">${br(block)}</p>`;
        })
        .join("")
    : "";
  const conversation = turns
    .map(
      (m) =>
        `<p style="margin:0 0 10px;padding:10px 12px;border-radius:10px;background:${
          m.role === "user" ? "#f1f6c8" : "#f1f1f1"
        }"><strong>${m.role === "user" ? "Visitante" : "Assistente"}:</strong> ${br(m.content)}</p>`,
    )
    .join("");
  const clsColor = cls === "Qualificado" ? "#1d6b2f" : cls === "A avaliar" ? "#8a5a00" : "#8a1c1c";
  const html = `<div style="font-family:Arial,sans-serif;color:#17171a;max-width:640px">
<h2 style="margin:0 0 8px">${title}</h2>
<p style="margin:0 0 8px">Contato informado: <strong>${esc(contact)}</strong> · ${esc(lang)}</p>
${
  full
    ? `${h2("1. Alertas")}
${
  alerts.length
    ? `<ul style="margin:0 0 12px;${box};background:#fde8e8;color:#8a1c1c;font-size:13px;padding-left:28px">${alerts.map((a) => `<li style="margin:2px 0">${esc(a)}</li>`).join("")}</ul>`
    : `<p style="margin:0 0 12px;color:#666;font-size:13px">Nenhum alerta.</p>`
}
<table style="border-collapse:collapse;font-size:13px;margin:0 0 8px">${scores
        .map((s) => `<tr><td style="padding:3px 8px 3px 0">${s.mark}</td><td style="padding:3px 8px 3px 0"><strong>${esc(s.label)}</strong></td><td style="padding:3px 0;color:#444">${esc(s.note)}</td></tr>`)
        .join("")}</table>
${h2("2. Qualificação")}
<p style="margin:0 0 6px;font-size:18px;font-weight:bold;color:${clsColor}">${esc(cls)}</p>
<p style="margin:0 0 16px;${box};background:#27272b;color:#eefb6e;font-size:13px">${esc(fit)}</p>
${h2(`3. Respostas do briefing (tipo: ${types})`)}
${
  extras.briefing
    ? `<p style="margin:0 0 8px;font-size:13px">${missing.length ? `<strong style="color:#8a1c1c">Obrigatórios sem resposta:</strong> ${esc(missing.join(", "))}` : "Todos os obrigatórios respondidos."}</p>
<table style="border-collapse:collapse;width:100%;font-size:13px">${rows
        .map(
          (r) =>
            `<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e5e5;vertical-align:top;width:40%"><strong>${esc(r.question)}</strong>${r.required ? " *" : ""}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e5e5;${r.status === "sem-resposta" ? "color:#8a1c1c" : ""}">${esc(r.status === "sem-resposta" ? "Sem resposta" : STATUS_LABEL[r.status] + r.value)}</td></tr>`,
        )
        .join("")}</table><p style="margin:4px 0 0;color:#666;font-size:12px">* obrigatório</p>`
    : `<p style="margin:0;color:#666">Não geradas.</p>`
}
${h2("4. PRÉ-PROPOSTA PARA O CLIENTE (revise e encaminhe; o cliente não recebeu nada)")}
${
  extras.proposal
    ? `${
        fwd
          ? `<p style="margin:0 0 8px"><a href="${esc(fwd.href)}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#eefb6e;color:#27272b;font-weight:bold;text-decoration:none">Encaminhar ao cliente</a></p><p style="margin:0 0 12px;color:#666;font-size:12px">${esc(fwdNote)}</p>`
          : `<p style="margin:0 0 12px;color:#666;font-size:12px">Sem e-mail válido do cliente para o link de encaminhar.</p>`
      }<p style="margin:0 0 6px;font-size:12px;font-weight:bold;color:#27272b">▼ Copie daqui até o fim do bloco</p><div style="padding:16px 20px;border:2px dashed #27272b;border-radius:8px;background:#ffffff;font-size:14px;line-height:1.55">${proposalHtml}</div><p style="margin:6px 0 0;font-size:12px;font-weight:bold;color:#27272b">▲ Fim do bloco</p>`
    : `<p style="margin:0;color:#666">${esc(noProposal)}</p>`
}
${h2("5. Notas internas (só para você)")}
${notes.length ? `<div style="${box};background:#f7f7f7;font-size:13px;line-height:1.5">${br(notes.join("\n"))}</div>` : `<p style="margin:0;color:#666">Nenhuma.</p>`}
${h2("6. Conversa")}`
    : `<p style="margin:0 0 16px;${box};background:#27272b;color:#eefb6e;font-size:13px">Qualificação interna (automática, confira na conversa): ${esc(fit)}</p>`
}
${conversation}
${isEmail(contact) ? `<p style="margin-top:20px;color:#666;font-size:13px">Responder a este e-mail responde direto para ${esc(contact)}.</p>` : ""}
</div>`;

  const flag = alerts.length ? ` (${alerts.length} ${alerts.length === 1 ? "alerta" : "alertas"})` : "";
  const head = status === "complete" ? "Diagnóstico completo" : status === "out" ? "Fora do perfil" : "Diagnóstico incompleto";
  return {
    subject: `${head}${status === "complete" ? ` [${cls}]` : ""} — ${contact}${flag}`,
    text,
    html,
  };
}
