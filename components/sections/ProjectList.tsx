import Link from "next/link";
import LoopVideo from "@/components/deck/primitives/LoopVideo";
import { ReducedProvider } from "@/components/deck/useReduced";
import type { ShowcaseItem } from "@/lib/decks/showcase";
import type { Dictionary } from "@/lib/i18n";

type Props = {
  items: ShowcaseItem[];
  t: Dictionary["home"]["index"];
  showMeta: boolean; // false no EN: setor/local/tagline só existem em português
};

const pad = (n: number) => String(n).padStart(2, "0");

// Lista da home com tudo aberto: cada projeto mostra texto e vídeo ao mesmo tempo.
// O vídeo só é pedido perto da tela e toca só enquanto está visível (LoopVideo).
// O ReducedProvider faz o LoopVideo respeitar prefers-reduced-motion.
export default function ProjectList({ items, t, showMeta }: Props) {
  return (
    <ReducedProvider>
      <section id="projetos" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-14 md:py-20">
        <div className="lg:flex lg:items-end lg:justify-between lg:gap-12">
          <div>
            <p className="label">[{t.label}]</p>
            <h2 className="mt-4 max-w-xl font-display text-h2 font-extrabold uppercase">{t.title}</h2>
          </div>
          {/* ao lado do título no desktop, em duas linhas */}
          <p className="mt-4 max-w-xl text-muted lg:mt-0 lg:max-w-[34rem] lg:pb-2">{t.text}</p>
        </div>

        <ul className="mt-10 border-t border-line">
          {items.map((item) => (
            <li
              key={item.slug}
              className="border-b border-line py-8 md:py-12 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-12"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest">
                  <span>{pad(item.index)}</span>
                  <span aria-hidden="true">{item.flags.join(" ")}</span>
                  <span className="opacity-60">{item.year}</span>
                </p>

                <h3 className="mt-4 font-display text-3xl font-extrabold uppercase leading-none tracking-tight md:text-5xl">
                  <Link href={`/apresentacoes/${item.slug}`}>{item.name}</Link>
                </h3>

                {showMeta && (
                  <>
                    <p className="mt-4 text-sm text-muted">
                      {item.sector} · {item.location}
                    </p>
                    <p className="mt-2 max-w-md text-base text-muted">{item.tagline}</p>
                  </>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
                  <Link href={`/apresentacoes/${item.slug}`} className="btn-brut">
                    {t.view} →
                  </Link>
                  {item.liveUrl && (
                    <a
                      href={item.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center text-sm font-semibold text-ink underline underline-offset-4 hover:text-ink/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    >
                      {t.live} ↗
                    </a>
                  )}
                </div>
              </div>

              <Link href={`/apresentacoes/${item.slug}`} aria-label={`${t.open}: ${item.name}`} className="mt-6 block lg:mt-0">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
                  <LoopVideo media={item.desktop} />
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/apresentacoes"
          className="group/all flex items-center justify-between gap-4 border-b border-line py-6 font-display text-xl font-extrabold uppercase md:text-2xl"
        >
          {t.all}
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover/all:translate-x-2 motion-reduce:transform-none"
          >
            →
          </span>
        </Link>

        {t.note ? (
          <p className="mt-8 font-mono text-[11px] uppercase tracking-widest text-muted">{t.note}</p>
        ) : null}
      </section>
    </ReducedProvider>
  );
}
