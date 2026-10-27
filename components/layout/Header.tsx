"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { getDictionary, type Locale } from "@/lib/i18n";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

// Header glass: translúcido com blur sobre o conteúdo que passa por baixo.
export default function Header({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dict = getDictionary(locale);

  const links = [
    { href: "/portfolio", label: dict.nav.portfolio },
    { href: "/sobre", label: dict.nav.about },
  ];

  return (
    <header className="sticky top-0 z-50 bg-paper/70 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-6 px-4 sm:px-6 md:h-20">
        <Link href="/" aria-label="Linkando Design" onClick={() => setOpen(false)}>
          <Image
            src="/logo-ink.svg"
            alt="Linkando Design"
            width={150}
            height={30}
            priority
            className="h-6 w-auto md:h-7"
          />
        </Link>

        {/* links centralizados no espaço entre o logo e o grupo globo + CTA */}
        <nav className="hidden flex-1 items-center md:flex">
          <div className="flex flex-1 items-center justify-center gap-12 lg:gap-16">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`label link-brut transition-opacity ${
                  pathname.startsWith(l.href) ? "" : "opacity-60 hover:opacity-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher locale={locale} />

            <Link href="/briefing" className="btn-brut px-5 py-2.5 text-sm">
              {dict.nav.cta}
            </Link>
          </div>
        </nav>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink/20 bg-surface/70 backdrop-blur transition-colors active:bg-ink/10 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? dict.nav.close : dict.nav.menu}
          aria-expanded={open}
        >
          {/* ícone hambúrguer/X em CSS puro: sem lib de ícones só para isto */}
          <span className="relative block h-4 w-5" aria-hidden="true">
            <span
              className={`absolute left-0 block h-0.5 w-5 bg-ink transition-transform ${
                open ? "top-[7px] rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-[7px] block h-0.5 w-5 bg-ink transition-opacity ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 block h-0.5 w-5 bg-ink transition-transform ${
                open ? "top-[7px] -rotate-45" : "top-[14px]"
              }`}
            />
          </span>
        </button>
      </div>

      {open && (
        <nav className="border-t border-line bg-paper/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col px-6 py-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-4 font-display text-2xl font-extrabold uppercase"
              >
                {l.label}
              </Link>
            ))}
            <div className="py-4">
              <LanguageSwitcher locale={locale} />
            </div>
            <Link
              href="/briefing"
              onClick={() => setOpen(false)}
              className="btn-brut mb-2 text-center"
            >
              {dict.nav.cta}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
