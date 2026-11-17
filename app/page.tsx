import HomeHero from "@/components/sections/HomeHero";
import ProjectIndex from "@/components/sections/ProjectIndex";
import Services from "@/components/sections/Services";
import StudioBand from "@/components/sections/StudioBand";
import Method from "@/components/sections/Method";
import Faq from "@/components/sections/Faq";
import { getShowcase } from "@/lib/decks/showcase";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default function Home() {
  const locale = getLocale();
  const dict = getDictionary(locale);

  return (
    <>
      <HomeHero locale={locale} />

      {/* Índice dos 8 sites: cada linha abre a apresentação; setor e local só existem em português */}
      <ProjectIndex items={getShowcase()} t={dict.home.index} showMeta={locale === "pt"} />

      <Services locale={locale} />

      <StudioBand locale={locale} />

      <Method locale={locale} />

      <Faq locale={locale} />
    </>
  );
}
