import {
  LONG_TURNS,
  asksContact,
  buildSystemPrompt,
  conversationState,
  fixGenderedThanks,
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

export const runtime = "nodejs";
// o diagnóstico pode precisar de até 3 tentativas (ver POST): mais que os 10s padrão
export const maxDuration = 40;

// Assistente do site (conduz o diagnóstico). A resposta é gerada INTEIRA antes de
// ser enviada: se o modelo gratuito cortar no meio (MAX_TOKENS, timeout, sem
// STOP), tenta de novo em vez de mostrar uma frase pela metade. Isso importa na
// mensagem de fechamento, onde está o marcador que dispara o envio ao time.
// Provedores e ordem de fallback: lib/llm.ts (Gemini grátis primeiro, Claude
// opcional). Nada configurado/disponível → 503, e o chat usa o script offline.
//
// Lista do briefing: quando a IA quer pedir nome e e-mail ou resumir, a rota extrai
// as respostas da conversa (mesma extração do e-mail do lead) e, se faltar item
// obrigatório de lib/briefing-fields.ts, manda refazer perguntando o que falta.

type IncomingMessage = { role: "user" | "assistant"; content: string };

// anti-abuso simples, por instância: 30 mensagens por 10 min por IP.
// Protege a cota gratuita (que é por projeto, não por visitante).
const hits = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 30;
}

export async function POST(req: Request) {
  let body: { messages?: IncomingMessage[]; locale?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("JSON inválido", { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (tooMany(ip)) return new Response("Muitas mensagens", { status: 429 });

  const locale: Locale = typeof body.locale === "string" && isLocale(body.locale) ? body.locale : "pt";

  const cleaned: Turn[] = (Array.isArray(body.messages) ? body.messages : [])
    .filter(
      (m): m is IncomingMessage =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  // o modelo vê só as últimas 40 mensagens (a lista do briefing deixa a conversa
  // mais longa), mas o estado da conversa conta todas
  const history = cleaned.slice(-40);

  // A conversa precisa começar com uma mensagem do visitante
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

  // Portão da lista do briefing: só quando a resposta pede contato (sem contato
  // ainda) ou traz o resumo. A extração roda no máximo uma vez por mensagem; se a
  // nova tentativa insistir, a mesma lista de pendências vale. Se a extração falhar,
  // não segura.
  let gate: { questions: string[] } | null | undefined; // undefined = ainda não extraiu
  async function missingGate(out: string): Promise<ReplyIssue | null> {
    if (state.userTurns >= LONG_TURNS || state.summaryPending) return null;
    const stage = !state.hasContact && asksContact(out) ? "contact" : isSummary(out) ? "summary" : null;
    if (!stage) return null;
    if (gate === undefined) {
      const b = await extractBriefing(cleaned, { deadlineMs: 10_000 }).catch(() => null);
      // no resumo, nome e e-mail também precisam estar lá (a pessoa pode ter
      // adiantado só o e-mail)
      // com a conversa: item de acesso "parcial" ainda não aprofundado e decisão de
      // contratação sem decisor claro também seguram o pedido de contato
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

  // limite de tempo total: o visitante não espera para sempre (maxDuration = 40s)
  const deadline = Date.now() + 32_000;
  let text = "";
  let rejected: { text: string; issue: ReplyIssue } | null = null; // última resposta reprovada pela trava
  let correction = "";
  for (const attempt of attempts) {
    if (Date.now() > deadline) break;
    try {
      const out = (await attempt.run(system + correction)).trim();
      if (!out) {
        console.warn(`[chat] ${attempt.name} devolveu resposta vazia`);
        continue;
      }
      // trava de qualidade: reprovou, o próximo candidato refaz com a razão no prompt
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
  // reprovada em todas as tentativas: o servidor conserta a resposta (ver repairReply)
  if (!text && rejected) text = repairReply(rejected.text, rejected.issue, locale, state);

  // tudo falhou: 503, e o hook do chat responde com o script offline
  if (!text) return new Response("Agente IA indisponível", { status: 503 });
  // o assistente não marca gênero: "obrigado/obrigada" vira "agradeço" (o modelo escorrega)
  if (pt) text = fixGenderedThanks(text);

  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
