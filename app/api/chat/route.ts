import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/chat-context";
import { isLocale, type Locale } from "@/lib/i18n";

export const runtime = "nodejs";

// Assistente comercial do site. Ordem de provedores (ver .env.local.example):
//   1. Gemini no plano gratuito do Google AI Studio (GEMINI_API_KEY)
//      modelo principal  GEMINI_MODEL  (padrão gemini-3.5-flash-lite)
//      se demorar, esgotar a cota (429) ou falhar → gemini-3.6-flash
//      (cada modelo tem cota própria: o reserva dobra a cota gratuita)
//   2. Claude (ANTHROPIC_API_KEY), opcional, só se existir a chave
//   3. nada configurado/disponível → 503, e o ChatAgent usa o script offline
//
// Escolha do modelo: latência manda em chat. Medido no plano gratuito, com
// streaming e o prompt real (out/2026):
//   gemini-3.5-flash-lite  0,7–2s até o 1º trecho  ← principal (Intelligence
//                          Index 22; respostas boas porque o contexto é fechado)
//   gemini-3.6-flash       2–4s (thinkingLevel low) ← reserva, mais capaz
//   gemini-3.8-flash       >30s: o de maior nota gratuito (índice 41), mas é
//                          modelo de raciocínio (~21s até o 1º trecho no
//                          próprio Artificial Analysis) e não respondeu em 3/3
//                          testes. Se melhorar: GEMINI_MODEL=gemini-3.8-flash.

type IncomingMessage = { role: "user" | "assistant"; content: string };
type Turn = { role: "user" | "assistant"; content: string };

const GEMINI_BASE = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODELS = [process.env.GEMINI_MODEL || "gemini-3.5-flash-lite", "gemini-3.6-flash"].filter(
  (m, i, all) => all.indexOf(m) === i,
);
const MAX_TOKENS = 1024; // com folga: tokens de raciocínio contam neste limite

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

// Abre o stream do Gemini. Devolve a Response só se estiver ok, para o chamador
// poder cair no próximo modelo antes de começar a responder ao visitante.
async function openGemini(model: string, system: string, history: Turn[], apiKey: string) {
  const body = (withThinking: boolean) =>
    JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: history.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        maxOutputTokens: MAX_TOKENS,
        temperature: 0.6,
        // chat de atendimento não precisa de raciocínio longo: menor latência
        // e menos tokens gastos da cota
        ...(withThinking ? { thinkingConfig: { thinkingLevel: "low" } } : {}),
      },
    });

  const url = `${GEMINI_BASE}/models/${model}:streamGenerateContent?alt=sse`;
  const call = (withThinking: boolean) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: body(withThinking),
      // o stream só abre quando o modelo começa a responder: se demorar, passa
      // para o próximo modelo em vez de deixar o visitante olhando o "digitando…"
      signal: AbortSignal.timeout(7_000),
    });

  let res = await call(true);
  // alguns modelos não aceitam thinkingLevel: tenta de novo sem o campo
  if (res.status === 400) res = await call(false);
  return res.ok && res.body ? res : null;
}

// SSE do Gemini → só os pedaços de texto (ignora partes de "thought")
async function* geminiText(res: Response): AsyncGenerator<string> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line.startsWith("data:")) continue;
      try {
        const json = JSON.parse(line.slice(5).trim());
        for (const part of json.candidates?.[0]?.content?.parts ?? []) {
          if (typeof part.text === "string" && !part.thought) yield part.text;
        }
      } catch {
        /* linha de keep-alive ou JSON parcial: ignora */
      }
    }
  }
}

async function* claudeText(system: string, history: Turn[]): AsyncGenerator<string> {
  const stream = new Anthropic().messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 600,
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages: history,
  });
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
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

  const history: Turn[] = (Array.isArray(body.messages) ? body.messages : [])
    .filter(
      (m): m is IncomingMessage =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-24)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  // A conversa precisa começar com uma mensagem do visitante
  while (history.length > 0 && history[0].role !== "user") history.shift();
  if (history.length === 0) {
    return new Response("Nenhuma mensagem do usuário", { status: 400 });
  }

  const system = buildSystemPrompt(locale);
  let source: AsyncGenerator<string> | null = null;

  if (process.env.GEMINI_API_KEY) {
    for (const model of GEMINI_MODELS) {
      try {
        const res = await openGemini(model, system, history, process.env.GEMINI_API_KEY);
        if (res) {
          source = geminiText(res);
          break;
        }
        console.warn(`[chat] ${model} indisponível, tentando o próximo`);
      } catch (err) {
        console.warn(`[chat] ${model} falhou:`, err);
      }
    }
  }
  if (!source && process.env.ANTHROPIC_API_KEY) source = claudeText(system, history);
  if (!source) return new Response("Agente IA indisponível", { status: 503 });

  const gen = source;
  const encoder = new TextEncoder();
  const apology =
    locale === "en"
      ? "\n\nI had a connection problem just now. You can reach us through the briefing page (/briefing) instead."
      : "\n\nTive um problema de conexão agora. Pode seguir pela página de briefing (/briefing) que a gente responde em até 24h.";

  let sent = 0;
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const text of gen) {
          sent += text.length;
          controller.enqueue(encoder.encode(text));
        }
        // resposta vazia (ex.: raciocínio estourou o limite): erro para o
        // cliente cair no script offline em vez de mostrar balão vazio
        if (sent === 0) controller.error(new Error("empty"));
        else controller.close();
      } catch {
        if (sent === 0) controller.error(new Error("failed"));
        else {
          controller.enqueue(encoder.encode(apology));
          controller.close();
        }
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
