
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

  if (now - lastRun < 120) return;
  lastRun = now;

  if (document.hidden) return;

  const vh = window.innerHeight;
  const center = vh / 2;

  let winner: Sub | null = null;
  let best = Infinity;

  subs.forEach((s) => {
    const r = s.el.getBoundingClientRect();
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

export function subscribeMotion(el: HTMLElement, setActive: (v: boolean) => void) {
  if (reduced) return;

  const sub: Sub = { el, setActive, current: false };
  subs.add(sub);
  start();

  return () => {
    subs.delete(sub);
    if (subs.size === 0) stop();
  };
}
