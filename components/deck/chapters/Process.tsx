"use client";

import { motion } from "framer-motion";
import { chapterNumber } from "@/components/deck/chapterIndex";
import { cx } from "@/components/deck/cx";
import Chapter from "@/components/deck/primitives/Chapter";
import Eyebrow from "@/components/deck/primitives/Eyebrow";
import WordReveal from "@/components/deck/primitives/WordReveal";
import { useReduced } from "@/components/deck/useReduced";
import type { Deck, ProcessChapter } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Colunas por largura. As classes ficam completas aqui: o Tailwind não gera classe montada por template.
const LG_COLS: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};
const XL_COLS: Record<number, string> = {
  1: "xl:grid-cols-1",
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  5: "xl:grid-cols-5",
};

// 1 coluna no celular, 2 no sm e no md; no lg, N colunas até 4 (senão 3); no xl, N até 5, 6 em 3 e 7 ou mais em 4.
function gridCols(n: number): string {
  const lg = LG_COLS[n <= 4 ? Math.max(n, 1) : 3];
  const xl = XL_COLS[n <= 5 ? Math.max(n, 1) : n === 6 ? 3 : 4];
  return cx("grid-cols-1 sm:grid-cols-2", lg, xl);
}

// Processo: todas as etapas à vista de uma vez, cada uma num cartão com número grande, nome, saída e nota.
// Nada é clicável, nada fica preso à rolagem e nenhum texto é cortado.
export default function Process({ chapter, deck }: { chapter: ProcessChapter; deck: Deck }) {
  const reduced = useReduced();

  return (
    <Chapter id={chapter.id}>
      <div className="deck-container">
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

        <ol className={cx("mt-[var(--sp-3)] grid items-stretch gap-4 sm:gap-5", gridCols(chapter.steps.length))}>
          {chapter.steps.map((step, i) => (
            <motion.li
              key={step.n}
              className="min-w-0"
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.9, ease: EASE, delay: i * 0.08 }}
            >
              {/* o movimento de entrada fica no <li>; o cartão tem o próprio hover, sem brigar com ele */}
              <div
                className={cx(
                  "flex h-full flex-col border p-6 [border-color:var(--d-line)]",
                  "hover:[border-color:var(--d-accent)] focus-within:[border-color:var(--d-accent)]",
                  !reduced && "transition-[transform,border-color] duration-200 hover:-translate-y-0.5 focus-within:-translate-y-0.5",
                )}
                style={{ borderRadius: "var(--d-radius)" }}
              >
                <p
                  className="deck-h2"
                  aria-hidden="true"
                  style={{
                    fontWeight: "var(--d-display-weight, 800)",
                    fontSize: "clamp(2.75rem, 4.2vw, 4rem)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.04em",
                    color: "var(--d-accent)",
                  }}
                >
                  {step.n}
                </p>
                <p
                  className="mt-5 break-words font-medium"
                  style={{ fontSize: "clamp(1.15rem, 1.6vw, 1.5rem)", lineHeight: 1.2, color: "var(--d-fg)" }}
                >
                  {step.name}
                </p>
                <p className="mt-3 break-words text-[15px] font-medium" style={{ color: "var(--d-accent)" }}>
                  {step.output}
                </p>
                <p className="mt-3 break-words text-[14px] sm:text-[15px]" style={{ lineHeight: 1.6, color: "var(--d-fg-muted)" }}>
                  {step.note}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </Chapter>
  );
}
