(function () {
  const q = new URLSearchParams(location.search);
  const fit = document.getElementById("fit");
  const resize = () => {
    const k = Math.max(innerWidth / 1600, innerHeight / 1000);
    fit.style.transform = `translate(-50%,-50%) scale(${k})`;
  };
  resize();
  addEventListener("resize", resize);

  const all = [...document.querySelectorAll(".scene")];
  const ids = (q.get("s") || all[0].id).split(",");
  const scenes = ids.map((id) => document.getElementById(id)).filter(Boolean);
  scenes.forEach((s) => s.classList.add("on"));
  scenes.forEach((s, i) => (s.style.zIndex = 1));
  scenes.slice(1).forEach((s) => (s.style.opacity = 0));

  const cam = (s, p) => {
    const [s0, x0, y0, s1, x1, y1] = (s.dataset.cam || "1,0,0,1.05,-10,-6").split(",").map(Number);
    const e = (1 - Math.cos(Math.PI * p)) / 2;
    const c = s.querySelector(".cam");
    if (c) c.style.transform = `translate(${x0 + (x1 - x0) * e}px,${y0 + (y1 - y0) * e}px) scale(${s0 + (s1 - s0) * e})`;
  };
  scenes.forEach((s) => cam(s, 0));
  if (q.get("anim") !== "1") return;

  const H = Number(q.get("hold") || 5.2);
  const F = 1.0;
  const N = scenes.length;
  const P = N * (H + F);
  let t0 = null;
  const running = () => q.get("play") === "1" || getComputedStyle(document.documentElement).getPropertyValue("--run").trim() === "running";

  function frame(now) {
    if (t0 === null) {
      if (!running()) return requestAnimationFrame(frame);
      t0 = now;
    }
    const t = ((now - t0) / 1000) % (N === 1 ? 16 : P);
    if (N === 1) {
      const p = t < 8 ? t / 8 : 1 - (t - 8) / 8;
      cam(scenes[0], p);
    } else {
      const idx = Math.floor(t / (H + F));
      const local = t - idx * (H + F);
      scenes.forEach((s, i) => {
        const u = (((t - i * (H + F) + F) % P) + P) % P;
        cam(s, Math.min(1, u / (H + 2 * F)));
        s.style.opacity = 0;
        s.style.zIndex = 1;
      });
      const cur = scenes[idx];
      cur.style.opacity = 1;
      if (local > H) {
        const nx = scenes[(idx + 1) % N];
        nx.style.zIndex = 2;
        const a = (local - H) / F;
        nx.style.opacity = (1 - Math.cos(Math.PI * a)) / 2;
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
