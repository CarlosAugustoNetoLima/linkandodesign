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

/** Ponto marcado sobre a tela no tour: x e y são o CENTRO, em % da gravação. Com `w` e `h` (% da largura e da altura) o foco é um retângulo; sem eles, um círculo de raio `r` (% da largura). */
export type TourPin = { x: number; y: number; r?: number; w?: number; h?: number };

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
  /** coleção de ícones animados (opcional): cartões com traço que se desenha, como no site */
  icons?: {
    title: string; // ex.: "Ícones"
    note: string; // 1 frase sob o título
    /** false quando os ícones não se desenham no site: o bloco mostra o ícone parado */
    animated?: boolean;
    /** espessura do traço em px num ícone de 24; padrão 2 */
    stroke?: number;
    /** hover: true repete em ciclo o efeito de hover do site, na parte marcada com data-fx="scale" | "scale-left" | "rotate" */
    /** CSS das animações do próprio site (opcional): os ícones com `cls` usam essas classes, sem a animação de caneta */
    css?: string;
    items: { label: string; shapes: string; hover?: boolean; cls?: string }[]; // shapes = SVG interno de um ícone 24×24 de traço (path/circle/rect), sem o <svg>
  };
  /** animações (opcional): cartões de curva e duração, mostrados como último bloco do style guide */
  motion?: {
    title: string; // ex.: "Animações"
    note: string; // 1 frase sob o título
    tokens: MotionChapter["tokens"];
  };
  /** ilustrações do site (opcional): o SVG e o CSS copiados do site, num cartão com o fundo do site */
  illustrations?: {
    title: string;
    note: string;
    background: string;
    css: string;
    items: { label: string; svg: string }[];
  };
  /** sistema visual (opcional): escala tipográfica, espaçamentos e grid, mostrados abaixo dos ícones */
  system?: {
    /** escala tipográfica: cada step mostra um exemplo no tamanho real (ou em clamp, se for grande) */
    type: {
      title: string;
      note: string;
      steps: {
        name: string; // ex.: "Display"
        min: number; // px
        max: number; // px (igual a min quando o tamanho é fixo)
        weight: number;
        sample: string; // texto de exemplo
        tracking?: string; // ex.: "-0.02em"
        uppercase?: boolean;
        stretch?: number; // largura da fonte em % (eixo wdth), para fontes largas
        font?: "display" | "body"; // fonte do degrau: a dos títulos (padrão) ou a do texto
      }[];
    };
    /** escala de espaçamentos em px, com uma barra proporcional a cada passo */
    spacing: {
      title: string;
      note: string;
      steps: { px: number; use: string }[]; // ex.: { px: 16, use: "entre cards" }
    };
    /** grid, padrão de pontos e medidas de colunas */
    grid: {
      title: string;
      note: string;
      items: { k: string; v: string }[]; // ex.: { k: "Largura máxima", v: "1440 px" }
      /** colunas de cada divisão do grid (frações) */
      splits: { name: string; cols: number[] }[]; // ex.: { name: "Título e conteúdo", cols: [5, 7] }
      /** padrão de pontos do fundo: tamanho da célula, cor do fundo e cor do ponto */
      dots: { name: string; size: number; bg: string; dot: string }[];
    };
  };
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

/**
 * 5 · Anatomia: a tela abre só com o título e o botão "Ver detalhes". Cada pin vira um passo do tour,
 * um por clique, sem prender a rolagem: a gravação para no poster e o pin ativo ganha o foco escuro.
 */
export type AnatomyChapter = Base & {
  type: "anatomy";
  eyebrow: string;
  title: string;
  media: Media;
  /** x e y em % da gravação (0–100); r é o raio do spotlight em % da largura */
  pins: { x: number; y: number; r?: number; title: string; why: string }[];
};

/**
 * 6 · Destaque: a tela abre só com o título e o botão "Ver detalhes". `body`, cada `spec`
 * e `decision` viram os passos do tour, nessa ordem (nenhum campo muda). O tour avança por clique,
 * um passo por vez, sem prender a rolagem. No tour, a gravação para no quadro parado (o poster) e
 * `at` de cada spec diz onde marcar; sem nenhum `at`, o tour não para a gravação nem marca nada.
 */
export type FeatureChapter = Base & {
  type: "feature";
  eyebrow: string;
  title: string;
  body: string;
  media: Media;
  mediaKind: "desktop" | "mobile";
  side: "left" | "right"; // lado da mídia no desktop
  specs: (Spec & { at?: TourPin })[];
  decision?: { title: string; text: string };
  /** endereço mostrado na barra da moldura (ex.: "/about"); sem ele, vale o host do deck */
  frameUrl?: string;
  /** link que abre a página gravada em nova aba */
  link?: { url: string; label: string };
  /** "full": só cabeçalho e mídia, em tela cheia (sem texto ao lado nem tour); o `body` fica só para leitor de tela */
  layout?: "full";
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
};

