"use client";

import { Fragment, useRef, type CSSProperties, type ElementType } from "react";
import { motion, useInView } from "framer-motion";
import { useReduced } from "@/components/deck/useReduced";

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  /** palavras (sem pontuação) que ganham a cor de destaque */
  emphasis?: string[];
  delay?: number;
  stagger?: number;
  trigger?: "view" | "mount";
  style?: CSSProperties;
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Comparação de palavra: sem caixa e sem pontuação.
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9À-ɏ]/g, "");

// Texto que sobe palavra a palavra de dentro de uma máscara. "\n" vira quebra de
// linha. Com prefers-reduced-motion fica estático.
export default function WordReveal({
  text,
  as = "p",
  className,
  emphasis = [],
  delay = 0,
  stagger = 0.06,
  trigger = "view",
  style,
}: Props) {
  const reduced = useReduced();
  const Tag = as as ElementType;
  const rootRef = useRef<HTMLElement>(null);
  // O gatilho vive na raiz (sempre ocupa espaço), não nos spans: eles começam
  // fora da máscara e o IntersectionObserver os trata como invisíveis, então
  // um whileInView neles nunca dispararia.
  const inView = useInView(rootRef, { once: true, margin: "-10% 0px -10% 0px" });
  const shown = trigger === "mount" || inView;
  const marked = new Set(emphasis.map(norm));
  const lines = text.split("\n").map((l) => l.split(/\s+/).filter(Boolean));

  let n = 0;
  return (
    <Tag ref={rootRef} className={className} style={style} aria-label={text.replace(/\n/g, " ")}>
      {lines.map((line, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {line.map((word, wi) => {
            const idx = n++;
            const emStyle: CSSProperties | undefined = marked.has(norm(word))
              ? { color: "var(--d-accent)" }
              : undefined;
            return (
              <Fragment key={idx}>
                <span aria-hidden="true" style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}>
                  {reduced ? (
                    <span style={emStyle}>{word}</span>
                  ) : (
                    <motion.span
                      style={{ display: "inline-block", ...emStyle }}
                      initial={{ y: "110%" }}
                      animate={{ y: shown ? 0 : "110%" }}
                      transition={{ duration: 1, ease: EASE, delay: delay + idx * stagger }}
                    >
                      {word}
                    </motion.span>
                  )}
                </span>
                {wi < line.length - 1 ? " " : null}
              </Fragment>
            );
          })}
        </Fragment>
      ))}
    </Tag>
  );
}
