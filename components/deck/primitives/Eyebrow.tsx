"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cx } from "@/components/deck/cx";
import { useReduced } from "@/components/deck/useReduced";

type Props = {
  index?: string;
  children: ReactNode;
  className?: string;
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function Eyebrow({ index, children, className }: Props) {
  const reduced = useReduced();

  return (
    <span
      className={cx(
        "inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.28em]",
        className,
      )}
      style={{ color: "var(--d-accent)" }}
    >
      {index && (
        <>
          <span className="tabular-nums">{index}</span>
          <motion.span
            aria-hidden="true"
            className="block h-px w-7 origin-left"
            style={{ backgroundColor: "currentColor" }}
            initial={reduced ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE }}
          />
        </>
      )}
      <span>{children}</span>
    </span>
  );
}
