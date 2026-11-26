"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { getDictionary, type Locale } from "@/lib/i18n";
import LivingDots from "@/components/agent/LivingDots";
import { privacy, renderText, useDiagnosisChat } from "@/components/agent/useDiagnosisChat";

const copy = {
  pt: { title: "Vamos entender o seu projeto.", lead: "Diagnóstico gratuito. A proposta chega por e-mail em até 24h.", name: "Linkando" },
  en: { title: "Let's understand your project.", lead: "Free diagnosis. The proposal arrives by email within 24 hours.", name: "Linkando" },
} as const;

export default function DiagnosisChat({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).chat;
  const c = copy[locale];
  const { messages, typing, send } = useDiagnosisChat(locale);
  const [input, setInput] = useState("");
  const [showPrivacy, setShowPrivacy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const empty = messages.length <= 1 && !typing;
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let text = "";
    try {
      text = sessionStorage.getItem("linkando:diag-start") ?? "";
      sessionStorage.removeItem("linkando:diag-start");
    } catch {}
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      if (!text) text = q;
      router.replace("/diagnostico");
    }
    text = text.trim().slice(0, 2000);
    if (text) send(text);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      nearBottom.current = el.scrollHeight - (window.scrollY + window.innerHeight) < 160;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const box = composerRef.current;
    const end = bottomRef.current;
    if (!box || !end) return;
    const sync = () => {
      end.style.scrollMarginBottom = `${box.offsetHeight}px`;
      if (nearBottom.current && messages.length > 1) end.scrollIntoView({ behavior: "auto", block: "end" });
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(box);
    return () => ro.disconnect();
  }, [messages.length]);

  useEffect(() => {
    if (messages.length <= 1 && !typing) return;
    const last = messages[messages.length - 1];
    if (last?.from === "user") nearBottom.current = true;
    if (!nearBottom.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    bottomRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" });
  }, [messages, typing]);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
  }, [input]);

  function submit(text: string) {
    if (!text.trim() || typing) return;
    setInput("");
    send(text);
  }

  const canSend = input.trim().length > 0 && !typing;

  return (
    <div className="relative z-10 flex min-h-[calc(100dvh-4rem)] flex-col text-white md:min-h-[calc(100dvh-5rem)]">
      <LivingDots active={typing} />
      <div
        role="log"
        aria-live="polite"
        aria-label={t.dialogAria}
        className={`relative z-10 mx-auto flex w-full max-w-[760px] flex-1 flex-col px-5 pt-8 ${empty ? "justify-center pb-6" : "gap-6 pb-8 md:pt-12"}`}
      >
        {empty && (
          <div className="mb-8 text-center">
            <h1 className="font-display text-h1 font-extrabold text-white">{c.title}</h1>
            <p className="mt-4 text-base text-white/60">{c.lead}</p>
          </div>
        )}

        {messages.map((m, i) =>
          m.from === "user" ? (
            <div
              key={i}
              className="ml-auto max-w-[85%] whitespace-pre-wrap break-words rounded-[18px] rounded-br-[6px] bg-[#F4F3EE] px-4 py-3 text-[15px] shadow-[0_8px_24px_-12px_rgba(0,0,0,.6)] leading-relaxed text-ink"
            >
              {m.text}
            </div>
          ) : (
            <div key={i} className={`rounded-[18px] rounded-bl-[6px] border border-white/[0.08] bg-[#2F2F34] px-5 py-4 shadow-[0_8px_24px_-12px_rgba(0,0,0,.6)] ${empty ? "mx-auto max-w-[620px] text-center" : "mr-auto max-w-[92%]"}`}>
              <p className={`mb-2 flex items-center gap-2 text-xs font-semibold text-white/60 ${empty ? "justify-center" : ""}`}>
                <span className="h-2 w-2 rounded-full bg-lime" aria-hidden />
                {c.name}
              </p>
              <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-white md:text-base">
                {renderText(m.text)}
              </p>
            </div>
          ),
        )}

        {empty && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {t.quick.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => submit(q)}
                className="min-h-[44px] rounded-full border border-white/[0.12] bg-[#2F2F34] px-4 py-2 text-sm text-white/90 transition-colors hover:border-lime hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {typing && (
          <div className="mr-auto rounded-[18px] border border-white/[0.08] bg-[#2F2F34] px-5 py-4">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-white/60">
              <span className="h-2 w-2 rounded-full bg-lime" aria-hidden />
              {c.name}
            </p>
            <span className="inline-flex gap-1 py-2" role="status" aria-label="…">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  style={{ animationDelay: `${d}ms` }}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70 motion-reduce:animate-none"
                />
              ))}
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div ref={composerRef} className="sticky bottom-0 z-10 bg-gradient-to-t from-charcoal from-70% to-charcoal/0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto w-full max-w-[760px]">
          <form
            className="flex items-end gap-2 rounded-[24px] border border-white/[0.12] bg-[#2F2F34] py-2 pl-5 pr-2 focus-within:border-lime/60"
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
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
                  submit(input);
                }
              }}
              placeholder={t.inputPh}
              aria-label={t.inputAria}
              className="max-h-36 min-h-[44px] flex-1 resize-none bg-transparent py-[10px] text-base leading-6 text-white placeholder:text-white/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!canSend}
              aria-label={t.sendAria}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime text-charcoal transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-30"
            >
              <ArrowUp size={20} strokeWidth={2.5} aria-hidden />
            </button>
          </form>

          {showPrivacy && (
            <div className="mt-2 max-h-36 space-y-2 overflow-y-auto text-xs leading-relaxed text-white/60">
              {privacy[locale].items.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          )}
          <p className="mt-2 px-2 text-center text-xs leading-snug text-white/60">
            {privacy[locale].short}{" "}
            <button
              type="button"
              onClick={() => setShowPrivacy((v) => !v)}
              aria-expanded={showPrivacy}
              className="inline-flex min-h-[44px] items-center font-semibold text-lime underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime sm:min-h-0"
            >
              {privacy[locale].toggle}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
