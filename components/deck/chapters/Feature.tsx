"use client";

import { motion, type Variants, useMotionValue, useSpring, useTransform } from "framer-motion";
import { type CSSProperties, type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import { chapterNumber } from "@/components/deck/chapterIndex";
import { cx } from "@/components/deck/cx";
import Chapter from "@/components/deck/primitives/Chapter";
import DeviceFrame from "@/components/deck/primitives/DeviceFrame";
import Eyebrow from "@/components/deck/primitives/Eyebrow";
import LoopVideo from "@/components/deck/primitives/LoopVideo";
import { TourDesktop, TourMobile, type TourStep, useTour } from "@/components/deck/primitives/Tour";
import WordReveal from "@/components/deck/primitives/WordReveal";
import { useReduced } from "@/components/deck/useReduced";
import type { Deck, FeatureChapter } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const TILT_SPRING = { stiffness: 120, damping: 18 };

const FULL_MEDIA: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};
const FULL_GAP = 40;
const FULL_HEAD_FALLBACK_PX = 140;

export default function Feature({ chapter, deck }: { chapter: FeatureChapter; deck: Deck }) {
  const reduced = useReduced();

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
  const host = deck.frameHost ?? new URL(deck.liveUrl).host;
  const phone = chapter.mediaKind === "mobile";
  const full = chapter.layout === "full";
  const large = !!deck.largeMedia && !phone && !full;
  const frameMax = `calc((100svh - var(--deck-bar-h) - var(--sp-1) - ${deck.mediaFramed ? 2 : 36}px) * ${aspect.toFixed(4)})`;

  const headRef = useRef<HTMLDivElement>(null);
  const [headPx, setHeadPx] = useState(FULL_HEAD_FALLBACK_PX);
  useEffect(() => {
    const el = headRef.current;
    if (!el || !full) return;
    const ro = new ResizeObserver(() => setHeadPx(Math.ceil(el.getBoundingClientRect().height)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [full]);
  const fullMax = `calc((100svh - var(--deck-bar-h) - var(--sp-1) - ${headPx}px - ${FULL_GAP}px - ${deck.mediaFramed ? 2 : 36}px) * ${aspect.toFixed(4)})`;

  const steps: TourStep[] = [
    { title: "Visão geral", text: chapter.body },
    ...chapter.specs.map((s) => ({ title: s.k, text: s.v, at: s.at })),
    ...(chapter.decision ? [{ tag: "Decisão", title: chapter.decision.title, text: chapter.decision.text }] : []),
  ];
  const tour = useTour(steps);

  const link = chapter.link && ((visibility: string) => (
    <a
      href={chapter.link!.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cx(
        "mt-6 min-h-[44px] self-start items-center gap-2 border border-[color:var(--d-line)] px-6 py-3 font-semibold text-[color:var(--d-fg)] transition-colors duration-200 hover:border-[color:var(--d-accent)] focus-visible:border-[color:var(--d-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--d-accent)]",
        visibility,
      )}
      style={{ borderRadius: "var(--d-radius)" }}
    >
      {chapter.link!.label} <span aria-hidden="true">↗</span><span className="sr-only"> (abre em nova aba)</span>
    </a>
  ));

  const mediaBox = (
    <motion.div
      className={cx("relative isolate", large && "lg:mx-auto lg:max-w-[var(--media-max)]")}
      style={{
        rotateX: reduced ? 0 : rotateX,
        rotateY: reduced ? 0 : rotateY,
        transformPerspective: 1200,
        ...(large ? { "--media-max": frameMax } : {}),
      } as CSSProperties}
      onPointerMove={tilt}
      onPointerLeave={untilt}
    >
      
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
        <div
          className="mx-auto max-w-[300px] lg:max-w-[var(--phone-w)]"
          style={{ "--phone-w": `clamp(220px, calc((100svh - 190px) * ${aspect.toFixed(4)} + 20px), 300px)` } as CSSProperties}
        >
          <DeviceFrame kind="phone" aspect={aspect}>
            <LoopVideo media={media} still={tour.still} />
          </DeviceFrame>
        </div>
      ) : (
        <DeviceFrame kind="browser" url={chapter.frameUrl ?? host} aspect={aspect} bare={deck.mediaFramed}>
          <LoopVideo media={media} still={tour.still} />
        </DeviceFrame>
      )}
    </motion.div>
  );

  if (full) {
    return (
      <Chapter id={chapter.id} className="[overflow-anchor:none]">
        <div className="deck-container">
          
          <div className="mx-auto w-full min-w-0" style={{ maxWidth: fullMax }}>
          <div ref={headRef} className="lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-x-12">
            <div className="min-w-0">
              <Eyebrow index={chapterNumber(deck, chapter.id)}>{chapter.eyebrow}</Eyebrow>
              <WordReveal
                as="h2"
                className="deck-h2 mt-5"
                style={{ fontSize: "clamp(1.5rem, 2.4vw, 2.3rem)" }}
                text={chapter.title}
              />
            </div>
            {link?.("inline-flex lg:mt-0")}
          </div>

          <motion.div
            className="mt-10 w-full min-w-0"
            initial={reduced ? false : "hidden"}
            whileInView={reduced ? undefined : "show"}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            variants={reduced ? undefined : FULL_MEDIA}
          >
            {mediaBox}
          </motion.div>
          </div>

          
          <p className="sr-only">{chapter.body}</p>
        </div>
      </Chapter>
    );
  }

  const side = chapter.side === "left";

  return (
    <Chapter id={chapter.id} className="[overflow-anchor:none]">
      <div className="deck-container">
        
        <div
          className={cx(
            "grid grid-cols-[minmax(0,1fr)] items-center gap-x-16 gap-y-12",
            large && "lg:gap-x-10",
            large
              ? side
                ? "lg:grid-cols-[minmax(0,77fr)_minmax(280px,23fr)]"
                : "lg:grid-cols-[minmax(280px,23fr)_minmax(0,77fr)]"
              : side
                ? "lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"
                : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]",
          )}
        >
          <div className={cx("order-1 min-w-0", side ? "lg:order-2" : "lg:order-1")}>
            <motion.div layout={reduced ? false : "position"} transition={{ duration: 0.5, ease: EASE }}>
              <Eyebrow index={chapterNumber(deck, chapter.id)}>{chapter.eyebrow}</Eyebrow>
              <WordReveal
                as="h2"
                className="deck-h2 mt-6"
                style={{ fontSize: "clamp(1.5rem, 2.4vw, 2.3rem)" }}
                text={chapter.title}
              />
            </motion.div>

            {large ? (
              <div className="[&_.deck-body]:!text-[14px]">
                <TourDesktop tour={tour} />
              </div>
            ) : (
              <TourDesktop tour={tour} />
            )}
            {link?.("hidden lg:inline-flex")}
          </div>

          <div className={cx("order-2 min-w-0", side ? "lg:order-1" : "lg:order-2")}>{mediaBox}</div>

          
          
          <div className="order-3 min-w-0 lg:hidden">
            <TourMobile tour={tour} />
            {link?.("flex w-full justify-center")}
          </div>
        </div>
      </div>
    </Chapter>
  );
}
