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
};

// Vídeo em loop do site apresentado. O arquivo só é pedido perto da tela, toca
// só enquanto está visível e nunca toca com prefers-reduced-motion (fica o poster).
export default function LoopVideo({ media, className, eager = false, fit = "cover" }: Props) {
  const reduced = useReduced();
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(eager);

  // Atribui o src quando o elemento chega a 300 px da viewport.
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

  // Toca quando pelo menos 25% aparece e pausa ao sair.
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !near) return;
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
  }, [near, reduced]);

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
    </div>
  );
}
