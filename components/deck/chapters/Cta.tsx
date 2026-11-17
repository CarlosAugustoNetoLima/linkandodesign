"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import Chapter from "@/components/deck/primitives/Chapter";
import MagneticButton from "@/components/deck/primitives/MagneticButton";
import WordReveal from "@/components/deck/primitives/WordReveal";
import { useReduced } from "@/components/deck/useReduced";
import type { CtaChapter, Deck } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Anéis ao fundo, defasados: respiram sem competir com o texto.
const RINGS = [
  { size: "40vmin", delay: 0 },
  { size: "62vmin", delay: 1.2 },
  { size: "84vmin", delay: 2.4 },
];

// Bloco que entra com fade + subida ao aparecer na tela.
function Fade({ delay, className, children }: { delay: number; className?: string; children: ReactNode }) {
  const reduced = useReduced();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

// Chamada final: título, botão magnético para o projeto real e navegação entre decks.
// Com prefers-reduced-motion os anéis ficam parados e o conteúdo aparece sem transição.
export default function Cta({
  chapter,
  deck,
  next,
}: {
  chapter: CtaChapter;
  deck: Deck;
  next?: { slug: string; name: string };
}) {
  const reduced = useReduced();
  const host = new URL(deck.liveUrl).host;

  return (
    <Chapter id={chapter.id} className="overflow-hidden text-center">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {RINGS.map((r) => (
          <motion.span
            key={r.size}
            className="absolute left-1/2 top-1/2 block rounded-full"
            style={{
              width: r.size,
              height: r.size,
              x: "-50%",
              y: "-50%",
              border: "1px solid var(--d-line)",
              opacity: reduced ? 0.5 : undefined,
            }}
            initial={reduced ? false : { scale: 0.92, opacity: 0.35 }}
            animate={reduced ? undefined : { scale: 1, opacity: 0.8 }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", delay: r.delay }}
          />
        ))}
      </div>

      <div className="deck-container relative z-10 flex w-full flex-col items-center">
        <WordReveal as="h2" className="deck-h1" text={chapter.title} />

        <Fade delay={0.3} className="mt-8">
          <p className="deck-body mx-auto">{chapter.body}</p>
        </Fade>

        <Fade delay={0.5} className="mt-12">
          <MagneticButton href={deck.liveUrl} external variant="ink" className="px-10 py-6 text-lg">
            {chapter.button} ↗
          </MagneticButton>
        </Fade>

        <Fade delay={0.65} className="mt-6 flex flex-col items-center gap-2">
          <p className="deck-mono text-[12px]" style={{ color: "var(--d-fg-muted)" }}>
            {host}
          </p>
          {chapter.note && (
            <p className="text-[13px]" style={{ color: "var(--d-fg-muted)" }}>
              {chapter.note}
            </p>
          )}
        </Fade>

        {deck.extraLinks?.map((l, i) => (
          <Fade key={l.url} delay={0.72 + i * 0.08} className="mt-6 flex flex-col items-center gap-2">
            <MagneticButton href={l.url} external variant="ghost">
              {l.label} ↗
            </MagneticButton>
            {l.note && (
              <p className="text-[12px]" style={{ color: "var(--d-fg-muted)" }}>
                {l.note}
              </p>
            )}
          </Fade>
        ))}

        <Fade
          delay={0.8}
          className="mt-20 flex flex-wrap items-center justify-center gap-8 text-[13px] uppercase tracking-[0.14em]"
        >
          <Link href="/apresentacoes" className="opacity-70 transition-opacity hover:opacity-100">
            ← Voltar ao portfólio
          </Link>
          {next && (
            <Link href={`/apresentacoes/${next.slug}`} className="opacity-70 transition-opacity hover:opacity-100">
              Próximo projeto: {next.name} →
            </Link>
          )}
        </Fade>
      </div>
    </Chapter>
  );
}
