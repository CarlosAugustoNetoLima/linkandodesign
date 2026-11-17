"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { chapterNumber } from "@/components/deck/chapterIndex";
import { cx } from "@/components/deck/cx";
import Chapter from "@/components/deck/primitives/Chapter";
import DeviceFrame from "@/components/deck/primitives/DeviceFrame";
import Eyebrow from "@/components/deck/primitives/Eyebrow";
import LoopVideo from "@/components/deck/primitives/LoopVideo";
import WordReveal from "@/components/deck/primitives/WordReveal";
import { useReduced } from "@/components/deck/useReduced";
import type { AnatomyChapter, Deck } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const pad = (n: number) => String(n).padStart(2, "0");

type Pin = AnatomyChapter["pins"][number];

type PinDotProps = { index: number; pin: Pin; active: boolean; onSelect: (i: number) => void };

// Ponto numerado sobre a gravação. O ativo fica preenchido e um pouco maior.
function PinDot({ index, pin, active, onSelect }: PinDotProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      aria-label={`Pin ${index + 1}: ${pin.title}`}
      aria-current={active ? "step" : undefined}
      className="pointer-events-auto absolute flex h-6 w-6 items-center justify-center text-[11px] transition-[transform,background-color,color] duration-300"
      style={{
        left: `${pin.x}%`,
        top: `${pin.y}%`,
        transform: `translate(-50%, -50%) scale(${active ? 1.15 : 1})`,
        borderRadius: "50%",
        border: "1px solid rgba(255,255,255,.85)",
        background: active ? "#fff" : "rgba(0,0,0,.55)",
        color: active ? "#111" : "#fff",
      }}
    >
      {index + 1}
    </button>
  );
}

// Anatomia: a gravação do site com pins que acendem um a um, conforme o scroll
// pinado. Em telas menores (ou com reduced motion) vira fluxo normal.
export default function Anatomy({ chapter, deck }: { chapter: AnatomyChapter; deck: Deck }) {
  const reduced = useReduced();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  // lg+ (o breakpoint do Tailwind), sincronizado com a janela
  const [wide, setWide] = useState(false);

  const { pins, media } = chapter;
  const N = pins.length;
  const pin = pins[active];
  const host = new URL(deck.liveUrl).host;
  // o pin só prende a tela no lg e sem reduced motion
  const pinned = !reduced;
  const wrapperStyle = pinned ? ({ "--anatomy-h": `${100 + N * 60}vh` } as CSSProperties) : undefined;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // O scroll só troca o pin ativo quando a seção está pinada no lg.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!pinned || !wide) return;
    setActive(Math.min(N - 1, Math.max(0, Math.floor(v * N))));
  });

  // Com o pin ativo no lg, o clique leva ao meio do trecho de scroll daquele pin.
  // Sem pin, só troca o cartão; no celular rola até o item da lista.
  function selectPin(i: number) {
    const behavior: ScrollBehavior = reduced ? "auto" : "smooth";
    const wrap = wrapperRef.current;
    if (pinned && wide && wrap) {
      const top = wrap.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + ((i + 0.5) / N) * (wrap.offsetHeight - window.innerHeight), behavior });
      return;
    }
    setActive(i);
    if (!wide) itemRefs.current[i]?.scrollIntoView({ behavior, block: "center" });
  }

  return (
    <Chapter id={chapter.id} style={pinned ? { padding: 0 } : undefined}>
      <div ref={wrapperRef} className={cx(pinned && "lg:h-[var(--anatomy-h)]")} style={wrapperStyle}>
        <div className={cx("deck-container", pinned && "deck-screen lg:sticky lg:top-0 lg:h-[100svh]")}>
          <div className="grid w-full gap-12 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
            <div className="min-w-0 lg:col-start-2 lg:row-start-1">
              <Eyebrow index={chapterNumber(deck, chapter.id)}>{chapter.eyebrow}</Eyebrow>
              <WordReveal
                as="h2"
                className="deck-h2 mt-6"
                style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.6rem)" }}
                text={chapter.title}
              />

              <div className="mt-10 hidden lg:block">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={reduced ? false : { opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? undefined : { opacity: 0, y: -18 }}
                    transition={{ duration: 0.45, ease: EASE }}
                  >
                    <p className="deck-mono text-[12px] tracking-[0.14em]" style={{ color: "var(--d-accent)" }}>
                      {pad(active + 1)} / {pad(N)}
                    </p>
                    <p
                      className="mt-4"
                      style={{
                        fontSize: "clamp(1.3rem, 2vw, 1.8rem)",
                        fontWeight: 500,
                        lineHeight: 1.2,
                        color: "var(--d-fg)",
                      }}
                    >
                      {pin.title}
                    </p>
                    <p className="deck-body mt-4">{pin.why}</p>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex gap-1.5">
                  {pins.map((_, i) => (
                    <span
                      key={i}
                      aria-hidden="true"
                      className="block h-[2px] w-7 transition-colors duration-300"
                      style={{
                        background:
                          i === active
                            ? "var(--d-accent)"
                            : i < active
                              ? "var(--d-fg-muted)"
                              : "var(--d-line)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="min-w-0 lg:col-start-1 lg:row-start-1">
              <DeviceFrame kind="browser" url={host} aspect={media.width / media.height}>
                <LoopVideo media={media} eager />

                {/* camada de anotação: escurece a gravação e marca o pin ativo */}
                <div className="pointer-events-none absolute inset-0">
                  <motion.div
                    aria-hidden="true"
                    className="absolute hidden lg:block"
                    initial={false}
                    animate={{
                      left: `${pin.x}%`,
                      top: `${pin.y}%`,
                      width: `${(pin.r ?? 12) * 2}%`,
                    }}
                    transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 110, damping: 20 }}
                    style={{
                      x: "-50%",
                      y: "-50%",
                      aspectRatio: "1",
                      borderRadius: "50%",
                      border: "1.5px solid rgba(255,255,255,.95)",
                      boxShadow: "0 0 0 200vmax rgba(0,0,0,0.42)",
                    }}
                  >
                    {!reduced && (
                      <motion.span
                        className="absolute inset-0 block"
                        style={{ border: "1px solid rgba(255,255,255,.95)", borderRadius: "50%" }}
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={{ scale: 1.25, opacity: 0 }}
                        transition={{ duration: 1.8, ease: "easeOut", repeat: Infinity }}
                      />
                    )}
                  </motion.div>

                  {pins.map((p, i) => (
                    <PinDot key={i} index={i} pin={p} active={i === active} onSelect={selectPin} />
                  ))}
                </div>
              </DeviceFrame>
            </div>

            <ol className="lg:hidden">
              {pins.map((p, i) => (
                <motion.li
                  key={i}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  className="grid grid-cols-[40px_1fr] gap-x-3 py-5"
                  style={{ borderTop: "1px solid var(--d-line)" }}
                  initial={reduced ? false : { opacity: 0, y: 20 }}
                  whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: EASE }}
                >
                  <span className="deck-mono pt-0.5 text-[12px]" style={{ color: "var(--d-accent)" }}>
                    {pad(i + 1)}
                  </span>
                  <div>
                    <p style={{ fontSize: 17, fontWeight: 500, color: "var(--d-fg)" }}>{p.title}</p>
                    <p className="deck-body mt-2" style={{ fontSize: 15 }}>
                      {p.why}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Chapter>
  );
}
