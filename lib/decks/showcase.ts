import { decks } from "./index";
import type { Media } from "./types";


export type ShowcaseItem = {
  slug: string;
  index: number;
  name: string;
  year: number;
  sector: string;
  location: string;
  flags: string[];
  tagline: string;
  liveUrl: string;
  desktop: Media;
  mobile: Media;
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
      liveUrl: deck.liveUrl,
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

export const serviceProofs: string[][] = [
  ["jsynq-marca", "in-the-level"],
  ["jsynq", "tickett"],
  ["hubber-reels", "collision-auto-pros"],
  ["jsynq-workspace"],
];
