import type { MetadataRoute } from "next";
import { decks } from "@/lib/decks";
import { projectSlugs } from "@/lib/projects";

const BASE_URL = "https://linkandodesign.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${BASE_URL}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority,
  });

  return [
    page("/", 1),
    page("/sobre", 0.6),
    page("/diagnostico", 0.8),
    page("/briefing", 0.8),
    page("/apresentacoes", 0.8),
    ...decks.map((d) => page(`/apresentacoes/${d.slug}`, 0.6)),
    ...projectSlugs.map((slug) => page(`/projeto/${slug}`, 0.6)),
  ];
}
