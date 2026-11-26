import HomeHero from "@/components/sections/HomeHero";
import ProjectList from "@/components/sections/ProjectList";
import Services from "@/components/sections/Services";
import Method from "@/components/sections/Method";
import Faq from "@/components/sections/Faq";
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { getShowcase } from "@/lib/decks/showcase";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  const locale = getLocale();
  const dict = getDictionary(locale);

  return (
    <>
      <JsonLd />
      <HomeHero locale={locale} />

      
      <ProjectList items={getShowcase()} t={dict.home.index} showMeta={locale === "pt"} />

      <Services locale={locale} />

      <Method locale={locale} />

      <Faq locale={locale} />
    </>
  );
}
