import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import { getDictionary, type Locale } from "@/lib/i18n";
import { getShowcase, serviceProofs } from "@/lib/decks/showcase";

// Serviços em bento: cada dor vem com os dois sites que a provam.
// O item 0 ocupa o bloco grande à esquerda; 1 e 2 empilham à direita.
export default function Services({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).home.services;
  const showcase = getShowcase();

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 md:py-24">
      <p className="label">[{t.label}]</p>
      <h2 className="mt-4 max-w-2xl font-display text-h2 font-extrabold uppercase">{t.title}</h2>

      <div className="mt-12 grid gap-4 md:grid-cols-6 md:gap-5">
        {t.items.map((item, i) => {
          const wide = i === 0;
          const span = wide ? "md:col-span-6" : "md:col-span-3";
          // slug que não existe em `showcase` some sem quebrar a seção
          const proofs = (serviceProofs[i] ?? []).flatMap((slug) =>
            showcase.filter((s) => s.slug === slug),
          );

          return (
            <Reveal key={item.n} delay={i * 0.06} className={`h-full ${span}`}>
              <div
                className={`group flex h-full flex-col rounded-3xl border border-line bg-surface p-8 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-lg motion-reduce:transform-none ${
                  wide ? "md:flex-row md:items-center md:gap-14 md:p-10" : ""
                }`}
              >
                <div className={wide ? "md:w-[40%] md:shrink-0" : ""}>
                  <p className="num-hollow font-display text-6xl font-extrabold transition-colors group-hover:text-ink md:text-7xl">
                    {item.n}
                  </p>
                  <h3
                    className={`mt-8 font-display text-xl font-extrabold md:text-2xl ${
                      wide ? "md:text-3xl" : ""
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p className={`mt-4 leading-relaxed text-muted ${wide ? "text-sm md:text-base" : "text-sm"}`}>
                    {item.text}
                  </p>
                </div>

                <div className={wide ? "mt-8 md:mt-0 md:flex-1" : "mt-auto pt-8"}>
                  <p className="label opacity-60">[{t.proof}]</p>
                  <ul className="mt-3 grid grid-cols-2 gap-3">
                    {proofs.map((p) => (
                      <li key={p.slug}>
                        <Link href={`/apresentacoes/${p.slug}`} className="group/proof block">
                          <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-paper">
                            <img
                              src={p.desktop.poster}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover/proof:scale-[1.03] motion-reduce:transform-none"
                            />
                          </div>
                          <span className="mt-2 block font-mono text-[10px] uppercase tracking-widest">
                            {p.name} →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
