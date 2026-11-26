"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { chapterNumber } from "@/components/deck/chapterIndex";
import { cx } from "@/components/deck/cx";
import Chapter from "@/components/deck/primitives/Chapter";
import DeviceFrame from "@/components/deck/primitives/DeviceFrame";
import Eyebrow from "@/components/deck/primitives/Eyebrow";
import LoopVideo from "@/components/deck/primitives/LoopVideo";
import { TourDesktop, TourMobile, type TourStep, useTour } from "@/components/deck/primitives/Tour";
import WordReveal from "@/components/deck/primitives/WordReveal";
import { useReduced } from "@/components/deck/useReduced";
import type { Deck, ResponsiveChapter } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

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

export default function Responsive({ chapter, deck }: { chapter: ResponsiveChapter; deck: Deck }) {
  const reduced = useReduced();

  const { desktop, mobile } = chapter;
  const host = deck.frameHost ?? new URL(deck.liveUrl).host;
  const large = !!deck.largeMedia;
  const rowMax = `calc(((100svh - var(--deck-bar-h) - var(--sp-1) - 88px) * ${(desktop.width / desktop.height).toFixed(4)}) * 1.31 + 32px)`;

  const steps: TourStep[] = [
    { title: "Visão geral", text: chapter.body },
    ...chapter.notes.map((n) => ({ title: n.k, text: n.v, device: n.device })),
  ];
  const tour = useTour(steps);
  const target = tour.tour ? tour.step.device : undefined;
  const dim = (d: "desktop" | "mobile") => (target && target !== d ? 0.28 : 1);

  const mediaRight = chapter.side === "right";

  return (
    <Chapter id={chapter.id} className="[overflow-anchor:none]">
      <div className="deck-container">
        <div
          className={cx(
            "grid grid-cols-[minmax(0,1fr)] items-center gap-x-16 gap-y-12",
            large && "lg:gap-x-10",
            mediaRight
              ? large
                ? "lg:grid-cols-[minmax(280px,23fr)_minmax(0,77fr)]"
                : "lg:grid-cols-[minmax(0,1fr)_minmax(0,2.3fr)]"
              : large
                ? "lg:grid-cols-[minmax(0,77fr)_minmax(280px,23fr)]"
                : "lg:grid-cols-[minmax(0,2.3fr)_minmax(0,1fr)]",
          )}
        >
          <div className={cx("order-1 min-w-0", mediaRight ? "lg:order-1" : "lg:order-2")}>
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
          </div>

          <div
            className={cx("order-2 min-w-0", mediaRight ? "lg:order-2" : "lg:order-1", large && "lg:mx-auto lg:max-w-[var(--row-max)]")}
            style={large ? ({ "--row-max": rowMax } as CSSProperties) : undefined}
          >
            
            <div className="sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,0.31fr)] sm:items-end sm:gap-6 lg:gap-8">
              <motion.div
                animate={{ opacity: dim("desktop") }}
                transition={{ duration: reduced ? 0 : 0.4, ease: EASE }}
              >
                <DeviceFrame kind="browser" url={host} aspect={desktop.width / desktop.height} bare={deck.mediaFramed}>
                  <LoopVideo media={desktop} still={tour.still} />
                </DeviceFrame>
                <Ruler label="1280 px" reduced={reduced} />
              </motion.div>

              <motion.div
                className="mx-auto mt-12 max-w-[200px] sm:mx-0 sm:mt-0 sm:max-w-none"
                animate={{ opacity: dim("mobile") }}
                transition={{ duration: reduced ? 0 : 0.4, ease: EASE }}
              >
                <DeviceFrame kind="phone" aspect={mobile.width / mobile.height}>
                  <LoopVideo media={mobile} still={tour.still} />
                </DeviceFrame>
                <Ruler label="390 px" reduced={reduced} />
              </motion.div>
            </div>
          </div>

          
          <TourMobile tour={tour} className="order-3" />
        </div>
      </div>
    </Chapter>
  );
}
