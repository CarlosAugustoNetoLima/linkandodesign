import nodemailer from "nodemailer";


export const MAIL_SUBJECT_TAG = "[Site]";

const DEFAULT_COPIES = ["linkandodesign@gmail.com", "carlosnetolima@gmail.com"];

export const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/\r/g, "").trim().slice(0, max) : "";

export const oneLine = (v: string) => v.replace(/[\r\n]+/g, " ");

export const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export function smtpConfigured() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

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
  subject: string;
  text: string;
  html: string;
  replyTo?: { name?: string; address: string };
}) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO, MAIL_COPIES } = process.env;
  const port = Number(SMTP_PORT) || 465;
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  const copies = MAIL_COPIES ? MAIL_COPIES.split(",").map((v) => v.trim()).filter(Boolean) : DEFAULT_COPIES;
  const to = Array.from(new Set([MAIL_TO || SMTP_USER, ...copies].filter((v): v is string => Boolean(v))));
  await transporter.sendMail({
    from: { name: "Site Linkando Design", address: SMTP_USER! },
    to,
    replyTo: opts.replyTo,
    subject: `${MAIL_SUBJECT_TAG} ${oneLine(opts.subject)}`,
    text: opts.text,
    html: opts.html,
  });
}
