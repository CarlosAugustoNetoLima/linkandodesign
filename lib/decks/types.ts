import type { DeckFontKey } from "./fonts";

// Contrato dos decks de apresentação. Um deck é DADO (este tipo) + um motor
// genérico (components/deck). Nada aqui guarda função ou JSX: o dossiê de cada
// site é um objeto serializável, então a skill `build-site-deck` só precisa
// preencher campos, nunca escrever componente.

/** Vídeo em loop gravado do site real (mp4 h264 sem áudio) + frame de capa. */
export type Media = {
  /** caminho público do mp4, ex.: "/decks/cinnamon/hero-desktop.mp4" */
  src: string;
  /** jpg de capa (aparece antes do play e com prefers-reduced-motion) */
  poster: string;
  width: number;
  height: number;
  /** descrição curta do que a gravação mostra (acessibilidade) */
  alt: string;
};

/**
 * O palco (fundo, texto e linhas) é padronizado em `lib/decks/stage.ts`: o papel claro
 * da Linkando, igual ao das outras páginas. O tema traz só o que é do site apresentado.
 */
export type DeckTheme = {
  /** cor de destaque (pins, linhas ativas, números): use a variante do site que tem contraste sobre o papel */
  accent: string;
  accentInk: string; // texto sobre `accent` quando ele é preenchimento
  fontKey: DeckFontKey;
  /** fonte só dos títulos (capa e capítulos); padrão: `fontKey` */
  displayFontKey?: DeckFontKey;
  /** peso de TODOS os títulos de capítulo (Cinnamon: 300; a capa usa `coverWeight`) */
  displayWeight: number;
  /** tracking só do título da capa, estilo wordmark (ex.: "0.14em") */
  displayTracking: string;
  /** caixa alta só na capa; os títulos dos capítulos ficam em caixa normal */
  displayUppercase: boolean;
  /** raio de chips, cards e painéis do palco (ex.: "0px", "10px", "1rem") */
  radius: string;
  /** largura da fonte (eixo wdth, em %) nos títulos e na capa; só para fontes variáveis largas. Padrão 100 */
  displayStretch?: number;
  /** peso do título da capa (os capítulos usam `displayWeight`). Padrão 200 */
  coverWeight?: number;
};

type Base = {
  /** âncora e `id` da <section> */
  id: string;
  /** nome curto no rail de capítulos (1–2 palavras) */
  label: string;
};

export type Spec = { k: string; v: string };

/** 1 · Capa: título grande entrando letra a letra sobre um loop do site. */
export type CoverChapter = Base & {
  type: "cover";
  kicker: string; // linha pequena acima do título
  title: string;
  subtitle: string;
  chips: string[]; // stack em chips
  credit: string; // rodapé da capa
  backdrop: Media;
};

/** 2 · Afirmação: texto grande que se acende palavra a palavra com o scroll + contadores. */
export type StatementChapter = Base & {
  type: "statement";
  eyebrow: string;
  text: string;
  /** palavras (exatas, sem pontuação) que ganham a cor de destaque */
  emphasis: string[];
  stats: { value: number; prefix?: string; suffix?: string; label: string }[];
};

/** 3 · Identidade: paleta (hover expande, clique copia) e tipografia viva. */
export type IdentityChapter = Base & {
  type: "identity";
  eyebrow: string;
  title: string;
  swatches: { name: string; hex: string; role: string }[];
  fonts: {
    name: string;
    role: string;
    sample: string;
    weight: number;
    tracking?: string;
    uppercase?: boolean;
    /** exibe o exemplo na largura do display (`theme.displayStretch`), para fontes wide */
    wide?: boolean;
    /** mostra o exemplo nesta fonte; padrão: a do palco */
    fontKey?: DeckFontKey;
    size: "xl" | "lg" | "md" | "sm";
    note: string;
  }[];
};

