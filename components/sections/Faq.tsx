import { getDictionary, type Locale } from "@/lib/i18n";

// Acordeão em <details>/<summary>: acessível por teclado e leitor de tela sem
// JS. Caixas arredondadas soltas; o "+" gira para fechar e o item aberto fica
// marcado em preto (traço lime).
export default function Faq({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).home.faq;

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 md:py-24">
      <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:gap-16">
        <div>
          <p className="label">[{t.label}]</p>
          <h2 className="mt-4 font-display text-h2 font-extrabold uppercase">{t.title}</h2>
        </div>

        <div className="flex flex-col gap-3">
          {t.items.map((item) => (
            <details
              key={item.q}
              className="group overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-5 py-5 font-display text-lg font-extrabold transition-colors hover:bg-ink/5 group-open:bg-ink group-open:text-paper [&::-webkit-details-marker]:hidden sm:px-6">
                {item.q}
                <span aria-hidden="true" className="relative h-4 w-4 shrink-0">
                  <span className="absolute left-0 top-1/2 h-0.5 w-4 -translate-y-1/2 rounded-full bg-ink group-open:bg-lime" />
                  <span className="absolute left-1/2 top-0 h-4 w-0.5 -translate-x-1/2 rounded-full bg-ink transition-transform duration-200 group-open:rotate-90 group-open:opacity-0" />
                </span>
              </summary>
              <p className="max-w-2xl border-t border-line px-5 py-5 text-sm leading-relaxed text-muted sm:px-6">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
