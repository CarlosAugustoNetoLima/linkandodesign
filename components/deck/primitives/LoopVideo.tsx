"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/components/deck/cx";
import { useReduced } from "@/components/deck/useReduced";
import type { Media } from "@/lib/decks/types";

type Props = {
  media: Media;
  className?: string;
  eager?: boolean;
  fit?: "cover" | "contain";
  still?: boolean;
  stillSrc?: string;
};

export default function LoopVideo({ media, className, eager = false, fit = "cover", still, stillSrc }: Props) {
  const reduced = useReduced();
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(eager);

  useEffect(() => {
    const el = ref.current;
    if (eager || near || !el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager, near]);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !near) return;
    if (still) {
      el.pause();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      el.pause();
    };
  }, [near, reduced, still]);

  return (
    <div className={cx("relative h-full w-full overflow-hidden", className)}>
      <video
        ref={ref}
        className={cx("h-full w-full", fit === "contain" ? "object-contain" : "object-cover")}
        src={near && !reduced ? media.src : undefined}
        poster={media.poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={media.alt}
      />
      
      {still !== undefined && (
        <img
          src={stillSrc ?? media.poster}
          alt=""
          aria-hidden="true"
          draggable={false}
          onError={(e) => {
            if (e.currentTarget.getAttribute("src") !== media.poster) e.currentTarget.src = media.poster;
          }}
          className={cx(
            "pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-300",
            fit === "contain" ? "object-contain" : "object-cover",
            still ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </div>
  );
}
