import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DeckPlayer from "@/components/deck/DeckPlayer";
import { decks, getDeck, getNextDeck } from "@/lib/decks";

export function generateStaticParams() {
  return decks.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const deck = getDeck(params.slug);
  if (!deck) return {};
  return {
    title: deck.seo.title,
    description: deck.seo.description,
    robots: { index: true },
  };
}

export default function ApresentacaoPage({ params }: { params: { slug: string } }) {
  const deck = getDeck(params.slug);
  if (!deck) notFound();

  const next = getNextDeck(params.slug);

  return <DeckPlayer deck={deck} next={next ? { slug: next.slug, name: next.name } : undefined} />;
}
