import { decks } from "@/lib/decks";
import type { Chapter, Media } from "@/lib/decks/types";

type Clip = { src: string; w: number; h: number; poster?: string };
const clip = (m: Media): Clip => ({ src: m.src, w: m.width, h: m.height, poster: m.poster });

const GF: Record<string, string> = {
  montserrat: "Montserrat",
  archivo: "Archivo",
  inter: "Inter",
  interTight: "Inter Tight",
  bebasNeue: "Bebas Neue",
  plusJakarta: "Plus Jakarta Sans",
};

const lum = (hex: string) => {
  const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
  return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
};

const raw = decks.map((d) => {
  const ch = d.chapters as (Chapter & { id: string })[];
  const dir = d.cover.src.slice(0, d.cover.src.lastIndexOf("/") + 1);
  const details = ch.find((c) => c.type === "details");
  const page =
    ch.find((c) => c.id === "pagina-inicio" && c.type === "feature") ??
    ch.find((c) => c.id.startsWith("pagina-") && c.type === "feature");
  const phones = ch.find((c) => c.type === "phones");
  const identity = ch.find((c) => c.type === "identity");
  const features = ch.filter((c) => c.type === "feature" && c.mediaKind === "desktop") as Extract<Chapter, { type: "feature" }>[];
  const kind = !page && !details ? (d.mediaFramed && d.frameHost ? "system" : "brand") : "site";

  const build = kind === "brand" ? features.find((f) => f.media.src !== d.cover.src) : undefined;
  const shots = details
    ? details.items.map((i) => clip(i.media))
    : features.filter((f) => f.media.src !== d.cover.src && f !== page && f !== build).slice(0, 6).map((f) => clip(f.media));

  const phoneClips = phones && phones.type === "phones" ? phones.phones.slice(1).map((p) => clip(p.media)) : [];
  if (phoneClips.length < 3 && kind !== "brand")
    phoneClips.unshift(clip({ src: dir + "hero-mobile.mp4", poster: dir + "hero-mobile.jpg", width: 520, height: 1126, alt: "" }));

  const id = identity && identity.type === "identity" ? identity : undefined;
  const display = GF[d.theme.displayFontKey ?? d.theme.fontKey] ?? "Inter";
  return {
    slug: d.slug,
    name: d.name,
    kind,
    accent: lum(d.theme.accent) < 0.08 ? "#8d8d99" : d.theme.accent,
    frame: kind === "site" ? "browser" : "card",
    hero: clip(d.cover),
    coverStill: kind === "brand" ? (ch.find((c) => c.id === "papelaria" && c.type === "feature") ?? ch.find((c) => c.id === "versoes" && c.type === "feature")) : undefined,
    coverClip: null as Clip | null,
    heroMobile: kind === "brand" ? null : dir + "hero-mobile.mp4",
    build: build ? clip(build.media) : null,
    details: shots,
    page: page && page.type === "feature" ? clip(page.media) : null,
    phones: kind === "brand" ? [] : phoneClips,
    style: id
      ? {
          swatches: id.swatches.slice(0, 7).map((s) => ({ hex: s.hex, name: s.name })),
          fonts: id.fonts.slice(0, 2).map((f, i) => ({
            family: GF[f.fontKey ?? (i === 0 ? d.theme.displayFontKey ?? d.theme.fontKey : d.theme.fontKey)] ?? display,
            name: f.name,
            sample: f.sample,
            weight: f.weight,
            uppercase: !!f.uppercase,
          })),
          icons: id.icons ? { stroke: id.icons.stroke ?? 1.6, items: id.icons.items.slice(0, 8).map((i) => i.shapes) } : null,
          illustrations: id.illustrations ? id.illustrations.items.slice(0, 4).map((i) => i.svg) : [],
        }
      : null,
  };
});

const out = raw.map(({ coverStill, ...r }) => ({
  ...r,
  coverClip: coverStill && coverStill.type === "feature" ? clip(coverStill.media) : null,
}));
console.log(JSON.stringify(out, null, 1));
