"use client";

import { motion } from "framer-motion";
import { chapterNumber } from "@/components/deck/chapterIndex";
import Chapter from "@/components/deck/primitives/Chapter";
import Eyebrow from "@/components/deck/primitives/Eyebrow";
import WordReveal from "@/components/deck/primitives/WordReveal";
import { useReduced } from "@/components/deck/useReduced";
import type { Deck, TopicsChapter } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const pad = (n: number) => String(n).padStart(2, "0");

// Classes completas e literais, para o Tailwind enxergar cada uma no código.
// Três colunas no xl quando há múltiplo de 3 itens ou mais de 4; senão, duas.
const GRID = {
  three: "mt-14 grid grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-10 md:grid-cols-2 xl:grid-cols-3",
  two: "mt-14 grid grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-10 md:grid-cols-2 xl:grid-cols-2",
} as const;

// Tópicos: título, texto opcional e uma grade de itens. Cada item é só uma linha de cima
// com número, título e texto, sem cartão.
export default function Topics({ chapter, deck }: { chapter: TopicsChapter; deck: Deck }) {
  const reduced = useReduced();
  const grid = chapter.items.length % 3 === 0 || chapter.items.length > 4 ? GRID.three : GRID.two;

  return (
    <Chapter id={chapter.id}>
      <div className="deck-container">
        <Eyebrow index={chapterNumber(deck, chapter.id)}>{chapter.eyebrow}</Eyebrow>
        <WordReveal as="h2" className="deck-h2 mt-5" text={chapter.title} />
        {chapter.body && (
          <motion.p
            className="deck-body mt-6"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
          >
            {chapter.body}
          </motion.p>
        )}

        <div className={grid}>
          {chapter.items.map((item, i) => (
            <motion.div
              key={item.title}
              style={{ borderTop: "2px solid var(--d-line)", paddingTop: 22 }}
              initial={reduced ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.9, ease: EASE, delay: (i % 3) * 0.08 }}
            >
              <p className="text-[13px] font-semibold tracking-[0.14em]" style={{ color: "var(--d-accent)" }}>
                {pad(i + 1)}
              </p>
              <p className="mt-3 text-[20px] font-medium leading-snug">{item.title}</p>
              <p className="mt-3 text-[15px] leading-[1.7]" style={{ color: "var(--d-fg-muted)" }}>
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </Chapter>
  );
}
