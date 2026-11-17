"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type Props = {
  progress: ReactNode;
  header: ReactNode;
  footer: ReactNode;
  agent: ReactNode;
  children: ReactNode;
};

// Chrome do site (progresso, header, footer, agente) em todas as páginas, exceto
// nos decks em /apresentacoes/<slug>: lá o palco é tela cheia com moldura própria.
// O hub /apresentacoes (sem barra final) mantém o chrome.
export default function SiteChrome({ progress, header, footer, agent, children }: Props) {
  const pathname = usePathname();

  if (pathname.startsWith("/apresentacoes/")) {
    return <main>{children}</main>;
  }

  return (
    <>
      {progress}
      {header}
      <main>{children}</main>
      {footer}
      {agent}
    </>
  );
}
