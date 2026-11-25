import type { Deck } from "./types";
import { cinnamon } from "./cinnamon";
import { hubber } from "./hubber";
import { collision } from "./collision";
import { az } from "./az";
import { tickett } from "./tickett";
import { vivaOSamba } from "./viva-o-samba";
import { yanns } from "./yanns";
import { stationOne } from "./station-one";
import { jsynq } from "./jsynq";
import { hubberReels } from "./hubber-reels";
import { jsynqWorkspace } from "./jsynq-workspace";
import { jsynqMarca } from "./jsynq-marca";
import { inTheLevel } from "./in-the-level";

// Registro dos decks. Para entrar no portfólio: criar `lib/decks/<site>.ts`
// (dossiê) e acrescentar aqui, na ordem em que aparecem no hub. Depois, tirar o
// nome da faixa "Em produção" em `app/apresentacoes/page.tsx`.
const all: Deck[] = [cinnamon, hubber, collision, az, tickett, vivaOSamba, yanns, stationOne, jsynq, hubberReels, jsynqWorkspace, jsynqMarca, inTheLevel];

// Fora do site até ser revisto (some da home, do portfólio, do chat e a página dá 404).
// Viva o Samba (Carlos, 2026-11-25): refazer os detalhes da interface.
const HIDDEN = new Set(["viva-o-samba"]);

export const decks: Deck[] = all.filter((d) => !HIDDEN.has(d.slug));

export function getDeck(slug: string): Deck | undefined {
  return decks.find((d) => d.slug === slug);
}

/** Próximo deck da lista, circular; undefined se só houver um. */
export function getNextDeck(slug: string): Deck | undefined {
  if (decks.length < 2) return undefined;
  const i = decks.findIndex((d) => d.slug === slug);
  return decks[(i + 1) % decks.length];
}
