"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { getProject, getProjects } from "@/lib/projects";

const SLUGS = ["yanns", "festival-crato", "wauw", "jsynq"] as const;
const VIDEOS: Record<(typeof SLUGS)[number], string> = {
  yanns: "/projects/yanns.mp4",
  "festival-crato": "/projects/festivalcrato.mp4",
  wauw: "/projects/wauw.mp4",
  jsynq: "/projects/jsynq.mp4",
};

const HOLD = 7000;
const FADE = 700;
const PREROLL = 1100;

export default function HeroMobileShowcase({ locale }: { locale: Locale }) {
  const [show, setShow] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setShow(mq.matches);
    const fn = (ev: MediaQueryListEvent) => setShow(ev.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  if (!show) return null;
  return <Cycler locale={locale} />;
}

function Cycler({ locale }: { locale: Locale }) {
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const activeRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);

  useEffect(() => {
    videos.current[0]?.play().catch(() => {});
    if (reduced) return;

    let holdTimer: number;
    let prerollTimer: number;
    let cancelled = false;

    const advance = () => {
      const from = activeRef.current;
      const to = (from + 1) % SLUGS.length;
      prerollTimer = window.setTimeout(() => {
        if (!cancelled) videos.current[to]?.play().catch(() => {});
      }, HOLD - PREROLL);
      holdTimer = window.setTimeout(() => {
        if (cancelled) return;
        activeRef.current = to;
        setActive(to);
        videos.current[from]?.pause();
        advance();
      }, HOLD);
    };
    advance();

    return () => {
      cancelled = true;
      clearTimeout(holdTimer);
      clearTimeout(prerollTimer);
    };
  }, [reduced]);

  const current = getProject(locale, SLUGS[active]) ?? getProjects(locale)[active];

  return (
    <div>
      <div className="relative mx-auto aspect-[16/10] w-[84%] max-w-[360px] overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-sm">
        {SLUGS.map((slug, i) => (
          <video
            key={slug}
            ref={(el) => {
              videos.current[i] = el;
            }}
            src={VIDEOS[slug]}
            muted
            loop
            playsInline
            preload={i === 0 ? "auto" : "metadata"}
            className="absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out"
            style={{ opacity: i === active ? 1 : 0, transitionDuration: `${FADE}ms` }}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {SLUGS.map((slug, i) => (
            <span
              key={slug}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === active ? "w-4 bg-lime" : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
        {current && (
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/60">
            {current.flag} {current.name}
          </p>
        )}
      </div>
    </div>
  );
}
