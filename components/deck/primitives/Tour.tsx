"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type RefObject, useEffect, useRef, useState } from "react";
import { cx } from "@/components/deck/cx";
import { useReduced } from "@/components/deck/useReduced";
import type { TourPin } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const pad = (n: number) => String(n).padStart(2, "0");
// Os detalhes por clique saíram dos decks: cada tela mostra só o texto principal, sem botão.
const SHOW_ONLY_FIRST = true;

// Passo do tour: `tag` é um rótulo opcional (ex.: "Decisão"), antes do título.
// `device` esmaece o outro aparelho no capítulo Celular; `at` não é mais desenhado.
export type TourStep = { tag?: string; title: string; text: string; at?: TourPin; device?: "desktop" | "mobile" };

// Botão que abre os detalhes (o passo a passo da tela). Sem seta: a seta sugeria que o tour levava para fora da página.
function TourButton({ n, onOpen }: { n: number; onOpen: () => void }) {
  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex items-center gap-3 rounded-[10px] bg-ink py-3 pl-3.5 pr-6 text-[13px] font-semibold uppercase tracking-[0.08em] text-lime transition-[transform,background-color] hover:bg-[#2a2a2e] motion-safe:hover:-translate-y-px"
      >
        <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-lime text-ink">
          <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor">
            <path d="M2 1l7 4-7 4z" />
          </svg>
        </span>
        Ver detalhes
      </button>
      <p className="mt-3 text-[12px]" style={{ color: "var(--d-fg-muted)" }}>
        {n} {n === 1 ? "ponto" : "pontos"} desta tela
      </p>
    </>
  );
}

// Estado do tour de um capítulo. O capítulo passa os passos e renderiza TourDesktop (lg) e
// TourMobile (abaixo do lg). O tour não mexe na rolagem: o passo só muda por clique ou seta.
export function useTour(steps: TourStep[]) {
  const [tour, setTour] = useState(false);
  const [active, setActive] = useState(0);

  const N = steps.length;
  const step = steps[active];
  // a gravação segue rodando: os detalhes não marcam pontos na tela
  const still = false;

  function openTour() {
    setActive(0);
    setTour(true);
  }

  function closeTour() {
    setTour(false);
  }

  function goTo(i: number) {
    setActive(Math.min(N - 1, Math.max(0, i)));
  }

  // no último passo, "Concluir" fecha o tour
  function next() {
    if (active === N - 1) closeTour();
    else goTo(active + 1);
  }

  return { tour, active, steps, N, step, still, openTour, closeTour, goTo, next };
}

export type TourState = ReturnType<typeof useTour>;

