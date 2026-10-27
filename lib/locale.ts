import { cookies } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

// Lê o idioma do cookie NEXT_LOCALE (setado pelo seletor PT·EN do header).
// Sem cookie válido, cai no padrão: português brasileiro.
export function getLocale(): Locale {
  const value = cookies().get("NEXT_LOCALE")?.value;
  return value && isLocale(value) ? value : defaultLocale;
}
