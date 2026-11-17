"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import LoopVideo from "@/components/deck/primitives/LoopVideo";
import { ReducedProvider, useReduced } from "@/components/deck/useReduced";
import type { Deck } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Card do hub. Mostra o poster; com o mouse em cima ou foco no card, troca pelo
// vídeo em loop. Em toque e com prefers-reduced-motion, fica o poster.
function DeckCardInner({ deck }: { deck: Deck }) {
  const reduced = useReduced();
  const [live, setLive] = useState(false);

  return (
    <Link
      href={`/apresentacoes/${deck.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-charcoal text-white shadow-dark"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setLive(true);
      }}
      onPointerLeave={() => setLive(false)}
      onFocus={() => setLive(true)}
      onBlur={() => setLive(false)}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{ scale: live && !reduced ? 1.04 : 1 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <img
            src={deck.cover.poster}
            alt={deck.cover.alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {live && (
            <div className="absolute inset-0">
              <LoopVideo media={deck.cover} eager />
            </div>
          )}
        </motion.div>
        {/* o país já está dito no texto abaixo: a bandeira é só reforço visual */}
        <span
          aria-hidden="true"
          className="absolute left-4 top-4 flex gap-2 rounded-lg bg-ink/90 px-3 py-2 text-3xl leading-none md:text-4xl"
        >
          {deck.flags.map((flag) => (
            <span key={flag}>{flag}</span>
          ))}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6 md:p-8">
        <h2 className="font-display text-h2 font-extrabold uppercase">{deck.name}</h2>
        <p className="mt-2 text-[13px] text-white/60">
          {deck.sector} · {deck.location}
        </p>
        <p className="mt-4 text-[14px] leading-relaxed text-white/75">{deck.summary}</p>

        <ul className="mb-7 mt-5 flex flex-wrap gap-2">
          {deck.stack.map((s) => (
            <li key={s} className="rounded-lg border border-white/20 px-3 py-1 text-[11px] text-white/80">
              {s}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-5 text-sm font-semibold text-lime">
          {/* o espaço acima empurra o rodapé para a base: todos os cards da linha ficam do mesmo tamanho */}
          <span>Ver apresentação</span>
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-300 motion-safe:group-hover:translate-x-1.5"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function DeckCard({ deck }: { deck: Deck }) {
  return (
    <ReducedProvider>
      <DeckCardInner deck={deck} />
    </ReducedProvider>
  );
}
