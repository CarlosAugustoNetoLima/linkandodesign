import { Archivo, Bebas_Neue, Inter, Inter_Tight, Montserrat, Plus_Jakarta_Sans } from "next/font/google";

// Fontes dos sites apresentados. Cada deck usa as fontes do próprio site como
// palco; só entra aqui a fonte de quem já tem deck. next/font precisa de
// declaração estática, por isso o registro é um objeto fixo e não um lookup.
export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-deck-montserrat",
  display: "swap",
});

// Archivo variável com eixo de largura (wdth): substitui a wide licenciada do Hubber.
export const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-deck-archivo", display: "swap" });

// Inter (fonte do Collision Auto Pros e do YANNS): variável, com os pesos que os sites usam.
export const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--font-deck-inter", display: "swap" });

// Inter Tight (fonte do AZ Car Rental): variável, 300 a 800.
export const interTight = Inter_Tight({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--font-deck-inter-tight", display: "swap" });

// Bebas Neue (fonte do Viva o Samba): peso único (400), usada nos títulos.
export const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: ["400"], variable: "--font-deck-bebas", display: "swap" });

// Plus Jakarta Sans (fonte do Viva o Samba): variável, de 300 a 800, para o texto.
export const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--font-deck-jakarta", display: "swap" });

export const deckFonts = { montserrat, archivo, inter, interTight, bebasNeue, plusJakarta } as const;

export type DeckFontKey = keyof typeof deckFonts;

/** Valor de `font-family` (variável CSS gerada pelo next/font) de cada fonte. */
export const deckFontFamily: Record<DeckFontKey, string> = {
  montserrat: "var(--font-deck-montserrat), ui-sans-serif, system-ui, sans-serif",
  archivo: "var(--font-deck-archivo), ui-sans-serif, system-ui, sans-serif",
  inter: "var(--font-deck-inter), ui-sans-serif, system-ui, sans-serif",
  interTight: "var(--font-deck-inter-tight), ui-sans-serif, system-ui, sans-serif",
  bebasNeue: "var(--font-deck-bebas), Impact, ui-sans-serif, system-ui, sans-serif",
  plusJakarta: "var(--font-deck-jakarta), ui-sans-serif, system-ui, sans-serif",
};
