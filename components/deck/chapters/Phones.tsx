"use client";

import { motion, type Variants } from "framer-motion";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { chapterNumber } from "@/components/deck/chapterIndex";
import Chapter from "@/components/deck/primitives/Chapter";
import DeviceFrame from "@/components/deck/primitives/DeviceFrame";
import Eyebrow from "@/components/deck/primitives/Eyebrow";
import LoopVideo from "@/components/deck/primitives/LoopVideo";
import WordReveal from "@/components/deck/primitives/WordReveal";
import { useReduced } from "@/components/deck/useReduced";
import type { Deck, PhonesChapter } from "@/lib/decks/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Cada celular sobe e aparece; o atraso cresce com o índice (o `custom`).
const PHONE: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE, delay: i * 0.12 },
  }),
};

// espaço entre os celulares no lg (gap-8)
const GAP = 32;
const HEAD_FALLBACK_PX = 166;
// altura total da moldura do celular por largura: a tela é 390×844 e a borda da moldura é 3% da largura de cada lado
const PHONE_RATIO = 0.94 * (844 / 390) + 0.06;

// altura máxima de um celular: a altura da janela menos a barra do deck, o padding do capítulo, o bloco
// do cabeçalho (medido no cliente, com o valor de reserva do SSR) e a etiqueta com o endereço (~60 px).
// Vale abaixo do lg (uma fileira que rola, logo abaixo do cabeçalho).
const phoneMaxH = (headPx: number) =>
  `max(220px, calc((100svh - var(--deck-bar-h) - var(--sp-1) - ${headPx}px - var(--sp-3) - 60px) / ${PHONE_RATIO.toFixed(4)}))`;

// No lg, cada linha ocupa quase a altura da tela sozinha: a janela menos a barra do deck, uma margem e a etiqueta.
const phoneRowH = `calc((100svh - var(--deck-bar-h) - 48px - 72px) / ${PHONE_RATIO.toFixed(4)})`;
// celulares por linha no lg (7 páginas = 4 em cima e 3 embaixo, centradas)
const PER_ROW = 4;

// Celulares: várias gravações mobile lado a lado, para explorar a versão do celular de um site.
// Sem tour e sem hover: a leitura é direta. A partir de lg, linhas de até 4, centradas, todos do mesmo
// tamanho e cada linha com quase a altura da tela; abaixo de lg, uma fileira que rola na horizontal (~70% da largura).
// Com reduced motion, tudo aparece pronto.
export default function Phones({ chapter, deck }: { chapter: PhonesChapter; deck: Deck }) {
  const reduced = useReduced();
  const n = chapter.phones.length;
  const headRef = useRef<HTMLDivElement>(null);
  const [headPx, setHeadPx] = useState(HEAD_FALLBACK_PX);

  // altura real do bloco de cabeçalho (título de 1 ou 2 linhas): o teto dos celulares acompanha
  useEffect(() => {
    const el = headRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeadPx(Math.ceil(el.getBoundingClientRect().height)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // largura de cada celular: no lg, 1/4 da linha (menos os espaços) ou a altura da tela, o que for menor;
  // abaixo de lg, 70% da largura ou a altura da tela. A fração vem de `100%` do próprio row.
  const vars = {
    "--phone-m": `min(70vw, ${phoneMaxH(headPx)})`,
    "--phone-d": `min(calc((100% - ${(Math.min(n, PER_ROW) - 1) * GAP}px) / ${Math.min(n, PER_ROW)}), ${phoneRowH})`,
  } as CSSProperties;

  return (
    <Chapter id={chapter.id}>
      <div className="deck-container">
        {/* no lg o título e o texto ficam lado a lado: o cabeçalho baixo deixa os celulares maiores */}
        <div ref={headRef} className="lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-end lg:gap-x-12">
          <div className="min-w-0">
            <Eyebrow index={chapterNumber(deck, chapter.id)}>{chapter.eyebrow}</Eyebrow>
            <WordReveal
              as="h2"
              className="deck-h2 mt-5"
              style={{ fontSize: "clamp(1.5rem, 2.4vw, 2.3rem)" }}
              text={chapter.title}
            />
          </div>
          <motion.p
            className="deck-body mt-5 lg:mt-0 lg:!text-[15px]"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
          >
            {chapter.body}
          </motion.p>
        </div>

        {/* o gatilho fica no pai (sempre ocupa área); os celulares entram pelos variants */}
        <motion.div
          className="mt-[var(--sp-3)] min-w-0"
          style={vars}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "show"}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        >
          {/* abaixo de lg, a fileira rola na horizontal (só ela, sem estourar a página); a partir de lg, linhas de até 4 */}
          <div className="flex min-w-0 snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pb-6 lg:pb-0 lg:snap-none lg:flex-wrap lg:justify-center lg:gap-x-8 lg:gap-y-16 lg:overflow-visible lg:pb-0">
            {chapter.phones.map((p, i) => (
              <motion.figure
                key={p.label}
                className="w-[var(--phone-m)] shrink-0 snap-center lg:w-[var(--phone-d)]"
                custom={i}
                variants={reduced ? undefined : PHONE}
              >
                <DeviceFrame kind="phone" aspect={p.media.width / p.media.height}>
                  <LoopVideo media={p.media} />
                </DeviceFrame>
                <figcaption className="mt-4 text-center">
                  <p className="text-[13px] font-semibold leading-snug" style={{ color: "var(--d-fg)" }}>
                    {p.label}
                  </p>
                  {/* o endereço da página inicial ("/") não diz nada: só os das outras páginas aparecem */}
                  {p.url && p.url !== "/" && (
                    <p className="deck-mono mt-1 break-all text-[12px]" style={{ color: "var(--d-fg-muted)" }}>
                      {p.url}
                    </p>
                  )}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </motion.div>
      </div>
    </Chapter>
  );
}
