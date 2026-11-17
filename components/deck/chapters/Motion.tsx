"use client";

import {
  animate,
  cubicBezier,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect, useRef } from "react";
import { chapterNumber } from "@/components/deck/chapterIndex";
import Chapter from "@/components/deck/primitives/Chapter";
import Eyebrow from "@/components/deck/primitives/Eyebrow";
import WordReveal from "@/components/deck/primitives/WordReveal";
import { useReduced } from "@/components/deck/useReduced";
import type { Deck, MotionChapter } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Token = MotionChapter["tokens"][number];

// Card de um token: um quadrado percorre a pista com a curva e a duração reais, em loop.
// Só anima enquanto está na tela. Com reduced motion, fica no fim da pista.
function TokenCard({ token, index, reduced }: { token: Token; index: number; reduced: boolean | null }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { margin: "-10%" });
  // t: progresso do tempo, 0 → 1 em loop. A posição do quadrado é a curva aplicada a t.
  const t = useMotionValue(0);
  const easeFn = cubicBezier(...token.ease);

  // quadrado da pista: avança com o easing e nunca sai da trilha (22 px)
  const demoLeft = useTransform(t, (v) => {
    const e = easeFn(v);
    return `calc(${e * 100}% - ${e * 22}px)`;
  });

  // Anima só com o card na tela; ao sair, para. Com reduced motion, fica no fim.
  useEffect(() => {
    if (reduced) {
      t.set(1);
      return;
    }
    if (!inView) return;
    const controls = animate(t, [0, 1], {
      duration: token.duration,
      ease: "linear",
      repeat: Infinity,
      repeatDelay: 0.9,
    });
    return () => controls.stop();
  }, [inView, reduced, t, token.duration]);

  const durationLabel = `Dura ${token.duration.toFixed(1).replace(".", ",")} s`;

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.9, ease: EASE, delay: index * 0.08 }}
    >
      <div
        ref={cardRef}
        className="flex h-full flex-col p-6"
        style={{ border: "1px solid var(--d-line)", background: "var(--d-bg-alt)", borderRadius: "var(--d-radius)" }}
      >
        <p className="text-[17px] font-medium">{token.name}</p>

        {/* pista: o mesmo movimento, com a curva real */}
        <div className="relative mt-6 h-[44px]" aria-hidden="true">
          <span className="absolute inset-x-0 top-1/2 h-px" style={{ background: "var(--d-line)" }} />
          <motion.span
            className="absolute top-1/2 h-[22px] w-[22px]"
            style={{ left: demoLeft, y: "-50%", background: "var(--d-accent)", borderRadius: "var(--d-radius)" }}
          />
        </div>

        <p className="mt-4 text-[13px]" style={{ color: "var(--d-fg-muted)" }}>
          {durationLabel}
          {token.stagger !== undefined && " · itens entram um após o outro"}
        </p>

        <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "var(--d-fg-muted)" }}>
          {token.usage}
        </p>
      </div>
    </motion.div>
  );
}

// Linguagem de movimento: as curvas e durações reais do site, rodando em loop.
// Com prefers-reduced-motion os quadrados ficam no fim da pista.
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

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {chapter.tokens.map((tk, i) => (
            <TokenCard key={tk.name} token={tk} index={i} reduced={reduced} />
          ))}
        </div>

        <ul className="mt-16 grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-3">
          {chapter.notes.map((note, i) => (
            <motion.li
              key={note}
              className="flex items-start gap-3 text-[14.5px] leading-relaxed"
              style={{ color: "var(--d-fg-muted)" }}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.07 }}
            >
              <span
                aria-hidden="true"
                className="mt-[9px] h-1.5 w-1.5 shrink-0"
                style={{ background: "var(--d-accent)", borderRadius: "var(--d-radius)" }}
              />
              <span>{note}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </Chapter>
  );
}
