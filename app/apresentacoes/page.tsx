import type { Metadata } from "next";
import DeckCard from "@/components/deck/DeckCard";
import Reveal from "@/components/motion/Reveal";
import { decks } from "@/lib/decks";

export function generateMetadata(): Metadata {
  return { title: "Apresentações · Linkando Design" };
}

export default function ApresentacoesPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-14 md:pt-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Portfólio</p>
        <h1 className="mt-4 max-w-4xl font-display text-display font-extrabold uppercase">
          Projetos entregues.
        </h1>
        <p className="mt-5 max-w-xl text-muted">
          Sites, landing pages, marcas e sistemas. Cada apresentação mostra os efeitos, as decisões de
          design e o link do projeto no ar.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          {decks.map((deck, i) => (
            <Reveal key={deck.slug} delay={i * 0.08} className="h-full">
              <DeckCard deck={deck} />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
