import { EMAIL } from "@/lib/contact";
import type { Locale } from "@/lib/i18n";

// Serviços que o cliente pode marcar no briefing. O `id` é o contrato entre o
// formulário e a API; os rótulos em PT também vão no e-mail para o estúdio.
export const SERVICE_IDS = ["brand", "site", "landing", "system", "redesign", "other"] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

export const DEADLINE_IDS = ["asap", "1-2m", "3m+", "flexible"] as const;
export const BUDGET_IDS = ["b1", "b2", "b3", "b4", "talk"] as const;

type Option = { id: string; label: string; hint?: string };

export type BriefingCopy = {
  metaTitle: string;
  label: string;
  title: string;
  text: string;
  services: { title: string; hint: string; items: (Option & { id: ServiceId })[] };
  about: {
    title: string;
    name: string;
    email: string;
    phone: string;
    phoneHint: string;
    company: string;
    optional: string;
  };
  project: {
    title: string;
    details: string;
    detailsPlaceholder: string;
    reference: string;
    referencePlaceholder: string;
    deadline: string;
    budget: string;
    deadlines: Option[];
    budgets: Option[];
  };
  privacy: string;
  steps: { next: string; back: string; step: string; of: string };
  submit: string;
  sending: string;
  errors: { services: string; required: string; email: string; generic: string };
  success: { title: string; text: string; home: string };
};

export const briefingCopy: Record<Locale, BriefingCopy> = {
  pt: {
    metaTitle: "Briefing — Linkando Design",
    label: "Briefing",
    title: "Vamos criar o seu projeto juntos.",
    text: "Conte o que você precisa em poucos minutos. Não precisa ter tudo definido: a gente responde em até 24h e desenha o melhor caminho com você.",
    services: {
      title: "O que você quer criar?",
      hint: "Pode escolher mais de um.",
      items: [
        { id: "brand", label: "Marca", hint: "Identidade visual, logo e sistema de design" },
        { id: "site", label: "Site", hint: "Site institucional completo" },
        { id: "landing", label: "Landing page", hint: "Página focada em converter" },
        { id: "system", label: "Sistema / interface", hint: "Painel ou sistema interno da equipe" },
        { id: "redesign", label: "Redesign", hint: "Renovar marca ou site que já existe" },
        { id: "other", label: "Ainda não sei", hint: "Quero ajuda para descobrir" },
      ],
    },
    about: {
      title: "Quem é você?",
      name: "Nome",
      email: "E-mail",
      phone: "WhatsApp",
      phoneHint: "Com DDD, se preferir falar por lá",
      company: "Empresa",
      optional: "opcional",
    },
    project: {
      title: "Sobre o projeto",
      details: "O que está travando hoje?",
      detailsPlaceholder: "Conte o contexto, o problema e o que você espera do resultado.",
      reference: "Site atual ou referência",
      referencePlaceholder: "https://",
      deadline: "Prazo desejado",
      budget: "Investimento previsto",
      deadlines: [
        { id: "asap", label: "O quanto antes" },
        { id: "1-2m", label: "1 a 2 meses" },
        { id: "3m+", label: "3 meses ou mais" },
        { id: "flexible", label: "Sem pressa" },
      ],
      budgets: [
        { id: "b1", label: "Até R$ 5 mil" },
        { id: "b2", label: "R$ 5 a 10 mil" },
        { id: "b3", label: "R$ 10 a 20 mil" },
        { id: "b4", label: "Acima de R$ 20 mil" },
        { id: "talk", label: "Prefiro conversar" },
      ],
    },
    privacy: `Usamos estes dados só para responder ao seu pedido e preparar a proposta. Eles chegam por e-mail ao time da Linkando Design (${EMAIL}). Para corrigir ou apagar, escreva para esse endereço.`,
    steps: { next: "Continuar", back: "Voltar", step: "Etapa", of: "de" },
    submit: "Enviar briefing",
    sending: "Enviando…",
    errors: {
      services: "Escolha pelo menos um serviço.",
      required: "Preencha este campo.",
      email: "Informe um e-mail válido.",
      generic: `Não consegui enviar agora. Tente de novo em instantes ou escreva direto para ${EMAIL}.`,
    },
    success: {
      title: "Briefing recebido.",
      text: "Obrigado! Já avisamos o estúdio e você recebe nossa resposta em até 24h, no e-mail que informou.",
      home: "Voltar para o início",
    },
  },
  en: {
    metaTitle: "Briefing — Linkando Design",
    label: "Briefing",
    title: "Let's create your project together.",
    text: "Tell us what you need in a few minutes. You don't need everything figured out: we reply within 24 hours and shape the best path with you.",
    services: {
      title: "What do you want to create?",
      hint: "Pick as many as you like.",
      items: [
        { id: "brand", label: "Brand", hint: "Visual identity, logo and design system" },
        { id: "site", label: "Website", hint: "Complete company website" },
        { id: "landing", label: "Landing page", hint: "A page built to convert" },
        { id: "system", label: "System / interface", hint: "Dashboard or internal team tool" },
        { id: "redesign", label: "Redesign", hint: "Refresh an existing brand or site" },
        { id: "other", label: "Not sure yet", hint: "I'd like help figuring it out" },
      ],
    },
    about: {
      title: "Who are you?",
      name: "Name",
      email: "Email",
      phone: "WhatsApp",
      phoneHint: "With country code, if you'd rather chat there",
      company: "Company",
      optional: "optional",
    },
    project: {
      title: "About the project",
      details: "What's holding you back today?",
      detailsPlaceholder: "Share the context, the problem and what you expect from the result.",
      reference: "Current site or reference",
      referencePlaceholder: "https://",
      deadline: "Desired timeline",
      budget: "Expected investment",
      deadlines: [
        { id: "asap", label: "As soon as possible" },
        { id: "1-2m", label: "1 to 2 months" },
        { id: "3m+", label: "3 months or more" },
        { id: "flexible", label: "No rush" },
      ],
      budgets: [
        { id: "b1", label: "Up to €1,000" },
        { id: "b2", label: "€1,000 – 2,500" },
        { id: "b3", label: "€2,500 – 5,000" },
        { id: "b4", label: "Over €5,000" },
        { id: "talk", label: "I'd rather discuss it" },
      ],
    },
    privacy: `We use this information only to reply to your request and prepare the proposal. It reaches the Linkando Design team by email (${EMAIL}). To correct or delete it, write to that address.`,
    steps: { next: "Continue", back: "Back", step: "Step", of: "of" },
    submit: "Send briefing",
    sending: "Sending…",
    errors: {
      services: "Pick at least one service.",
      required: "Please fill in this field.",
      email: "Enter a valid email.",
      generic: `We couldn't send it right now. Please try again shortly or write to ${EMAIL}.`,
    },
    success: {
      title: "Briefing received.",
      text: "Thank you! The studio has been notified and you'll hear back within 24 hours, at the email you provided.",
      home: "Back to home",
    },
  },
};

// Rótulos para o e-mail do estúdio. Serviço e prazo saem sempre em PT; a faixa
// de investimento sai no idioma preenchido (as moedas diferem entre PT e EN).
const PT = briefingCopy.pt;
export const serviceLabelPt = (id: string) =>
  PT.services.items.find((i) => i.id === id)?.label ?? id;
export const deadlineLabelPt = (id: string) =>
  PT.project.deadlines.find((i) => i.id === id)?.label ?? id;
export const budgetLabel = (locale: Locale, id: string) =>
  briefingCopy[locale].project.budgets.find((i) => i.id === id)?.label ?? id;
