import { decks } from "./index";
import type { Media } from "./types";

// Lista enxuta dos decks para a home: só o que o card e a seção de prova usam. Passar o `Deck`
// inteiro levaria os capítulos (pesados, com componentes cliente) para o bundle da home. O celular
// não está no dossiê: é a gravação `hero-mobile` na mesma pasta do cover.

export type ShowcaseItem = {
  slug: string;
  index: number;
  name: string;
  year: number;
  sector: string;
  location: string;
  flags: string[];
  tagline: string;
  desktop: Media; // deck.cover
  mobile: Media; // gravação do celular, na mesma pasta do cover
};

export function getShowcase(): ShowcaseItem[] {
  return decks.map((deck) => {
    const dir = deck.cover.src.slice(0, deck.cover.src.lastIndexOf("/") + 1);
    return {
      slug: deck.slug,
      index: deck.index,
      name: deck.name,
      year: deck.year,
      sector: deck.sector,
      location: deck.location,
      flags: deck.flags,
      tagline: deck.tagline,
      desktop: deck.cover,
      mobile: {
        src: dir + "hero-mobile.mp4",
        poster: dir + "hero-mobile.jpg",
        width: 520,
        height: 1126,
        alt: `${deck.name} no celular`,
      },
    };
  });
}

// Dor → decks que a provam, na ordem dos 3 serviços de `dict.home.services.items`.
export const serviceProofs: string[][] = [
  ["cinnamon-studio", "viva-o-samba"],
  ["collision-auto-pros", "az-car-rental"],
  ["tickett", "station-one"],
];
