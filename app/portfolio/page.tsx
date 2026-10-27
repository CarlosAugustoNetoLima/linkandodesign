import type { Metadata } from "next";
import PortfolioGrid from "@/components/sections/PortfolioGrid";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { getProjects } from "@/lib/projects";

export function generateMetadata(): Metadata {
  const dict = getDictionary(getLocale());
  return { title: `${dict.portfolio.title} — Linkando Design` };
}

export default function PortfolioPage() {
  const locale = getLocale();
  const t = getDictionary(locale).portfolio;

  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-14 md:pt-24">
        <p className="label">[{t.label}]</p>
        <h1 className="mt-4 max-w-3xl font-display text-h1 font-extrabold uppercase">{t.title}</h1>
        <p className="mt-5 max-w-xl text-muted">{t.text}</p>
      </section>

      <PortfolioGrid locale={locale} projects={getProjects(locale)} />
    </>
  );
}
