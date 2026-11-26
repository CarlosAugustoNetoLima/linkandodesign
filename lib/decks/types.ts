import type { DeckFontKey } from "./fonts";


export type Media = {
  src: string;
  poster: string;
  width: number;
  height: number;
  alt: string;
};

export type DeckTheme = {
  accent: string;
  accentInk: string;
  fontKey: DeckFontKey;
  displayFontKey?: DeckFontKey;
  displayWeight: number;
  displayTracking: string;
  displayUppercase: boolean;
  radius: string;
  displayStretch?: number;
  coverWeight?: number;
};

type Base = {
  id: string;
  label: string;
};

export type Spec = { k: string; v: string };

export type TourPin = { x: number; y: number; r?: number; w?: number; h?: number };

export type CoverChapter = Base & {
  type: "cover";
  kicker: string;
  title: string;
  subtitle: string;
  chips: string[];
  credit: string;
  backdrop: Media;
};

export type StatementChapter = Base & {
  type: "statement";
  eyebrow: string;
  text: string;
  emphasis: string[];
};

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
    wide?: boolean;
    fontKey?: DeckFontKey;
    size: "xl" | "lg" | "md" | "sm";
    note: string;
  }[];
  icons?: {
    title: string;
    note: string;
    animated?: boolean;
    stroke?: number;
    css?: string;
    items: { label: string; shapes: string; hover?: boolean; cls?: string }[];
  };
  motion?: {
    title: string;
    note: string;
    tokens: MotionChapter["tokens"];
  };
  illustrations?: {
    title: string;
    note: string;
    background: string;
    css: string;
    items: { label: string; svg: string }[];
  };
  system?: {
    type: {
      title: string;
      note: string;
      steps: {
        name: string;
        min: number;
        max: number;
        weight: number;
        sample: string;
        tracking?: string;
        uppercase?: boolean;
        stretch?: number;
        font?: "display" | "body";
      }[];
    };
    spacing: {
      title: string;
      note: string;
      steps: { px: number; use: string }[];
    };
    grid: {
      title: string;
      note: string;
      items: { k: string; v: string }[];
      splits: { name: string; cols: number[] }[];
      dots: { name: string; size: number; bg: string; dot: string }[];
    };
  };
};

export type SequenceChapter = Base & {
  type: "sequence";
  eyebrow: string;
  title: string;
  body: string;
  frames: {
    dir: string;
    prefix: string;
    pad: number;
    ext: "webp" | "jpg";
    count: number;
    width: number;
    height: number;
    endAt?: number;
  };
  outro?: {
    src: string;
    alt: string;
    label: string;
    from: number;
    fade: number;
    zoom: [number, number];
    dim?: { from: number; to: number };
  };
  scrollLength: number;
  captions: { from: number; to: number; eyebrow: string; title: string }[];
  specs: Spec[];
};

export type AnatomyChapter = Base & {
  type: "anatomy";
  eyebrow: string;
  title: string;
  media: Media;
  pins: { x: number; y: number; r?: number; title: string; why: string }[];
};

export type FeatureChapter = Base & {
  type: "feature";
  eyebrow: string;
  title: string;
  body: string;
  media: Media;
  mediaKind: "desktop" | "mobile";
  side: "left" | "right";
  specs: (Spec & { at?: TourPin })[];
  decision?: { title: string; text: string };
  frameUrl?: string;
  link?: { url: string; label: string };
  layout?: "full";
};

export type MotionChapter = Base & {
  type: "motion";
  eyebrow: string;
  title: string;
  body: string;
  tokens: {
    name: string;
    ease: [number, number, number, number];
    duration: number;
    stagger?: number;
    usage: string;
  }[];
  notes: string[];
};

export type ProcessChapter = Base & {
  type: "process";
  eyebrow: string;
  title: string;
  body: string;
  steps: { n: string; name: string; output: string; note: string }[];
};

export type ResponsiveChapter = Base & {
  type: "responsive";
  side?: "left" | "right";
  eyebrow: string;
  title: string;
  body: string;
  desktop: Media;
  mobile: Media;
  notes: (Spec & { device?: "desktop" | "mobile" })[];
};

export type TopicItem = {
  title: string;
  text: string;
  stat?: { value: string; label: string };
  chips?: string[];
};

export type TopicsChapter = Base & {
  type: "topics";
  eyebrow: string;
  title: string;
  body?: string;
  items: TopicItem[];
  variant?: "map";
};

export type CompareChapter = Base & {
  type: "compare";
  eyebrow: string;
  title: string;
  body: string;
  variants: {
    tag: string;
    name: string;
    text: string;
    media: Media;
    url: string;
    frameUrl?: string;
    button: string;
  }[];
  note?: string;
};

export type PhonesChapter = Base & {
  type: "phones";
  eyebrow: string;
  title: string;
  body: string;
  phones: {
    label: string;
    media: Media;
    url?: string;
  }[];
};

export type CtaChapter = Base & {
  type: "cta";
  title: string;
  body: string;
  button: string;
  note?: string;
};

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

export type Credit = { name: string; role?: string; href?: string; handle?: string };

export type Deck = {
  slug: string;
  index: number;
  name: string;
  client: string;
  year: number;
  sector: string;
  location: string;
  flags: string[];
  tagline: string;
  liveUrl: string;
  extraLinks?: { label: string; url: string; note?: string }[];
  frameHost?: string;
  mediaFramed?: boolean;
  largeMedia?: boolean;
  stack: string[];
  theme: DeckTheme;
  cover: Media;
  summary: string;
  seo: { title: string; description: string };
  credits: Credit[];
  chapters: Chapter[];
};
