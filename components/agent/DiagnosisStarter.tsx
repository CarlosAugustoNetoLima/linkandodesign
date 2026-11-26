"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";

export const DIAG_START_KEY = "linkando:diag-start";

type Props = {
  placeholder: string;
  sendLabel: string;
  note: string;
  quickAria: string;
  quick: readonly string[];
  tone?: "light" | "dark";
};

export default function DiagnosisStarter({ placeholder, sendLabel, note, quickAria, quick, tone = "light" }: Props) {
  const dark = tone === "dark";
  const router = useRouter();
  const [input, setInput] = useState("");
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const quickRef = useRef<HTMLUListElement>(null);
  const sent = useRef(false);
  const [scroll, setScroll] = useState({ left: 0, max: 0, client: 0, total: 0 });

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }, [input]);

  useEffect(() => {
    const el = quickRef.current;
    if (!el) return;
    const measure = () => {
      const client = el.clientWidth;
      const total = el.scrollWidth;
      setScroll({ left: el.scrollLeft, max: Math.max(0, total - client), client, total });
    };
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const hasMore = scroll.max > 1;
  const atStart = scroll.left <= 1;
  const atEnd = scroll.max > 0 && scroll.left >= scroll.max - 1;
  const mask = hasMore
    ? `linear-gradient(to right, ${atStart ? "#000 0%" : "transparent 0%, #000 16px"}, #000 calc(100% - ${atEnd ? "0px" : "36px"}), ${atEnd ? "#000 100%" : "transparent 100%"})`
    : undefined;
  const thumbWidth = hasMore ? Math.max(12, (scroll.client / scroll.total) * 100) : 100;
  const thumbOffset = hasMore ? (scroll.left / scroll.max) * ((100 - thumbWidth) / thumbWidth) * 100 : 0;

  function go(raw: string) {
    const text = raw.trim();
    if (!text || sent.current) return;
    sent.current = true;
    try {
      sessionStorage.setItem(DIAG_START_KEY, text);
      router.push("/diagnostico");
    } catch {
      router.push(`/diagnostico?q=${encodeURIComponent(text)}`);
    }
  }

  const canSend = input.trim().length > 0;

  return (
    <div className="w-full max-w-[640px]">
      <p className={`font-mono text-[11px] uppercase tracking-widest ${dark ? "text-white/60" : "text-ink/60"}`}>{note}</p>
      <ul
        ref={quickRef}
        style={mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
        className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        aria-label={quickAria}
      >
        {quick.map((q) => (
          <li key={q} className="shrink-0">
            <button
              type="button"
              onClick={() => go(q)}
              className={`min-h-[44px] rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none ${dark ? "border-white/25 text-white/80 hover:border-white hover:text-white focus-visible:outline-lime" : "border-ink/25 text-ink/80 hover:border-ink hover:text-ink focus-visible:outline-ink"}`}
            >
              {q}
            </button>
          </li>
        ))}
      </ul>
      {hasMore && (
        <div
          className={`mt-2 h-[3px] overflow-hidden rounded-full sm:hidden ${dark ? "bg-white/10" : "bg-ink/10"}`}
          aria-hidden="true"
        >
          <div
            className={`h-full rounded-full bg-lime transition-opacity duration-200 motion-reduce:transition-none ${atEnd ? "opacity-30" : "opacity-70"}`}
            style={{ width: `${thumbWidth}%`, transform: `translateX(${thumbOffset}%)` }}
          />
        </div>
      )}
      <form
        className={`mt-3 flex items-end gap-2 rounded-[24px] border py-2 pl-5 pr-2 transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 motion-reduce:transition-none ${dark ? "border-white/25 bg-white/[0.06] focus-within:border-white focus-within:outline-lime" : "border-ink/30 bg-white/60 focus-within:border-ink focus-within:outline-ink"}`}
        onSubmit={(e) => {
          e.preventDefault();
          go(input);
        }}
      >
        <textarea
          ref={areaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              go(input);
            }
          }}
          name="message"
          autoComplete="off"
          placeholder={placeholder}
          aria-label={placeholder}
          className={`max-h-24 min-h-[64px] min-w-0 flex-1 resize-none bg-transparent py-[10px] text-base leading-6 focus:outline-none sm:min-h-[44px] ${dark ? "text-white placeholder:text-white/50" : "text-ink placeholder:text-ink/55"}`}
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label={sendLabel}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime text-charcoal transition-[background-color,opacity] hover:bg-lime/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-30 motion-reduce:transition-none"
        >
          <ArrowUp size={20} strokeWidth={2.5} aria-hidden />
        </button>
      </form>

    </div>
  );
}
