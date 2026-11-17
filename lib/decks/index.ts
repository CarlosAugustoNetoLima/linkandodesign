import type { Deck } from "./types";
import { cinnamon } from "./cinnamon";
import { hubber } from "./hubber";
import { collision } from "./collision";
import { az } from "./az";
import { tickett } from "./tickett";
import { vivaOSamba } from "./viva-o-samba";
import { yanns } from "./yanns";
import { stationOne } from "./station-one";

// Registro dos decks. Para entrar no portfólio: criar `lib/decks/<site>.ts`
// (dossiê) e acrescentar aqui, na ordem em que aparecem no hub. Depois, tirar o
// nome da faixa "Em produção" em `app/apresentacoes/page.tsx`.
export const decks: Deck[] = [cinnamon, hubber, collision, az, tickett, vivaOSamba, yanns, stationOne];

export function getDeck(slug: string): Deck | undefined {
  return decks.find((d) => d.slug === slug);
}

/** Próximo deck da lista, circular; undefined se só houver um. */
export function getNextDeck(slug: string): Deck | undefined {
  if (decks.length < 2) return undefined;
  const i = decks.findIndex((d) => d.slug === slug);
  return decks[(i + 1) % decks.length];
}
