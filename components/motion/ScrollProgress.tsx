"use client";

import { motion, useScroll, useReducedMotion } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduced = useReducedMotion();

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-ink"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
