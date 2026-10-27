import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/i18n";

// Banner de abertura: bloco charcoal arredondado com a MESMA margem no topo,
// laterais e fundo, e altura contida (não ocupa o viewport inteiro). O fundo é
// charcoal liso.
// A faixa inferior lista os países onde já entregamos.
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

export default function HeroBanner({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).home.hero;

  // sem padding no TOPO: o banner encosta no header. Laterais e fundo mantêm a
  // margem mínima do resto dos blocos escuros.
  return (
    <section className="px-2 pb-2 sm:px-3 sm:pb-3">
      <div className="relative overflow-hidden rounded-2xl bg-charcoal text-white shadow-dark md:rounded-3xl">
        {/* ——— conteúdo ——— */}
        <div className="relative flex min-h-[440px] flex-col justify-between gap-10 p-6 sm:p-10 md:min-h-[540px] md:p-12 lg:p-14">
          <div className="max-w-xl pt-2 lg:max-w-2xl">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-lime">
              [{t.eyebrow}]
            </p>
            <h1 className="mt-5 font-display text-h1 font-extrabold uppercase">
              {t.title1}{" "}
              <span className="text-lime">{t.title2}</span>
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/70 md:text-base">
              {t.text}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/portfolio" className="btn-brut btn-brut--dark">
                {t.secondary} →
              </Link>
              <Link
                href="/briefing"
                className="glass-dark rounded-lg px-6 py-3.5 font-semibold text-white transition-colors hover:bg-white/20"
              >
                {t.cta} →
              </Link>
            </div>
          </div>

          {/* prova imediata: os países onde já entregamos */}
          <ul className="flex flex-wrap items-center gap-x-7 gap-y-2">
            {countries[locale].map((c) => (
              <li
                key={c.name}
                className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-white/70"
              >
                <span aria-hidden="true">{c.flag}</span>
                {c.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
