"use client";

import { useEffect, useRef } from "react";

type Props = {
  active?: boolean;
  contained?: boolean;
  className?: string;
};

// Campo de pontos vivo: grade com respiração contínua e interatividade com cursor/toque.
export default function LivingDots({ active = false, contained = false, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  const mouseRef = useRef({
    x: -9999,
    y: -9999,
    targetX: -9999,
    targetY: -9999,
    active: false,
    radius: 140,
  });

  const ripplesRef = useRef<{ x: number; y: number; r: number; maxR: number; alpha: number }[]>([]);

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
      if (!canvas || !ctx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (contained) {
        const parent = canvas.parentElement;
        w = parent ? parent.clientWidth : canvas.clientWidth || window.innerWidth;
        h = parent ? parent.clientHeight : canvas.clientHeight || 500;
      } else {
        w = window.innerWidth;
        h = window.innerHeight;
      }
      gap = w < 640 ? 30 : 26;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    }

    function draw(now: number) {
      if (!ctx) return;
      // tempo acelerado: as ondas passam organicamente
      const t = reduce ? 4 : ((now - start) / 1000) * 2.2;
      const amp = 1 + boost * 0.45;
      ctx.clearRect(0, 0, w, h);

      const m = mouseRef.current;
      const ripples = ripplesRef.current;
      const mRad = m.radius;
      const mRad2 = mRad * mRad;

      const cols = Math.ceil(w / gap) + 1;
      const rows = Math.ceil(h / gap) + 1;
      const ox = (w - (cols - 1) * gap) / 2;
      const oy = (h - (rows - 1) * gap) / 2;

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const gx = ox + i * gap;
          const gy = oy + j * gap;

          // Ondas contínuas orgânicas
          const a = Math.sin(gx * 0.006 + t * 0.7 + Math.sin(gy * 0.004 + t * 0.4) * 1.6);
          const b = Math.sin(gy * 0.009 - t * 0.55 + gx * 0.003);
          const c = Math.sin(gx * 0.045 + gy * 0.038 + t * 1.2);
          let v = (a * 0.5 + b * 0.3 + c * 0.2) * 0.5 + 0.5; // 0..1
          v = Math.min(1, Math.max(0, (v - 0.5) * amp + 0.5));
          const p = v * v;

          // Interatividade com o cursor (repulsão sutil e iluminação)
          let mForce = 0;
          let pushX = 0;
          let pushY = 0;

          if (m.active) {
            const dx = gx - m.x;
            const dy = gy - m.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < mRad2) {
              const dist = Math.sqrt(d2);
              const norm = 1 - dist / mRad;
              mForce = norm * norm;
              const angle = Math.atan2(dy, dx);
              const push = mForce * 11;
              pushX = Math.cos(angle) * push;
              pushY = Math.sin(angle) * push;
            }
          }

          // Ondas de toque/clique (ripples)
          let ripForce = 0;
          for (let k = 0; k < ripples.length; k++) {
            const rip = ripples[k];
            const rdx = gx - rip.x;
            const rdy = gy - rip.y;
            const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
            const diff = Math.abs(rdist - rip.r);
            if (diff < 36) {
              const wave = (1 - diff / 36) * rip.alpha;
              if (wave > ripForce) ripForce = wave;
            }
          }

          const finalForce = Math.min(1, mForce + ripForce);
          const x = gx + pushX;
          const y = gy + pushY;

          const alpha = Math.min(1, 0.03 + p * 0.5 + finalForce * 0.65);
          const r = 0.4 + p * 1.0 + finalForce * 1.5;

          if (finalForce > 0.4 || (p > 0.86 && (i * 7 + j * 13) % 9 === 0)) {
            ctx.fillStyle = `rgba(238,251,110,${(alpha * 0.95).toFixed(3)})`;
          } else {
            ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
          }

          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function loop(now: number) {
      boost += ((activeRef.current ? 1 : 0) - boost) * 0.04;

      // Suavização da posição do mouse
      const m = mouseRef.current;
      if (m.active) {
        m.x += (m.targetX - m.x) * 0.16;
        m.y += (m.targetY - m.y) * 0.16;
      } else {
        m.x += (-9999 - m.x) * 0.1;
        m.y += (-9999 - m.y) * 0.1;
      }

      // Propagação de ripples
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.r += 6;
        rip.alpha *= 0.92;
        if (rip.r > rip.maxR || rip.alpha < 0.02) {
          ripples.splice(i, 1);
        }
      }

      draw(now);
      raf = requestAnimationFrame(loop);
    }

    function onPointerMove(e: PointerEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (contained) {
        const inside = mx >= -50 && mx <= rect.width + 50 && my >= -50 && my <= rect.height + 50;
        if (inside) {
          mouseRef.current.targetX = mx;
          mouseRef.current.targetY = my;
          mouseRef.current.active = true;
        } else {
          mouseRef.current.active = false;
        }
      } else {
        mouseRef.current.targetX = mx;
        mouseRef.current.targetY = my;
        mouseRef.current.active = true;
      }
    }

    function onPointerDown(e: PointerEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (contained) {
        if (mx >= 0 && mx <= rect.width && my >= 0 && my <= rect.height) {
          ripplesRef.current.push({
            x: mx,
            y: my,
            r: 0,
            maxR: Math.min(rect.width, 280),
            alpha: 0.95,
          });
        }
      } else {
        ripplesRef.current.push({
          x: mx,
          y: my,
          r: 0,
          maxR: 320,
          alpha: 0.95,
        });
      }
    }

    function onPointerLeave() {
      mouseRef.current.active = false;
    }

    function onVisibility() {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) raf = requestAnimationFrame(loop);
    }

    resize();

    let ro: ResizeObserver | null = null;
    if (contained && canvas.parentElement && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => resize());
      ro.observe(canvas.parentElement);
    } else {
      window.addEventListener("resize", resize);
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave);

    if (!reduce) {
      document.addEventListener("visibilitychange", onVisibility);
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("mouseleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [contained]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none z-0 ${
        contained
          ? "absolute inset-0 h-full w-full bg-charcoal"
          : "fixed inset-0 h-full w-full bg-charcoal"
      } ${className ?? ""}`}
    />
  );
}