// Painel do tour: um passo por vez, trocado pelos botões ou pelas setas do teclado.
function TourPanel({ tour, panelRef }: { tour: TourState; panelRef?: RefObject<HTMLDivElement> }) {
  const reduced = useReduced();
  const { active, steps, N, step, closeTour, goTo, next } = tour;
  const last = active === N - 1;
  const nextRef = useRef<HTMLButtonElement>(null);

  // o botão que abriu o tour some: o foco do teclado vai para o "Próximo", sem rolar a página
  useEffect(() => {
    nextRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <motion.div
      ref={panelRef}
      role="group"
      aria-label="Detalhes desta tela"
      data-tour
      // o stopPropagation impede o DeckPlayer de trocar de capítulo com as setas (ele ouve em window)
      onKeyDown={(e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        e.stopPropagation();
        goTo(e.key === "ArrowRight" ? active + 1 : active - 1);
      }}
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, y: -14 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <div className="flex items-center justify-between">
        <p className="deck-mono text-[12px] tracking-[0.14em]" style={{ color: "var(--d-accent)" }}>
          {pad(active + 1)} / {pad(N)}
          {step.tag ? ` · ${step.tag.toUpperCase()}` : ""}
        </p>
        <button
          type="button"
          onClick={closeTour}
          className="text-[12px] uppercase tracking-[0.14em] opacity-60 transition-opacity hover:opacity-100"
        >
          Fechar
        </button>
      </div>

      {/* passos empilhados na mesma célula: a altura é a do maior, e nada pula ao trocar */}
      <div className="mt-4 grid" aria-live="polite">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            className="[grid-area:1/1]"
            initial={false}
            animate={{ opacity: i === active ? 1 : 0, y: i === active ? 0 : i < active ? -14 : 14 }}
            transition={{ duration: reduced ? 0 : 0.45, ease: EASE }}
            aria-hidden={i !== active}
            style={{ pointerEvents: i === active ? "auto" : "none" }}
          >
            <p
              style={{
                fontSize: "clamp(1.2rem, 1.8vw, 1.6rem)",
                fontWeight: 500,
                lineHeight: 1.2,
                color: "var(--d-fg)",
              }}
            >
              {s.title}
            </p>
            <p className="deck-body mt-4" style={{ fontSize: "clamp(0.95rem, 1.1vw, 1.0625rem)" }}>
              {s.text}
            </p>
          </motion.div>
        ))}
      </div>

      {/* no lg as barras encolhem para os botões nunca passarem da coluna; se nem assim cabem, a barra desce */}
      <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-x-6 lg:gap-y-3">
        <div className="order-2 flex gap-1.5 lg:order-1 lg:min-w-0 lg:flex-1 lg:basis-36">
          {steps.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir para: ${s.title}`}
              aria-current={i === active ? "step" : undefined}
              className="min-w-[10px] max-w-7 flex-1 py-3"
            >
              <span
                aria-hidden="true"
                className="block h-[2px] w-full transition-colors duration-300"
                style={{
                  background: i === active ? "var(--d-accent)" : i < active ? "var(--d-fg-muted)" : "var(--d-line)",
                }}
              />
            </button>
          ))}
        </div>

        <div className="order-1 flex items-center gap-2 lg:order-2 lg:ml-auto lg:shrink-0">
          <button
            type="button"
            aria-label="Passo anterior"
            onClick={() => goTo(active - 1)}
            className={cx(
              "inline-flex items-center gap-2 px-3 py-3 text-[12px] font-semibold uppercase tracking-[0.1em] opacity-70 transition-opacity hover:opacity-100",
              active === 0 && "invisible",
            )}
          >
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M6.5 1.5L3 5l3.5 3.5" />
            </svg>
            Anterior
          </button>

          {/* o anel chama o clique no primeiro passo; com reduced motion, não pisca */}
          <span className="relative flex flex-1 lg:flex-none">
            {active === 0 && !reduced && (
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[10px]"
                style={{ border: "2px solid var(--d-fg)" }}
                initial={{ scale: 1, opacity: 0.55 }}
                animate={{ scale: [1, 1.14], opacity: [0.55, 0] }}
                transition={{ duration: 1.5, ease: "easeOut", repeat: Infinity }}
              />
            )}
            <button
              ref={nextRef}
              type="button"
              onClick={next}
              className="relative inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-ink px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-lime transition-colors hover:bg-[#2a2a2e] lg:w-auto"
            >
              {last ? "Concluir" : "Próximo"}
              {last ? (
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M1.5 5.5L4 8l4.5-6" />
                </svg>
              ) : (
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M3.5 1.5L7 5l-3.5 3.5" />
                </svg>
              )}
            </button>
          </span>
        </div>
      </div>

      <p
        className="mt-4 text-[12px] transition-opacity duration-300"
        style={{ color: "var(--d-fg-muted)", opacity: active === 0 ? 1 : 0 }}
        aria-hidden={active !== 0}
      >
        Clique em Próximo para avançar.
      </p>
    </motion.div>
  );
}

function OnlyStep({ text, className }: { text: string; className?: string }) {
  return (
    <p className={cx("deck-body", className)} style={{ fontSize: "clamp(0.95rem, 1.1vw, 1.0625rem)" }}>
      {text}
    </p>
  );
}

// Lado do lg: o botão abre o painel no lugar dele, com a mesma animação de entrada e saída.
export function TourDesktop({ tour }: { tour: TourState }) {
  const reduced = useReduced();
  const { tour: open, N, openTour, steps } = tour;

  // sem "Ver detalhes" (Carlos, 2026-11-22): a tela mostra só o primeiro passo, o texto principal
  if (SHOW_ONLY_FIRST || N === 1) return <OnlyStep text={steps[0].text} className="mt-8 hidden lg:block" />;

  return (
    <div className="mt-10 hidden lg:block">
      <AnimatePresence mode="wait">
        {open ? (
          <TourPanel key="tour" tour={tour} />
        ) : (
          <motion.div
            key="cta"
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -14 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <TourButton n={N} onOpen={openTour} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Abaixo do lg: o painel abre logo abaixo do botão, com o mesmo passo a passo do lg.
export function TourMobile({ tour, className }: { tour: TourState; className?: string }) {
  const reduced = useReduced();
  const { tour: open, N, openTour, steps } = tour;
  const panelRef = useRef<HTMLDivElement>(null);

  // ao abrir, leva o painel à vista sem pular
  useEffect(() => {
    if (open) panelRef.current?.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [open, reduced]);

  if (SHOW_ONLY_FIRST || N === 1) return <OnlyStep text={steps[0].text} className={cx("lg:hidden", className)} />;

  return (
    <div className={cx("lg:hidden", className)}>
      {open ? (
        <TourPanel tour={tour} panelRef={panelRef} />
      ) : (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <TourButton n={N} onOpen={openTour} />
        </motion.div>
      )}
    </div>
  );
}
