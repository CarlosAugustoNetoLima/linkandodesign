import Link from "next/link";
import ProjectMotionCard from "@/components/ui/ProjectMotionCard";
import Reveal from "@/components/motion/Reveal";
import { getDictionary, type Locale } from "@/lib/i18n";
import { getProjects } from "@/lib/projects";

export default function FeaturedWork({
  locale,
  limit,
}: {
  locale: Locale;
  limit?: number;
}) {
  const dict = getDictionary(locale);
  const t = dict.home.featured;
  const all = getProjects(locale);
  const projects = limit ? all.slice(0, limit) : all;

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 md:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label">[{t.label}]</p>
          <h2 className="mt-4 max-w-xl font-display text-h2 font-extrabold uppercase">{t.title}</h2>
          <p className="mt-4 max-w-xl text-muted">{t.text}</p>
        </div>

        <Link href="/portfolio" className="link-brut text-sm font-semibold">
          {t.all} →
        </Link>
      </div>

      <div className="mt-12 grid gap-10">
        {projects.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.05}>
            <ProjectMotionCard
              slug={p.motion.base}
              name={p.name}
              url={p.url.replace(/^https?:\/\//, "")}
              year={p.year}
              flag={p.flag}
              summary={p.context}
              tags={p.tags}
              href={`/projeto/${p.slug}`}
              caseLabel={t.case}
              devices={dict.project}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
