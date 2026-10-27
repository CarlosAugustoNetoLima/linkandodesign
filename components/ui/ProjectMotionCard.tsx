"use client";

import Link from "next/link";
import MotionPair, { type MotionPairDict } from "@/components/ui/MotionPair";

// Card de projeto: a gravação real do site em desktop e mobile, lado a lado,
// com a ficha do projeto logo abaixo — tudo dentro do mesmo card.
// Hover moderno: elevação suave com sombra difusa.
export type MotionCardProps = {
  slug: string; // base dos arquivos de gravação
  name: string;
  url: string; // domínio exibido na barra do navegador
  year: string;
  flag: string;
  summary: string;
  tags: readonly string[];
  href: string;
  caseLabel: string;
  devices: MotionPairDict;
};

export default function ProjectMotionCard({
  slug,
  name,
  url,
  year,
  flag,
  summary,
  tags,
  href,
  caseLabel,
  devices,
}: MotionCardProps) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-line bg-surface p-2 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-lg motion-reduce:transform-none">
      <MotionPair base={slug} name={name} url={url} dict={devices} />

      {/* Ficha do projeto — dentro do card */}
      <div className="p-4 sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="font-display text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
            {name} <span aria-hidden="true">{flag}</span>
          </h3>
          <span className="label opacity-60">{year}</span>
        </div>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          {summary}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-md border border-ink/15 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink/70"
              >
                {tag}
              </li>
            ))}
          </ul>

          <Link
            href={href}
            className="link-brut inline-flex items-center gap-1.5 text-sm font-semibold"
          >
            {caseLabel}
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
