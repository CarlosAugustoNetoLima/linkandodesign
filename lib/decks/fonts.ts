import { Archivo, Bebas_Neue, Inter, Inter_Tight, Montserrat, Plus_Jakarta_Sans } from "next/font/google";

export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-deck-montserrat",
  display: "swap",
});

export const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-deck-archivo", display: "swap" });

export const inter = Inter({ subsets: ["latin"], variable: "--font-deck-inter", display: "swap" });

export const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-deck-inter-tight", display: "swap" });

export const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: ["400"], variable: "--font-deck-bebas", display: "swap" });

export const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--font-deck-jakarta", display: "swap" });

export const deckFonts = { montserrat, archivo, inter, interTight, bebasNeue, plusJakarta } as const;

export type DeckFontKey = keyof typeof deckFonts;

export const deckFontFamily: Record<DeckFontKey, string> = {
  montserrat: "var(--font-deck-montserrat), ui-sans-serif, system-ui, sans-serif",
  archivo: "var(--font-deck-archivo), ui-sans-serif, system-ui, sans-serif",
  inter: "var(--font-deck-inter), ui-sans-serif, system-ui, sans-serif",
  interTight: "var(--font-deck-inter-tight), ui-sans-serif, system-ui, sans-serif",
  bebasNeue: "var(--font-deck-bebas), Impact, ui-sans-serif, system-ui, sans-serif",
  plusJakarta: "var(--font-deck-jakarta), ui-sans-serif, system-ui, sans-serif",
};
