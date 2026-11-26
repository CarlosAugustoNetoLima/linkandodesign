"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { chapterNumber } from "@/components/deck/chapterIndex";
import { cx } from "@/components/deck/cx";
import Chapter from "@/components/deck/primitives/Chapter";
import Eyebrow from "@/components/deck/primitives/Eyebrow";
import MotionTokens from "@/components/deck/primitives/MotionTokens";
import WordReveal from "@/components/deck/primitives/WordReveal";
import { useReduced } from "@/components/deck/useReduced";
import { deckFontFamily } from "@/lib/decks/fonts";
import type { Deck, IdentityChapter } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type SwatchData = IdentityChapter["swatches"][number];
type FontSpec = IdentityChapter["fonts"][number];
type IconSet = NonNullable<IdentityChapter["icons"]>;
type IconSpec = IconSet["items"][number];
type SystemSpec = NonNullable<IdentityChapter["system"]>;

const ICON_CSS = `
.ico-pen :is(path,circle,rect,line,polyline,polygon){stroke-dasharray:1 1;stroke-dashoffset:0;animation:ico-pen 3s cubic-bezier(0.45,0,0.25,1) infinite both;animation-delay:var(--d,0s)}
.ico-pen > :nth-child(2){animation-delay:calc(var(--d,0s) + .25s)}
.ico-pen > :nth-child(3){animation-delay:calc(var(--d,0s) + .5s)}
.ico-pen > :nth-child(4){animation-delay:calc(var(--d,0s) + .75s)}
.ico-pen > :nth-child(n+5){animation-delay:calc(var(--d,0s) + 1s)}
@keyframes ico-pen{0%{stroke-dashoffset:1;opacity:1}50%,62%{stroke-dashoffset:0;opacity:1}92%,100%{stroke-dashoffset:0;opacity:0}}
.ico-fx [data-fx]{transform-box:fill-box;transform-origin:center;animation:2.8s cubic-bezier(.16,1,.3,1) infinite both;animation-delay:var(--d,0s)}
.ico-fx [data-fx=scale]{animation-name:ico-fx-scale}
.ico-fx [data-fx=scale-left]{transform-origin:left center;animation-name:ico-fx-scale}
.ico-fx [data-fx=rotate]{animation-name:ico-fx-rotate}
.ico-fx [data-fx=nudge]{animation:ico-fx-nudge 2.4s ease-in-out infinite}
.ico-fx [data-fx=nudge-left]{animation:ico-fx-nudge-left 2.4s ease-in-out infinite}
@keyframes ico-fx-nudge{0%,100%{transform:translateX(0);opacity:.5}50%{transform:translateX(7px);opacity:1}}
@keyframes ico-fx-nudge-left{0%,100%{transform:translateX(0);opacity:.5}50%{transform:translateX(-7px);opacity:1}}
@keyframes ico-fx-scale{0%,30%{transform:scaleX(1)}45%,80%{transform:scaleX(.7)}95%,100%{transform:scaleX(1)}}
@keyframes ico-fx-rotate{0%,30%{transform:rotate(0)}52%,80%{transform:rotate(60deg)}100%{transform:rotate(0)}}
`;

function penShapes(shapes: string): string {
  return shapes.replace(/<(path|circle|rect|line|polyline|polygon)\b/g, '<$1 pathLength="1"');
}

const SIZES: Record<FontSpec["size"], string> = {
  xl: "clamp(2.4rem, 5vw, 4.6rem)",
  lg: "clamp(2rem, 4vw, 3.4rem)",
  md: "clamp(1.15rem, 1.8vw, 1.5rem)",
  sm: "0.75rem",
};

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function readableOn(hex: string): string {
  const l = luminance(hex);
  const withWhite = 1.05 / (l + 0.05);
  const withDark = (l + 0.05) / (luminance("#111111") + 0.05);
  return withWhite >= withDark ? "#fff" : "#111";
}

