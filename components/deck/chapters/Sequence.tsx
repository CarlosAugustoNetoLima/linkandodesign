"use client";

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { chapterNumber } from "@/components/deck/chapterIndex";
import { cx } from "@/components/deck/cx";
import Chapter from "@/components/deck/primitives/Chapter";
import Eyebrow from "@/components/deck/primitives/Eyebrow";
import WordReveal from "@/components/deck/primitives/WordReveal";
import { useReduced } from "@/components/deck/useReduced";
import type { Deck, SequenceChapter, Spec } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const SPRING = { stiffness: 220, damping: 38, mass: 0.35 };
const STATIC_PROGRESS = 0.4;
const LEAD_SVH = 40;

const pad3 = (n: number) => String(n).padStart(3, "0");

const toIndex = (p: number, count: number, endAt: number) =>
  Math.round(Math.min(1, Math.max(0, p / endAt)) * (count - 1));

function loadOrder(count: number): number[] {
  const seen = new Set<number>();
  const order: number[] = [];
  for (const step of [8, 4, 2, 1]) {
    for (let i = 0; i < count; i += step) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  return order;
}

function frameUrl({ dir, prefix, pad, ext }: SequenceChapter["frames"], i: number) {
  return `${dir}/${prefix}${String(i + 1).padStart(pad, "0")}.${ext}`;
}

type CaptionProps = {
  eyebrow: string;
  title: string;
  from: number;
  to: number;
  progress: MotionValue<number>;
};

function Caption({ eyebrow, title, from, to, progress }: CaptionProps) {
  const fade = Math.min(0.04, (to - from) / 4);
  const first = from === 0;
  const range = first ? [0, to - fade, to] : [from, from + fade, to - fade, to];
  const opacity = useTransform(progress, range, first ? [1, 1, 0] : [0, 1, 1, 0]);
  const y = useTransform(progress, range, first ? [0, 0, -14] : [14, 0, 0, -14]);

  return (
    <motion.div className="col-start-1 row-start-1" style={{ opacity, y }}>
      <p className="text-[11px] font-medium uppercase tracking-[0.24em]" style={{ color: "rgba(255,255,255,.78)" }}>
        {eyebrow}
      </p>
      <p
        className="mt-2"
        style={{
          fontSize: "clamp(1.2rem, 2.2vw, 1.9rem)",
          fontWeight: "var(--d-display-weight)",
          lineHeight: 1.15,
          color: "#fff",
        }}
      >
        {title}
      </p>
    </motion.div>
  );
}

type SpecRowProps = { spec: Spec; index: number; reduced: boolean | null };

function SpecRow({ spec, index, reduced }: SpecRowProps) {
  return (
    <motion.div
      className="grid grid-cols-[132px_1fr] gap-x-4 py-3"
      style={{ borderTop: "1px solid var(--d-line)" }}
      initial={reduced ? false : { opacity: 0, x: 16 }}
      whileInView={reduced ? undefined : { opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: EASE, delay: index * 0.06 }}
    >
      <dt className="pt-0.5 text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--d-fg-muted)" }}>
        {spec.k}
      </dt>
      <dd className="text-[14px] leading-[1.6]" style={{ color: "var(--d-fg)" }}>
        {spec.v}
      </dd>
    </motion.div>
  );
}

type OutroProps = { outro: NonNullable<SequenceChapter["outro"]>; progress: MotionValue<number> };

function Outro({ outro, progress }: OutroProps) {
  const opacity = useTransform(progress, [outro.from, outro.from + outro.fade], [0, 1]);
  const scale = useTransform(progress, [outro.from, 1], outro.zoom);

  return (
    <>
      <motion.img
        src={outro.src}
        alt={outro.alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity, scale, transformOrigin: "center" }}
      />
      {outro.dim && <Dim from={outro.dim.from} to={outro.dim.to} progress={progress} />}
    </>
  );
}

type DimProps = { from: number; to: number; progress: MotionValue<number> };

function Dim({ from, to, progress }: DimProps) {
  const opacity = useTransform(progress, [from, 1], [0, to]);
  return <motion.div className="pointer-events-none absolute inset-0" style={{ background: "#000", opacity }} />;
}

