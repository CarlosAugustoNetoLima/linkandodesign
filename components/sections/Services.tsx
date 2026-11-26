import StartDiagnosisButton from "@/components/agent/StartDiagnosisButton";
import { getDictionary, type Locale } from "@/lib/i18n";

export default function Services({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).home.services;

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 md:py-24">
      <p className="label">[{t.label}]</p>
      <h2 className="mt-4 max-w-2xl font-display text-h2 font-extrabold uppercase">{t.title}</h2>

      <ul className="mt-10 border-t border-line">
        {t.items.map((item, i) => (
          <li
            key={item.n}
            className="grid gap-4 border-b border-line py-8 lg:grid-cols-[auto_minmax(0,4fr)_minmax(0,6fr)] lg:gap-10"
          >
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted lg:pt-2">{item.n}</span>

            <div>
              <h3 className="font-display text-2xl font-extrabold md:text-3xl">{item.title}</h3>
              <p className="mt-2 font-display font-medium text-muted">{item.tagline}</p>
            </div>

            <div>
              <p className="leading-relaxed text-muted">{item.text}</p>
              {t.ctas[i] && (
                <StartDiagnosisButton
                  message={t.ctas[i]}
                  className="link-brut mt-5 inline-flex min-h-[44px] items-center text-sm font-semibold text-ink"
                >
                  {t.ctas[i]} →
                </StartDiagnosisButton>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
