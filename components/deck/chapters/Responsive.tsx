"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { chapterNumber } from "@/components/deck/chapterIndex";
import Chapter from "@/components/deck/primitives/Chapter";
import DeviceFrame from "@/components/deck/primitives/DeviceFrame";
import Eyebrow from "@/components/deck/primitives/Eyebrow";
import LoopVideo from "@/components/deck/primitives/LoopVideo";
import WordReveal from "@/components/deck/primitives/WordReveal";
import { useReduced } from "@/components/deck/useReduced";
import type { Deck, ResponsiveChapter, Spec } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type SpecRowProps = { spec: Spec; index: number; reduced: boolean | null };

// Linha de especificação: rótulo à esquerda, valor à direita, hairline no topo.
function SpecRow({ spec, index, reduced }: SpecRowProps) {
  return (
    <motion.div
      className="grid grid-cols-[132px_1fr] gap-x-4 py-3"
      style={{ borderTop: "1px solid var(--d-line)" }}
      initial={reduced ? false : { opacity: 0, x: 16 }}
      whileInView={reduced ? undefined : { opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: EASE, delay: index * 0.06 }}
    >
      <dt className="pt-0.5 text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--d-fg-muted)" }}>
        {spec.k}
      </dt>
      <dd className="text-[14.5px] leading-[1.6]" style={{ color: "var(--d-fg)" }}>
        {spec.v}
      </dd>
    </motion.div>
  );
}

// Régua de largura: uma linha que se desenha ao entrar na tela, com tracinhos nas pontas.
function Ruler({ label, reduced }: { label: string; reduced: boolean | null }) {
  return (
    <div className="mt-5">
      <div className="relative h-2">
        <motion.span
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 block h-px origin-left"
          style={{ background: "var(--d-line)" }}
          initial={reduced ? false : { scaleX: 0 }}
          whileInView={reduced ? undefined : { scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE }}
        />
        <span aria-hidden="true" className="absolute left-0 top-0 block h-full w-px" style={{ background: "var(--d-line)" }} />
        <span aria-hidden="true" className="absolute right-0 top-0 block h-full w-px" style={{ background: "var(--d-line)" }} />
      </div>
      <p className="deck-mono mt-2 text-center text-[11px] tracking-[0.12em]" style={{ color: "var(--d-fg-muted)" }}>
        {label}
      </p>
    </div>
  );
}

// Responsivo: a mesma página no desktop e no celular, em loop. No lg o celular
// fica sobreposto no canto; abaixo disso, empilhado. Parallax opostos no scroll.
export default function Responsive({ chapter, deck }: { chapter: ResponsiveChapter; deck: Deck }) {
  const reduced = useReduced();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const phoneY = useTransform(scrollYProgress, [0, 1], [70, -30]);
  const desktopY = useTransform(scrollYProgress, [0, 1], [-16, 16]);

  const { desktop, mobile } = chapter;
  const host = new URL(deck.liveUrl).host;

  return (
    <Chapter id={chapter.id}>
      <div ref={ref} className="deck-container">
        <Eyebrow index={chapterNumber(deck, chapter.id)}>{chapter.eyebrow}</Eyebrow>
        <WordReveal as="h2" className="deck-h2 mt-5" text={chapter.title} />
        <motion.p
          className="deck-body mt-6"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          {chapter.body}
        </motion.p>

        <div className="relative mt-14">
          <motion.div className="lg:w-[78%]" style={{ y: reduced ? 0 : desktopY }}>
            <DeviceFrame kind="browser" url={host} aspect={desktop.width / desktop.height}>
              <LoopVideo media={desktop} />
            </DeviceFrame>
            <Ruler label="1280 px" reduced={reduced} />
          </motion.div>

          <motion.div
            className="mx-auto mt-12 max-w-[240px] lg:absolute lg:bottom-[-48px] lg:right-0 lg:mx-0 lg:mt-0 lg:w-[21%] lg:max-w-none"
            style={{ y: reduced ? 0 : phoneY }}
          >
            <DeviceFrame kind="phone" aspect={mobile.width / mobile.height}>
              <LoopVideo media={mobile} />
            </DeviceFrame>
            <Ruler label="390 px" reduced={reduced} />
          </motion.div>
        </div>

        <dl className="mt-16 grid gap-x-12 md:grid-cols-2 lg:mt-24">
          {chapter.notes.map((n, i) => (
            <SpecRow key={n.k} spec={n} index={i} reduced={reduced} />
          ))}
        </dl>
      </div>
    </Chapter>
  );
}