export default function Sequence({ chapter, deck }: { chapter: SequenceChapter; deck: Deck }) {
  const reduced = useReduced();
  const frames = chapter.frames;
  const { count, width, height } = frames;
  const endAt = frames.endAt ?? 1;
  const outroFrom = chapter.outro?.from ?? Infinity;
  const needed = reduced ? 1 : count;
  const ratio = width / height;

  const mediaRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [mediaH, setMediaH] = useState(0);
  const [vh, setVh] = useState(0);
  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setMediaH(el.getBoundingClientRect().height);
      setVh(window.innerHeight);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const barH = 56;
  const stuckTop = (vh + barH - mediaH) / 2;
  const { scrollYProgress: railProgress } = useScroll({
    target: railRef,
    offset: ["start 0.65", `end ${Math.round(stuckTop + mediaH)}px`],
  });
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const { scrollYProgress: passProgress } = useScroll({ target: mediaRef, offset: ["start 0.9", "end 0.1"] });
  const staticProgress = useMotionValue(STATIC_PROGRESS);
  const railPinned = !reduced && !wide && mediaH > 0;
  const mode = useRef<"static" | "pass" | "rail">("rail");
  mode.current = reduced ? "static" : wide ? "pass" : "rail";
  const drive = useTransform(() => {
    const v = { static: staticProgress.get(), pass: passProgress.get(), rail: railProgress.get() };
    return v[mode.current];
  });
  const smooth = useSpring(drive, SPRING);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const okRef = useRef<boolean[]>([]);
  const targetRef = useRef(0);
  const shownRef = useRef(-1);
  const [frame, setFrame] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [inOutro, setInOutro] = useState(false);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const ok = okRef.current;
    if (!canvas || !ctx || ok.length === 0) return;

    const t = targetRef.current;
    let src = -1;
    for (let d = 0; d < ok.length && src < 0; d++) {
      if (ok[t - d]) src = t - d;
      else if (ok[t + d]) src = t + d;
    }
    if (src < 0 || src === shownRef.current) return;

    const img = imagesRef.current[src];
    if (!img) return;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    shownRef.current = src;
  }, []);

  useEffect(() => {
    const images: HTMLImageElement[] = [];
    const ok: boolean[] = new Array<boolean>(count).fill(false);
    imagesRef.current = images;
    okRef.current = ok;
    shownRef.current = -1;

    const start = toIndex(drive.get(), count, endAt);
    targetRef.current = start;
    setFrame(start);
    setLoaded(0);

    const order = reduced ? [start] : loadOrder(count);
    let live = true;
    let settled = 0;
    let good = 0;
    for (const i of order) {
      const img = new Image();
      const settle = (success: boolean) => {
        if (!live) return;
        settled++;
        if (success) {
          ok[i] = true;
          good++;
          paint();
        }
        if (settled % 6 === 0 || settled === order.length) setLoaded(good);
      };
      img.onload = () => settle(true);
      img.onerror = () => settle(false);
      images[i] = img;
      img.src = frameUrl(frames, i);
    }

    return () => {
      live = false;
    };
  }, [frames, count, endAt, reduced, drive, paint]);

  useMotionValueEvent(smooth, "change", (p) => {
    const nowInOutro = p >= outroFrom;
    if (nowInOutro !== inOutro) setInOutro(nowInOutro);

    const idx = toIndex(p, count, endAt);
    if (idx === targetRef.current) return;
    targetRef.current = idx;
    setFrame(idx);
    paint();
  });

  return (
    <Chapter id={chapter.id}>
      <div>
        <div>
          <div
            className={cx(
              "deck-container grid content-start items-center gap-10 lg:content-center lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.9fr)] lg:gap-12",
            )}
          >
            <div className="min-w-0">
              <Eyebrow index={chapterNumber(deck, chapter.id)}>{chapter.eyebrow}</Eyebrow>
              <WordReveal
                as="h2"
                className="deck-h2 mt-5"
                style={{ fontSize: "clamp(1.8rem, 3.1vw, 2.9rem)" }}
                text={chapter.title}
              />
              <motion.p
                className="deck-body mt-6"
                initial={reduced ? false : { opacity: 0, y: 16 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                {chapter.body}
              </motion.p>
              {chapter.specs.length > 0 && (
                <dl className="mt-10 hidden lg:block">
                  {chapter.specs.map((s, i) => (
                    <SpecRow key={s.k} spec={s} index={i} reduced={reduced} />
                  ))}
                </dl>
              )}
            </div>

            <div className="flex min-w-0 lg:justify-end">
              <div ref={railRef} className={railPinned ? "w-full" : "contents"} style={railPinned ? { height: `calc(${mediaH}px + ${LEAD_SVH}svh)` } : undefined}>
              <div className={railPinned ? "sticky w-full" : "contents"} style={railPinned ? { top: stuckTop } : undefined}>
              
              <div
                ref={mediaRef}
                className="relative w-[var(--seq-w)] overflow-hidden lg:w-[var(--seq-w-lg)]"
                style={{
                  ["--seq-w" as string]: `min(100%, ${(50 * ratio).toFixed(1)}vh)`,
                  ["--seq-w-lg" as string]: `min(100%, ${(72 * ratio).toFixed(1)}vh)`,
                  aspectRatio: `${width} / ${height}`,
                  border: "1px solid var(--d-line)",
                  borderRadius: "var(--d-radius)",
                  background: "#111",
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={width}
                  height={height}
                  aria-hidden="true"
                  className="block h-full w-full"
                />

                {chapter.outro && !reduced && <Outro outro={chapter.outro} progress={smooth} />}

                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 grid grid-cols-1 p-6"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }}
                >
                  {chapter.captions.map((c) => (
                    <Caption
                      key={c.title}
                      eyebrow={c.eyebrow}
                      title={c.title}
                      from={c.from}
                      to={c.to}
                      progress={drive}
                    />
                  ))}
                </div>

                <div className="pointer-events-none absolute right-5 top-4 w-40 text-right">
                  <p className="deck-mono text-[11px] tracking-[0.14em]" style={{ color: "rgba(255,255,255,.85)" }}>
                    {inOutro && chapter.outro ? chapter.outro.label : `FRAME ${pad3(frame + 1)} / ${pad3(count)}`}
                  </p>
                  <div className="mt-2 h-[2px] w-full" style={{ background: "rgba(255,255,255,.25)" }}>
                    <motion.div
                      className="h-full w-full origin-left"
                      style={{ background: "#fff", scaleX: drive }}
                    />
                  </div>
                  {loaded < needed && (
                    <p className="deck-mono mt-2 text-[11px]" style={{ color: "rgba(255,255,255,.85)" }}>
                      carregando frames {loaded}/{needed}
                    </p>
                  )}
                </div>
              </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Chapter>
  );
}
