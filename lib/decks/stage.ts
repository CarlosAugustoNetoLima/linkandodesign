// O palco dos decks é um só para todos os sites: o papel claro e limpo da Linkando,
// o mesmo das outras páginas do portfólio. Assim o que se destaca é a apresentação
// do site (as gravações), não o fundo. A identidade de cada site entra pelo acento,
// pela fonte dos títulos e pelo raio (`DeckTheme`), e pelas próprias gravações.
export const STAGE = {
  bg: "#F4F3EE", // papel cru (--paper)
  bgAlt: "#FFFFFF", // painéis e cartões (--surface)
  fg: "#17171A", // tinta (--ink)
  fgMuted: "rgba(23,23,26,0.62)", // --muted
  line: "rgba(23,23,26,0.28)", // mais forte que o --line do site (.12): no deck as linhas precisam aparecer sobre o papel
  ink: "#17171A",
  lime: "#EEFB6E", // só como texto/detalhe sobre tinta, nunca como fundo no claro
} as const;
