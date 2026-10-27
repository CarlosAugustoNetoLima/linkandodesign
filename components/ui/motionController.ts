// Controlador de "um par animado por vez".
//
// Cada gravação é um webp de keyframes cheios (~1MB); animar vários ao mesmo
// tempo satura a decodificação e trava a rolagem. Este módulo mantém o registro
// dos pares visíveis e, num loop rAF leve, elege o mais próximo do centro do
// viewport como o único ativo. Usa geometria (getBoundingClientRect) em vez de
// IntersectionObserver/eventos de scroll, que não disparam de forma confiável
// em todos os ambientes (ex.: preview iframado).
//
// Segurança contra "setState durante render": os setActive só são chamados de
// dentro do callback rAF (fora da fase de render do React) e apenas quando o
// valor muda.

type Sub = { el: HTMLElement; setActive: (v: boolean) => void; current: boolean };

const subs = new Set<Sub>();
let raf = 0;
let lastRun = 0;
let reduced = false;

if (typeof window !== "undefined") {
  reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function tick(now: number) {
  raf = requestAnimationFrame(tick);

  // recomputa no máximo ~a cada 120ms: geometria não precisa de 60Hz
  if (now - lastRun < 120) return;
  lastRun = now;

  if (document.hidden) return;

  const vh = window.innerHeight;
  const center = vh / 2;

  let winner: Sub | null = null;
  let best = Infinity;

  subs.forEach((s) => {
    const r = s.el.getBoundingClientRect();
    // precisa estar majoritariamente no viewport para concorrer
    const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    if (visible < Math.min(r.height, vh) * 0.5) return;
    const dist = Math.abs(r.top + r.height / 2 - center);
    if (dist < best) {
      best = dist;
      winner = s;
    }
  });

  subs.forEach((s) => {
    const shouldBeActive = s === winner;
    if (s.current !== shouldBeActive) {
      s.current = shouldBeActive;
      s.setActive(shouldBeActive);
    }
  });
}

// scroll/resize/visibilitychange forçam um recálculo imediato no próximo tick
// (resposta mais rápida em navegadores reais; o loop rAF é o driver contínuo).
function poke() {
  lastRun = 0;
}

let listening = false;
function ensureListeners() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("scroll", poke, { passive: true });
  window.addEventListener("resize", poke, { passive: true });
  document.addEventListener("visibilitychange", poke);
}

function start() {
  ensureListeners();
  if (!raf) raf = requestAnimationFrame(tick);
}

function stop() {
  if (raf) {
    cancelAnimationFrame(raf);
    raf = 0;
  }
}

// Registra um par. Retorna a função de limpeza para o useEffect.
export function subscribeMotion(el: HTMLElement, setActive: (v: boolean) => void) {
  if (reduced) return; // respeita quem pediu menos movimento: fica no poster

  const sub: Sub = { el, setActive, current: false };
  subs.add(sub);
  start();

  return () => {
    subs.delete(sub);
    if (subs.size === 0) stop();
  };
}
