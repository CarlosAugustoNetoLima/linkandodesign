import {
  LONG_TURNS,
  asksContact,
  buildSystemPrompt,
  conversationState,
  extractionReply,
  fixGenderedThanks,
  isExtractionAttempt,
  isSummary,
  missingFieldsIssue,
  repairReply,
  validateReply,
  type ReplyIssue,
} from "@/lib/chat-context";
import { BRIEFING_FIELDS } from "@/lib/briefing-fields";
import { isLocale, type Locale } from "@/lib/i18n";
import { extractBriefing, missingRequired } from "@/lib/lead-proposal";
import { llmAttempts, type Turn } from "@/lib/llm";
import { allowedOrigin, oversized } from "@/lib/request-guard";

export const runtime = "nodejs";
export const maxDuration = 40;


type IncomingMessage = { role: "user" | "assistant"; content: string };

const hits = new Map<string, number[]>();
const lastTurn = new Map<string, number>();
function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 30;
}
function tooFast(ip: string) {
  const now = Date.now();
  if (now - (lastTurn.get(ip) ?? 0) < 800) return true;
  lastTurn.set(ip, now);
  return false;
}

export async function POST(req: Request) {
  if (!allowedOrigin(req)) return new Response("Origem não permitida", { status: 403 });
  if (oversized(req)) return new Response("Corpo muito grande", { status: 413 });
  let body: { messages?: IncomingMessage[]; locale?: string; website?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("JSON inválido", { status: 400 });
  }
  if (typeof body.website === "string" && body.website.trim()) return new Response("ok");

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (tooMany(ip) || tooFast(ip)) return new Response("Muitas mensagens", { status: 429 });

  const locale: Locale = typeof body.locale === "string" && isLocale(body.locale) ? body.locale : "pt";
  const lastUserText = body.messages?.filter((m) => m?.role === "user").at(-1)?.content ?? "";
  if (isExtractionAttempt(lastUserText)) {
    return new Response(extractionReply(locale), {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const cleaned: Turn[] = (Array.isArray(body.messages) ? body.messages : [])
    .filter(
      (m): m is IncomingMessage =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  const history = cleaned.slice(-40);

  while (history.length > 0 && history[0].role !== "user") history.shift();
  if (history.length === 0) {
    return new Response("Nenhuma mensagem do usuário", { status: 400 });
  }

  const state = conversationState(cleaned, locale);
  const visitorText = cleaned
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n");
  const system = buildSystemPrompt(locale, state);
  const attempts = llmAttempts(history);
  const pt = locale === "pt";

  let gate: { questions: string[] } | null | undefined;
  async function missingGate(out: string): Promise<ReplyIssue | null> {
    if (state.userTurns >= LONG_TURNS || state.summaryPending) return null;
    const stage = !state.hasContact && asksContact(out) ? "contact" : isSummary(out) ? "summary" : null;
    if (!stage) return null;
    if (gate === undefined) {
      const b = await extractBriefing(cleaned, { deadlineMs: 10_000 }).catch(() => null);
      const ids = b ? missingRequired(b, { contact: stage === "summary", turns: cleaned }) : [];
      if (ids.length) console.warn(`[chat] lista do briefing incompleta (${stage}): ${ids.join(", ")}`);
      gate = ids.length
        ? {
            questions: ids
              .map((id) => BRIEFING_FIELDS.find((f) => f.id === id)?.question[pt ? "pt" : "en"])
              .filter((q): q is string => Boolean(q)),
          }
        : null;
    }
    return gate ? missingFieldsIssue(gate.questions, locale, stage) : null;
  }

  const deadline = Date.now() + 32_000;
  let text = "";
  let rejected: { text: string; issue: ReplyIssue } | null = null;
  let correction = "";
  for (const attempt of attempts) {
    if (Date.now() > deadline) break;
    try {
      const out = (await attempt.run(system + correction)).trim();
      if (!out) {
        console.warn(`[chat] ${attempt.name} devolveu resposta vazia`);
        continue;
      }
      const problem = validateReply(out, locale, state, visitorText) ?? (await missingGate(out));
      if (!problem) {
        text = out;
        break;
      }
      console.warn(`[chat] ${attempt.name} reprovada (${problem.code})`);
      rejected = { text: out, issue: problem };
      correction = `\n\n## CORREÇÃO OBRIGATÓRIA (sua resposta anterior foi rejeitada)\n${problem.message}`;
    } catch (err) {
      console.warn(`[chat] ${attempt.name} falhou:`, err instanceof Error ? err.message : err);
    }
  }
  if (!text && rejected) text = repairReply(rejected.text, rejected.issue, locale, state);

  if (!text) return new Response("Agente IA indisponível", { status: 503 });
  if (pt) text = fixGenderedThanks(text);

  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
