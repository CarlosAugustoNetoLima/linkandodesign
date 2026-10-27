import nodemailer from "nodemailer";

// Envio de e-mail do site para o estúdio via SMTP (caixa da Hostinger).
// Todo e-mail sai com o prefixo "[Site]" no assunto: é por ele que o filtro do
// webmail move a mensagem para a pasta "Site". Usado por /api/briefing e
// /api/chat/lead.
//
// Variáveis (.env.local — ver .env.local.example):
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS  (obrigatórias)
//   MAIL_TO  (padrão: o próprio SMTP_USER)

export const MAIL_SUBJECT_TAG = "[Site]";

export const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/\r/g, "").trim().slice(0, max) : "";

// cabeçalhos de e-mail não podem ter quebra de linha (injeção de header)
export const oneLine = (v: string) => v.replace(/[\r\n]+/g, " ");

export const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export function smtpConfigured() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

// anti-abuso simples, por instância e por chave (IP)
export function makeLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string) => {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(key, recent);
    return recent.length > max;
  };
}

export async function sendSiteMail(opts: {
  subject: string; // sem o prefixo: ele é acrescentado aqui
  text: string;
  html: string;
  replyTo?: { name?: string; address: string };
}) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO } = process.env;
  const port = Number(SMTP_PORT) || 465;
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await transporter.sendMail({
    from: { name: "Site Linkando Design", address: SMTP_USER! },
    to: MAIL_TO || SMTP_USER,
    replyTo: opts.replyTo,
    subject: `${MAIL_SUBJECT_TAG} ${oneLine(opts.subject)}`,
    text: opts.text,
    html: opts.html,
  });
}
