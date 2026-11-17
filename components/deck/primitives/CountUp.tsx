"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { cx } from "@/components/deck/cx";
import { useReduced } from "@/components/deck/useReduced";

type Props = {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  /** se vier, controla o disparo; se não, dispara ao entrar na tela */
  start?: boolean;
  className?: string;
};

// power2.out do GSAP (easeOutQuad) como cubic-bezier.
const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

// Número que conta de 0 até o valor, em pt-BR. Com prefers-reduced-motion mostra o final.
export default function CountUp({ value, prefix = "", suffix = "", duration = 1.6, start, className }: Props) {
  const reduced = useReduced();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const go = start ?? inView;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!go || reduced) return;
    const controls = animate(0, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => setShown(v),
    });
    return () => controls.stop();
  }, [go, reduced, value, duration]);

  const n = reduced ? value : Math.round(shown);

  return (
    <span ref={ref} className={cx("tabular-nums", className)}>
      {prefix}
      {n.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}
