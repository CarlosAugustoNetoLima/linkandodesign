import Link from "next/link";
import HeroBanner from "@/components/sections/HeroBanner";
import Clients from "@/components/sections/Clients";
import FeaturedWork from "@/components/sections/FeaturedWork";
import Faq from "@/components/sections/Faq";
import Reveal from "@/components/motion/Reveal";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default function Home() {
  const locale = getLocale();
  const dict = getDictionary(locale);
  const t = dict.home;

  return (
    <>
      <HeroBanner locale={locale} />

      <Clients locale={locale} />

      <FeaturedWork locale={locale} limit={3} />

      {/* Serviços — onde dói: cards suaves com números vazados */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:py-24">
        <p className="label">[{t.services.label}]</p>
        <h2 className="mt-4 max-w-2xl font-display text-h2 font-extrabold uppercase">
          {t.services.title}
        </h2>

        <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
          {t.services.items.map((item, i) => (
            <Reveal key={item.n} delay={i * 0.06}>
              <div className="group h-full rounded-3xl border border-line bg-surface p-8 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-lg motion-reduce:transform-none">
                <p className="num-hollow font-display text-6xl font-extrabold transition-colors group-hover:text-ink md:text-7xl">
                  {item.n}
                </p>
                <h3 className="mt-8 font-display text-xl font-extrabold">{item.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Diferencial — bloco de tipografia pura */}
      <section className="mx-auto max-w-7xl px-5 py-8 md:py-14">
        <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:gap-16">
          <div>
            <p className="label">[{t.diff.label}]</p>
            <h2 className="mt-4 font-display text-h2 font-extrabold uppercase">{t.diff.title}</h2>
          </div>
          <Reveal>
            <p className="max-w-2xl text-lg leading-relaxed md:text-2xl md:leading-snug">
              {t.diff.text}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Chamada intermediária — bloco escuro arredondado, com margem */}
      <section className="px-2 py-12 sm:px-3 md:py-16">
        <div className="rounded-2xl bg-charcoal p-8 text-white shadow-dark sm:p-12 md:rounded-3xl md:p-16">
          <h2 className="max-w-3xl font-display text-h1 font-extrabold uppercase">
            {t.midCta.title}
          </h2>
          <p className="mt-6 max-w-2xl leading-relaxed text-white/60">{t.midCta.text}</p>
          <Link href="/#contato" className="btn-brut btn-brut--dark mt-10">
            {t.midCta.cta}
          </Link>
        </div>
      </section>

      {/* Metodologia — cronograma em linhas suaves */}
      <section className="mx-auto max-w-7xl px-5 py-12 md:py-20">
        <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:gap-16">
          <div>
            <p className="label">[{t.method.label}]</p>
            <h2 className="mt-4 font-display text-h2 font-extrabold uppercase">{t.method.title}</h2>
          </div>
          <div>
            <p className="max-w-2xl leading-relaxed text-muted">{t.method.text}</p>

            <ol className="mt-10">
              {t.method.steps.map((s, i) => (
                <li key={s.n}>
                  <Reveal delay={i * 0.05}>
                    <div className="-mx-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 rounded-2xl border-b border-line px-4 py-6 transition-colors hover:bg-ink/5 sm:grid-cols-[64px_180px_1fr]">
                      <span className="num-hollow font-display text-3xl font-extrabold">{s.n}</span>
                      <h3 className="self-center font-display text-lg font-extrabold uppercase">
                        {s.title}
                      </h3>
                      <p className="col-start-2 self-center text-sm leading-relaxed text-muted sm:col-start-3">
                        {s.text}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <Faq locale={locale} />
    </>
  );
}
