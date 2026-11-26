"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { DIAG_START_KEY } from "@/components/agent/DiagnosisStarter";

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
