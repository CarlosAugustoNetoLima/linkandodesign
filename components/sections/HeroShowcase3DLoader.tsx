"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const HeroShowcase3D = dynamic(() => import("./HeroShowcase3D"), { ssr: false });

export default function HeroShowcase3DLoader() {
  const [show3D, setShow3D] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    setShow3D(mq.matches);
    const fn = (ev: MediaQueryListEvent) => setShow3D(ev.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  if (!show3D) return null;
  return <HeroShowcase3D />;
}
