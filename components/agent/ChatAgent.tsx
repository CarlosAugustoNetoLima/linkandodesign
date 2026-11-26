"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { getDictionary, type Locale } from "@/lib/i18n";

export default function ChatAgent({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).chat;
  const pathname = usePathname();
  if (pathname === "/diagnostico" || pathname === "/") return null;

  return (
    <Link
      href="/diagnostico"
      aria-label={t.openAria}
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-lg bg-ink text-lime shadow-btn transition-all duration-150 hover:-translate-y-0.5 hover:shadow-btn-hover"
    >
      <MessageCircle size={24} strokeWidth={2} aria-hidden />
    </Link>
  );
}
