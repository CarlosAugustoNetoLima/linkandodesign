"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import LoopVideo from "@/components/deck/primitives/LoopVideo";
import { ReducedProvider, useReduced } from "@/components/deck/useReduced";
import type { ShowcaseItem } from "@/lib/decks/showcase";

type Props = {
  items: ShowcaseItem[];
  t: { label: string; title: string; text: string; all: string; open: string; note: string };
  showMeta: boolean; // false no EN: setor/local/tagline só existem em português
};

const pad = (n: number) => String(n).padStart(2, "0");

// Índice da home: lista editorial dos sites. O projeto da vez é o da linha que cruza
// 45% da altura da tela, então rolar a página percorre os sites um a um. O mouse
// também escolhe (após 120 ms), assim como o foco do teclado. No desktop o painel
// ao lado toca o vídeo do projeto da vez; abaixo de 1024 px quem toca é a miniatura
// da própria linha.
function ProjectIndexInner({ items, t, showMeta }: Props) {
  const reduced = useReduced();
  const [active, setActive] = useState(0);
  // null até hidratar: o servidor não sabe se há painel lateral
  const [wide, setWide] = useState<boolean | null>(null);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>();
  const scrollTimer = useRef<ReturnType<typeof setTimeout>>();
  const lastScroll = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // A troca por rolagem espera 140 ms de assentamento: uma rolagem rápida não deve
  // carregar um vídeo por linha que passou.
  useEffect(() => {
    const onScroll = () => {
      lastScroll.current = performance.now();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).pop();
        if (!hit) return;
        const i = Number((hit.target as HTMLElement).dataset.i);
        clearTimeout(scrollTimer.current);
        scrollTimer.current = setTimeout(() => setActive(i), 140);
      },
      { rootMargin: "-45% 0px -55% 0px" },
    );
    rows.current.forEach((el) => el && io.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
      clearTimeout(scrollTimer.current);
      clearTimeout(hoverTimer.current);
    };
  }, []);

  const cur = items[active] ?? items[0];

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 md:py-24">
      <div>
        <p className="label">[{t.label}]</p>
        <h2 className="mt-4 max-w-xl font-display text-h2 font-extrabold uppercase">{t.title}</h2>
        <p className="mt-4 max-w-xl text-muted">{t.text}</p>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <ul className="border-t border-line">
            {items.map((item, i) => (
              <li
                key={item.slug}
                ref={(el) => {
                  rows.current[i] = el;
                }}
                data-i={i}
              >
                <Link
                  href={`/apresentacoes/${item.slug}`}
                  data-active={i === active}
                  className="group/row grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_auto] items-start gap-x-4 lg:items-center border-b border-line py-5 md:gap-x-6 md:py-7 lg:py-8"
                  onPointerEnter={(e) => {
                    if (e.pointerType !== "mouse") return;
                    clearTimeout(hoverTimer.current);
                    hoverTimer.current = setTimeout(() => {
                      // rolar leva a linha para baixo do cursor parado e o navegador
                      // dispara "enter": isso não é uma escolha do mouse
                      if (performance.now() - lastScroll.current < 450) return;
                      clearTimeout(scrollTimer.current);
                      setActive(i);
                    }, 120);
                  }}
                  onPointerLeave={() => clearTimeout(hoverTimer.current)}
                  onFocus={() => {
                    clearTimeout(hoverTimer.current);
                    clearTimeout(scrollTimer.current);
                    setActive(i);
                  }}
                >
                  {/* mono pequeno: o número vazado a este tamanho fecha e vira cheio */}
                  <span className="font-mono text-xs font-semibold tracking-widest text-ink/50 transition-colors duration-300 lg:group-data-[active=true]/row:text-ink">
                    {pad(item.index)}
                  </span>

                  {/* wrapper em coluna: o img vira bloco e não deixa espaço de linha abaixo */}
                  <span className="flex min-w-0 flex-col">
                    <span className="sr-only">{t.open}: </span>
                    {/* no desktop só o projeto da vez fica em tinta cheia e avança; os demais em tom suave */}
                    <span className="block font-display text-3xl font-extrabold uppercase leading-none tracking-tight transition-[transform,color] duration-300 motion-reduce:transform-none md:text-5xl lg:text-ink/55 lg:group-data-[active=true]/row:translate-x-2 lg:group-data-[active=true]/row:text-ink">
                      {item.name}
                    </span>
                    {showMeta && (
                      <span className="mt-2 block text-sm text-muted">
                        {item.sector} · {item.location}
                      </span>
                    )}
                    {/* no mobile a 3ª coluna some: bandeira e ano vêm para cá */}
                    <span className="mt-2 flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest md:hidden">
                      <span aria-hidden="true">{item.flags.join(" ")}</span>
                      <span className="opacity-60">{item.year}</span>
                    </span>
                    {/* miniatura só no mobile e tablet; no desktop o painel mostra o vídeo.
                        A linha da vez troca o pôster pelo vídeo (um por vez, para poupar dados). */}
                    <span className="relative mt-3 block aspect-[16/10] w-full max-w-xs overflow-hidden rounded-xl border border-line lg:hidden">
                      {wide === false && i === active ? (
                        <LoopVideo media={item.desktop} eager />
                      ) : (
                        <img
                          src={item.desktop.poster}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </span>
                  </span>

                  <span className="hidden md:flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest">
                    <span aria-hidden="true">{item.flags.join(" ")}</span>
                    <span className="opacity-60">{item.year}</span>
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover/row:translate-x-1 lg:group-data-[active=true]/row:translate-x-1"
                    >
                      →
                    </span>
                  </span>
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
        </div>

        <aside aria-hidden="true" className="hidden lg:block">
          <div className="sticky top-28">
            <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card-lg">
              <div className="relative aspect-[16/10] bg-paper">
                {/* crossfade: o vídeo anterior some enquanto o novo entra */}
                <AnimatePresence initial={false}>
                  <motion.div
                    key={cur.slug}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.4 }}
                  >
                    <LoopVideo media={cur.desktop} eager />
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="p-5">
                <p className="label">
                  [{pad(cur.index)} / {pad(items.length)}]
                </p>
                <p className="mt-2 font-display text-xl font-extrabold uppercase">{cur.name}</p>
                {showMeta && <p className="mt-2 text-sm text-muted">{cur.tagline}</p>}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {t.note ? (
        <p className="mt-8 font-mono text-[11px] uppercase tracking-widest text-muted">{t.note}</p>
      ) : null}
    </section>
  );
}

export default function ProjectIndex(props: Props) {
  return (
    <ReducedProvider>
      <ProjectIndexInner {...props} />
    </ReducedProvider>
  );
}
