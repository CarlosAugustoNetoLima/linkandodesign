"use client";

import type { ReactNode } from "react";

// Botão de "Solicitar diagnóstico": abre o chat da IA (ChatAgent escuta este evento).
// O href é só fallback sem JavaScript: leva ao formulário /briefing.
export const OPEN_CHAT_EVENT = "linkando:open-chat";

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
    <a
      href="/briefing"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        window.dispatchEvent(new Event(OPEN_CHAT_EVENT));
        onOpen?.();
      }}
    >
      {children}
    </a>
  );
}
