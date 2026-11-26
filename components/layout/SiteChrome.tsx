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

export default function SiteChrome({ progress, header, footer, agent, children }: Props) {
  const pathname = usePathname();

  if (pathname.startsWith("/apresentacoes/")) {
    return (
      <>
        <main>{children}</main>
        {agent}
      </>
    );
  }

  return (
    <>
      {progress}
      {header}
      <main>{children}</main>
      {pathname === "/diagnostico" ? null : footer}
      {agent}
    </>
  );
}
