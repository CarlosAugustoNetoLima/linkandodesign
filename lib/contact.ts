// Dados de contato do estúdio, num lugar só.
//
// PENDENTE ANTES DO DEPLOY: número de WhatsApp, e-mail e redes ainda não foram
// informados (o CLAUDE.md lista todos como "(adicionar)"). Enquanto WHATSAPP
// estiver vazio, os CTAs de WhatsApp caem para o e-mail — nunca para um link
// inventado.

export const WHATSAPP = ""; // ex.: "5511999999999" (só dígitos, com DDI)
export const EMAIL = "contato@linkandodesign.com";
export const SOCIAL: { label: string; href: string }[] = [
  // { label: "Instagram", href: "https://instagram.com/…" },
];

const WHATSAPP_MSG = {
  pt: "Olá! Vim pelo site e queria falar sobre um projeto.",
  en: "Hi! I came from your website and I'd like to talk about a project.",
};

export function contactHref(locale: "pt" | "en" = "pt") {
  if (WHATSAPP) {
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MSG[locale])}`;
  }
  return `mailto:${EMAIL}`;
}

export const hasWhatsapp = Boolean(WHATSAPP);