function Swatch({ swatch, index }: { swatch: SwatchData; index: number }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const ink = readableOn(swatch.hex);
  const light = ink === "#111";

  async function copy() {
    try {
      await navigator.clipboard.writeText(swatch.hex);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1400);
    } catch {
    }
  }

  return (
    <motion.button
      type="button"
      onClick={copy}
      aria-label={`${swatch.name} ${swatch.hex}, copiar`}
      className="group relative flex-none min-h-[72px] md:min-h-0 md:h-auto md:flex-1 md:hover:grow-[3.2] md:focus-visible:grow-[3.2] overflow-hidden text-left transition-[flex-grow] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px]"
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
      
      <span className="relative block p-3 leading-tight md:absolute md:inset-x-0 md:bottom-0 md:p-5">
        <span className="block text-[13px] font-medium">{swatch.name}</span>
        <span className="deck-mono block text-[12px]">{copied ? "Copiado ✓" : swatch.hex}</span>
        <span className="block text-[12px] opacity-100 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
          {swatch.role}
        </span>
      </span>
    </motion.button>
  );
}

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

function IconCard({ item, index, reduced, stroke }: { item: IconSpec; index: number; reduced: boolean | null; stroke: number }) {
  const svgProps = {
    width: 44,
    height: 44,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-4 border border-[color:var(--d-line)] p-6"
      style={{ borderRadius: "var(--d-radius)", "--d": `${(index % 6) * 0.18}s` } as CSSProperties}
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE, delay: index * 0.05 } },
      }}
    >
      {item.cls ? (
        <svg
          {...svgProps}
          className={item.cls}
          style={{ color: "var(--d-fg)", "--ic-accent": "var(--d-accent)" } as CSSProperties}
          dangerouslySetInnerHTML={{ __html: item.shapes }}
        />
      ) : (
      <svg {...svgProps} style={{ color: "var(--d-accent)" }}>
        {reduced ? (
          <g dangerouslySetInnerHTML={{ __html: item.shapes }} />
        ) : item.hover ? (
          <g className="ico-fx" dangerouslySetInnerHTML={{ __html: item.shapes }} />
        ) : (
          <>
            <g className="ico-ghost" style={{ opacity: 0.3 }} dangerouslySetInnerHTML={{ __html: item.shapes }} />
            <g className="ico-pen" dangerouslySetInnerHTML={{ __html: penShapes(item.shapes) }} />
          </>
        )}
      </svg>
      )}
      <span className="text-[13px]" style={{ color: "var(--d-fg-muted)" }}>
        {item.label}
      </span>
    </motion.div>
  );
}

const REVEAL = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

function SystemHead({ title, note }: { title: string; note: string }) {
  return (
    <>
      <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--d-fg-muted)" }}>
        {title}
      </p>
      <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--d-fg-muted)" }}>
        {note}
      </p>
    </>
  );
}

