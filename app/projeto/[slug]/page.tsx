import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectCoverCard from "@/components/ui/ProjectCoverCard";
import MotionPair from "@/components/ui/MotionPair";
import Reveal from "@/components/motion/Reveal";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { getProject, nextProject, projectSlugs } from "@/lib/projects";
import { contactHref, hasWhatsapp, EMAIL } from "@/lib/contact";

export function generateStaticParams() {
  return projectSlugs.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getProject(getLocale(), params.slug);
  if (!p) return {};
  return { title: `${p.name} — Linkando Design`, description: p.context };
}

export default function ProjetoPage({ params }: { params: { slug: string } }) {
  const locale = getLocale();
  const dict = getDictionary(locale);
  const t = dict.project;
  const p = getProject(locale, params.slug);
  if (!p) notFound();

  const next = nextProject(locale, p.slug);
  const domain = p.url.replace(/^https?:\/\//, "");
  const craftItems = p.craft
    .slice(0, p.craftMedia.length)
    .map((note, i) => ({ ...note, media: p.craftMedia[i] }));

  return (
    <>
      
      <section className="mx-auto max-w-7xl px-5 pb-12 pt-10 md:pt-16">
        <Link href="/apresentacoes" className="link-brut font-mono text-xs uppercase tracking-widest">
          ← {t.back}
        </Link>

        <h1 className="mt-8 font-display text-display font-extrabold uppercase">
          {p.name} <span aria-hidden="true">{p.flag}</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{p.context}</p>

        
        <ul className="mt-6 flex flex-wrap gap-2" aria-label={t.deliverables}>
          {p.deliverables.map((d) => (
            <li
              key={d}
              className="rounded-md bg-ink px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-lime"
            >
              {d}
            </li>
          ))}
        </ul>

        
        <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: t.typeLabel, v: p.type },
            { k: t.countryLabel, v: p.country },
            { k: t.yearLabel, v: p.year },
            { k: t.siteLabel, v: domain },
          ].map((row) => (
            <div
              key={row.k}
              className="rounded-2xl border border-line bg-surface p-5 shadow-card"
            >
              <dt className="label opacity-60">{row.k}</dt>
              <dd className="mt-2 text-sm font-semibold">{row.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      
      <section className="mx-auto max-w-7xl px-5 pb-16">
        <div className="overflow-hidden rounded-3xl border border-line shadow-card-lg">
          <MotionPair base={p.motion.base} name={p.name} url={domain} dict={t} />
        </div>
        {p.motionExtra?.map((m) => (
          <div key={m.base} className="mt-10">
            {m.label && <p className="label mb-4">[{m.label[locale]}]</p>}
            <div className="overflow-hidden rounded-3xl border border-line shadow-card-lg">
              <MotionPair base={m.base} name={p.name} url={domain} dict={t} />
            </div>
          </div>
        ))}
      </section>

      
      <section className="mx-auto max-w-7xl px-5 py-4 md:py-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { k: t.challenge, v: p.problem },
            { k: t.solution, v: p.solution },
            { k: t.result, v: p.result },
          ].map((b) => (
            <div key={b.k} className="rounded-3xl border border-line bg-surface p-8 shadow-card">
              <h2 className="label">[{b.k}]</h2>
              <p className="mt-4 leading-relaxed">{b.v}</p>
            </div>
          ))}
        </div>
      </section>

      
      <section className="mx-auto max-w-7xl px-5 py-10 md:py-14">
        <p className="label">[{t.process}]</p>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {p.process.map((step, i) => (
            <li key={step} className="rounded-2xl border border-line bg-surface p-6 shadow-card">
              <span className="num-hollow font-display text-4xl font-extrabold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-4 text-sm font-semibold leading-snug">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      
      {p.stats.length > 0 && (
        <section className="px-2 py-8 sm:px-3">
          <div className="rounded-2xl bg-charcoal p-8 text-white shadow-dark sm:p-12 md:rounded-3xl">
            <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">
              [{t.numbers}]
            </p>
            <div className="mt-8 grid gap-10 sm:grid-cols-3">
              {p.stats.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-4xl font-extrabold text-lime md:text-5xl">
                    {s.value}
                  </p>
                  <p className="mt-2 text-sm text-white/60">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      
      {craftItems.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-14 md:py-20">
          <h2 className="font-display text-h2 font-extrabold uppercase">{t.gallery}</h2>

          <div className="mt-12 grid gap-14 md:gap-20">
            {craftItems.map((c, i) => (
              <Reveal key={c.title}>
                <div className="grid items-start gap-6 md:grid-cols-[1fr_320px] md:gap-10">
                  
                  <div className="dotgrid flex items-start gap-3 rounded-3xl border border-line bg-paper p-4 shadow-card sm:gap-5 sm:p-6">
                    <img
                      src={c.media.desktop}
                      alt={`${c.title} — ${t.deviceDesktop}`}
                      loading="lazy"
                      decoding="async"
                      className="block min-w-0 flex-1 self-start rounded-xl border border-line shadow-card"
                    />
                    <img
                      src={c.media.mobile}
                      alt={`${c.title} — ${t.deviceMobile}`}
                      loading="lazy"
                      decoding="async"
                      className="block w-[24%] max-w-[150px] shrink-0 rounded-xl border border-line shadow-card"
                    />
                  </div>

                  
                  <div className="md:sticky md:top-28">
                    <span className="num-hollow font-display text-4xl font-extrabold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 font-display text-xl font-extrabold">{c.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{c.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      
      <section className="mx-auto max-w-7xl px-5 py-10 md:py-14">
        <div className="rounded-3xl border border-line bg-surface p-8 shadow-card md:p-12">
          <p className="label">[{t.palette}]</p>

          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <div>
              <ul className="flex flex-wrap gap-4">
                {p.palette.map((sw) => (
                  <li key={sw.hex} className="flex items-center gap-3">
                    <span
                      className="block h-14 w-14 rounded-xl border border-ink/15 shadow-card"
                      style={{ backgroundColor: sw.hex }}
                      aria-hidden="true"
                    />
                    <span>
                      <span className="block font-mono text-xs uppercase">{sw.hex}</span>
                      <span className="block text-xs text-muted">{sw.name}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-8 max-w-md text-sm leading-relaxed text-muted">
                <span className="label mr-2 opacity-60">[{t.dna}]</span>
                {p.dna}
              </p>
            </div>

            <div className="dotgrid rounded-2xl border border-line bg-paper p-8">
              <p className="font-display text-4xl font-extrabold leading-tight">
                {p.fonts.display}
              </p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted">
                Display
              </p>
              <p className="mt-6 text-2xl leading-tight">{p.fonts.body}</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted">Body</p>
            </div>
          </div>
        </div>
      </section>

      
      <section className="px-2 py-8 sm:px-3">
        <div className="rounded-2xl bg-charcoal p-8 shadow-dark sm:p-12 md:rounded-3xl md:p-16">
          <p className="max-w-4xl font-display text-h1 font-extrabold uppercase text-lime">
            “{p.quote}”
          </p>
        </div>
      </section>

      
      <section className="mx-auto max-w-7xl px-5 py-14 md:py-20">
        <div className="flex flex-wrap items-center gap-5">
          
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-brut"
          >
            {t.live} ↗
          </a>
          <a href={contactHref(locale)} className="btn-brut-ghost">
            {hasWhatsapp ? t.cta : EMAIL}
          </a>
        </div>

        <h2 className="mt-16 max-w-2xl font-display text-h2 font-extrabold uppercase">
          {t.ctaTitle}
        </h2>
        <p className="mt-4 max-w-xl text-muted">{t.ctaText}</p>
      </section>

      
      <section className="mx-auto max-w-7xl px-5 pb-16">
        <p className="label">[{t.next}]</p>
        <div className="mt-8">
          <ProjectCoverCard
            slug={next.slug}
            name={next.name}
            href={`/projeto/${next.slug}`}
            cover={
              next.slug === "yanns"
                ? "/projects/yanns-cover.webp"
                : next.slug === "festival-crato"
                ? "/projects/festivalcrato-cover.webp"
                : next.slug === "wauw"
                ? "/projects/wauw-cover.webp"
                : next.slug === "jsynq"
                ? "/projects/jsynq-cover.webp"
                : `/projects/${next.slug}-cover.webp`
            }
            year={next.year}
            flag={next.flag}
            summary={next.context}
            tags={next.tags}
            caseLabel={dict.home.featured.case}
          />
        </div>
      </section>
    </>
  );
}
