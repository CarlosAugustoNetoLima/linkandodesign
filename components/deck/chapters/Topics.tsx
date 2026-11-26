"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type ComponentPropsWithRef, type KeyboardEvent, type ReactNode, useRef, useState } from "react";
import { chapterNumber } from "@/components/deck/chapterIndex";
import { cx } from "@/components/deck/cx";
import Chapter from "@/components/deck/primitives/Chapter";
import Eyebrow from "@/components/deck/primitives/Eyebrow";
import WordReveal from "@/components/deck/primitives/WordReveal";
import { useReduced } from "@/components/deck/useReduced";
import type { Deck, TopicItem, TopicsChapter } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const pad = (n: number) => String(n).padStart(2, "0");

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--d-accent)]";

const SKEL: number[][] = [[70, 40], [50, 80, 30], [85, 55], [40, 70], [60, 35, 50]];

type TabProps = ComponentPropsWithRef<"button">;

function Chips({ chips, className }: { chips: string[]; className: string }) {
  return (
    <ul className={cx("flex flex-wrap gap-2", className)}>
      {chips.map((c, k) => (
        <li
          key={k}
          className="rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors [border-color:var(--d-line)] [color:var(--d-fg)] hover:[border-color:var(--d-accent)]"
        >
          {c}
        </li>
      ))}
    </ul>
  );
}

function RowTab({
  item,
  i,
  on,
  last,
  dense,
  reduced,
  tab,
}: {
  item: TopicItem;
  i: number;
  on: boolean;
  last: boolean;
  dense: boolean;
  reduced: boolean;
  tab: TabProps;
}) {
  return (
    <button
      {...tab}
      type="button"
      className={cx(
        "relative flex w-full items-center gap-5 text-left transition-colors",
        on ? "[color:var(--d-fg)]" : "[color:color-mix(in_srgb,var(--d-fg)_44%,transparent)] hover:[color:color-mix(in_srgb,var(--d-fg)_80%,transparent)]",
        FOCUS,
      )}
      style={{
        minHeight: dense ? "clamp(38px, 5.2vh, 52px)" : "clamp(44px, 6.2vh, 60px)",
        paddingBlock: 6,
        borderTop: "1px solid var(--d-line)",
        borderBottom: last ? "1px solid var(--d-line)" : undefined,
      }}
    >
      <motion.span
        aria-hidden="true"
        className="absolute -top-px left-0 right-0 h-[2px] origin-left"
        style={{ background: "var(--d-accent)" }}
        initial={false}
        animate={{ scaleX: on ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.45, ease: EASE }}
      />
      <span
        className="deck-mono shrink-0 text-[12px] tracking-[0.14em]"
        style={{ color: on ? "var(--d-accent)" : "color-mix(in srgb, var(--d-fg) 30%, transparent)" }}
      >
        {pad(i + 1)}
      </span>
      <span className="font-medium leading-tight" style={{ fontSize: "clamp(1.0625rem, 1.5vw, 1.375rem)" }}>
        {item.title}
      </span>
      <svg
        aria-hidden="true"
        width="8"
        height="12"
        viewBox="0 0 8 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="ml-auto shrink-0 transition-[opacity,transform] duration-300"
        style={{ opacity: on ? 1 : 0.2, transform: on ? "translateX(3px)" : "none" }}
      >
        <path d="M2 1.5L6.5 6 2 10.5" />
      </svg>
    </button>
  );
}

function MapTab({
  item,
  i,
  on,
  first,
  dense,
  reduced,
  tab,
}: {
  item: TopicItem;
  i: number;
  on: boolean;
  first: boolean;
  dense: boolean;
  reduced: boolean;
  tab: TabProps;
}) {
  return (
    <button
      {...tab}
      type="button"
      className={cx(
        "relative flex w-full items-center gap-3 px-3 text-left transition-colors",
        on ? "[color:var(--d-fg)]" : "[color:color-mix(in_srgb,var(--d-fg)_44%,transparent)] hover:[color:color-mix(in_srgb,var(--d-fg)_80%,transparent)]",
        FOCUS,
      )}
      style={{
        minHeight: dense ? "clamp(28px, 4.1vh, 40px)" : "clamp(32px, 4.6vh, 44px)",
        paddingBlock: 4,
        borderTop: first ? undefined : "1px solid var(--d-line)",
      }}
    >
      <motion.span
        aria-hidden="true"
        className="absolute bottom-1 left-0 top-1 w-[3px] rounded-full"
        style={{ background: "var(--d-accent)" }}
        initial={false}
        animate={{ scaleY: on ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.45, ease: EASE }}
      />
      <span
        className="deck-mono shrink-0 text-[11px]"
        style={{ color: on ? "var(--d-accent)" : "color-mix(in srgb, var(--d-fg) 30%, transparent)" }}
      >
        {pad(i + 1)}
      </span>
      <span className="min-w-0 text-[14px] font-medium leading-snug">{item.title}</span>
      <span aria-hidden="true" className="ml-auto hidden w-[32%] flex-col items-end gap-[3px] xl:flex">
        {SKEL[i % SKEL.length].map((w, k) => (
          <span
            key={k}
            className="h-[3px] rounded-full"
            style={{
              width: `${w}%`,
              background: on ? "var(--d-accent)" : "var(--d-line)",
              opacity: on ? 0.55 : 0.6,
            }}
          />
        ))}
      </span>
    </button>
  );
}

