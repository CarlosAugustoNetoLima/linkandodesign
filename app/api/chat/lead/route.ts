import {
  clean,
  esc,
  isEmail,
  makeLimiter,
  oneLine,
  sendSiteMail,
  smtpConfigured,
} from "@/lib/mail";

export const runtime = "nodejs";

// Envia a conversa do chat para o time quando o visitante informa um contato
// (e-mail ou telefone) NA PRÓPRIA CONVERSA. O aviso de que isso acontece fica
// visível no painel do chat (ver ChatAgent). Nada é guardado no servidor: a
// conversa só sai por e-mail para a caixa do estúdio (pasta "Site").

type Turn = { role: "user" | "assistant"; content: string };

const tooMany = makeLimiter(5, 60 * 60 * 1000); // 5 envios por hora por IP

export async function POST(req: Request) {
  let body: { contact?: string; locale?: string; messages?: Turn[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (tooMany(ip)) return Response.json({ error: "rate" }, { status: 429 });

  const contact = clean(body.contact, 120);
  const turns: Turn[] = (Array.isArray(body.messages) ? body.messages : [])
    .filter(
      (m): m is Turn =>
        !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
    )
    .slice(-40)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  // só envia se o contato realmente foi dito pelo visitante na conversa:
  // impede usar o endpoint para mandar e-mail com conteúdo arbitrário
  const saidByVisitor = turns.some((m) => m.role === "user" && m.content.includes(contact));
  if (!contact || !saidByVisitor) return Response.json({ error: "invalid" }, { status: 400 });

  if (!smtpConfigured()) {
    console.error("[chat/lead] SMTP não configurado");
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  const lang = body.locale === "en" ? "English" : "Português";
  const transcript = turns
    .map((m) => `${m.role === "user" ? "Visitante" : "Assistente"}: ${m.content}`)
    .join("\n\n");
  const text = `Contato informado: ${contact}\nIdioma do site: ${lang}\n\n--- Conversa ---\n\n${transcript}\n`;
  const html = `<div style="font-family:Arial,sans-serif;color:#17171a;max-width:560px">
<h2 style="margin:0 0 8px">Conversa do chat com contato</h2>
<p style="margin:0 0 16px">Contato informado: <strong>${esc(contact)}</strong> · ${esc(lang)}</p>
${turns
  .map(
    (m) =>
      `<p style="margin:0 0 10px;padding:10px 12px;border-radius:10px;background:${
        m.role === "user" ? "#f1f6c8" : "#f1f1f1"
      }"><strong>${m.role === "user" ? "Visitante" : "Assistente"}:</strong> ${esc(m.content).replace(/\n/g, "<br>")}</p>`,
  )
  .join("")}
${isEmail(contact) ? `<p style="margin-top:20px;color:#666;font-size:13px">Responder a este e-mail responde direto para ${esc(contact)}.</p>` : ""}
</div>`;

  try {
    await sendSiteMail({
      subject: `Conversa do chat — ${oneLine(contact)}`,
      text,
      html,
      replyTo: isEmail(contact) ? { address: contact } : undefined,
    });
  } catch (err) {
    console.error("[chat/lead] falha ao enviar:", err);
    return Response.json({ error: "send_failed" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
