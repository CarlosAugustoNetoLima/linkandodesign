"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Fragment, useEffect, useLayoutEffect, useRef } from "react";
import Chapter from "@/components/deck/primitives/Chapter";
import LoopVideo from "@/components/deck/primitives/LoopVideo";
import { useReduced } from "@/components/deck/useReduced";
import type { CoverChapter, Deck } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
// A moldura se abre de baixo para cima. O fim passa da caixa de propósito: um inset(0) cortaria a sombra.
const CLIP_HIDDEN = "inset(100% 0% 0% 0%)";
const CLIP_SHOWN = "inset(-50% -50% -50% -50%)";
// Tamanho máximo do título. A medição só reduz a partir daqui, nunca passa deste valor.
const TITLE_SIZE = "clamp(2.2rem, 5.4vw, 5.6rem)";
// Variável que o JS preenche quando a maior palavra não cabe. Sem ela, vale o clamp.
const FIT_VAR = "--cover-fs";
// useLayoutEffect mede antes do paint (sem piscar); no servidor vira useEffect, sem aviso.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

// Capa: papel claro, título gigante entrando letra a letra e o loop do site numa moldura
// em destaque. No scroll o texto recua e a moldura sobe. Com prefers-reduced-motion
// fica estática e sem entrada.
export default function Cover({ chapter, deck }: { chapter: CoverChapter; deck: Deck }) {
  const reduced = useReduced();
  // o wrapper tem a altura da própria seção: é o alvo do parallax
  const ref = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const frameY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const textOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.15]);

  // Nenhuma palavra quebra no meio: a maior precisa caber na largura útil da coluna.
  // Mede o scrollWidth da palavra mais larga contra a largura do título; se passar,
  // reduz a fonte na proporção e confere de novo (até 3 passadas, a largura é linear).
  // Refaz ao redimensionar e quando as fontes carregam, pois a medida muda com a fonte.
  useIsoLayoutEffect(() => {
    const h1 = titleRef.current;
    if (!h1) return;
    const fit = () => {
      h1.style.removeProperty(FIT_VAR); // volta ao clamp para medir o tamanho natural
      for (let pass = 0; pass < 3; pass++) {
        const avail = h1.clientWidth;
        let widest = 0;
        h1.querySelectorAll<HTMLElement>("[data-word]").forEach((w) => {
          widest = Math.max(widest, w.scrollWidth);
        });
        if (avail === 0 || widest <= avail) break;
        const size = parseFloat(getComputedStyle(h1).fontSize);
        h1.style.setProperty(FIT_VAR, `${(size * avail) / widest}px`);
      }
    };
    fit();
    let width = h1.clientWidth;
    const ro = new ResizeObserver(() => {
      if (h1.clientWidth !== width) {
        width = h1.clientWidth;
        fit();
      }
    });
    ro.observe(h1);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [chapter.title]);

  const lines = chapter.title.split("\n");
  let letter = 0; // índice global da letra, para o stagger atravessar as linhas

  return (
    <div ref={ref}>
      <Chapter id={chapter.id} className="deck-container deck-cover gap-10">
        {/* miolo: texto e moldura do vídeo no mesmo eixo central */}
        <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-y-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-x-16">
          <motion.div
            className="flex min-w-0 flex-col justify-center"
            style={{ y: reduced ? 0 : textY, opacity: reduced ? 1 : textOpacity }}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.24em]" style={{ color: "var(--d-accent)" }}>
              {chapter.kicker}
            </p>

            <h1
              ref={titleRef}
              aria-label={lines.join(" ")}
              className="mt-6"
              style={{
                fontSize: `var(${FIT_VAR}, ${TITLE_SIZE})`,
                lineHeight: 0.95,
                fontWeight: "var(--d-cover-weight, 200)",
                fontFamily: "var(--d-font-display, var(--d-font))",
                fontStretch: "var(--d-display-stretch, 100%)",
                letterSpacing: "var(--d-display-tracking)",
                textTransform: deck.theme.displayUppercase ? "uppercase" : "none",
                color: "var(--d-fg)",
              }}
            >
              {lines.map((line, li) => (
                <span key={li} className="block">
                  {line.split(" ").map((word, wi) => {
                    if (wi > 0) letter++; // o espaço entre palavras conta no stagger, como antes
                    return (
                      <Fragment key={wi}>
                        {wi > 0 && " "}
                        {/* a palavra é uma unidade: não quebra entre letras */}
                        <span data-word className="inline-block whitespace-nowrap">
                          {Array.from(word).map((ch) => {
                            const k = letter++;
                            return (
                              <span
                                key={k}
                                aria-hidden="true"
                                className="inline-block overflow-hidden align-top"
                                style={{ padding: "0.14em 0 0.3em", margin: "-0.14em 0 -0.3em" }}
                              >
                                <motion.span
                                  className="inline-block"
                                  initial={reduced ? false : { y: "160%" }}
                                  animate={{ y: 0 }}
                                  transition={{ duration: 1.2, ease: EASE, delay: 0.25 + k * 0.035 }}
                                >
                                  {ch}
                                </motion.span>
                              </span>
                            );
                          })}
                        </span>
                      </Fragment>
                    );
                  })}
                </span>
              ))}
            </h1>

            <motion.p
              className="deck-body mt-8"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 1.2 }}
            >
              {chapter.subtitle}
            </motion.p>

            <ul className="mt-8 flex flex-wrap gap-2">
              {chapter.chips.map((c, i) => (
                <motion.li
                  key={c}
                  className="border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em]"
                  style={{ borderColor: "var(--d-line)", borderRadius: "var(--d-radius)", color: "var(--d-fg)" }}
                  initial={reduced ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 1.4 + i * 0.06 }}
                >
                  {c}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* moldura do vídeo: a gravação do site em destaque, sobe no scroll */}
          <motion.div className="min-w-0" style={{ y: reduced ? 0 : frameY }}>
            <motion.div
              className="relative w-full overflow-hidden"
              style={{
                aspectRatio: `${chapter.backdrop.width} / ${chapter.backdrop.height}`,
                borderRadius: "max(var(--d-radius), 0px)",
                boxShadow: "0 40px 90px -40px rgba(23,23,26,.55)",
                background: "#111",
              }}
              initial={reduced ? false : { clipPath: CLIP_HIDDEN }}
              animate={reduced ? undefined : { clipPath: CLIP_SHOWN }}
              transition={{ duration: 1.3, ease: EASE, delay: 0.35 }}
            >
              <motion.div className="absolute inset-0" style={{ scale: reduced ? 1 : videoScale }}>
                <LoopVideo media={chapter.backdrop} eager />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* rodapé da capa, logo abaixo do miolo: crédito à esquerda, indicador à direita do container */}
        <div className="flex items-end justify-between gap-6">
          <p className="text-[11px]" style={{ color: "var(--d-fg-muted)" }}>
            {chapter.credit}
          </p>
          <div
            aria-hidden="true"
            className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em]"
            style={{ color: "var(--d-fg)" }}
          >
            <span>Role</span>
            <span className="relative block h-12 w-px overflow-hidden" style={{ background: "var(--d-line)" }}>
              <span className="deck-role-bar absolute inset-x-0 top-0 block h-full" style={{ background: "var(--d-fg)" }} />
            </span>
          </div>
        </div>
      </Chapter>
    </div>
  );
}
