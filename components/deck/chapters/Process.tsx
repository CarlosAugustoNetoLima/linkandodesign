"use client";

import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { useRef, useState, type CSSProperties } from "react";
import { chapterNumber } from "@/components/deck/chapterIndex";
import { cx } from "@/components/deck/cx";
import Chapter from "@/components/deck/primitives/Chapter";
import Eyebrow from "@/components/deck/primitives/Eyebrow";
import WordReveal from "@/components/deck/primitives/WordReveal";
import { useReduced } from "@/components/deck/useReduced";
import type { Deck, ProcessChapter } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const FOOTNOTE: CSSProperties = { borderLeft: "2px solid var(--d-accent)", paddingLeft: 16, color: "var(--d-fg-muted)" };

type Step = ProcessChapter["steps"][number];

// Nó da linha do tempo: vazio com borda accent, cheio quando o passo foi alcançado.
function Node({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx("block h-[14px] w-[14px] transition-colors duration-500", className)}
      style={{
        borderRadius: "50%",
        border: "1px solid var(--d-accent)",
        background: filled ? "var(--d-accent)" : "var(--d-bg)",
      }}
    />
  );
}

// Conteúdo de um passo: número, nome, dono, saída e nota. Igual no pin e na lista.
function StepBody({ step }: { step: Step }) {
  return (
    <>
      <p className="leading-none" style={{ fontSize: "clamp(2.2rem, 3.4vw, 3.2rem)", fontWeight: 200, color: "var(--d-accent)" }}>
        {step.n}
      </p>
      <p className="mt-4 text-[20px] font-medium leading-snug">{step.name}</p>
      <p className="mt-3 break-words text-[14px] font-medium leading-snug" style={{ color: "var(--d-accent)" }}>
        {step.output}
      </p>
      <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "var(--d-fg-muted)" }}>
        {step.note}
      </p>
    </>
  );
}

// Cabeçalho padrão, com o corpo do capítulo.
function Head({ chapter, deck }: { chapter: ProcessChapter; deck: Deck }) {
  const reduced = useReduced();

  return (
    <>
      <Eyebrow index={chapterNumber(deck, chapter.id)}>{chapter.eyebrow}</Eyebrow>
      <WordReveal as="h2" className="deck-h2 mt-5" text={chapter.title} />
      <motion.p
        className="deck-body mt-6"
        initial={reduced ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
      >
        {chapter.body}
      </motion.p>
    </>
  );
}

// Processo: no desktop, a linha do tempo se desenha com o scroll (seção pinada).
// No mobile e com prefers-reduced-motion, vira uma lista vertical sem pin.
export default function Process({ chapter, deck }: { chapter: ProcessChapter; deck: Deck }) {
  const reduced = useReduced();
  const wrapperRef = useRef<HTMLDivElement>(null);
  // o wrapper existe mesmo com reduced motion (escondido), para o ref do scroll sempre estar ligado
  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ["start start", "end end"] });
  const lineScale = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const n = chapter.steps.length;
  // passo alcançado: índices até `level` acendem; `done` mostra a nota de rodapé
  const [level, setLevel] = useState(0);
  const [done, setDone] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setLevel(Math.floor(v * (n + 0.5)));
    setDone(v > 0.9);
  });

  return (
    <Chapter id={chapter.id} style={{ padding: 0 }}>
      {/* desktop: seção alta com o conteúdo preso (sticky) enquanto o scroll percorre os passos */}
      <div
        ref={wrapperRef}
        className={cx("hidden", !reduced && "lg:block")}
        style={{ height: `${150 + n * 55}vh` }}
      >
        <div className="sticky top-0 deck-screen h-[100svh]">
          <div className="deck-container">
            <Head chapter={chapter} deck={deck} />

            <div className="relative mt-16">
              <span aria-hidden="true" className="absolute inset-x-0 top-[7px] h-px" style={{ background: "var(--d-line)" }} />
              <motion.span
                aria-hidden="true"
                className="absolute inset-x-0 top-[6px] h-[2px] origin-left"
                style={{ background: "var(--d-accent)", scaleX: lineScale }}
              />
              <div className="grid gap-x-8" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
                {chapter.steps.map((s, i) => {
                  const reached = i <= level;
                  return (
                    <div key={s.n}>
                      <Node filled={reached} />
                      <motion.div
                        className="mt-8 pr-2"
                        animate={{ opacity: reached ? 1 : 0.22, y: reached ? 0 : 18 }}
                        transition={{ duration: 0.6, ease: EASE }}
                      >
                        <StepBody step={s} />
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>

            {chapter.footnote && (
              <motion.p
                className="mt-12 max-w-[60ch] text-[14px] leading-relaxed"
                style={FOOTNOTE}
                animate={{ opacity: done ? 1 : 0, y: done ? 0 : 12 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                {chapter.footnote}
              </motion.p>
            )}
          </div>
        </div>
      </div>

      {/* mobile (e reduced motion em qualquer largura): lista vertical, sem pin */}
      <div className={cx("deck-screen", !reduced && "lg:hidden")}>
        <div className="deck-container">
          <Head chapter={chapter} deck={deck} />

          <div className="relative mt-14 pl-8">
            <motion.span
              aria-hidden="true"
              className="absolute bottom-0 left-[6px] top-[7px] w-px origin-top"
              style={{ background: "var(--d-line)" }}
              initial={reduced ? false : { scaleY: 0 }}
              whileInView={reduced ? undefined : { scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: EASE }}
            />
            {chapter.steps.map((s) => (
              <motion.div
                key={s.n}
                className="relative pb-12 last:pb-0"
                initial={reduced ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <Node filled className="absolute -left-8 top-0" />
                <StepBody step={s} />
              </motion.div>
            ))}
          </div>

          {chapter.footnote && (
            <p className="mt-14 max-w-[60ch] text-[14px] leading-relaxed" style={FOOTNOTE}>
              {chapter.footnote}
            </p>
          )}
        </div>
      </div>
    </Chapter>
  );
}
