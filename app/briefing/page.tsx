import type { Metadata } from "next";
import BriefingForm from "@/components/briefing/BriefingForm";
import { briefingCopy } from "@/lib/briefing";
import { getLocale } from "@/lib/locale";

export function generateMetadata(): Metadata {
  return { title: briefingCopy[getLocale()].metaTitle };
}

export default function BriefingPage() {
  const locale = getLocale();
  const t = briefingCopy[locale];

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-14 md:pt-24">
      <p className="label">[{t.label}]</p>
      <h1 className="mt-4 max-w-3xl font-display text-h1 font-extrabold uppercase">{t.title}</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{t.text}</p>

      <div className="relative mt-14 md:mt-20">
        <BriefingForm locale={locale} />
      </div>
    </div>
  );
}
