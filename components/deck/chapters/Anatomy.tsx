"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cx } from "@/components/deck/cx";
import { chapterNumber } from "@/components/deck/chapterIndex";
import Chapter from "@/components/deck/primitives/Chapter";
import DeviceFrame from "@/components/deck/primitives/DeviceFrame";
import Eyebrow from "@/components/deck/primitives/Eyebrow";
import LoopVideo from "@/components/deck/primitives/LoopVideo";
import { TourDesktop, TourMobile, type TourStep, useTour } from "@/components/deck/primitives/Tour";
import WordReveal from "@/components/deck/primitives/WordReveal";
import { useReduced } from "@/components/deck/useReduced";
import type { AnatomyChapter, Deck } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function Anatomy({ chapter, deck }: { chapter: AnatomyChapter; deck: Deck }) {
  const reduced = useReduced();

  const { pins, media } = chapter;
  const aspect = media.width / media.height;
  const host = deck.frameHost ?? new URL(deck.liveUrl).host;
  const large = !!deck.largeMedia;
  const frameMax = `calc((100svh - var(--deck-bar-h) - var(--sp-1) - ${deck.mediaFramed ? 2 : 36}px) * ${aspect.toFixed(4)})`;

  const steps: TourStep[] = pins.map((p) => ({ title: p.title, text: p.why, at: { x: p.x, y: p.y, r: p.r } }));
  const tour = useTour(steps);

  return (
    <Chapter id={chapter.id} className="[overflow-anchor:none]">
      <div className="deck-container">
        <div
          className={cx(
            "grid grid-cols-[minmax(0,1fr)] items-center gap-x-16 gap-y-12",
            large && "lg:gap-x-10",
            large ? "lg:grid-cols-[minmax(0,77fr)_minmax(280px,23fr)]" : "lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]",
          )}
        >
          <div className="order-1 min-w-0 lg:order-2">
            <motion.div layout={reduced ? false : "position"} transition={{ duration: 0.5, ease: EASE }}>
              <Eyebrow index={chapterNumber(deck, chapter.id)}>{chapter.eyebrow}</Eyebrow>
              <WordReveal
                as="h2"
                className="deck-h2 mt-6"
                style={{ fontSize: large ? "clamp(1.5rem, 2.4vw, 2.3rem)" : "clamp(1.6rem, 2.8vw, 2.6rem)" }}
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
            className={cx("order-2 min-w-0 lg:order-1", large && "lg:mx-auto lg:max-w-[var(--media-max)]")}
            style={large ? ({ "--media-max": frameMax } as CSSProperties) : undefined}
          >
            <DeviceFrame kind="browser" url={host} aspect={aspect} bare={deck.mediaFramed}>
              
              <LoopVideo media={media} eager still={tour.still} stillSrc={media.src.replace(/\.mp4$/, "-start.jpg")} />
            </DeviceFrame>
          </div>

          
          <TourMobile tour={tour} className="order-3" />
        </div>
      </div>
    </Chapter>
  );
}
