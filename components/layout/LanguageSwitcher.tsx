"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { locales, localeNames, type Locale } from "@/lib/i18n";

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  const choose = (target: Locale) => {
    setOpen(false);
    if (target === locale) return;
    document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div
      ref={root}
      className="relative"
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Idioma / Language"
        className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-300 hover:border-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
          open ? "border-ink/40 bg-surface text-ink shadow-card" : "border-ink/20 bg-transparent text-ink"
        }`}
      >
        <Globe spinning={open} />
      </button>

      
      <div
        className={`absolute left-0 top-full z-50 pt-2 md:left-1/2 md:-translate-x-1/2 ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <ul
          role="listbox"
          aria-label="Idioma / Language"
          className={`flex w-48 origin-top flex-col gap-1.5 overflow-hidden rounded-2xl border border-line bg-surface p-2 shadow-card transition-all duration-300 ease-out ${
            open ? "translate-y-0 scale-100 opacity-100" : "-translate-y-2 scale-95 opacity-0"
          }`}
        >
          {locales.map((l, i) => {
            const active = l === locale;
            return (
              <li
                key={l}
                role="option"
                aria-selected={active}
                style={{ transitionDelay: open ? `${60 + i * 50}ms` : "0ms" }}
                className={`transition-all duration-300 ${
                  open ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
                }`}
              >
                <button
                  type="button"
                  onClick={() => choose(l)}
                  tabIndex={open ? 0 : -1}
                  className={`flex w-full items-center gap-3 rounded-[4px] px-3 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                    active ? "bg-ink/5 text-ink" : "text-ink/60 hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  <span className="w-6 font-mono text-[11px] font-semibold uppercase tracking-widest">
                    {l}
                  </span>
                  <span className="flex-1 text-sm font-medium">{localeNames[l]}</span>
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full bg-lime transition-transform duration-300 ${
                      active ? "scale-100" : "scale-0"
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Globe({ spinning }: { spinning: boolean }) {
  const meridian = (delay: string) => ({
    transformBox: "fill-box" as const,
    transformOrigin: "center",
    animation: spinning ? `globe-spin 2.2s ease-in-out ${delay} infinite` : "none",
  });
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-[18px] w-[18px] transition-transform duration-500 ${spinning ? "rotate-[18deg]" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.25" />
      <path d="M2.75 12h18.5" />
      <path d="M4.2 7.5c4.8 1.6 10.8 1.6 15.6 0M4.2 16.5c4.8-1.6 10.8-1.6 15.6 0" />
      <ellipse cx="12" cy="12" rx="4.2" ry="9.25" style={meridian("0s")} />
      <ellipse cx="12" cy="12" rx="4.2" ry="9.25" style={meridian("-1.1s")} />
    </svg>
  );
}
