"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeMotion } from "@/components/ui/motionController";

// As duas gravações do site, lado a lado: janela de navegador + telemóvel.
//
// Só anima o par mais centralizado no viewport de cada vez. Cada gravação é um
// webp de keyframes cheios (~1MB, 118 frames); animar vários simultaneamente
// satura a decodificação e trava a rolagem. O controlador (motionController)
// decide o vencedor via rAF a partir da geometria — sem depender de eventos de
// scroll nem de IntersectionObserver, que não disparam de forma confiável em
// todos os ambientes. Fora de vista e com prefers-reduced-motion: poster fixo.

export type MotionPairDict = { deviceDesktop: string; deviceMobile: string };

export default function MotionPair({
  base,
  name,
  url,
  dict,
}: {
  base: string;
  name: string;
  url: string;
  dict: MotionPairDict;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return subscribeMotion(el, setActive);
  }, []);

  const M = "/projects/motion";
  const src = (kind: "desktop" | "mobile") =>
    active ? `${M}/${base}-${kind}.webp` : `${M}/${base}-${kind}-poster.webp`;

  return (
    <div
      ref={ref}
      className="dotgrid flex items-end gap-3 rounded-2xl bg-paper p-4 sm:gap-6 sm:p-8 md:rounded-3xl"
    >
      {/* Desktop — janela de navegador */}
      <figure className="min-w-0 flex-1 overflow-hidden rounded-xl border border-line bg-surface shadow-card">
        <div className="flex items-center gap-2 border-b border-line bg-surface px-3 py-2">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-ink/30" />
            <span className="h-2 w-2 rounded-full bg-ink/15" />
            <span className="h-2 w-2 rounded-full bg-ink/15" />
          </span>
          <span className="mx-auto truncate rounded-full bg-paper px-2.5 py-0.5 font-mono text-[10px] tracking-wide text-ink/70">
            {url}
          </span>
        </div>
        <img
          src={src("desktop")}
          alt={`${name} — ${dict.deviceDesktop}`}
          width={640}
          height={400}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
      </figure>

      {/* Mobile — mesma navegação, viewport de telemóvel */}
      <figure className="w-[22%] max-w-[132px] shrink-0 overflow-hidden rounded-[16px] border-[3px] border-ink bg-ink shadow-card sm:rounded-[20px] sm:border-4">
        <img
          src={src("mobile")}
          alt={`${name} — ${dict.deviceMobile}`}
          width={220}
          height={476}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full rounded-[12px] sm:rounded-[15px]"
        />
      </figure>
    </div>
  );
}
