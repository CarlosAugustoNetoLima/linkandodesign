"use client";

import { Fragment, useRef, type CSSProperties, type ElementType } from "react";
import { motion, useInView } from "framer-motion";
import { useReduced } from "@/components/deck/useReduced";

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  emphasis?: string[];
  delay?: number;
  stagger?: number;
  trigger?: "view" | "mount";
  style?: CSSProperties;
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9À-ɏ]/g, "");

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
                
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-block",
                    overflow: "hidden",
                    verticalAlign: "top",
                    padding: "0.14em 0.06em 0.3em",
                    margin: "-0.14em -0.06em -0.3em",
                  }}
                >
                  {reduced ? (
                    <span style={emStyle}>{word}</span>
                  ) : (
                    <motion.span
                      style={{ display: "inline-block", ...emStyle }}
                      initial={{ y: "160%" }}
                      animate={{ y: shown ? 0 : "160%" }}
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
