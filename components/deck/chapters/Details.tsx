"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { chapterNumber } from "@/components/deck/chapterIndex";
import Chapter from "@/components/deck/primitives/Chapter";
import Eyebrow from "@/components/deck/primitives/Eyebrow";
import LoopVideo from "@/components/deck/primitives/LoopVideo";
import WordReveal from "@/components/deck/primitives/WordReveal";
import { useReduced } from "@/components/deck/useReduced";
import type { Deck, DetailsChapter } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function Details({ chapter, deck }: { chapter: DetailsChapter; deck: Deck }) {
  const reduced = useReduced();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const n = chapter.items.length;

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);

  function step(dir: number) {
    setOpen((i) => (i === null ? i : (i + dir + n) % n));
  }

  const current = open !== null ? chapter.items[open] : null;

  return (
    <Chapter id={chapter.id}>
      <div className="deck-container">
        <Eyebrow index={chapterNumber(deck, chapter.id)}>{chapter.eyebrow}</Eyebrow>
        <WordReveal as="h2" className="deck-h2 mt-5" text={chapter.title} />

        <div
          className={`mt-[var(--sp-3)] grid grid-cols-2 gap-4 sm:gap-5 ${
            chapter.items.length % 3 === 0 && chapter.items.length % 4 !== 0
              ? "lg:grid-cols-3"
              : "lg:grid-cols-4"
          }`}
        >
          {chapter.items.map((item, i) => (
            <motion.figure
              key={item.label}
              className="min-w-0"
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.9, ease: EASE, delay: i * 0.06 }}
            >
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`Ampliar: ${item.label}`}
                className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden border [border-color:var(--d-line)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--d-accent)]"
                style={{ borderRadius: "var(--d-radius)" }}
              >
                <LoopVideo media={item.media} fit="cover" className="absolute inset-0 h-full w-full" />
                <span
                  aria-hidden="true"
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center bg-[rgba(20,20,22,0.7)] text-white transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100"
                  style={{ borderRadius: "var(--d-radius)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
                  </svg>
                </span>
              </button>
              <figcaption className="mt-3 text-[14px] font-medium leading-snug" style={{ color: "var(--d-fg)" }}>
                {item.label}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === e.currentTarget && setOpen(null)}
        onKeyDown={(e) => {
          if (e.key.startsWith("Arrow") || e.key.startsWith("Page") || e.key === "Home" || e.key === "End") e.stopPropagation();
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        aria-label={current?.label ?? chapter.title}
        className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-[rgba(14,14,16,0.88)]"
      >
        {current && (
          <div className="flex w-[min(92vw,calc((92svh-96px)*4/3))] flex-col gap-4 text-white">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[14px] font-medium">
                {current.label} <span className="opacity-60">· {open! + 1}/{n}</span>
              </p>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="min-h-[44px] px-2 text-[12px] font-semibold uppercase tracking-[0.12em] opacity-80 hover:opacity-100"
              >
                Fechar
              </button>
            </div>
            <div className="relative aspect-[4/3] w-full overflow-hidden" style={{ borderRadius: "var(--d-radius)" }}>
              <LoopVideo key={open} media={current.media} eager fit="cover" className="absolute inset-0 h-full w-full" />
            </div>
            {n > 1 && (
              <div className="flex justify-between">
                <button type="button" onClick={() => step(-1)} className="min-h-[44px] px-2 text-[13px] opacity-80 hover:opacity-100">
                  ← Anterior
                </button>
                <button type="button" onClick={() => step(1)} className="min-h-[44px] px-2 text-[13px] opacity-80 hover:opacity-100">
                  Próximo →
                </button>
              </div>
            )}
          </div>
        )}
      </dialog>
    </Chapter>
  );
}
