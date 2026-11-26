import { cookies } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

export function getLocale(): Locale {
  const value = cookies().get("NEXT_LOCALE")?.value;
  return value && isLocale(value) ? value : defaultLocale;
}
