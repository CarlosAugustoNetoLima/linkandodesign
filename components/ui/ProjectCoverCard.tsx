"use client";

import Link from "next/link";
import Image from "next/image";

export type ProjectCoverCardProps = {
  slug: string;
  name: string;
  href: string;
  cover: string;
  year: string;
  flag: string;
  summary: string;
  tags: readonly string[];
  caseLabel: string;
};

export default function ProjectCoverCard({
  name,
  href,
  cover,
  year,
  flag,
  summary,
  tags,
  caseLabel,
}: ProjectCoverCardProps) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-line bg-surface shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-lg motion-reduce:transform-none">
      <Link href={href} className="block relative aspect-[16/10] w-full overflow-hidden bg-paper">
        <Image
          src={cover}
          alt={`Capa do projeto ${name}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.015]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
          quality={90}
        />
      </Link>

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
