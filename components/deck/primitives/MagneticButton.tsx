"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import type { PointerEvent, ReactNode } from "react";
import { cx } from "@/components/deck/cx";
import { useReduced } from "@/components/deck/useReduced";

type Props = {
  href: string;
  children: ReactNode;
  external?: boolean;
  strength?: number;
  className?: string;
  variant?: "ink" | "ghost";
};

const MAX = 14;
const SPRING = { stiffness: 180, damping: 15, mass: 0.4 };
const clamp = (v: number) => Math.max(-MAX, Math.min(MAX, v));

export default function MagneticButton({
  href,
  children,
  external = false,
  strength = 0.35,
  className,
  variant = "ink",
}: Props) {
  const reduced = useReduced();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (reduced || window.matchMedia("(pointer: coarse)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const cx0 = r.left + r.width / 2 - sx.get();
    const cy0 = r.top + r.height / 2 - sy.get();
    x.set(clamp((e.clientX - cx0) * strength));
    y.set(clamp((e.clientY - cy0) * strength));
  }

  function onPointerLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      className="inline-block"
      style={{ x: sx, y: sy }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={cx(
          "inline-flex items-center justify-center rounded-[10px] px-7 py-4 font-semibold transition-colors duration-200",
          variant === "ink" && "bg-ink text-lime hover:bg-[#2a2a2e]",
          className,
        )}
        style={variant === "ghost" ? { border: "1px solid var(--d-line)", color: "var(--d-fg)" } : undefined}
      >
        {children}
      </a>
    </motion.div>
  );
}
