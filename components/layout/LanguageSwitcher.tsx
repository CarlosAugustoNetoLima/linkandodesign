"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { locales, localeNames, type Locale } from "@/lib/i18n";

// Seletor de idioma: globo em SVG que gira (meridianos) enquanto o menu está
// ativo. Abre no hover (desktop), no foco por teclado e no toque/clique
// (mobile). Troca via cookie NEXT_LOCALE (sem mexer na URL) e revalida os
// Server Components com router.refresh().
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

  // fecha com Esc e ao clicar/tocar fora (necessário no toque, sem mouseleave)
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
        className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-300 ${
          open ? "border-charcoal bg-charcoal text-lime" : "border-ink/20 bg-transparent text-ink"
        }`}
      >
        <Globe spinning={open} />
      </button>

      {/* o wrapper com pt cobre o vão entre botão e painel: o hover não se
          perde no caminho */}
      <div
        className={`absolute left-0 top-full z-50 pt-2 md:left-1/2 md:-translate-x-1/2 ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <ul
          role="listbox"
          aria-label="Idioma / Language"
          className={`flex w-48 origin-top flex-col gap-1.5 overflow-hidden rounded-2xl bg-charcoal p-2 shadow-dark transition-all duration-300 ease-out ${
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
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    active ? "bg-white/10 text-lime" : "text-white/80 hover:bg-white/10 hover:text-white"
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

// Globo: contorno + equador/paralelos fixos; dois meridianos elípticos
// defasados em meia volta fazem a ilusão de rotação (scaleX 1 → 0 → 1).
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
