"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// A cena WebGL só existe no cliente (next/dynamic ssr:false precisa de um
// Client Component). Enquanto carrega, o gradiente do banner fica sozinho.
const HeroShowcase3D = dynamic(() => import("./HeroShowcase3D"), { ssr: false });

// Abaixo de 640px (breakpoint `sm`, mesmo ponto onde HeroBanner.tsx desenha o
// véu escuro) o Canvas NEM MONTA. Antes disso a cena inteira — 4 luzes,
// sombra recalculada todo frame, decode de vídeo, EffectComposer com Bloom+
// SMAA — rodava escondida atrás do véu a 80% de opacidade só para não
// aparecer. Zero ganho visual (o véu já cobria quase tudo) e o custo inteiro
// pago em celular, que é exatamente o hardware com menos margem.
export default function HeroShowcase3DLoader() {
  const [show3D, setShow3D] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    setShow3D(mq.matches);
    const fn = (ev: MediaQueryListEvent) => setShow3D(ev.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  // null no primeiro render (SSR/hidratação): não sabemos a largura ainda, e
  // chutar teria custo dos dois lados (monta e desmonta o WebGL, ou perde o
  // gate). Fica em branco por um instante — o gradiente do banner preenche.
  if (!show3D) return null;
  return <HeroShowcase3D />;
}
