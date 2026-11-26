import Link from "next/link";
import DiagnosisStarter from "@/components/agent/DiagnosisStarter";
import LivingDots from "@/components/agent/LivingDots";
import { getDictionary, type Locale } from "@/lib/i18n";

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

export default function HomeHero({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).home.hero;
  const titleSize =
    locale === "pt" ? "lg:text-[clamp(2.25rem,6.1vw,88px)]" : "lg:text-[clamp(2.25rem,5.4vw,84px)]";

  return (
    <>
      <section className="px-4 sm:px-6 pt-0 pb-6 md:pb-8">
        
        <div className="relative overflow-hidden rounded-[24px] bg-charcoal px-6 py-6 text-white sm:px-8 md:px-12 md:py-8 lg:px-12 lg:py-9">
          <LivingDots contained className="rounded-[24px]" />
          <div className="relative z-10">
            
            <h1
              className={`hero-in font-display text-balance text-[clamp(2.75rem,12vw,3.5rem)] lg:whitespace-nowrap ${titleSize} leading-[1.06] tracking-[-0.03em] font-extrabold uppercase`}
              style={{ ["--i" as string]: 1 }}
            >
              
              <span className="text-white/55">{t.title1}</span>{" "}
              {t.title2}
            </h1>

            
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start lg:gap-10 xl:grid-cols-2">
              <div className="hero-in min-w-0" style={{ ["--i" as string]: 2 }}>
                <p className="hidden max-w-[600px] text-base leading-relaxed text-white/70 md:block md:text-lg">{t.text}</p>
                
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
                  <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-5">
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

                  <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
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
                </div>

                <Link
                  href="#projetos"
                  className="mt-6 hidden min-h-[44px] items-center text-sm font-semibold text-white underline underline-offset-4 hover:text-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime lg:inline-flex"
                >
                  {t.secondary} →
                </Link>
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
          </div>
        </div>
      </section>
    </>
  );
}
