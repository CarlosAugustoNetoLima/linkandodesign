"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import OpenChatLink from "@/components/agent/OpenChatLink";
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

        <Fade delay={0.5} className="mt-[var(--sp-3)]">
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

        <Fade delay={0.74} className="mt-[var(--sp-3)] flex flex-col items-center gap-4">
          <p className="text-[18px] font-medium sm:text-[20px]" style={{ color: "var(--d-fg)" }}>
            Quer um projeto assim para a sua empresa?
          </p>
          <OpenChatLink
            className={`inline-flex min-h-[44px] items-center justify-center rounded-[10px] border border-[color:var(--d-line)] px-7 py-4 font-semibold text-[color:var(--d-fg)] transition-[transform,border-color] duration-200 hover:border-[color:var(--d-accent)] focus-visible:border-[color:var(--d-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--d-accent)] ${reduced ? "" : "hover:-translate-y-0.5 focus-visible:-translate-y-0.5"}`}
          >
            Solicitar diagnóstico →
          </OpenChatLink>
          <p className="text-[13px]" style={{ color: "var(--d-fg-muted)" }}>
            Gratuito. A proposta chega por e-mail em até 24h.
          </p>
        </Fade>

        {deck.credits.length > 0 && (
          <Fade delay={0.82} className="mt-[var(--sp-2)] w-full">
            <section aria-labelledby={`${chapter.id}-ficha`}>
              <h3
                id={`${chapter.id}-ficha`}
                className="deck-mono text-[11px] uppercase tracking-[0.14em]"
                style={{ color: "var(--d-fg-muted)" }}
              >
                Ficha técnica
              </h3>
              <ul className="mt-5 flex flex-wrap justify-center gap-x-12 gap-y-5">
                {deck.credits.map((c) => (
                  <li key={c.name} className="flex flex-col items-center gap-1">
                    <p className="text-[15px] font-medium" style={{ color: "var(--d-fg)" }}>
                      {c.href ? (
                        <a href={c.href} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                          {c.name}
                          <span className="sr-only"> (abre em nova aba)</span>
                        </a>
                      ) : (
                        c.name
                      )}
                    </p>
                    {c.role && (
                      <p className="text-[13px]" style={{ color: "var(--d-fg-muted)" }}>
                        {c.role}
                      </p>
                    )}
                    {c.handle && (
                      <p className="deck-mono text-[11px]" style={{ color: "var(--d-fg-muted)" }}>
                        {c.handle}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </Fade>
        )}

        <Fade
          delay={0.88}
          className="mt-[var(--sp-3)] flex flex-wrap items-center justify-center gap-8 text-[13px] uppercase tracking-[0.14em]"
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
