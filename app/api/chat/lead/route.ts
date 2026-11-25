import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clean, isEmail, makeLimiter, sendSiteMail, smtpConfigured } from "@/lib/mail";
import { buildLeadEmail, prepareLeadExtras, type LeadInput } from "@/lib/lead-proposal";
import { qualify } from "@/lib/pricing-base";

export const runtime = "nodejs";
// "complete" gera as respostas do briefing e a pré-proposta antes de enviar
export const maxDuration = 60;

// Envia a conversa do chat para o time quando há um contato (e-mail ou telefone)
// dito pelo visitante NA PRÓPRIA CONVERSA. O campo `status` diz em que ponto ela
// está: "complete" = a IA concluiu o diagnóstico; "partial" = o visitante fechou
// o chat ou saiu da página antes disso; "out" = a IA encerrou como fora do perfil
// (investimento abaixo do mínimo, sem flexibilidade), com ou sem contato (qualquer
// outro valor vira "partial").
// O aviso de que isso acontece fica visível no chat (ver privacy em useDiagnosisChat).
// Nada é guardado no servidor: a conversa só sai por e-mail para a caixa do
// estúdio (pasta "Site").
// "complete" leva também, só para o time: alertas e placar, a classe do lead, as
// respostas do briefing campo a campo, a pré-proposta para o cliente (três opções) e
// as notas internas (lib/lead-proposal.ts). "out" leva alertas, placar e briefing, sem
// pré-proposta. O cliente não recebe nada automático. Se a geração falhar, o e-mail
// sai com a conversa e um aviso.
//
// Teste sem envio: LEAD_DRY_RUN=1 grava o e-mail (.txt e .html) em LEAD_DRY_RUN_DIR
// (padrão: pasta temporária do sistema/linkando-lead) em vez de mandar por SMTP.

type Turn = { role: "user" | "assistant"; content: string };

const tooMany = makeLimiter(5, 60 * 60 * 1000); // 5 envios por hora por IP

export async function POST(req: Request) {
  let body: { contact?: string; locale?: string; status?: string; messages?: Turn[] };
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
    .slice(-80) // um diagnóstico completo passa de 25 mensagens: o contato não pode ficar de fora
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  const locale = body.locale === "en" ? "en" : "pt";
  const status: LeadInput["status"] = body.status === "complete" ? "complete" : body.status === "out" ? "out" : "partial";
  // só envia se o contato realmente foi dito pelo visitante na conversa:
  // impede usar o endpoint para mandar e-mail com conteúdo arbitrário
  const saidByVisitor = Boolean(contact) && turns.some((m) => m.role === "user" && m.content.includes(contact));
  if (contact && !saidByVisitor) return Response.json({ error: "invalid" }, { status: 400 });
  if (status === "out") {
    // fora do perfil vale sem contato, mas só se a conversa tem mesmo um investimento
    // abaixo do mínimo dito pelo visitante
    const fit = qualify(turns.filter((m) => m.role === "user").map((m) => m.content), locale).fit;
    if (fit !== "abaixo") return Response.json({ error: "invalid" }, { status: 400 });
  } else if (!contact) return Response.json({ error: "invalid" }, { status: 400 });

  const dryRun = process.env.LEAD_DRY_RUN === "1";
  if (!dryRun && !smtpConfigured()) {
    console.error("[chat/lead] SMTP não configurado");
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  const input: LeadInput = { contact, locale, status, turns };
  const mail = buildLeadEmail(input, await prepareLeadExtras(input));

  if (dryRun) {
    const dir = process.env.LEAD_DRY_RUN_DIR || join(tmpdir(), "linkando-lead");
    const base = join(dir, `${Date.now()}-${input.status}`);
    await mkdir(dir, { recursive: true });
    await writeFile(`${base}.txt`, `Assunto: [Site] ${mail.subject}\n\n${mail.text}`);
    await writeFile(`${base}.html`, mail.html);
    console.log(`[chat/lead] LEAD_DRY_RUN: e-mail gravado em ${base}.txt (nada foi enviado)`);
    return Response.json({ ok: true, dryRun: true });
  }

  try {
    await sendSiteMail({
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      replyTo: isEmail(contact) ? { address: contact } : undefined,
    });
  } catch (err) {
    console.error("[chat/lead] falha ao enviar:", err);
    return Response.json({ error: "send_failed" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
