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

const all: Deck[] = [cinnamon, hubber, collision, az, tickett, vivaOSamba, yanns, stationOne, jsynq, hubberReels, jsynqWorkspace, jsynqMarca, inTheLevel];

const HIDDEN = new Set(["viva-o-samba"]);

export const decks: Deck[] = all.filter((d) => !HIDDEN.has(d.slug));

export function getDeck(slug: string): Deck | undefined {
  return decks.find((d) => d.slug === slug);
}

export function getNextDeck(slug: string): Deck | undefined {
  if (decks.length < 2) return undefined;
  const i = decks.findIndex((d) => d.slug === slug);
  return decks[(i + 1) % decks.length];
}
