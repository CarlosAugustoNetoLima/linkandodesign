"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { type CSSProperties, type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { chapterNumber } from "@/components/deck/chapterIndex";
import { cx } from "@/components/deck/cx";
import Chapter from "@/components/deck/primitives/Chapter";
import DeviceFrame from "@/components/deck/primitives/DeviceFrame";
import Eyebrow from "@/components/deck/primitives/Eyebrow";
import LoopVideo from "@/components/deck/primitives/LoopVideo";
import WordReveal from "@/components/deck/primitives/WordReveal";
import { useReduced } from "@/components/deck/useReduced";
import type { CompareChapter, Deck } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Cada coluna sobe e aparece; a segunda entra com um pequeno atraso (o `custom` é o índice).
const COLUMN: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE, delay: i * 0.15 },
  }),
};

// Abaixo de lg (<1024): as versões empilhadas, cada uma com a sua moldura e o seu link.
// A moldura ocupa a coluna inteira (nunca passa de 100%).
const FRAME_MAX_STACK = "min(100%, max(220px, calc((100svh - 565px) * 1.42)))";

// lg+: uma moldura só, a maior que deixa o capítulo inteiro na tela. A conta: altura da janela
// menos a barra do deck, o padding de cima e de baixo do capítulo, o bloco do título e do body
// (medido no cliente com ResizeObserver; sem medida, vale o valor de reserva do SSR), a margem da
// grade (--sp-3) e a barra da moldura (34 px). A gravação é 1280×800 (×1,6).
const HEAD_FALLBACK_PX = 166;
const frameMaxDesk = (headPx: number) =>
  `min(100%, max(320px, calc((100svh - var(--deck-bar-h) - var(--sp-1) - 34px - var(--sp-3) - ${headPx}px) * 1.6)))`;

// lg+ com 2 versões lado a lado: a moldura ocupa a coluna e só o teto da altura a limita. A conta:
// a mesma, com a barra da moldura (34 px), a margem entre cabeçalho e grade (--sp-3) e
// ~110 px embaixo (linha de tag, nome e link de 44 px, mt-3 e o texto em até 2 linhas de 14 px).
const frameMaxSide = (headPx: number) =>
  `min(100%, max(320px, calc((100svh - var(--deck-bar-h) - var(--sp-1) - 34px - ${headPx}px - var(--sp-3) - 52px) * 1.6)))`;

