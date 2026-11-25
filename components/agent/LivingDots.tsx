"use client";

import { useEffect, useRef } from "react";

// Campo de pontos que respira: grade fixa na viewport, brilho e tamanho vindos de ondas lentas.
export default function LivingDots({ active = false }: { active?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let gap = 26;
    let raf = 0;
    let boost = 0;
    const start = performance.now();

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      gap = w < 640 ? 32 : 26;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    }

    function draw(now: number) {
      // tempo acelerado: as ondas passam mais ligeiras
      const t = reduce ? 4 : ((now - start) / 1000) * 2.2;
      const amp = 1 + boost * 0.45;
      ctx!.clearRect(0, 0, w, h);
      const cols = Math.ceil(w / gap) + 1;
      const rows = Math.ceil(h / gap) + 1;
      const ox = (w - (cols - 1) * gap) / 2;
      const oy = (h - (rows - 1) * gap) / 2;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const gx = ox + i * gap;
          const gy = oy + j * gap;
          const a = Math.sin(gx * 0.006 + t * 0.7 + Math.sin(gy * 0.004 + t * 0.4) * 1.6);
          const b = Math.sin(gy * 0.009 - t * 0.55 + gx * 0.003);
          // frequência alta: vizinhos ficam em fases diferentes, uns acendem enquanto outros apagam
          const c = Math.sin(gx * 0.045 + gy * 0.038 + t * 1.2);
          let v = (a * 0.5 + b * 0.3 + c * 0.2) * 0.5 + 0.5; // 0..1
          v = Math.min(1, Math.max(0, (v - 0.5) * amp + 0.5));
          const p = v * v;
          // o ponto fica no lugar: só o brilho e o tamanho pulsam, fortes e fracos intercalando
          const x = gx;
          const y = gy;
          const alpha = 0.03 + p * 0.5;
          const r = 0.4 + p * 1.0;
          if (p > 0.86 && (i * 7 + j * 13) % 9 === 0) ctx!.fillStyle = `rgba(238,251,110,${(alpha * 0.9).toFixed(3)})`;
          else ctx!.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
          ctx!.beginPath();
          ctx!.arc(x, y, r, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }

    function loop(now: number) {
      boost += ((activeRef.current ? 1 : 0) - boost) * 0.04;
      draw(now);
      raf = requestAnimationFrame(loop);
    }

    function onVisibility() {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) raf = requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener("resize", resize);
    if (!reduce) {
      document.addEventListener("visibilitychange", onVisibility);
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full bg-charcoal"
    />
  );
}