/**
 * 9 · Responsivo: desktop e celular lado a lado, em loop. A tela abre só com o título e o botão
 * "Ver detalhes". `body` e cada `notes` viram os passos do tour, nessa ordem (nenhum campo muda).
 * O tour avança por clique, um passo por vez, sem prender a rolagem. No tour, a gravação para no
 * quadro parado (o poster) e `device` de cada nota diz qual aparelho ela explica; sem nenhum `device`,
 * o tour não para a gravação nem esmaece nada.
 */
export type ResponsiveChapter = Base & {
  type: "responsive";
  /** lado das mídias no desktop; o DeckPlayer alterna sozinho junto com as seções de efeito */
  side?: "left" | "right";
  eyebrow: string;
  title: string;
  body: string;
  desktop: Media;
  mobile: Media;
  notes: (Spec & { device?: "desktop" | "mobile" })[];
};

/** Item de um capítulo de tópicos: título e texto, com um número em destaque e etiquetas opcionais. */
export type TopicItem = {
  title: string;
  text: string;
  /** número em destaque no painel (ex.: "117", "62 → 91"); `label` diz o que ele mede */
  stat?: { value: string; label: string };
  /** nomes de tecnologias ou ferramentas, mostrados como etiquetas no painel */
  chips?: string[];
};

/**
 * Tópicos: título + explorador de itens. Só um item é lido por vez: um seletor à esquerda e o
 * detalhe (número grande, título, texto, etiquetas) à direita; no celular, um acordeão. Serve
 * para descoberta, estrutura da página, desenvolvimento e testes: explicação direta, sem arquivos.
 */
export type TopicsChapter = Base & {
  type: "topics";
  eyebrow: string;
  title: string;
  body?: string;
  items: TopicItem[];
  /** "map": o índice vira uma página esquematizada, com as seções na ordem em que aparecem */
  variant?: "map";
};

/**
 * 11 · Comparação: duas versões de uma página lado a lado, cada uma com a sua gravação em loop e o
 * seu link. Sem tour e sem hover na moldura: a leitura é direta.
 */
export type CompareChapter = Base & {
  type: "compare";
  eyebrow: string;
  title: string;
  body: string;
  /** de 2 a 7 versões ou páginas, na ordem das abas. Com 2, os dois links ficam visíveis; com 3 ou mais, só o da aba ativa */
  variants: {
    tag: string; // "A", "B"
    name: string; // "Página inicial A"
    text: string; // 1–2 frases
    media: Media; // gravação desktop 1280×800
    url: string; // endereço que abre esta versão
    /** endereço mostrado na barra da moldura (ex.: "site.com/?home=a"); sem ele, vale o host do deck */
    frameUrl?: string;
    button: string; // texto do link, ex.: "Abrir a versão A"
  }[];
  /** linha pequena abaixo das duas colunas (opcional) */
  note?: string;
};

/**
 * Celulares: várias gravações de celular (390×844) lado a lado, para explorar a versão mobile de um
 * site. Sem tour: a leitura é direta. Abaixo de lg, uma fileira que rola na horizontal.
 */
export type PhonesChapter = Base & {
  type: "phones";
  eyebrow: string;
  title: string;
  body: string; // 1–2 frases
  /** de 2 a 8 gravações de celular (todas as páginas do site), na ordem em que aparecem */
  phones: {
    label: string; // ex.: "Página inicial"
    media: Media; // gravação mobile 390×844
    url?: string; // endereço mostrado abaixo da tela, ex.: "/consulting"
  }[];
};

/** 12 · Chamada final: botão magnético "Ver projeto real". */
export type CtaChapter = Base & {
  type: "cta";
  title: string;
  body: string;
  button: string;
  note?: string;
};

/** Detalhes da interface: grade de recortes curtos, gravados de perto, cada um com só um nome. */
export type DetailsChapter = Base & {
  type: "details";
  eyebrow: string;
  title: string;
  items: { label: string; media: Media }[];
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
  | DetailsChapter
  | TopicsChapter
  | ResponsiveChapter
  | CompareChapter
  | PhonesChapter
  | CtaChapter;

/** Uma pessoa da ficha técnica. `role` fica vazio quando a função ainda não foi confirmada. */
export type Credit = { name: string; role?: string; href?: string; handle?: string };

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
  /** endereço mostrado na moldura do navegador quando as telas não são do liveUrl (ex.: um app fechado) */
  frameHost?: string;
  /** as gravações de computador já trazem a janela desenhada: o palco mostra só o recorte, sem a barra do navegador */
  mediaFramed?: boolean;
  /** telas maiores: a gravação ocupa ~70% da largura nos capítulos feature, anatomy e responsive */
  largeMedia?: boolean;
  stack: string[];
  theme: DeckTheme;
  /** capa do card no hub */
  cover: Media;
  summary: string;
  seo: { title: string; description: string };
  /** ficha técnica no fim do deck: quem trabalhou no projeto */
  credits: Credit[];
  chapters: Chapter[];
};
