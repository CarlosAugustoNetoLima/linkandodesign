import Anthropic from "@anthropic-ai/sdk";


export type Turn = { role: "user" | "assistant"; content: string };

const GEMINI_BASE = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODELS = [process.env.GEMINI_MODEL || "gemini-3.5-flash-lite", "gemini-3.6-flash"].filter(
  (m, i, all) => all.indexOf(m) === i,
);
const GEMINI_TIMEOUTS_MS = [8_000, 14_000];
const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
const MAX_TOKENS = 3072;

export type LlmOptions = {
  maxTokens?: number;
  json?: boolean;
  timeoutScale?: number;
  temperature?: number;
};

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
        ...(withThinking ? { thinkingConfig: { thinkingLevel: "low" } } : {}),
      },
    });

  const url = `${GEMINI_BASE}/models/${model}:streamGenerateContent?alt=sse`;
  const call = (withThinking: boolean) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: body(withThinking),
      signal: AbortSignal.timeout(timeoutMs),
    });

  let res = await call(true);
  if (res.status === 400) res = await call(false);
  if (res.status === 503) {
    await new Promise((r) => setTimeout(r, 500));
    res = await call(true);
  }
  if (!res.ok) console.warn(`[llm] ${model} respondeu ${res.status}`);
  return res.ok && res.body ? res : null;
}

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

async function collect(gen: AsyncGenerator<string>): Promise<string> {
  let out = "";
  for await (const part of gen) out += part;
  return out;
}

export type Attempt = { name: string; run: (system: string) => Promise<string> };

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
    attempts.push(gemini(0));
  }
  if (claudeLast) attempts.push(claude);
  return attempts;
}

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
