import OpenChatLink from "@/components/agent/OpenChatLink";
import { getDictionary, type Locale } from "@/lib/i18n";
import { decks } from "@/lib/decks";

// Chamada escura com diferencial em texto grande e três números à direita.
// O total de sites vem do registro de decks, então acompanha o portfólio.
export default function StudioBand({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const b = dict.home.band;
  const s = dict.about.stats;
  const numbers = [s[0], { value: String(decks.length), label: b.sites }, s[1]];

  return (
    <section className="px-2 py-8 sm:px-3 md:py-12">
      <div className="rounded-2xl bg-charcoal p-8 text-white shadow-dark sm:p-12 md:rounded-3xl md:p-16">
        <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">[{b.label}]</p>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <div>
            <h2 className="max-w-3xl font-display text-h1 font-extrabold uppercase">{b.title}</h2>
            <p className="mt-6 max-w-2xl leading-relaxed text-white/60">{b.text}</p>
            <OpenChatLink className="btn-brut btn-brut--dark mt-10">
              {b.cta}
            </OpenChatLink>
          </div>

          {/* dt antes de dd na ordem do DOM (exigido pelo HTML); flex-col-reverse põe o número em cima */}
          <dl>
            {numbers.map((n) => (
              <div
                key={n.label}
                className="flex flex-col-reverse border-t border-white/15 py-6 first:border-t-0 first:pt-0"
              >
                <dt className="mt-2 text-sm text-white/60">{n.label}</dt>
                <dd className="font-display text-5xl font-extrabold text-lime md:text-6xl">
                  {n.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
