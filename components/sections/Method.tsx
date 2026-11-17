import Reveal from "@/components/motion/Reveal";
import { getDictionary, type Locale } from "@/lib/i18n";

// Metodologia em linha do tempo horizontal: um passo por coluna, com número
// vazado e régua no topo que escurece no hover.
export default function Method({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).home.method;

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 md:py-24">
      <p className="label">[{t.label}]</p>
      <h2 className="mt-4 max-w-2xl font-display text-h2 font-extrabold uppercase">{t.title}</h2>
      <p className="mt-5 max-w-2xl leading-relaxed text-muted">{t.text}</p>

      <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {t.steps.map((s, i) => (
          <li key={s.n}>
            <Reveal delay={i * 0.08}>
              <div className="group border-t-2 border-ink/15 pt-6 transition-colors duration-300 hover:border-ink">
                <span className="num-hollow font-display text-5xl font-extrabold transition-colors group-hover:text-ink">
                  {s.n}
                </span>
                <h3 className="mt-6 font-display text-lg font-extrabold uppercase">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{s.text}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
