import Link from "next/link";
import OpenChatLink from "@/components/agent/OpenChatLink";
import ShowcaseStage from "@/components/sections/ShowcaseStage";
import { getShowcase } from "@/lib/decks/showcase";
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

// Hero da home. Título e CTAs são HTML do servidor; só a vitrine é cliente.
// Os dados da vitrine são montados aqui para não levar os capítulos dos decks
// para o bundle. Setor e local só existem em português, por isso o `showMeta`.
export default function HomeHero({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).home.hero;

  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pt-10 md:pt-14">
        <p className="label hero-in" style={{ ["--i" as string]: 0 }}>[{t.eyebrow}]</p>
        <h1
          className="hero-in mt-5 max-w-6xl font-display text-[clamp(2rem,5vw,4.5rem)] leading-[1.06] tracking-[-0.03em] font-extrabold uppercase"
          style={{ ["--i" as string]: 1 }}
        >
          {/* sem caixa de fundo: a frase de impacto é a única em tinta cheia, a de abertura em tom suave */}
          <span className="text-muted">{t.title1}</span>
          <br />
          {t.title2}
        </h1>

        <div className="mt-7 flex flex-wrap items-end justify-between gap-6">
          <div className="hero-in" style={{ ["--i" as string]: 2 }}>
            <p className="max-w-xl text-base leading-relaxed text-muted md:text-lg">{t.text}</p>
            <ul className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
              {countries[locale].map((c) => (
                <li
                  key={c.name}
                  className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ink/60"
                >
                  <span aria-hidden="true">{c.flag}</span>
                  {c.name}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="hero-in grid w-full grid-cols-1 gap-3 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-4"
            style={{ ["--i" as string]: 3 }}
          >
            <OpenChatLink className="btn-brut text-center">
              {t.cta} →
            </OpenChatLink>
            <Link href="/apresentacoes" className="btn-brut-ghost text-center">
              {t.secondary} →
            </Link>
          </div>
        </div>
      </section>

      <ShowcaseStage items={getShowcase()} showMeta={locale === "pt"} t={t.stage} />
    </>
  );
}
