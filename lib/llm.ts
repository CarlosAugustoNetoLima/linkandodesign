import Anthropic from "@anthropic-ai/sdk";

// Provedores de LLM do site, na mesma ordem para o chat (/api/chat) e para o
// rascunho de proposta do lead (/api/chat/lead). Ordem (ver .env.local.example):
//   1. Gemini no plano gratuito do Google AI Studio (GEMINI_API_KEY)
//      modelo principal  GEMINI_MODEL  (padrão gemini-3.5-flash-lite)
//      se demorar, esgotar a cota (429) ou falhar → gemini-3.6-flash
//      (cada modelo tem cota própria: o reserva dobra a cota gratuita)
//   2. Claude (ANTHROPIC_API_KEY), opcional, só se existir a chave; modelo em
//      ANTHROPIC_MODEL (padrão claude-sonnet-5-5). Com CHAT_PROVIDER=claude ele
//      passa a ser o PRIMEIRO e o Gemini vira reserva.
//   3. nada configurado/disponível → lista vazia; quem chama decide o plano B
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

export type Turn = { role: "user" | "assistant"; content: string };

const GEMINI_BASE = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODELS = [process.env.GEMINI_MODEL || "gemini-3.5-flash-lite", "gemini-3.6-flash"].filter(
  (m, i, all) => all.indexOf(m) === i,
);
// Tempo máximo até o 1º trecho: o principal costuma responder em 0,7–2s, mas
// no plano gratuito já passou de 9s; o reserva é mais lento e ganha mais folga.
const GEMINI_TIMEOUTS_MS = [8_000, 14_000];
const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
// Com folga: os tokens de raciocínio contam neste limite. Com 1024, o flash-lite
// chegou a gastar quase tudo pensando e cortar a resposta em ~150 caracteres
// (finishReason MAX_TOKENS), por isso o limite é alto: só o teto, não a duração.
const MAX_TOKENS = 3072;

export type LlmOptions = {
  maxTokens?: number; // padrão 3072 (chat)
  json?: boolean; // pede JSON puro ao Gemini (responseMimeType)
  timeoutScale?: number; // multiplica o tempo até o 1º trecho (tarefas longas, fora do chat)
  temperature?: number;
};

// Abre o stream do Gemini. Devolve a Response só se estiver ok, para o chamador
// poder cair no próximo modelo antes de começar a responder ao visitante.
async function openGemini(
  model: string,
  system: string,
  history: Turn[],
  apiKey: string,
  timeoutMs: number,
  opts: LlmOptions,
) {
  const body = (withThinking: boolean) =>
    JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: history.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        maxOutputTokens: opts.maxTokens ?? MAX_TOKENS,
        temperature: opts.temperature ?? 0.6,
        ...(opts.json ? { responseMimeType: "application/json" } : {}),
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
      signal: AbortSignal.timeout(timeoutMs),
    });

  let res = await call(true);
  // alguns modelos não aceitam thinkingLevel: tenta de novo sem o campo
  if (res.status === 400) res = await call(false);
  // 503 = modelo sobrecarregado, quase sempre passa na segunda tentativa
  if (res.status === 503) {
    await new Promise((r) => setTimeout(r, 500));
    res = await call(true);
  }
  if (!res.ok) console.warn(`[llm] ${model} respondeu ${res.status}`);
  return res.ok && res.body ? res : null;
}

// SSE do Gemini → só os pedaços de texto (ignora partes de "thought").
// O último trecho traz finishReason "STOP". Se o stream acabar sem ele (corte no
// meio da frase, limite de tokens, filtro), lança erro: quem chama tenta o
// próximo candidato em vez de usar uma resposta pela metade.
async function* geminiText(res: Response): AsyncGenerator<string> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let finish: string | null = null;
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
        const cand = json.candidates?.[0];
        if (typeof cand?.finishReason === "string") finish = cand.finishReason;
        for (const part of cand?.content?.parts ?? []) {
          if (typeof part.text === "string" && !part.thought) yield part.text;
        }
      } catch {
        /* linha de keep-alive ou JSON parcial: ignora */
      }
    }
  }
  if (finish !== "STOP") throw new Error(`gemini terminou sem STOP (${finish ?? "sem finishReason"})`);
}

async function* claudeText(system: string, history: Turn[], opts: LlmOptions): AsyncGenerator<string> {
  const stream = new Anthropic({ timeout: 15_000 * (opts.timeoutScale ?? 1), maxRetries: 1 }).messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: opts.maxTokens ? Math.min(opts.maxTokens, 4096) : 1024,
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages: history,
  });
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}

// Consome o gerador até o fim: devolve a resposta completa ou lança se o stream morrer.
async function collect(gen: AsyncGenerator<string>): Promise<string> {
  let out = "";
  for await (const part of gen) out += part;
  return out;
}

export type Attempt = { name: string; run: (system: string) => Promise<string> };

// Candidatos em ordem. Cada um devolve a resposta COMPLETA ou lança.
export function llmAttempts(history: Turn[], opts: LlmOptions = {}): Attempt[] {
  const apiKey = process.env.GEMINI_API_KEY;
  const claudeFirst = Boolean(process.env.ANTHROPIC_API_KEY) && process.env.CHAT_PROVIDER === "claude";
  const claudeLast = Boolean(process.env.ANTHROPIC_API_KEY) && !claudeFirst;
  const scale = opts.timeoutScale ?? 1;

  const attempts: Attempt[] = [];
  const claude = { name: "claude", run: (sys: string) => collect(claudeText(sys, history, opts)) };
  const gemini = (i: number) => ({
    name: GEMINI_MODELS[i],
    run: async (sys: string) => {
      const res = await openGemini(
        GEMINI_MODELS[i],
        sys,
        history,
        apiKey!,
        (GEMINI_TIMEOUTS_MS[i] ?? GEMINI_TIMEOUTS_MS[GEMINI_TIMEOUTS_MS.length - 1]) * scale,
        opts,
      );
      if (!res) throw new Error("indisponível");
      return collect(geminiText(res));
    },
  });
  if (claudeFirst) attempts.push(claude);
  if (apiKey) {
    for (let i = 0; i < GEMINI_MODELS.length; i++) attempts.push(gemini(i));
    // a falha mais comum no plano gratuito é um corte aleatório, que quase sempre
    // passa na repetição: o principal ganha uma segunda chance no fim da fila
    attempts.push(gemini(0));
  }
  if (claudeLast) attempts.push(claude);
  return attempts;
}

// Para tarefas fora do chat (extração e proposta): percorre os candidatos até um
// devolver texto que o `accept` aprove. Devolve null se todos falharem.
export async function generate(
  system: string,
  history: Turn[],
  opts: LlmOptions & { accept?: (text: string) => boolean; deadlineMs?: number; label?: string } = {},
): Promise<string | null> {
  const deadline = Date.now() + (opts.deadlineMs ?? 30_000);
  for (const attempt of llmAttempts(history, opts)) {
    if (Date.now() > deadline) break;
    try {
      const out = (await attempt.run(system)).trim();
      if (out && (!opts.accept || opts.accept(out))) return out;
      console.warn(`[llm] ${opts.label ?? "generate"}: ${attempt.name} devolveu resposta inválida`);
    } catch (err) {
      console.warn(`[llm] ${opts.label ?? "generate"}: ${attempt.name} falhou:`, err instanceof Error ? err.message : err);
    }
  }
  return null;
}
