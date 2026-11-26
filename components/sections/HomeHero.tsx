import Link from "next/link";
import DiagnosisStarter from "@/components/agent/DiagnosisStarter";
import { getDictionary, type Locale } from "@/lib/i18n";

// Países onde já entregamos: a prova imediata logo abaixo do texto.
const countries: Record<Locale, { flag: string; name: string }[]> = {
  pt: [
    { flag: "🇵🇹", name: "Portugal" },
    { flag: "🇫🇷", name: "França" },
    { flag: "🇨🇻", name: "Cabo Verde" },
    { flag: "🇺🇸", name: "EUA" },
    { flag: "🇧🇷", name: "Brasil" },
  ],
  en: [
    { flag: "🇵🇹", name: "Portugal" },
    { flag: "🇫🇷", name: "France" },
    { flag: "🇨🇻", name: "Cape Verde" },
    { flag: "🇺🇸", name: "USA" },
    { flag: "🇧🇷", name: "Brazil" },
  ],
};

// Hero da home: título, texto, diagnóstico e atalho para a lista de projetos (#projetos).
export default function HomeHero({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).home.hero;

  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pt-6 md:pt-8">
        {/* painel escuro na cor do botão "Solicitar diagnóstico" (tinta), cantos de 24px */}
        <div className="grid grid-cols-1 gap-6 rounded-[24px] bg-ink px-5 py-8 text-white sm:px-8 md:px-12 md:py-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:px-16 lg:py-16">
          <div className="min-w-0">
            <h1
              className="hero-in font-display text-[clamp(2rem,7vw,3rem)] lg:text-[clamp(2.25rem,4.6vw,4.5rem)] leading-[1.06] tracking-[-0.03em] font-extrabold uppercase"
              style={{ ["--i" as string]: 1 }}
            >
              {/* sem caixa de fundo: a frase de impacto é a única em tinta cheia, a de abertura em tom suave */}
              <span className="text-white/55">{t.title1}</span>
              <br />
              {t.title2}
            </h1>

            <div className="hero-in" style={{ ["--i" as string]: 2 }}>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">{t.text}</p>
              <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-2 sm:gap-x-5">
                {t.facts.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 whitespace-nowrap text-[13px] font-semibold sm:gap-2 sm:text-sm md:text-base text-white">
                    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
                      <circle cx="8" cy="8" r="8" fill="#EEFB6E" />
                      <path d="M4.6 8.2l2.2 2.2 4.6-4.8" fill="none" stroke="#17171A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <ul className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                {countries[locale].map((c) => (
                  <li
                    key={c.name}
                    className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-white/60"
                  >
                    <span aria-hidden="true">{c.flag}</span>
                    {c.name}
                  </li>
                ))}
              </ul>

              <Link
                href="#projetos"
                className="mt-1 hidden min-h-[44px] items-center text-sm font-semibold text-white underline underline-offset-4 hover:text-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime lg:inline-flex"
              >
                {t.secondary} →
              </Link>
            </div>
          </div>

          <div className="hero-in min-w-0" style={{ ["--i" as string]: 3 }}>
            <DiagnosisStarter
              placeholder={t.starter.placeholder}
              sendLabel={t.starter.send}
              note={t.starter.note}
              quickAria={t.starter.quickAria}
              quick={getDictionary(locale).chat.quick}
              tone="dark"
            />
            <Link
              href="#projetos"
              className="inline-flex min-h-[44px] items-center text-sm font-semibold text-white underline underline-offset-4 hover:text-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime lg:hidden"
            >
              {t.secondary} →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
