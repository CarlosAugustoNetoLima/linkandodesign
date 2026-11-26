import type { Deck } from "@/lib/decks/types";

export function chapterNumber(deck: Deck, id: string): string {
  const i = deck.chapters.findIndex((c) => c.id === id);
  return String((i < 0 ? 0 : i) + 1).padStart(2, "0");
}