function MapFrame({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[14px] p-3" style={{ border: "1px solid var(--d-line)" }}>
      <div aria-hidden="true" className="mb-2 flex items-center gap-1.5 px-1 py-1">
        {[0, 1, 2].map((k) => (
          <span key={k} className="h-[6px] w-[6px] rounded-full" style={{ background: "var(--d-line)" }} />
        ))}
        <span className="ml-2 h-[6px] flex-1 rounded-full" style={{ background: "var(--d-line)", opacity: 0.6 }} />
      </div>
      {children}
    </div>
  );
}

function Selector({
  chapter,
  active,
  onSelect,
  reduced,
}: {
  chapter: TopicsChapter;
  active: number;
  onSelect: (i: number) => void;
  reduced: boolean;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const { items } = chapter;
  const N = items.length;
  const map = chapter.variant === "map";

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    let next: number;
    if (e.key === "ArrowDown") next = Math.min(N - 1, active + 1);
    else if (e.key === "ArrowUp") next = Math.max(0, active - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = N - 1;
    else return;
    e.preventDefault();
    e.stopPropagation();
    onSelect(next);
    refs.current[next]?.focus();
  }

  const tab = (i: number): TabProps => ({
    role: "tab",
    id: `${chapter.id}-tab-${i}`,
    "aria-selected": i === active,
    "aria-controls": `${chapter.id}-panel`,
    tabIndex: i === active ? 0 : -1,
    onClick: () => onSelect(i),
    ref: (el) => {
      refs.current[i] = el;
    },
  });

  const list = (
    <div role="tablist" aria-orientation="vertical" aria-label={chapter.title} onKeyDown={onKeyDown}>
      {items.map((item, i) =>
        map ? (
          <MapTab
            key={i}
            item={item}
            i={i}
            on={i === active}
            first={i === 0}
            dense={N > 9}
            reduced={reduced}
            tab={tab(i)}
          />
        ) : (
          <RowTab key={i} item={item} i={i} on={i === active} last={i === N - 1} dense={N > 7} reduced={reduced} tab={tab(i)} />
        ),
      )}
    </div>
  );

  return (
    <div className="min-w-0">
      {map ? <MapFrame>{list}</MapFrame> : list}
      <p className="mt-5 text-[12px]" style={{ color: "var(--d-fg-muted)" }}>
        Clique em um item para ver o detalhe.
      </p>
    </div>
  );
}

function statSize(value: string, mobile = false) {
  const n = value.length;
  if (mobile) return n <= 4 ? "clamp(3rem, 16vw, 4.5rem)" : n <= 7 ? "clamp(2.5rem, 12vw, 3.5rem)" : "clamp(2rem, 8.5vw, 2.75rem)";
  return n <= 4 ? "clamp(4rem, 9.5vw, 9rem)" : n <= 7 ? "clamp(3.25rem, 7vw, 6.5rem)" : "clamp(2.5rem, 4.6vw, 4.75rem)";
}

function Detail({ item, i, N }: { item: TopicItem; i: number; N: number }) {
  return (
    <>
      <p className="deck-mono text-[12px] tracking-[0.14em]" style={{ color: "var(--d-accent)" }}>
        {pad(i + 1)} / {pad(N)}
      </p>

      <p
        className="deck-h2 mt-4"
        aria-hidden={item.stat ? undefined : true}
        style={{
          fontWeight: "var(--d-display-weight, 800)",
          fontSize: statSize(item.stat ? item.stat.value : pad(i + 1)),
          lineHeight: 0.9,
          letterSpacing: "-0.04em",
          color: item.stat ? "var(--d-fg)" : "var(--d-accent)",
        }}
      >
        {item.stat ? item.stat.value : pad(i + 1)}
      </p>
      {item.stat && (
        <p className="mt-3 max-w-[34ch] text-[15px]" style={{ color: "var(--d-fg-muted)" }}>
          {item.stat.label}
        </p>
      )}

      <p
        className="mt-6"
        style={{ fontSize: "clamp(1.35rem, 2.1vw, 1.9rem)", fontWeight: 500, lineHeight: 1.15, color: "var(--d-fg)" }}
      >
        {item.title}
      </p>
      <p className="deck-body mt-4" style={{ fontSize: "clamp(0.95rem, 1.1vw, 1.0625rem)", maxWidth: "54ch" }}>
        {item.text}
      </p>

      {item.chips && <Chips chips={item.chips} className="mt-6" />}
    </>
  );
}

function Accordion({
  chapter,
  open,
  onToggle,
  reduced,
}: {
  chapter: TopicsChapter;
  open: number | null;
  onToggle: (i: number) => void;
  reduced: boolean;
}) {
  const { items } = chapter;

  return (
    <ul className="mt-[var(--sp-3)] lg:hidden">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li
            key={i}
            style={{
              borderTop: "1px solid var(--d-line)",
              borderBottom: i === items.length - 1 ? "1px solid var(--d-line)" : undefined,
            }}
          >
            <button
              type="button"
              id={`${chapter.id}-acc-btn-${i}`}
              aria-expanded={isOpen}
              aria-controls={`${chapter.id}-acc-${i}`}
              onClick={() => onToggle(i)}
              className={cx("flex w-full items-center gap-4 py-4 text-left", FOCUS)}
            >
              <span
                className="deck-mono shrink-0 text-[12px] tracking-[0.14em]"
                style={{ color: isOpen ? "var(--d-accent)" : "color-mix(in srgb, var(--d-fg) 30%, transparent)" }}
              >
                {pad(i + 1)}
              </span>
              <span
                className="text-[17px] font-medium leading-tight transition-colors"
                style={{ color: isOpen ? "var(--d-fg)" : "color-mix(in srgb, var(--d-fg) 44%, transparent)" }}
              >
                {item.title}
              </span>
              <svg
                aria-hidden="true"
                width="8"
                height="12"
                viewBox="0 0 8 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className={cx("ml-auto shrink-0", !reduced && "transition-transform duration-300")}
                style={{ transform: isOpen ? "rotate(90deg)" : "none" }}
              >
                <path d="M2 1.5L6.5 6 2 10.5" />
              </svg>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${chapter.id}-acc-${i}`}
                  role="region"
                  aria-labelledby={`${chapter.id}-acc-btn-${i}`}
                  initial={reduced ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduced ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.4, ease: EASE }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="pb-6 pt-2">
                    {item.stat && (
                      <>
                        <p
                          className="deck-h2"
                          style={{
                            fontWeight: 800,
                            fontSize: statSize(item.stat.value, true),
                            lineHeight: 1.1,
                            letterSpacing: "-0.04em",
                            color: "var(--d-fg)",
                          }}
                        >
                          {item.stat.value}
                        </p>
                        <p className="mt-2 text-[14px]" style={{ color: "var(--d-fg-muted)" }}>
                          {item.stat.label}
                        </p>
                      </>
                    )}
                    <p className={cx("deck-body", item.stat && "mt-4")} style={{ fontSize: "0.9375rem" }}>
                      {item.text}
                    </p>
                    {item.chips && <Chips chips={item.chips} className="mt-5" />}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}

export default function Topics({ chapter, deck }: { chapter: TopicsChapter; deck: Deck }) {
  const reduced = useReduced();
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(0);
  const N = chapter.items.length;

  return (
    <Chapter id={chapter.id}>
      <div className="deck-container">
        <Eyebrow index={chapterNumber(deck, chapter.id)}>{chapter.eyebrow}</Eyebrow>
        <WordReveal as="h2" className="deck-h2 mt-5" text={chapter.title} />
        {chapter.body && (
          <motion.p
            className="deck-body mt-6"
            style={{ maxWidth: "62ch" }}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
          >
            {chapter.body}
          </motion.p>
        )}

        <motion.div
          className="mt-[var(--sp-3)] hidden grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start gap-x-16 lg:grid"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <Selector chapter={chapter} active={active} onSelect={setActive} reduced={reduced} />

          
          <div
            role="tabpanel"
            id={`${chapter.id}-panel`}
            aria-labelledby={`${chapter.id}-tab-${active}`}
            aria-live="polite"
            className="grid min-w-0"
          >
            {chapter.items.map((item, i) => (
              <motion.div
                key={i}
                className="[grid-area:1/1]"
                initial={false}
                animate={{ opacity: i === active ? 1 : 0, y: i === active ? 0 : i < active ? -14 : 14 }}
                transition={{ duration: reduced ? 0 : 0.45, ease: EASE }}
                aria-hidden={i !== active}
                style={{ pointerEvents: i === active ? "auto" : "none" }}
              >
                <Detail item={item} i={i} N={N} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <Accordion chapter={chapter} open={open} onToggle={(i) => setOpen(open === i ? null : i)} reduced={reduced} />
      </div>
    </Chapter>
  );
}