// Comparação. Com 2 versões: abaixo de lg, empilhadas; a partir de lg, lado a lado (cada coluna
// com a sua moldura, a tag, o nome, o texto e o link). Com 3 ou mais: abaixo de lg, empilhadas;
// a partir de lg, abas verticais à esquerda e uma moldura grande à direita (as inativas são
// compactas e só a ativa mostra o texto). Sem tour, sem "Ver detalhes" e sem hover na moldura.
// Com reduced motion, tudo aparece pronto.
export default function Compare({ chapter, deck }: { chapter: CompareChapter; deck: Deck }) {
  const reduced = useReduced();
  const host = deck.frameHost ?? new URL(deck.liveUrl).host;
  const variants = chapter.variants;
  const compact = variants.length > 2;
  const [activeIdx, setActiveIdx] = useState(0);
  const headRef = useRef<HTMLDivElement>(null);
  const [headPx, setHeadPx] = useState(HEAD_FALLBACK_PX);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const uid = useId();
  const panelId = `${uid}-panel`;
  const cur = variants[activeIdx];
  const frameVars = {
    "--frame-stack": FRAME_MAX_STACK,
    "--frame-side": frameMaxSide(headPx),
  } as CSSProperties;

  // altura real do bloco de cabeçalho (título de 1 ou 2 linhas): o teto da moldura acompanha
  useEffect(() => {
    const el = headRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeadPx(Math.ceil(el.getBoundingClientRect().height)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // a outra versão já fica com o poster carregado: a troca não mostra tela vazia
  useEffect(() => {
    variants.forEach((v, i) => {
      if (i === activeIdx) return;
      const img = new Image();
      img.src = v.media.poster;
    });
  }, [activeIdx, variants]);

  function select(i: number) {
    setActiveIdx(i);
    tabRefs.current[i]?.focus();
  }

  // ↑↓ e ←→ trocam de aba; Home e End vão para a primeira e a última
  function onTabKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const n = variants.length;
    let next: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % n;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next === null) return;
    e.preventDefault();
    select(next);
  }

  return (
    <Chapter id={chapter.id}>
      <div className="deck-container">
        {/* com 2 versões, no lg o título e o texto ficam lado a lado: o cabeçalho baixo deixa as molduras maiores */}
        <div
          ref={headRef}
          className={cx(!compact && "lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-end lg:gap-x-12")}
        >
          <div className="min-w-0">
            <Eyebrow index={chapterNumber(deck, chapter.id)}>{chapter.eyebrow}</Eyebrow>
            <WordReveal
              as="h2"
              className="deck-h2 mt-5"
              style={{ fontSize: "clamp(1.5rem, 2.4vw, 2.3rem)" }}
              text={chapter.title}
            />
          </div>
          <motion.p
            className={cx("deck-body mt-5", !compact && "lg:mt-0 lg:!text-[15px]")}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
          >
            {chapter.body}
          </motion.p>
        </div>

        {/* o gatilho fica no pai (sempre ocupa área); as colunas entram pelos variants */}
        <motion.div
          className={"mt-[var(--sp-3)]"}
          style={frameVars}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "show"}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        >
          {/* as versões empilhadas: abaixo de lg e, com 2 versões, também a partir de lg (lado a lado) */}
          <div
            className={`grid grid-cols-[minmax(0,1fr)] gap-x-16 gap-y-12 ${compact ? "lg:hidden" : "lg:grid-cols-2 lg:gap-x-8"}`}
          >
            {variants.map((v, i) => (
              <motion.div key={v.tag} className="flex min-w-0 flex-col" custom={i} variants={reduced ? undefined : COLUMN}>
                <div className="w-full max-w-[var(--frame-stack)] lg:max-w-[var(--frame-side)]">
                  <DeviceFrame kind="browser" url={v.frameUrl ?? host} aspect={v.media.width / v.media.height} bare={deck.mediaFramed}>
                    <LoopVideo media={v.media} />
                  </DeviceFrame>
                </div>

                {/* lg+ com 2 versões: legenda de uma linha só (tag, nome e link), na largura da moldura; o texto fica no celular */}
                {!compact && (
                  <div className="hidden lg:flex lg:w-full lg:max-w-[var(--frame-side)] lg:flex-col">
                    <div className="flex min-h-[44px] items-center justify-between gap-4">
                      <div className="flex min-w-0 items-baseline gap-3">
                        <p
                          className="deck-h2 shrink-0 leading-none"
                          style={{
                            fontSize: "1.6rem",
                            fontWeight: "var(--d-display-weight, 800)",
                            color: "var(--d-accent)",
                          }}
                        >
                          {v.tag}
                        </p>
                        <p
                          className="deck-h2 min-w-0 break-words"
                          style={{ fontSize: "1.1rem", lineHeight: 1.2, color: "var(--d-fg)" }}
                        >
                          {v.name}
                        </p>
                      </div>
                      <a
                        href={v.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 border-b border-[color:var(--d-line)] px-1 text-[14px] font-semibold text-[color:var(--d-fg)] transition-colors duration-200 hover:border-[color:var(--d-accent)] focus-visible:border-[color:var(--d-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--d-accent)]"
                      >
                        {v.button} <span aria-hidden="true">↗</span>
                        <span className="sr-only"> (abre em nova aba)</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* abaixo de lg (e sempre com 3 ou mais): o texto ocupa o resto da coluna e o link vai para a base */}
                <div className="flex w-full flex-1 flex-col lg:hidden">
                  <div className="mt-5 flex items-baseline gap-4">
                    <p
                      className="deck-h2 leading-none"
                      style={{
                        fontSize: "clamp(2rem, 2.6vw, 2.75rem)",
                        fontWeight: "var(--d-display-weight, 800)",
                        color: "var(--d-accent)",
                      }}
                    >
                      {v.tag}
                    </p>
                    <p
                      className="deck-h2 break-words"
                      style={{
                        fontSize: "clamp(1.2rem, 1.7vw, 1.5rem)",
                        lineHeight: 1.15,
                        color: "var(--d-fg)",
                      }}
                    >
                      {v.name}
                    </p>
                  </div>

                  <p className="mb-5 mt-3 break-words text-[15px]" style={{ lineHeight: 1.6, color: "var(--d-fg-muted)" }}>
                    {v.text}
                  </p>

                  <a
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex self-start min-h-[44px] items-center gap-2 border border-[color:var(--d-line)] px-6 py-3 font-semibold text-[color:var(--d-fg)] transition-colors duration-200 hover:border-[color:var(--d-accent)] focus-visible:border-[color:var(--d-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--d-accent)]"
                    style={{ borderRadius: "var(--d-radius)" }}
                  >
                    {v.button} <span aria-hidden="true">↗</span>
                    <span className="sr-only"> (abre em nova aba)</span>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 3 ou mais, a partir de lg: abas verticais à esquerda (30%) e uma moldura grande à direita (70%) */}
          {compact && (
            <div className="hidden lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] lg:items-start lg:gap-x-16">
              <motion.div custom={0} variants={reduced ? undefined : COLUMN} className="flex min-w-0 flex-col">
                <div role="tablist" aria-orientation="vertical" aria-label="Versões da página" className="flex flex-col">
                  {variants.map((v, i) => {
                    const on = i === activeIdx;
                    return (
                      <button
                        key={v.tag}
                        ref={(el) => {
                          tabRefs.current[i] = el;
                        }}
                        id={`${uid}-tab-${i}`}
                        type="button"
                        role="tab"
                        aria-selected={on}
                        aria-controls={panelId}
                        tabIndex={on ? 0 : -1}
                        onClick={() => setActiveIdx(i)}
                        onKeyDown={(e) => onTabKey(e, i)}
                        className={cx(
                          "flex w-full min-w-0 items-baseline border-l-2 text-left transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--d-accent)]",
                          compact ? "gap-3 py-2 pl-4 pr-2" : "gap-4 py-3 pl-5 pr-2",
                          on ? "border-[color:var(--d-accent)]" : "border-transparent",
                        )}
                      >
                        <span
                          className="deck-h2 shrink-0 leading-none"
                          style={{
                            fontSize: compact ? "clamp(1.1rem, 1.5vw, 1.4rem)" : "clamp(2rem, 2.6vw, 2.75rem)",
                            fontWeight: "var(--d-display-weight, 800)",
                            color: "var(--d-accent)",
                          }}
                        >
                          {v.tag}
                        </span>
                        <span
                          className="deck-h2 min-w-0 break-words"
                          style={{
                            fontSize: compact ? "clamp(0.95rem, 1.2vw, 1.1rem)" : "clamp(1.2rem, 1.7vw, 1.5rem)",
                            lineHeight: 1.15,
                            color: on ? "var(--d-fg)" : "var(--d-fg-muted)",
                          }}
                        >
                          {v.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* a versão ativa: texto e link */}
                <p className="mt-6 break-words text-[15px]" style={{ lineHeight: 1.6, color: "var(--d-fg-muted)" }}>
                  {cur.text}
                </p>
                <a
                  href={cur.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-[44px] self-start items-center gap-2 border border-[color:var(--d-line)] px-6 py-3 font-semibold text-[color:var(--d-fg)] transition-colors duration-200 hover:border-[color:var(--d-accent)] focus-visible:border-[color:var(--d-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--d-accent)]"
                  style={{ borderRadius: "var(--d-radius)" }}
                >
                  {cur.button} <span aria-hidden="true">↗</span>
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              </motion.div>

              <motion.div custom={1} variants={reduced ? undefined : COLUMN} className="min-w-0">
                <div
                  role="tabpanel"
                  id={panelId}
                  aria-labelledby={`${uid}-tab-${activeIdx}`}
                  className="w-full"
                  style={{ maxWidth: frameMaxDesk(headPx) }}
                >
                  <DeviceFrame kind="browser" url={cur.frameUrl ?? host} aspect={cur.media.width / cur.media.height} bare={deck.mediaFramed}>
                    {reduced ? (
                      <LoopVideo key={cur.tag} media={cur.media} />
                    ) : (
                      // a troca é um crossfade: a versão nova entra por cima da que sai
                      <AnimatePresence initial={false}>
                        <motion.div
                          key={cur.tag}
                          className="absolute inset-0"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.4, ease: EASE }}
                        >
                          <LoopVideo media={cur.media} />
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </DeviceFrame>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>

        {chapter.note && (
          <p className="mt-8 text-center text-[13px]" style={{ color: "var(--d-fg-muted)" }}>
            {chapter.note}
          </p>
        )}
      </div>
    </Chapter>
  );
}
