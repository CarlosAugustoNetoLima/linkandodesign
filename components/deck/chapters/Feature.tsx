"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { PointerEvent as ReactPointerEvent } from "react";
import { chapterNumber } from "@/components/deck/chapterIndex";
import { cx } from "@/components/deck/cx";
import Chapter from "@/components/deck/primitives/Chapter";
import DeviceFrame from "@/components/deck/primitives/DeviceFrame";
import Eyebrow from "@/components/deck/primitives/Eyebrow";
import LoopVideo from "@/components/deck/primitives/LoopVideo";
import WordReveal from "@/components/deck/primitives/WordReveal";
import { useReduced } from "@/components/deck/useReduced";
import type { Deck, FeatureChapter, Spec } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const TILT_SPRING = { stiffness: 120, damping: 18 };

type SpecRowProps = { spec: Spec; index: number; reduced: boolean | null };

// Spec da faixa: tile com hairline no topo, rótulo em cima e valor embaixo.
function SpecRow({ spec, index, reduced }: SpecRowProps) {
  return (
    <motion.div
      className="py-[18px]"
      style={{ borderTop: "1px solid var(--d-line)" }}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: EASE, delay: index * 0.06 }}
    >
      <dt className="text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--d-fg-muted)" }}>
        {spec.k}
      </dt>
      <dd className="mt-2 text-[15px] leading-[1.6]" style={{ color: "var(--d-fg)" }}>
        {spec.v}
      </dd>
    </motion.div>
  );
}

// Destaque: gravação em moldura de aparelho, com leve tilt pelo ponteiro. Mídia e texto
// ficam centralizados no mesmo eixo. O lado vem do campo `side`.
// Com reduced motion, nada se mexe.
export default function Feature({ chapter, deck }: { chapter: FeatureChapter; deck: Deck }) {
  const reduced = useReduced();

  // posição do ponteiro sobre a mídia, de -1 a 1 em cada eixo
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-1, 1], [-3, 3]), TILT_SPRING);
  const rotateX = useSpring(useTransform(py, [-1, 1], [2, -2]), TILT_SPRING);

  function tilt(e: ReactPointerEvent<HTMLDivElement>) {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 2 - 1);
    py.set(((e.clientY - r.top) / r.height) * 2 - 1);
  }

  function untilt() {
    px.set(0);
    py.set(0);
  }

  const { media } = chapter;
  const aspect = media.width / media.height;
  const host = new URL(deck.liveUrl).host;
  const phone = chapter.mediaKind === "mobile";

  const mediaBox = (
    <motion.div
      className="relative isolate"
      style={{
        rotateX: reduced ? 0 : rotateX,
        rotateY: reduced ? 0 : rotateY,
        transformPerspective: 1200,
      }}
      onPointerMove={tilt}
      onPointerLeave={untilt}
    >
      {/* brilho da cor de destaque atrás da moldura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-12%]"
        style={{
          zIndex: -1,
          background: "radial-gradient(closest-side, color-mix(in srgb, var(--d-accent) 18%, transparent), transparent)",
          filter: "blur(40px)",
        }}
      />
      {phone ? (
        <div className="mx-auto max-w-[300px]">
          <DeviceFrame kind="phone" aspect={aspect}>
            <LoopVideo media={media} />
          </DeviceFrame>
        </div>
      ) : (
        <DeviceFrame kind="browser" url={host} aspect={aspect}>
          <LoopVideo media={media} />
        </DeviceFrame>
      )}
    </motion.div>
  );

  const side = chapter.side === "left";

  return (
    <Chapter id={chapter.id}>
      <div className="deck-container">
        {/* a mídia fica sempre na coluna de 1.5fr: a template muda conforme o lado */}
        <div
          className={cx(
            "grid grid-cols-[minmax(0,1fr)] items-center gap-x-16 gap-y-12",
            side ? "lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]",
          )}
        >
          <div className={cx("min-w-0", side ? "lg:order-1" : "lg:order-2")}>{mediaBox}</div>

          <div className={cx("min-w-0", side ? "lg:order-2" : "lg:order-1")}>
            <Eyebrow index={chapterNumber(deck, chapter.id)}>{chapter.eyebrow}</Eyebrow>
            <WordReveal
              as="h2"
              className="deck-h2 mt-6"
              style={{ fontSize: "clamp(1.8rem, 3.1vw, 2.9rem)" }}
              text={chapter.title}
            />
            <motion.p
              className="deck-body mt-6"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              {chapter.body}
            </motion.p>

            {chapter.decision && (
              <motion.div
                className="mt-8 px-[22px] py-4"
                style={{
                  borderLeft: "2px solid var(--d-accent)",
                  background: "var(--d-bg-alt)",
                  borderRadius: "var(--d-radius)",
                }}
                initial={reduced ? false : { opacity: 0, y: 20 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.24em]" style={{ color: "var(--d-accent)" }}>
                  Decisão
                </p>
                <p className="mt-3" style={{ fontSize: 17, fontWeight: 500, color: "var(--d-fg)" }}>
                  {chapter.decision.title}
                </p>
                <p className="mt-2" style={{ fontSize: 14.5, lineHeight: 1.7, color: "var(--d-fg-muted)" }}>
                  {chapter.decision.text}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {chapter.specs.length > 0 && (
          <dl className="mt-16 grid grid-cols-1 gap-x-12 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
            {chapter.specs.map((s, i) => (
              <SpecRow key={s.k} spec={s} index={i} reduced={reduced} />
            ))}
          </dl>
        )}
      </div>
    </Chapter>
  );
}
