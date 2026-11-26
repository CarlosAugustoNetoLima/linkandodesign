import { getDictionary, type Locale } from "@/lib/i18n";

export default function Method({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).home.method;

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 md:py-24">
      <p className="label">[{t.label}]</p>
      <h2 className="mt-4 max-w-2xl font-display text-h2 font-extrabold uppercase">{t.title}</h2>
      <p className="mt-5 max-w-2xl leading-relaxed text-muted">{t.text}</p>

      <ol className="mt-10 border-t border-line">
        {t.steps.map((s) => (
          <li
            key={s.n}
            className="grid grid-cols-[3rem_1fr] gap-x-6 border-b border-line py-5 md:grid-cols-[4rem_minmax(0,1fr)_minmax(0,1.4fr)]"
          >
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted">{s.n}</span>
            <h3 className="font-display text-lg font-extrabold uppercase md:text-xl">{s.title}</h3>
            <p className="col-start-2 mt-2 leading-relaxed text-muted md:col-start-3 md:row-start-1 md:mt-0">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
