"use client";

import { Fragment, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Chapter from "@/components/deck/primitives/Chapter";
import CountUp from "@/components/deck/primitives/CountUp";
import Eyebrow from "@/components/deck/primitives/Eyebrow";
import { useReduced } from "@/components/deck/useReduced";
import type { Deck, StatementChapter } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Comparação de palavra: sem caixa e sem pontuação, como manda o campo emphasis.
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9À-ɏ]/g, "");

type WordProps = {
  text: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
  emphasized: boolean;
  reduced: boolean | null;
};

// Uma palavra: a opacidade acompanha o scroll; palavra de destaque também muda de cor.
// Os hooks ficam aqui, um conjunto por palavra.
function Word({ text, progress, start, end, emphasized, reduced }: WordProps) {
  const opacity = useTransform(progress, [start, end], [0.14, 1]);
  // framer não interpola var(), então a cor vai de fg para accent via color-mix
  const mix = useTransform(progress, [end - 0.02, end], [0, 100]);
  const accentMix = useTransform(mix, (p) => `color-mix(in srgb, var(--d-accent) ${p}%, var(--d-fg))`);

  return (
    <motion.span
      style={{
        opacity: reduced ? 1 : opacity,
        color: emphasized ? (reduced ? "var(--d-accent)" : accentMix) : undefined,
      }}
    >
      {text}
    </motion.span>
  );
}

// Afirmação: o texto acende palavra a palavra com o scroll e, ao fim, os números contam.
// Com prefers-reduced-motion vira texto estático e altura normal.
export default function Statement({ chapter, deck }: { chapter: StatementChapter; deck: Deck }) {
  const reduced = useReduced();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [showStats, setShowStats] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => setShowStats(v > 0.7));

  const words = chapter.text.split(/\s+/).filter(Boolean);
  const N = Math.max(words.length, 1);
  const marked = new Set(chapter.emphasis.map(norm));
  const visible = reduced || showStats;

  return (
    <Chapter
      id={chapter.id}
      className={reduced ? undefined : "h-[240vh]"}
      style={reduced ? undefined : { padding: 0 }}
    >
      <div ref={ref} className="h-full">
        <div className={reduced ? "" : "sticky top-0 deck-screen h-[100svh]"}>
          <div className="deck-container">
            <Eyebrow>{chapter.eyebrow}</Eyebrow>

            <p
              className="mt-8 leading-[1.22]"
              style={{
                fontSize: "clamp(1.7rem, 3.7vw, 3.3rem)",
                fontWeight: "var(--d-display-weight)",
                maxWidth: 1240,
              }}
            >
              {words.map((w, i) => {
                const a = (i / N) * 0.62;
                const b = a + (0.62 / N) * 3;
                return (
                  <Fragment key={i}>
                    <Word
                      text={w}
                      progress={scrollYProgress}
                      start={a}
                      end={b}
                      emphasized={marked.has(norm(w))}
                      reduced={reduced}
                    />
                    {i < words.length - 1 ? " " : null}
                  </Fragment>
                );
              })}
            </p>

            <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
              {chapter.stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={false}
                  animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 24 }}
                  transition={{ duration: 0.9, ease: EASE, delay: i * 0.12 }}
                >
                  <p
                    className="leading-none"
                    style={{
                      fontSize: "clamp(2.4rem, 5vw, 4.4rem)",
                      fontWeight: 200,
                      color: "var(--d-accent)",
                    }}
                  >
                    <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} start={visible} />
                  </p>
                  <p className="deck-body mt-4" style={{ fontSize: 14 }}>
                    {s.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Chapter>
  );
}
