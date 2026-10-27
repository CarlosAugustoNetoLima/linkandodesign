import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export function generateMetadata(): Metadata {
  const dict = getDictionary(getLocale());
  return { title: `${dict.about.label} — Linkando Design` };
}

export default function SobrePage() {
  const locale = getLocale();
  const dict = getDictionary(locale);
  const t = dict.about;

  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-14 md:pt-24">
        <p className="label">[{t.label}]</p>
        <h1 className="mt-4 max-w-4xl font-display text-h1 font-extrabold uppercase">{t.title}</h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">{t.text}</p>
      </section>

      {/* Números do estúdio */}
      <section className="mx-auto max-w-7xl px-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {t.stats.map((s) => (
            <div
              key={s.label}
              className="rounded-3xl border border-line bg-surface px-6 py-10 shadow-card"
            >
              <p className="font-display text-5xl font-extrabold md:text-6xl">{s.value}</p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-muted">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:py-24">
        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          <Reveal>
            <div className="h-full rounded-3xl border border-line bg-surface p-8 shadow-card md:p-10">
              <h2 className="font-display text-h2 font-extrabold uppercase">{t.authority.title}</h2>
              <p className="mt-5 leading-relaxed text-muted">{t.authority.text}</p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="h-full rounded-3xl border border-line bg-surface p-8 shadow-card md:p-10">
              <h2 className="font-display text-h2 font-extrabold uppercase">{t.method.title}</h2>
              <p className="mt-5 leading-relaxed text-muted">{t.method.text}</p>
            </div>
          </Reveal>
        </div>

        <Link href="/portfolio" className="btn-brut mt-14">
          {dict.home.featured.all} →
        </Link>
      </section>
    </>
  );
}
