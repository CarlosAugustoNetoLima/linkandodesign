
export type ServiceKey = "brand" | "identity" | "site" | "landing" | "siteRedesign" | "system";
export type PriceKey = ServiceKey | "siteAdvanced" | "naming";
export type Currency = "BRL" | "EUR" | "USD";
export type Fit = "ok" | "abaixo" | "sem-info" | "sem-base";

type Base = {
  floor: number;
  eurFactor: number;
  min: Partial<Record<PriceKey, number>> & Record<ServiceKey, number>;
  max: Partial<Record<PriceKey, number>>;
};

const KEYS: ServiceKey[] = ["brand", "identity", "site", "landing", "siteRedesign", "system"];
const EXTRA_KEYS: PriceKey[] = ["siteAdvanced", "naming"];

export const SERVICE_LABEL: Record<ServiceKey, string> = {
  brand: "Desenvolvimento de Marca",
  identity: "Redesign de Identidade",
  site: "Criação de Site",
  landing: "Landing Page",
  siteRedesign: "Redesign de Site",
  system: "Sistemas Internos",
};

let cached: Base | null | undefined;

function loadBase(): Base | null {
  if (cached !== undefined) return cached;
  cached = null;
  const raw = process.env.PRICING_BASE;
  if (!raw) return cached;
  try {
    const b = JSON.parse(raw);
    const ok =
      Number(b.floor) > 0 &&
      Number(b.eurFactor) > 0 &&
      KEYS.every((k) => Number(b.min?.[k]) > 0);
    const min = {} as Base["min"];
    const max: Base["max"] = {};
    for (const k of [...KEYS, ...EXTRA_KEYS]) {
      if (Number(b.min?.[k]) > 0) min[k] = Number(b.min[k]);
      if (Number(b.max?.[k]) > 0) max[k] = Number(b.max[k]);
    }
    if (ok) cached = { floor: Number(b.floor), eurFactor: Number(b.eurFactor), min, max };
    else console.error("[pricing-base] PRICING_BASE incompleta: qualificação desligada");
  } catch {
    console.error("[pricing-base] PRICING_BASE não é um JSON válido: qualificação desligada");
  }
  return cached;
}

const MONEY =
  /(R\$|US\$|U\$|€|\$|\bEUR\b|\bUSD\b|\bBRL\b)?\s?(\d{1,3}(?:[.,\s]\d{3})+(?:[.,]\d{1,2})?|\d+(?:[.,]\d+)?)\s?(mil\b|k\b)?\s?(reais|real|euros?|d[oó]lar(?:es)?|dollars?|bucks)?/gi;

export type Money = { amount: number; currency: Currency };

function toNumber(raw: string, multiplied: boolean): number {
  if (multiplied) return Number(raw.replace(",", ".")) * 1000;
  const noDecimals = raw.replace(/[.,]\d{1,2}$/, "");
  return Number(noDecimals.replace(/[.,\s]/g, ""));
}

function currencyOf(symbol: string | undefined, word: string | undefined, fallback: Currency): Currency {
  const s = `${symbol ?? ""} ${word ?? ""}`.toLowerCase();
  if (/r\$|brl|rea/.test(s)) return "BRL";
  if (/€|eur/.test(s)) return "EUR";
  if (/\$|usd|d[oó]lar|dollar|buck/.test(s)) return "USD";
  return fallback;
}

export function moneyIn(text: string, fallback: Currency): Money[] {
  const out: Money[] = [];
  const re = new RegExp(MONEY.source, MONEY.flags);
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m[0] === "") {
      re.lastIndex++;
      continue;
    }
    const [, symbol, num, mult, word] = m;
    if (!symbol && !mult && !word) continue;
    const amount = toNumber(num, Boolean(mult));
    if (!Number.isFinite(amount) || amount < 100) continue;
    out.push({ amount, currency: currencyOf(symbol, word, fallback) });
  }
  return out;
}

const REDO = "(redesign|refazer|reformular|renovar|atualizar|moderniz\\w*|repaginar|rebrand\\w*|refresh|rebuild|revamp|nova vers[ãa]o)";
const WANT =
  "(criar|fazer|desenvolver|construir|montar|preciso|precisamos|quero|queremos|queria|quer[ií]amos|gostaria|nova|novo|need|want|would like|build|create|new)";
const RE = {
  identity: new RegExp(`${REDO}[^.!?\\n]{0,30}\\b(marca|logo\\w*|identidade|brand)|\\b(marca|logo\\w*|identidade|brand)\\b[^.!?\\n]{0,30}${REDO}`, "i"),
  brand: new RegExp(
    `${WANT}[^.!?\\n]{0,25}\\b(marca|logo(tipo|marca)?|identidade visual|brand( identity)?)\\b|\\b(branding|naming)\\b|\\b(marca|logo(tipo|marca)?|identidade visual)\\b[^.!?\\n]{0,20}\\b(nova|novo|do zero|from scratch)\\b`,
    "i",
  ),
  siteRedesign: new RegExp(`${REDO}[^.!?\\n]{0,30}\\b(site|website)\\b|\\b(site|website)\\b[^.!?\\n]{0,30}(${REDO.slice(1, -1)}|antigo|velho|desatualizado|outdated)`, "i"),
  landing: /landing|p[áa]gina de (venda|captura|capta[çc][ãa]o|lan[çc]amento)|sales page/i,
  site: /\b(site|website|loja virtual|e-?commerce|online store)\b/i,
  system: new RegExp(
    `\\b(sistemas? (internos?|de gest[ãa]o|pr[óo]prios?|para (a equipe|gerenciar|controlar|organizar))|painel|dashboard|plataforma interna|interface de gest[ãa]o|internal (system|tool)s?|management (interface|system)|admin panel)\\b(?![^.!?\\n]{0,15}\\b(nada|nenhum|nothing|none)\\b)|${WANT}[^.!?\\n]{0,15}\\b(sistema|software|system)\\b`,
    "i",
  ),
};

