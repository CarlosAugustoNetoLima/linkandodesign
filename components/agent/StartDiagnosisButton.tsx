"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { DIAG_START_KEY } from "@/components/agent/DiagnosisStarter";

// Abre o diagnóstico já com uma primeira mensagem (ex.: o serviço do card), como o campo do hero.
export default function StartDiagnosisButton({
  message,
  className,
  children,
}: {
  message: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();

  function start() {
    try {
      sessionStorage.setItem(DIAG_START_KEY, message);
      router.push("/diagnostico");
    } catch {
      router.push(`/diagnostico?q=${encodeURIComponent(message)}`);
    }
  }

  return (
    <button type="button" onClick={start} className={className}>
      {children}
    </button>
  );
}