/** 4 · Sequência: canvas desenhado a partir de frames, preso ao scroll do deck. */
export type SequenceChapter = Base & {
  type: "sequence";
  eyebrow: string;
  title: string;
  body: string;
  frames: {
    dir: string; // ex.: "/decks/cinnamon/seq"
    prefix: string; // ex.: "f_"
    pad: number; // zeros do índice (f_001 → 3)
    ext: "webp" | "jpg";
    count: number;
    width: number;
    height: number;
    /** progresso do scroll (0–1) em que o último frame é atingido; depois os frames congelam. Padrão 1 */
    endAt?: number;
  };
  /** cena final em foto: entra em crossfade sobre o último frame, com zoom contínuo e escurecimento no fim */
  outro?: {
    src: string;
    alt: string;
    /** texto curto do HUD enquanto a foto está visível (ex.: "FOTO · BANHEIRO") */
    label: string;
    /** progresso do scroll em que a foto começa a entrar */
    from: number;
    /** quanto do scroll dura o crossfade */
    fade: number;
    /** escala inicial e final do zoom contínuo (ex.: 1.04 → 1.22) */
    zoom: [number, number];
    /** escurecimento final (0–1), aplicado do progresso `dimFrom` até 1 */
    dim?: { from: number; to: number };
  };
  /** altura da área de scroll, em vh (ex.: 420) */
  scrollLength: number;
  /** legendas que entram e saem por faixa de progresso (0–1) */
  captions: { from: number; to: number; eyebrow: string; title: string }[];
  specs: Spec[];
};

/** 5 · Anatomia: gravação do site com pins que acendem um a um e explicam a decisão. */
export type AnatomyChapter = Base & {
  type: "anatomy";
  eyebrow: string;
  title: string;
  media: Media;
  /** x e y em % da gravação (0–100); r é o raio do spotlight em % da largura */
  pins: { x: number; y: number; r?: number; title: string; why: string }[];
};

/** 6 · Destaque: gravação + o que é + especificação + a decisão por trás (+ código). */
export type FeatureChapter = Base & {
  type: "feature";
  eyebrow: string;
  title: string;
  body: string;
  media: Media;
  mediaKind: "desktop" | "mobile";
  side: "left" | "right"; // lado da mídia no desktop
  specs: Spec[];
  decision?: { title: string; text: string };
};

/** 7 · Linguagem de movimento: curvas e durações reais, animadas em loop. */
export type MotionChapter = Base & {
  type: "motion";
  eyebrow: string;
  title: string;
  body: string;
  tokens: {
    name: string;
    /** cubic-bezier [x1, y1, x2, y2] equivalente */
    ease: [number, number, number, number];
    duration: number; // segundos
    stagger?: number;
    usage: string;
  }[];
  notes: string[];
};

/** 8 · Processo: linha do tempo que se desenha com o scroll. */
export type ProcessChapter = Base & {
  type: "process";
  eyebrow: string;
  title: string;
  body: string;
  steps: { n: string; name: string; output: string; note: string }[];
  footnote?: string;
};

/** 9 · Responsivo: desktop e celular lado a lado, em loop. */
export type ResponsiveChapter = Base & {
  type: "responsive";
  eyebrow: string;
  title: string;
  body: string;
  desktop: Media;
  mobile: Media;
  notes: Spec[];
};

/**
 * Tópicos: título + grade de cartões com um título e um texto simples cada. Serve para
 * descoberta, estrutura da página, desenvolvimento e testes: explicação direta, sem arquivos.
 */
export type TopicsChapter = Base & {
  type: "topics";
  eyebrow: string;
  title: string;
  body?: string;
  items: { title: string; text: string }[];
};

/** 10 · Chamada final: botão magnético "Ver projeto real". */
export type CtaChapter = Base & {
  type: "cta";
  title: string;
  body: string;
  button: string;
  note?: string;
};

export type Chapter =
  | CoverChapter
  | StatementChapter
  | IdentityChapter
  | SequenceChapter
  | AnatomyChapter
  | FeatureChapter
  | MotionChapter
  | ProcessChapter
  | TopicsChapter
  | ResponsiveChapter
  | CtaChapter;

export type Deck = {
  slug: string;
  /** posição no portfólio (1–9), mostrada como "01" */
  index: number;
  name: string;
  client: string;
  year: number;
  sector: string;
  location: string;
  /** bandeiras mostradas no card do hub, uma por país (🌍 quando o projeto atende o mundo todo) */
  flags: string[];
  tagline: string;
  /** link real (Vercel) aberto em nova aba */
  liveUrl: string;
  /** outros endereços do mesmo projeto (ex.: um produto em subdomínio), mostrados no CTA final */
  extraLinks?: { label: string; url: string; note?: string }[];
  stack: string[];
  theme: DeckTheme;
  /** capa do card no hub */
  cover: Media;
  summary: string;
  seo: { title: string; description: string };
  chapters: Chapter[];
};
