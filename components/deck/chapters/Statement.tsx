"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { cx } from "@/components/deck/cx";
import Chapter from "@/components/deck/primitives/Chapter";
import Eyebrow from "@/components/deck/primitives/Eyebrow";
import { useReduced } from "@/components/deck/useReduced";
import type { Deck, StatementChapter } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9À-ɏ]/g, "");

export default function Statement({ chapter, deck }: { chapter: StatementChapter; deck: Deck }) {
  const reduced = useReduced();

  const sentences = chapter.text.match(/[^.!?]+(?:[.!?]+["”]?|$)\s*/g)?.map((s) => s.trim()) ?? [chapter.text];
  const joined = sentences[0].length < 40 && sentences.length > 1;
  const lead = joined ? `${sentences[0]} ${sentences[1]}` : sentences[0];
  const support = sentences.slice(joined ? 2 : 1).join(" ");

  const marked = new Set(chapter.emphasis.map(norm));
  const leadWords = lead.split(/\s+/).filter(Boolean);
  const supportWords = support.split(/\s+/).filter(Boolean);

  return (
    <Chapter id={chapter.id}>
      <div className="deck-container">
        <Eyebrow>{chapter.eyebrow}</Eyebrow>

        <p
          className="mt-8"
          style={{
            fontSize: lead.length > 170 ? "clamp(1.7rem, 3.4vw, 3rem)" : "clamp(1.9rem, 4.2vw, 3.8rem)",
            fontWeight: "var(--d-display-weight)",
            lineHeight: 1.12,
            maxWidth: 1100,
          }}
        >
          {leadWords.map((w, i) => (
            <Fragment key={i}>
              
              <motion.span
                className="inline-block"
                style={{ color: marked.has(norm(w)) ? "var(--d-accent)" : undefined }}
                initial={reduced ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{ duration: 0.7, ease: EASE, delay: Math.min(i * 0.03, 0.9) }}
              >
                {w}
              </motion.span>
              {i < leadWords.length - 1 ? " " : null}
            </Fragment>
          ))}
        </p>

        {support && (
          <motion.p
            className="deck-body mt-8"
            style={{ fontSize: "clamp(1rem, 1.25vw, 1.2rem)", maxWidth: "62ch" }}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
          >
            {supportWords.map((w, i) => (
              <Fragment key={i}>
                {marked.has(norm(w)) ? (
                  <span style={{ color: "var(--d-accent)", fontWeight: 500 }}>{w}</span>
                ) : (
                  w
                )}
                {i < supportWords.length - 1 ? " " : null}
              </Fragment>
            ))}
          </motion.p>
        )}
      </div>
    </Chapter>
  );
}
