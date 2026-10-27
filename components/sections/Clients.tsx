import { getDictionary, type Locale } from "@/lib/i18n";
import { getProjects } from "@/lib/projects";

// Prova social: marquee escura em bloco arredondado, com os nomes dos clientes
// em tipografia (os SVGs dos logos ainda não foram fornecidos; ao chegarem,
// trocar o <span> por <Image> aqui). Pausa no hover, contínua e suave.
export default function Clients({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).home.clients;
  const clients = getProjects(locale).map((p) => ({
    name: p.name,
    country: p.country,
  }));

  // a lista é duplicada porque a animação translada -50%: o segundo bloco
  // entra exatamente quando o primeiro sai, fechando o loop sem salto
  const loop = [...clients, ...clients, ...clients, ...clients];

  return (
    <section aria-label={t.title} className="px-2 pt-14 sm:px-3 md:pt-20">
      <div className="mx-auto max-w-7xl px-3">
        <h2 className="font-display text-xl font-extrabold uppercase">
          {t.title}
        </h2>
        <p className="mt-2 max-w-lg text-sm text-muted">{t.text}</p>
      </div>

      {/* faixa em bloco arredondado, na largura do container dos textos;
          group + pause no hover */}
      <div className="mx-auto mt-6 max-w-7xl px-3">
        <div className="group flex overflow-hidden rounded-3xl bg-charcoal py-5 shadow-dark">
          <ul className="flex shrink-0 animate-marquee items-center gap-10 pr-10 group-hover:[animation-play-state:paused] md:gap-14 md:pr-14">
            {loop.map((c, i) => (
              <li
                key={`${c.name}-${i}`}
                className="flex shrink-0 items-baseline gap-3"
              >
                <span aria-hidden="true" className="font-display text-lime">
                  ✦
                </span>
                <span className="font-display text-2xl font-extrabold uppercase tracking-tight text-paper md:text-3xl">
                  {c.name}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                  {c.country}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
