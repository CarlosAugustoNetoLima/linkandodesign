"use client";

import { useMemo, useState } from "react";
import ProjectCoverCard from "@/components/ui/ProjectCoverCard";
import Reveal from "@/components/motion/Reveal";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { Project } from "@/lib/projects";

type Filter = "all" | Project["filter"];

// Grid do portfólio com filtro por categoria. Os filtros só aparecem quando há
// mais de uma categoria ocupada: hoje todos os projetos no ar são sites, e uma
// barra "Todos · Sites" seria decorativa. Ao entrar um projeto de marca ou de
// sistema, os botões aparecem sozinhos.
export default function PortfolioGrid({
  locale,
  projects,
}: {
  locale: Locale;
  projects: Project[];
}) {
  const dict = getDictionary(locale);
  const t = dict.portfolio;
  const [active, setActive] = useState<Filter>("all");

  const categories = useMemo(() => {
    const present = Array.from(new Set(projects.map((p) => p.filter)));
    return present.length > 1 ? (["all", ...present] as Filter[]) : [];
  }, [projects]);

  const shown = active === "all" ? projects : projects.filter((p) => p.filter === active);

  const label: Record<Filter, string> = {
    all: t.filters.all,
    site: t.filters.site,
    branding: t.filters.branding,
    uiux: t.filters.system,
  };

  const coverFor = (slug: string) => {
    if (slug === "yanns") return "/projects/yanns-cover.webp";
    if (slug === "festival-crato") return "/projects/festivalcrato-cover.webp";
    if (slug === "jsynq") return "/projects/jsynq-cover.webp";
    if (slug === "wauw") return "/projects/wauw-cover.webp";
    return `/projects/${slug}-cover.webp`;
  };

  return (
    <section className="mx-auto max-w-7xl px-5 pb-24">
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-3" role="group" aria-label={t.label}>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActive(c)}
              aria-pressed={active === c}
              className={`rounded-md border border-ink/20 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest transition-all duration-150 ${
                active === c
                  ? "border-ink bg-ink text-lime"
                  : "bg-surface text-ink shadow-card hover:-translate-y-0.5 hover:shadow-card-lg"
              }`}
            >
              {label[c]}
            </button>
          ))}
        </div>
      )}

      <div className="mt-10 grid gap-10">
        {shown.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.05}>
            <ProjectCoverCard
              slug={p.slug}
              name={p.name}
              href={`/projeto/${p.slug}`}
              cover={coverFor(p.slug)}
              year={p.year}
              flag={p.flag}
              summary={p.context}
              tags={p.tags}
              caseLabel={dict.home.featured.case}
            />
          </Reveal>
        ))}
      </div>

      {shown.length === 0 && <p className="py-16 text-muted">{t.empty}</p>}
    </section>
  );
}
