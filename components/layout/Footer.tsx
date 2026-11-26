import Link from "next/link";
import Image from "next/image";
import { getDictionary, type Locale } from "@/lib/i18n";
import { contactHref, hasWhatsapp, EMAIL } from "@/lib/contact";
import OpenChatLink from "@/components/agent/OpenChatLink";

export default function Footer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.footer;

  const links = [
    { href: "/", label: dict.nav.home },
    { href: "/apresentacoes", label: dict.nav.portfolio },
    { href: "/sobre", label: dict.nav.about },
    { href: "/briefing", label: (dict.nav as any).briefing || "Briefing" },
  ];

  return (
    <footer
      id="contato"
      className="mt-8 scroll-mt-20 rounded-t-[2rem] bg-charcoal text-white md:rounded-t-[3rem]"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 md:py-28">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-h1 font-extrabold uppercase">{dict.home.finalCta.title}</h2>
            <p className="mt-5 max-w-xl text-white/60">{dict.home.finalCta.text}</p>
          </div>

          <div className="flex flex-col items-start gap-3 md:shrink-0">
            <OpenChatLink className="btn-brut btn-brut--dark text-center">{dict.home.finalCta.cta} →</OpenChatLink>
            
            <a href={contactHref(locale)} className="link-brut text-sm text-white/60 hover:text-lime">
              {hasWhatsapp ? t.cta : EMAIL}
            </a>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-8 border-t border-white/15 pt-8 md:flex-row md:items-center md:justify-between">
          <Link href="/" aria-label="Linkando Design" className="shrink-0">
            <Image
              src="/logo-dark.svg"
              alt="Linkando Design"
              width={130}
              height={26}
              className="h-6 w-auto"
            />
          </Link>

          <nav aria-label={t.nav} className="flex flex-1 flex-wrap items-center justify-evenly gap-4 md:px-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="link-brut font-mono text-xs uppercase tracking-widest text-white/60 hover:text-lime"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <p className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-white/40">
            © {new Date().getFullYear()} Linkando Design. {t.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
