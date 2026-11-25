import type { Metadata } from "next";
import DiagnosisChat from "@/components/agent/DiagnosisChat";
import { getLocale } from "@/lib/locale";

const metas = {
  pt: {
    title: "Diagnóstico gratuito | Linkando Design",
    description: "Conte o seu projeto numa conversa rápida e receba a proposta por e-mail em até 24h.",
  },
  en: {
    title: "Free diagnosis | Linkando Design",
    description: "Tell us about your project in a quick chat and get the proposal by email within 24 hours.",
  },
} as const;

export function generateMetadata(): Metadata {
  return metas[getLocale()];
}

export default function DiagnosticoPage() {
  return <DiagnosisChat locale={getLocale()} />;
}
