"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import LoopVideo from "@/components/deck/primitives/LoopVideo";
import { ReducedProvider, useReduced } from "@/components/deck/useReduced";
import { BrowserFrame, PhoneFrame } from "@/components/ui/DeviceFrames";
import type { ShowcaseItem } from "@/lib/decks/showcase";

type Props = {
  items: ShowcaseItem[];
  showMeta: boolean;
  t: { aria: string; tabs: string; view: string; desktop: string; mobile: string };
};

const pad = (n: number) => String(n).padStart(2, "0");

// Vitrine da home: um palco que alterna entre os sites, com a gravação real em
// navegador e celular. A troca é o fim da barra de progresso e não um timer: assim,
// pausar a barra pausa a troca junto. Pausa com mouse em cima, foco dentro da
// vitrine ou aba oculta. Com prefers-reduced-motion não há barra, logo não troca sozinha.
function ShowcaseStageInner({ items, showMeta, t }: Props) {
  const reduced = useReduced();
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [inView, setInView] = useState(true);
  const ref = useRef<HTMLElement>(null);
  const paused = hover || focus || hidden || !inView;

  // aba oculta não deve avançar sozinha
  useEffect(() => {
    const sync = () => setHidden(document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  // fora da tela a vitrine para: nada de trocar (e carregar vídeo) onde ninguém vê
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // pôsteres do próximo no cache: a troca não mostra um quadro vazio
  useEffect(() => {
    const upcoming = items[(active + 1) % items.length];
    new Image().src = upcoming.desktop.poster;
    new Image().src = upcoming.mobile.poster;
  }, [active, items]);

  const next = () => setActive((a) => (a + 1) % items.length);
  const item = items[active];

  return (
    <section
      ref={ref}
      aria-label={t.aria}
      className="hero-in mx-auto max-w-7xl px-5 pb-8 pt-8 md:pt-10"
      style={{ ["--i" as string]: 4 }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setHover(true);
      }}
      onPointerLeave={() => setHover(false)}
      // só foco de teclado pausa: o foco que vem do clique numa aba deixaria a vitrine parada para sempre
      onFocus={(e) => {
        if (e.target.matches(":focus-visible")) setFocus(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocus(false);
      }}
    >
      <div className="dotgrid rounded-3xl border border-line bg-paper p-4 shadow-card-lg sm:p-8 md:p-10">
        <div className="mx-auto flex max-w-5xl items-end gap-3 sm:gap-6 md:gap-8">
          <BrowserFrame url={item.name} className="min-w-0 flex-1">
            <div className="relative aspect-[16/10] bg-paper">
              <Swap id={item.slug}>
                <LoopVideo media={item.desktop} eager />
              </Swap>
            </div>
          </BrowserFrame>

          <PhoneFrame className="w-[24%] max-w-[210px] shrink-0">
            <div className="relative aspect-[520/1126] overflow-hidden rounded-[12px] sm:rounded-[15px]">
              <Swap id={item.slug}>
                <LoopVideo media={item.mobile} eager />
              </Swap>
            </div>
          </PhoneFrame>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">
            [{pad(item.index)}] <span aria-hidden="true">{item.flags.join(" ")}</span>
          </p>
          <p className="mt-2 font-display text-2xl font-extrabold uppercase md:text-3xl">{item.name}</p>
          {showMeta && (
            <p className="mt-1 text-sm text-muted">
              {item.sector} · {item.location}
            </p>
          )}
        </div>
        <Link href={`/apresentacoes/${item.slug}`} className="btn-brut">
          {t.view} →
        </Link>
      </div>

      <div
        role="group"
        aria-label={t.tabs}
        style={{ ["--n" as string]: items.length }}
        className="mt-6 -mx-5 flex gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-[repeat(var(--n),minmax(0,1fr))] md:overflow-visible md:px-0 md:pb-0"
      >
        {items.map((s, i) => (
          <button
            key={s.slug}
            type="button"
            aria-pressed={i === active}
            onClick={() => setActive(i)}
            className="group min-w-[8.5rem] shrink-0 text-left md:min-w-0"
          >
            <span className="relative block h-0.5 w-full overflow-hidden bg-ink/15">
              {i === active &&
                (reduced ? (
                  <span className="absolute inset-0 bg-ink" />
                ) : (
                  <span
                    key={active}
                    className="stage-progress absolute inset-0 bg-ink"
                    style={{ animationPlayState: paused ? "paused" : "running" }}
                    onAnimationEnd={next}
                  />
                ))}
            </span>
            <span
              className={`mt-3 block truncate font-mono text-[11px] uppercase tracking-widest transition-colors ${
                i === active ? "text-ink" : "text-ink/50 group-hover:text-ink"
              }`}
            >
              {pad(s.index)} {s.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

// Crossfade entre gravações: a antiga some enquanto a nova entra. Com
// reduced-motion a troca é instantânea.
function Swap({ id, children }: { id: string; children: ReactNode }) {
  const reduced = useReduced();
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={id}
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.5 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default function ShowcaseStage(props: Props) {
  return (
    <ReducedProvider>
      <ShowcaseStageInner {...props} />
    </ReducedProvider>
  );
}