function TypeScale({ spec, reduced }: { spec: SystemSpec["type"]; reduced: boolean | null }) {
  return (
    <motion.div
      className="min-w-0"
      initial={reduced ? false : "hidden"}
      whileInView={reduced ? undefined : "show"}
      viewport={{ once: true }}
      variants={REVEAL}
    >
      <SystemHead title={spec.title} note={spec.note} />
      <div className="mt-8 grid grid-cols-[minmax(0,1fr)]">
        {spec.steps.map((s, i) => {
          const size =
            s.max >= 24
              ? `clamp(${s.min * 0.5}px, ${((s.max * 0.62) / 14.4).toFixed(2)}vw, ${s.max * 0.62}px)`
              : `${s.max}px`;
          const range = s.min === s.max ? `${s.max} px` : `${s.min}–${s.max} px`;

          return (
            <div
              key={`${s.name}-${i}`}
              className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 border-t border-[color:var(--d-line)] py-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8"
            >
              <div className="min-w-0">
                <p className="text-[14px] font-semibold" style={{ color: "var(--d-fg)" }}>
                  {s.name}
                </p>
                <p className="mt-1 text-[13px]" style={{ color: "var(--d-fg-muted)" }}>
                  {`${range} · peso ${s.weight}`}
                </p>
              </div>
              <p
                className="min-w-0 break-words"
                style={{
                  fontFamily: s.font === "body" ? "var(--d-font)" : "var(--d-font-display, var(--d-font))",
                  fontWeight: s.weight,
                  fontSize: size,
                  letterSpacing: s.tracking,
                  textTransform: s.uppercase ? "uppercase" : undefined,
                  fontStretch: s.stretch ? `${s.stretch}%` : undefined,
                  lineHeight: 1.05,
                  color: "var(--d-fg)",
                }}
              >
                {s.sample}
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function SpacingScale({ spec, reduced }: { spec: SystemSpec["spacing"]; reduced: boolean | null }) {
  return (
    <motion.div
      className="min-w-0"
      initial={reduced ? false : "hidden"}
      whileInView={reduced ? undefined : "show"}
      viewport={{ once: true }}
      variants={REVEAL}
    >
      <SystemHead title={spec.title} note={spec.note} />
      <div className="mt-8 flex flex-col gap-3">
        {spec.steps.map((s, i) => (
          <div key={`${s.px}-${i}`} className="flex min-w-0 items-center gap-4">
            <span
              className="w-[44px] flex-none text-[15px] font-semibold tabular-nums"
              style={{ color: "var(--d-fg)" }}
            >
              {s.px}
            </span>
            
            <span className="flex-none" style={{ width: `${Math.max(...spec.steps.map((t) => t.px))}px` }}>
              <span
                className="block h-[10px]"
                style={{ width: `${s.px}px`, background: "var(--d-accent)", borderRadius: "2px" }}
              />
            </span>
            <span className="min-w-0 text-[13px]" style={{ color: "var(--d-fg-muted)" }}>
              {s.use}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function GridScheme({ spec, reduced }: { spec: SystemSpec["grid"]; reduced: boolean | null }) {
  return (
    <motion.div
      className="min-w-0"
      initial={reduced ? false : "hidden"}
      whileInView={reduced ? undefined : "show"}
      viewport={{ once: true }}
      variants={REVEAL}
    >
      <SystemHead title={spec.title} note={spec.note} />

      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4">
        {spec.items.map((it, i) => (
          <div key={`${it.k}-${i}`} className="min-w-0">
            <p className="text-[13px]" style={{ color: "var(--d-fg-muted)" }}>
              {it.k}
            </p>
            <p className="text-[15px] font-semibold" style={{ color: "var(--d-fg)" }}>
              {it.v}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-6">
        {spec.splits.map((sp, i) => (
          <div key={`${sp.name}-${i}`} className="min-w-0">
            <p className="text-[13px]" style={{ color: "var(--d-fg-muted)" }}>
              {sp.name}
            </p>
            <div
              className="mt-2 grid h-[36px] gap-2"
              style={{ gridTemplateColumns: sp.cols.map((c) => `${c}fr`).join(" ") }}
            >
              {sp.cols.map((c, j) => (
                <div
                  key={j}
                  className="flex min-w-0 items-center justify-center text-[12px]"
                  style={{
                    background: "color-mix(in srgb, var(--d-accent) 14%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--d-accent) 40%, transparent)",
                    borderRadius: "var(--d-radius)",
                    color: "var(--d-fg)",
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        {spec.dots.map((d, i) => (
          <div key={`${d.name}-${i}`} className="min-w-0">
            <div
              className="h-[110px] w-[150px] max-w-full"
              style={{
                background: d.bg,
                backgroundImage: `radial-gradient(circle, ${d.dot} 1px, transparent 1.2px)`,
                backgroundSize: `${d.size}px ${d.size}px`,
                border: "1px solid var(--d-line)",
                borderRadius: "var(--d-radius)",
              }}
            />
            <p className="mt-2 text-[13px]" style={{ color: "var(--d-fg-muted)" }}>
              {`${d.name} · ${d.size} px`}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Identity({ chapter, deck }: { chapter: IdentityChapter; deck: Deck }) {
  const reduced = useReduced();
  const icons = chapter.icons;
  const illustrations = chapter.illustrations;
  const system = chapter.system;
  const motionBlock = chapter.motion;

  return (
    <Chapter id={chapter.id}>
      <div className="deck-container">
        <Eyebrow index={chapterNumber(deck, chapter.id)}>{chapter.eyebrow}</Eyebrow>
        <WordReveal as="h2" className="deck-h2 mt-5" text={chapter.title} />

        <motion.div
          className="mt-[var(--sp-3)] flex flex-col gap-[2px] overflow-hidden md:h-[clamp(220px,36vh,340px)] md:flex-row"
          style={{ border: "1px solid var(--d-line)", borderRadius: "var(--d-radius)" }}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "show"}
          viewport={{ once: true }}
        >
          {chapter.swatches.map((s, i) => (
            <Swatch key={s.name} swatch={s} index={i} />
          ))}
        </motion.div>

        <div className="mt-[var(--sp-2)] grid grid-cols-1 gap-4 md:grid-cols-2">
          {chapter.fonts.map((f, i) => (
            <FontCard key={`${f.name}-${f.role}`} font={f} index={i} reduced={reduced} />
          ))}
        </div>

        {icons && (
          <motion.div
            className="mt-[var(--sp-2)]"
            initial={reduced ? false : "hidden"}
            whileInView={reduced ? undefined : "show"}
            viewport={{ once: true }}
          >
            <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--d-fg-muted)" }}>
              {icons.title}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "var(--d-fg-muted)" }}>
              {icons.note}
            </p>
            <style dangerouslySetInnerHTML={{ __html: ICON_CSS }} />
            {icons.css && <style dangerouslySetInnerHTML={{ __html: icons.css }} />}
            <div className="mt-8 grid grid-cols-[repeat(3,minmax(0,1fr))] gap-3 md:grid-cols-[repeat(4,minmax(0,1fr))] lg:grid-cols-[repeat(6,minmax(0,1fr))]">
              {icons.items.map((item, i) => (
                <IconCard key={item.label} item={item} index={i} reduced={reduced || (icons.animated === false && !item.hover)} stroke={icons.stroke ?? 2} />
              ))}
            </div>
          </motion.div>
        )}

        {illustrations && (
          <motion.div
            className="mt-[var(--sp-2)]"
            initial={reduced ? false : "hidden"}
            whileInView={reduced ? undefined : "show"}
            viewport={{ once: true }}
            variants={REVEAL}
          >
            <SystemHead title={illustrations.title} note={illustrations.note} />
            <style dangerouslySetInnerHTML={{ __html: illustrations.css }} />
            <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {illustrations.items.map((item) => (
                <figure
                  key={item.label}
                  className="flex flex-col gap-4 p-5"
                  style={{ background: illustrations.background, borderRadius: "var(--d-radius)" }}
                >
                  
                  <div className="aspect-[6/5] w-full" dangerouslySetInnerHTML={{ __html: item.svg }} />
                  <figcaption className="text-[13px] text-white/70">{item.label}</figcaption>
                </figure>
              ))}
            </div>
          </motion.div>
        )}

        {system && (
          <>
            <div className="mt-[var(--sp-2)]">
              <TypeScale spec={system.type} reduced={reduced} />
            </div>
            <div className="mt-[var(--sp-2)] grid grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-[var(--sp-2)] lg:grid-cols-2">
              <SpacingScale spec={system.spacing} reduced={reduced} />
              <GridScheme spec={system.grid} reduced={reduced} />
            </div>
          </>
        )}

        {motionBlock && (
          <motion.div
            className="mt-[var(--sp-2)] min-w-0"
            initial={reduced ? false : "hidden"}
            whileInView={reduced ? undefined : "show"}
            viewport={{ once: true }}
            variants={REVEAL}
          >
            <SystemHead title={motionBlock.title} note={motionBlock.note} />
            <div className="mt-8">
              <MotionTokens tokens={motionBlock.tokens} reduced={reduced} />
            </div>
          </motion.div>
        )}
      </div>
    </Chapter>
  );
}
