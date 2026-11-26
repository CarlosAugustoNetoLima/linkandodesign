import Link from "next/link";
import type { ReactNode } from "react";

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
