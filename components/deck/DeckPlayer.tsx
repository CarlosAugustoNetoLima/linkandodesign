"use client";

import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cx } from "@/components/deck/cx";
import Anatomy from "@/components/deck/chapters/Anatomy";
import Cover from "@/components/deck/chapters/Cover";
import Compare from "@/components/deck/chapters/Compare";
import Cta from "@/components/deck/chapters/Cta";
import Feature from "@/components/deck/chapters/Feature";
import Identity from "@/components/deck/chapters/Identity";
import Motion from "@/components/deck/chapters/Motion";
import Details from "@/components/deck/chapters/Details";
import Phones from "@/components/deck/chapters/Phones";
import Process from "@/components/deck/chapters/Process";
import Responsive from "@/components/deck/chapters/Responsive";
import Sequence from "@/components/deck/chapters/Sequence";
import Statement from "@/components/deck/chapters/Statement";
import Topics from "@/components/deck/chapters/Topics";
import { ReducedProvider, useReduced } from "@/components/deck/useReduced";
import { deckFontFamily, deckFonts } from "@/lib/decks/fonts";
import { STAGE } from "@/lib/decks/stage";
import type { Chapter, Deck } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const pad = (n: number) => String(n).padStart(2, "0");

// Leva o capítulo ao topo. Com reduced motion o salto é imediato.
function scrollToChapter(id: string, reduced: boolean | null) {
  document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

// Seções lado a lado (efeitos e computador + celular) alternam a mídia: direita, esquerda, direita…
// O `side` do dado é ignorado para duas seções seguidas nunca ficarem na mesma posição.
function withAlternatingSides(chapters: Chapter[]): Chapter[] {
  let n = 0;
  return chapters.map((c) => {
    if (c.type === "feature" && c.layout !== "full") return { ...c, side: n++ % 2 === 0 ? "right" : "left" };
    if (c.type === "responsive") return { ...c, side: n++ % 2 === 0 ? "right" : "left" };
    return c;
  });
}

function renderChapter(c: Chapter, deck: Deck, next?: { slug: string; name: string }) {
  switch (c.type) {
    case "cover":
      return <Cover key={c.id} chapter={c} deck={deck} />;
    case "statement":
      return <Statement key={c.id} chapter={c} deck={deck} />;
    case "identity":
      return <Identity key={c.id} chapter={c} deck={deck} />;
    case "sequence":
      return <Sequence key={c.id} chapter={c} deck={deck} />;
    case "anatomy":
      return <Anatomy key={c.id} chapter={c} deck={deck} />;
    case "feature":
      return <Feature key={c.id} chapter={c} deck={deck} />;
    case "motion":
      return <Motion key={c.id} chapter={c} deck={deck} />;
    case "process":
      return <Process key={c.id} chapter={c} deck={deck} />;
    case "details":
      return <Details key={c.id} chapter={c} deck={deck} />;
    case "topics":
      return <Topics key={c.id} chapter={c} deck={deck} />;
    case "responsive":
      return <Responsive key={c.id} chapter={c} deck={deck} />;
    case "compare":
      return <Compare key={c.id} chapter={c} deck={deck} />;
    case "phones":
      return <Phones key={c.id} chapter={c} deck={deck} />;
    case "cta":
      return <Cta key={c.id} chapter={c} deck={deck} next={next} />;
  }
}

type Props = {
  deck: Deck;
  next?: { slug: string; name: string };
};

// Motor do deck. O palco é o papel da Linkando, igual em todos os sites; o site
// apresentado entra pelo acento, pela fonte e pelo raio (variáveis --d-*). A moldura
// (barra, rail, progresso) também é da marca. Os capítulos entram pelo tipo.
function DeckPlayerInner({ deck, next }: Props) {
  const reduced = useReduced();
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(deck.chapters[0]?.id ?? "");
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  const t = deck.theme;
  const vars = {
    "--d-bg": STAGE.bg,
    "--d-bg-alt": STAGE.bgAlt,
    "--d-fg": STAGE.fg,
    "--d-fg-muted": STAGE.fgMuted,
    "--d-accent": t.accent,
    "--d-accent-ink": t.accentInk,
    "--d-line": STAGE.line,
    "--d-font": deckFontFamily[t.fontKey],
    "--d-font-display": deckFontFamily[t.displayFontKey ?? t.fontKey],
    "--d-display-weight": String(t.displayWeight),
    "--d-display-tracking": t.displayTracking,
    "--d-display-stretch": `${t.displayStretch ?? 100}%`,
    "--d-cover-weight": String(t.coverWeight ?? 200),
    "--d-radius": t.radius,
    "--deck-bar-h": "56px",
  } as CSSProperties;

  // Capítulo ativo = o que cruza o meio da tela.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    root.querySelectorAll<HTMLElement>("section[data-chapter]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Teclado: setas, PageUp/Down, Home/End. Não trata Space e ignora campos de texto.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target instanceof HTMLElement ? e.target : null;
      if (el?.closest("input, textarea, select, [contenteditable]")) return;

      const chapters = deck.chapters;
      const cur = Math.max(0, chapters.findIndex((c) => c.id === activeId));
      let to: number;
      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
        case "ArrowRight":
          to = Math.min(cur + 1, chapters.length - 1);
          break;
        case "ArrowUp":
        case "PageUp":
        case "ArrowLeft":
          to = Math.max(cur - 1, 0);
          break;
        case "Home":
          to = 0;
          break;
        case "End":
          to = chapters.length - 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      scrollToChapter(chapters[to].id, reduced);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId, deck.chapters, reduced]);

  return (
    <div ref={rootRef} className={cx("deck", deckFonts[t.fontKey].variable, deckFonts[t.displayFontKey ?? t.fontKey].variable)} style={vars}>
      {/* progresso de leitura, no topo. Some com reduced motion, como o ScrollProgress do site */}
      {!reduced && (
        <motion.div
          aria-hidden="true"
          className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-ink"
          style={{ scaleX: progress }}
        />
      )}

      {/* barra superior: moldura Linkando */}
      <motion.header
        className="fixed inset-x-0 top-0 z-50 flex h-[var(--deck-bar-h)] items-center gap-4 px-5 font-sans text-ink backdrop-blur-md"
        style={{ background: "color-mix(in srgb, var(--d-bg) 78%, transparent)", borderBottom: "1px solid var(--d-line)" }}
        initial={reduced ? false : { y: -56 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <div className="flex flex-1 justify-start">
          <Link href="/apresentacoes" className="text-[12px] uppercase tracking-[0.14em] opacity-70 transition-opacity hover:opacity-100">
            ← Portfólio
          </Link>
        </div>
        <p className="hidden flex-1 text-center text-[12px] opacity-60 md:block">
          {deck.name} · {deck.year}
        </p>
        <div className="flex flex-1 justify-end">
          <a
            href={deck.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap rounded-[8px] bg-ink px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-lime transition-[transform,background-color] hover:bg-[#2a2a2e] motion-safe:hover:-translate-y-px sm:px-4 sm:text-[12px] sm:tracking-[0.08em]"
          >
            Ver projeto real ↗
          </a>
        </div>
      </motion.header>

      {/* rail de capítulos: só em telas grandes */}
      <nav
        aria-label="Capítulos"
        className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3.5 lg:flex"
      >
        {deck.chapters.map((c, i) => {
          const active = c.id === activeId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => scrollToChapter(c.id, reduced)}
              aria-current={active ? "true" : undefined}
              className="group relative flex h-5 items-center"
            >
              {/* o rótulo fica fora do fluxo: a área clicável do botão é só o traço, e não cobre os controles dos capítulos */}
              <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-[6px] bg-[rgba(39,39,43,0.9)] px-2 py-1 font-sans text-[11px] uppercase tracking-[0.16em] text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                {pad(i + 1)} · {c.label}
              </span>
              <span
                aria-hidden="true"
                className={cx(
                  "block h-px transition-[width,background-color] duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                  active ? "w-[30px] bg-ink" : "w-3.5 bg-ink/45",
                )}
              />
            </button>
          );
        })}
      </nav>

      {withAlternatingSides(deck.chapters).map((c) => renderChapter(c, deck, next))}
    </div>
  );
}

export default function DeckPlayer(props: Props) {
  return (
    <ReducedProvider>
      <DeckPlayerInner {...props} />
    </ReducedProvider>
  );
}
