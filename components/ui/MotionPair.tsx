"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserFrame, PhoneFrame } from "@/components/ui/DeviceFrames";
import { subscribeMotion } from "@/components/ui/motionController";


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
      
      <BrowserFrame url={url} className="min-w-0 flex-1">
        <img
          src={src("desktop")}
          alt={`${name} — ${dict.deviceDesktop}`}
          width={640}
          height={400}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
      </BrowserFrame>

      
      <PhoneFrame className="w-[22%] max-w-[132px] shrink-0">
        <img
          src={src("mobile")}
          alt={`${name} — ${dict.deviceMobile}`}
          width={220}
          height={476}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full rounded-[12px] sm:rounded-[15px]"
        />
      </PhoneFrame>
    </div>
  );
}
