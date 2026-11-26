"use client";

import { motion } from "framer-motion";
import { chapterNumber } from "@/components/deck/chapterIndex";
import Chapter from "@/components/deck/primitives/Chapter";
import Eyebrow from "@/components/deck/primitives/Eyebrow";
import MotionTokens from "@/components/deck/primitives/MotionTokens";
import WordReveal from "@/components/deck/primitives/WordReveal";
import { useReduced } from "@/components/deck/useReduced";
import type { Deck, MotionChapter } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function Motion({ chapter, deck }: { chapter: MotionChapter; deck: Deck }) {
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

        <div className="mt-[var(--sp-3)]">
          <MotionTokens tokens={chapter.tokens} notes={chapter.notes} reduced={reduced} />
        </div>
      </div>
    </Chapter>
  );
}
