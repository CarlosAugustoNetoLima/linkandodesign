
export const WHATSAPP = "";
export const EMAIL = "contato@linkandodesign.com";
export const SOCIAL: { label: string; href: string }[] = [
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
