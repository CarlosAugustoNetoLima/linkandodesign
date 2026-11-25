import Link from "next/link";
import type { ReactNode } from "react";

// Botão de "Solicitar diagnóstico": leva à página /diagnostico, onde a IA conduz
// o diagnóstico gratuito em tela cheia.
export default function OpenChatLink({
  className,
  children,
  onOpen,
}: {
  className?: string;
  children: ReactNode;
  onOpen?: () => void;
}) {
  return (
    <Link href="/diagnostico" className={className} onClick={onOpen}>
      {children}
    </Link>
  );
}
