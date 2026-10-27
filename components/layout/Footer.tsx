import Link from "next/link";
import Image from "next/image";
import { getDictionary, type Locale } from "@/lib/i18n";
import { contactHref, hasWhatsapp, EMAIL, SOCIAL } from "@/lib/contact";

// Bloco escuro de fechamento com topo arredondado: concentra a conversão.
// É o alvo do CTA do header (#contato).
export default function Footer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.footer;

  return (
    <footer
      id="contato"
      className="mt-8 scroll-mt-20 rounded-t-[2rem] bg-charcoal text-white md:rounded-t-[3rem]"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 md:py-28">
        <h2 className="max-w-3xl font-display text-h1 font-extrabold uppercase">{t.title}</h2>
        <p className="mt-5 max-w-xl text-white/60">{t.text}</p>

        <a href={contactHref(locale)} className="btn-brut btn-brut--dark mt-10">
          {/* sem número de WhatsApp configurado, o CTA fala a verdade e abre o e-mail */}
          {hasWhatsapp ? t.cta : EMAIL}
        </a>

        <div className="mt-20 flex flex-col gap-8 border-t border-white/15 pt-8 md:flex-row md:items-center md:justify-between">
          <Image
            src="/logo-dark.svg"
            alt="Linkando Design"
            width={130}
            height={26}
            className="h-6 w-auto"
          />

          <nav aria-label={t.nav} className="flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href="/portfolio"
              className="link-brut font-mono text-xs uppercase tracking-widest text-white/60 hover:text-lime"
            >
              {dict.nav.portfolio}
            </Link>
            <Link
              href="/sobre"
              className="link-brut font-mono text-xs uppercase tracking-widest text-white/60 hover:text-lime"
            >
              {dict.nav.about}
            </Link>
            {SOCIAL.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-brut font-mono text-xs uppercase tracking-widest text-white/60 hover:text-lime"
              >
                {s.label}
              </a>
            ))}
          </nav>

          <p className="font-mono text-[11px] uppercase tracking-widest text-white/40">
            © {new Date().getFullYear()} Linkando Design. {t.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
