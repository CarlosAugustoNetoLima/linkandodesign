import {
  BUDGET_IDS,
  DEADLINE_IDS,
  SERVICE_IDS,
  budgetLabel,
  deadlineLabelPt,
  serviceLabelPt,
} from "@/lib/briefing";
import { isLocale, type Locale } from "@/lib/i18n";
import { clean, esc, isEmail, makeLimiter, oneLine, sendSiteMail, smtpConfigured } from "@/lib/mail";

export const runtime = "nodejs";

// Envia o briefing para o e-mail do estúdio (ver lib/mail.ts: SMTP e prefixo
// "[Site]" que leva a mensagem para a pasta Site do webmail).

const MAX = { name: 120, email: 160, short: 160, long: 4000 };
const tooMany = makeLimiter(5, 60 * 60 * 1000); // 5 envios por hora por IP

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  // honeypot: campo invisível que humano não preenche. Responde "ok" para o
  // bot não tentar de novo, mas não envia nada.
  if (clean(body.website, 200)) return Response.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (tooMany(ip)) return Response.json({ error: "rate" }, { status: 429 });

  const locale: Locale = typeof body.locale === "string" && isLocale(body.locale) ? body.locale : "pt";
  const name = clean(body.name, MAX.name);
  const email = clean(body.email, MAX.email);
  const phone = clean(body.phone, 40);
  const company = clean(body.company, MAX.short);
  const details = clean(body.details, MAX.long);
  const reference = clean(body.reference, MAX.short);
  const services = Array.isArray(body.services)
    ? body.services.filter((s): s is string => (SERVICE_IDS as readonly string[]).includes(s as string))
    : [];
  const deadline = (DEADLINE_IDS as readonly string[]).includes(body.deadline as string)
    ? (body.deadline as string)
    : "";
  const budget = (BUDGET_IDS as readonly string[]).includes(body.budget as string)
    ? (body.budget as string)
    : "";

  if (!name || !details || !services.length || !isEmail(email)) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  if (!smtpConfigured()) {
    console.error("[briefing] SMTP não configurado (SMTP_HOST/SMTP_USER/SMTP_PASS)");
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  const serviceNames = services.map(serviceLabelPt);
  const rows: [string, string][] = [
    ["Nome", name],
    ["E-mail", email],
    ["WhatsApp", phone || "—"],
    ["Empresa", company || "—"],
    ["Serviços", serviceNames.join(", ")],
    ["Prazo", deadline ? deadlineLabelPt(deadline) : "—"],
    ["Investimento", budget ? budgetLabel(locale, budget) : "—"],
    ["Site / referência", reference || "—"],
    ["Idioma do site", locale === "pt" ? "Português" : "English"],
  ];

  const text =
    rows.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\nO que está travando:\n${details}\n`;
  const html = `<div style="font-family:Arial,sans-serif;color:#17171a;max-width:560px">
<h2 style="margin:0 0 16px">Novo briefing pelo site</h2>
<table style="border-collapse:collapse;width:100%">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0"><strong>${esc(v)}</strong></td></tr>`,
    )
    .join("")}</table>
<h3 style="margin:24px 0 8px">O que está travando</h3>
<p style="white-space:pre-wrap;margin:0">${esc(details)}</p>
<p style="margin-top:24px;color:#666;font-size:13px">Responder a este e-mail responde direto para ${esc(email)}.</p>
</div>`;

  try {
    await sendSiteMail({
      subject: `Novo briefing — ${oneLine(name)} · ${serviceNames.join(" + ")}`,
      text,
      html,
      replyTo: { name: oneLine(name), address: email },
    });
  } catch (err) {
    console.error("[briefing] falha ao enviar:", err);
    return Response.json({ error: "send_failed" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
