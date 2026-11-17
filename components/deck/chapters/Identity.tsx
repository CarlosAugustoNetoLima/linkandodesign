"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { chapterNumber } from "@/components/deck/chapterIndex";
import { cx } from "@/components/deck/cx";
import Chapter from "@/components/deck/primitives/Chapter";
import Eyebrow from "@/components/deck/primitives/Eyebrow";
import WordReveal from "@/components/deck/primitives/WordReveal";
import { useReduced } from "@/components/deck/useReduced";
import { deckFontFamily } from "@/lib/decks/fonts";
import type { Deck, IdentityChapter } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type SwatchData = IdentityChapter["swatches"][number];
type FontSpec = IdentityChapter["fonts"][number];

const SIZES: Record<FontSpec["size"], string> = {
  xl: "clamp(2.4rem, 5vw, 4.6rem)",
  lg: "clamp(2rem, 4vw, 3.4rem)",
  md: "clamp(1.15rem, 1.8vw, 1.5rem)",
  sm: "0.75rem",
};

// Luminância relativa (WCAG) de um #rrggbb.
function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Texto sobre a cor: #111 ou #fff, o que tiver mais contraste.
function readableOn(hex: string): string {
  const l = luminance(hex);
  const withWhite = 1.05 / (l + 0.05);
  const withDark = (l + 0.05) / (luminance("#111111") + 0.05);
  return withWhite >= withDark ? "#fff" : "#111";
}

// Amostra de cor: expande no hover (md+), copia o hex no clique e entra com scaleY.
// O gatilho da entrada é a faixa (pai), não o próprio swatch: um elemento com scaleY 0 não tem
// área, e o IntersectionObserver podia nunca disparar (a paleta ficava invisível).
function Swatch({ swatch, index }: { swatch: SwatchData; index: number }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const ink = readableOn(swatch.hex);
  // swatch claro (texto escuro) ganha borda: sobre o papel, branco e papel se confundem
  const light = ink === "#111";

  async function copy() {
    try {
      await navigator.clipboard.writeText(swatch.hex);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // sem permissão de clipboard: o hex segue visível e nada muda
    }
  }

  return (
    <motion.button
      type="button"
      onClick={copy}
      aria-label={`${swatch.name} ${swatch.hex}, copiar`}
      className="group relative flex-none h-[72px] md:h-auto md:flex-1 md:hover:grow-[3.2] md:focus-visible:grow-[3.2] overflow-hidden text-left transition-[flex-grow] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px]"
      style={{
        background: swatch.hex,
        color: ink,
        outlineColor: ink,
        transformOrigin: "bottom",
        border: light ? "1px solid var(--d-line)" : undefined,
      }}
      variants={{
        hidden: { scaleY: 0 },
        show: { scaleY: 1, transition: { duration: 1.1, ease: EASE, delay: index * 0.08 } },
      }}
    >
      <span className="absolute inset-x-0 bottom-0 block p-3 leading-tight md:p-5">
        <span className="block text-[13px] font-medium">{swatch.name}</span>
        <span className="deck-mono block text-[12px]">{copied ? "Copiado ✓" : swatch.hex}</span>
        <span className="block text-[12px] opacity-100 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
          {swatch.role}
        </span>
      </span>
    </motion.button>
  );
}

// Card de tipografia: a fonte real do site, revelada em máscara; no hover o tracking abre.
function FontCard({ font, index, reduced }: { font: FontSpec; index: number; reduced: boolean | null }) {
  const lineHeight = font.size === "xl" || font.size === "lg" ? 1.05 : 1.5;

  return (
    <div
      className="group flex flex-col p-7"
      style={{ border: "1px solid var(--d-line)", background: "var(--d-bg-alt)", borderRadius: "var(--d-radius)" }}
    >
      <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--d-fg-muted)" }}>
        {font.name} — {font.role}
      </p>

      {/* o gatilho é a máscara (parada), não o span que sai dela: assim o IntersectionObserver dispara */}
      <motion.div
        className="mt-6 overflow-hidden"
        initial={reduced ? false : "hidden"}
        whileInView={reduced ? undefined : "show"}
        viewport={{ once: true }}
      >
        <motion.span
          className={cx(
            "block py-[0.12em] transition-[letter-spacing] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] [letter-spacing:var(--track)] group-hover:[letter-spacing:calc(var(--track)_+_0.06em)]",
            font.uppercase && "uppercase",
          )}
          style={
            {
              fontWeight: font.weight,
              fontFamily: font.fontKey ? deckFontFamily[font.fontKey] : undefined,
              fontStretch: font.wide ? "var(--d-display-stretch, 100%)" : undefined,
              fontSize: SIZES[font.size],
              lineHeight,
              "--track": font.tracking ?? "0em",
            } as CSSProperties
          }
          variants={{
            hidden: { y: "105%" },
            show: { y: 0, transition: { duration: 1.1, ease: EASE, delay: index * 0.1 } },
          }}
        >
          {font.sample}
        </motion.span>
      </motion.div>

      <p className="mt-5 text-[14px] leading-relaxed" style={{ color: "var(--d-fg-muted)" }}>
        {font.note}
      </p>
    </div>
  );
}

// Identidade: paleta que se expande e tipografia viva.
// Com prefers-reduced-motion fica tudo estático e no estado final.
export default function Identity({ chapter, deck }: { chapter: IdentityChapter; deck: Deck }) {
  const reduced = useReduced();

  return (
    <Chapter id={chapter.id}>
      <div className="deck-container">
        <Eyebrow index={chapterNumber(deck, chapter.id)}>{chapter.eyebrow}</Eyebrow>
        <WordReveal as="h2" className="deck-h2 mt-5" text={chapter.title} />

        <motion.div
          className="mt-14 flex flex-col gap-[2px] overflow-hidden md:h-[clamp(220px,36vh,340px)] md:flex-row"
          style={{ border: "1px solid var(--d-line)", borderRadius: "var(--d-radius)" }}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "show"}
          viewport={{ once: true }}
        >
          {chapter.swatches.map((s, i) => (
            <Swatch key={s.name} swatch={s} index={i} />
          ))}
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2">
          {chapter.fonts.map((f, i) => (
            <FontCard key={f.name} font={f} index={i} reduced={reduced} />
          ))}
        </div>
      </div>
    </Chapter>
  );
}