export function servicesIn(text: string): ServiceKey[] {
  const t = text.replace(/sistemas? de design|design systems?/gi, "");
  const found = new Set<ServiceKey>();
  if (RE.identity.test(t)) found.add("identity");
  else if (RE.brand.test(t)) found.add("brand");
  if (RE.siteRedesign.test(t)) found.add("siteRedesign");
  else if (RE.landing.test(t)) found.add("landing");
  else if (RE.site.test(t)) found.add("site");
  if (RE.system.test(t)) found.add("system");
  return Array.from(found);
}

export type Qualification = {
  fit: Fit;
  services: ServiceKey[];
  budget: Money | null;
  minSum: number | null;
};

export function qualify(
  visitorTexts: string[],
  locale: "pt" | "en",
  extracted?: ServiceKey[],
  extraMin = 0,
): Qualification {
  const fallback: Currency = locale === "pt" ? "BRL" : "USD";
  const all = visitorTexts.join("\n");
  const services = extracted?.length ? extracted : servicesIn(all);
  const said = visitorTexts.flatMap((t) => moneyIn(t, fallback));
  const budget = said.length ? said[said.length - 1] : null;
  const base = loadBase();

  if (!budget) return { fit: "sem-info", services, budget, minSum: null };
  if (!base || budget.currency === "USD") return { fit: "sem-base", services, budget, minSum: null };

  const factor = budget.currency === "EUR" ? base.eurFactor : 1;
  const sum = services.reduce((s, k) => s + base.min[k], 0) + extraMin;
  const minSum = Math.max(base.floor, sum) * factor;
  return { fit: budget.amount < minSum ? "abaixo" : "ok", services, budget, minSum };
}

const FIT_LABEL: Record<Fit, string> = {
  ok: "Investimento declarado no perfil (≥ mínimo da opção Essencial)",
  abaixo: "Investimento declarado abaixo do mínimo da opção Essencial",
  "sem-info": "Investimento não declarado",
  "sem-base": "Sem base para comparar (moeda sem base ou PRICING_BASE ausente)",
};

export function fmt(m: Money): string {
  const symbol = m.currency === "BRL" ? "R$" : m.currency === "EUR" ? "€" : "US$";
  return `${symbol} ${Math.round(m.amount).toLocaleString("pt-BR")}`;
}

export function qualificationLine(q: Qualification): string {
  const parts = [FIT_LABEL[q.fit]];
  if (q.budget) parts.push(`investimento declarado: ${fmt(q.budget)}`);
  parts.push(`serviços identificados: ${q.services.length ? q.services.map((k) => SERVICE_LABEL[k]).join(", ") : "nenhum"}`);
  if (q.minSum !== null && q.budget) parts.push(`mínimo da opção Essencial: ${fmt({ amount: q.minSum, currency: q.budget.currency })}`);
  return parts.join(" · ");
}

export type Modifiers = { siteAdvanced?: boolean; naming?: boolean };
export type Band = { min: number; max: number | null; keys: PriceKey[]; floor: number };

export function hasBase(): boolean {
  return loadBase() !== null;
}

export function priceKeys(services: ServiceKey[], mods: Modifiers = {}): PriceKey[] {
  const base = loadBase();
  const keys: PriceKey[] = services.map((k) =>
    (k === "site" || k === "siteRedesign") && mods.siteAdvanced && base?.min.siteAdvanced ? "siteAdvanced" : k,
  );
  if (mods.naming && services.includes("brand") && base?.min.naming) keys.push("naming");
  return Array.from(new Set(keys));
}

export function priceBand(services: ServiceKey[], mods: Modifiers = {}): Band | null {
  const base = loadBase();
  if (!base || !services.length) return null;
  const keys = priceKeys(services, mods);
  const min = Math.max(base.floor, keys.reduce((s, k) => s + (base.min[k] ?? 0), 0));
  const allMax = keys.every((k) => base.max[k]);
  const max = allMax ? Math.max(min, keys.reduce((s, k) => s + (base.max[k] ?? 0), 0)) : null;
  return { min, max, keys, floor: base.floor };
}

export const PRICE_KEY_LABEL: Record<PriceKey, string> = {
  ...SERVICE_LABEL,
  siteAdvanced: "Site avançado (3D, efeitos pesados ou vários idiomas)",
  naming: "Naming",
};

export function bandLine(b: Band | null): string {
  if (!b) return "Faixa da base interna: sem base (PRICING_BASE ausente ou serviço não identificado).";
  const label = b.keys.map((k) => PRICE_KEY_LABEL[k]).join(" + ");
  const from = fmt({ amount: b.min, currency: "BRL" });
  return b.max
    ? `Faixa da base interna (${label}): ${from} a ${fmt({ amount: b.max, currency: "BRL" })}.`
    : `Faixa da base interna (${label}): a partir de ${from} (teto não configurado no PRICING_BASE).`;
}
