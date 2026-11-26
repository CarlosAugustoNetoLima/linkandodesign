"use client";

import { createContext, Fragment, useContext, useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

const ReducedContext = createContext(false);

export function ReducedProvider({ children }: { children: ReactNode }) {
  const pref = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduced = mounted ? Boolean(pref) : false;
  return (
    <ReducedContext.Provider value={reduced}>
      <Fragment key={reduced ? "reduced" : "motion"}>{children}</Fragment>
    </ReducedContext.Provider>
  );
}

export function useReduced(): boolean {
  return useContext(ReducedContext);
}

export default useReduced;
