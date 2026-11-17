"use client";

import { createContext, Fragment, useContext, useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

// useReducedMotion do framer devolve null no SSR e já true no 1º render do cliente
// de quem prefere menos movimento, o que quebra a hidratação. Por isso o 1º render
// do cliente sempre coincide com o do servidor (false) e a preferência entra após
// montar. Mas o framer NÃO reaplica `initial` quando `whileInView` vira undefined,
// então os elementos ficariam presos no estado oculto. A saída é remontar a
// subárvore (key) quando o valor muda: cada componente nasce já com o valor certo,
// lido do contexto, e renderiza o estado final direto.
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

/** Preferência por menos movimento. Precisa estar dentro de <ReducedProvider>. */
export function useReduced(): boolean {
  return useContext(ReducedContext);
}

export default useReduced;
