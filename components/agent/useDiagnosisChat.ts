"use client";

import { createElement, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/i18n";
import { EMAIL } from "@/lib/contact";

export type Message = { from: "agent" | "user"; text: string };

const fallback = {
  pt: {
    pricing: {
      brand:
        "O valor depende do escopo e só sai na proposta, que o time envia por e-mail em até 24h depois do diagnóstico. O diagnóstico é gratuito: faça aqui no chat ou em /briefing.",
      site: "O valor depende do escopo e só sai na proposta, que o time envia por e-mail em até 24h depois do diagnóstico. O diagnóstico é gratuito: faça aqui no chat ou em /briefing.",
      redesign:
        "O valor depende do escopo e só sai na proposta, que o time envia por e-mail em até 24h depois do diagnóstico. O diagnóstico é gratuito: faça aqui no chat ou em /briefing.",
      general:
        "O valor depende do escopo e só sai na proposta, que o time envia por e-mail em até 24h depois do diagnóstico. O diagnóstico é gratuito: faça aqui no chat ou em /briefing.",
    },
    deadline:
      "Depende do serviço: landing pages em 1–2 semanas, sites completos em 4–8 semanas, branding completo em 3–6 semanas. São estimativas, contadas a partir do início efetivo do projeto.",
    process: (n: number, titles: string) =>
      `Nosso processo tem ${n} etapas: ${titles}. Cada etapa é validada com você antes de avançar.`,
    services:
      "Trabalhamos com: Desenvolvimento de Marca, Redesign de Identidade, Criação de Site, Landing Page, Redesign de Site e sistemas internos. Qual desses faz mais sentido para você agora?",
    portfolio:
      "Temos sites, landing pages, marcas e sistemas recentes no portfólio, do imobiliário à música ao vivo, com clientes no Brasil, EUA, Portugal e França. Veja as apresentações em /apresentacoes. Quer que eu indique a mais parecida com o seu caso?",
    diagnosis:
      "Eu conduzo o diagnóstico por aqui, mas estou com instabilidade agora. Para não perder tempo, preencha o diagnóstico em /briefing (leva poucos minutos): o time analisa e envia a proposta por e-mail, com prazos e valores.",
    cta: "Estou com instabilidade agora. Para seguir, preencha o diagnóstico em /briefing (poucos minutos): o time responde em até 24h.",
  },
  en: {
    pricing: {
      brand:
        "Pricing depends on the scope. The proposal the team sends by email, within 24 hours of your diagnosis, includes the values in US dollars. Request your diagnosis here in the chat or at /briefing.",
      site: "Pricing depends on the scope. The proposal the team sends by email, within 24 hours of your diagnosis, includes the values in US dollars. Request your diagnosis here in the chat or at /briefing.",
      redesign:
        "Pricing depends on the scope. The proposal the team sends by email, within 24 hours of your diagnosis, includes the values in US dollars. Request your diagnosis here in the chat or at /briefing.",
      general:
        "Pricing depends on the scope. The proposal the team sends by email, within 24 hours of your diagnosis, includes the values in US dollars. Request your diagnosis here in the chat or at /briefing.",
    },
    deadline:
      "It depends on the service: landing pages in 1–2 weeks, full websites in 4–8 weeks, full branding in 3–6 weeks. These are estimates, counted from the actual start of the project.",
    process: (n: number, titles: string) =>
      `Our process has ${n} steps: ${titles}. Each step is validated with you before moving on.`,
    services:
      "We work with: Brand Development, Identity Redesign, Website Creation, Landing Pages, Website Redesign and internal systems. Which of these makes the most sense for you right now?",
    portfolio:
      "We have recent websites, landing pages, brands and systems in the portfolio, from real estate to live music, with clients in Brazil, the US, Portugal and France. See the presentations at /apresentacoes. Want me to point out the one closest to your case?",
    diagnosis:
      "I run the diagnosis here, but I'm having connection trouble right now. To save you time, fill in the diagnosis at /briefing (it takes a few minutes): the team reviews it and sends the proposal by email, with timelines and values.",
    cta: "I'm having connection trouble right now. To continue, fill in the diagnosis at /briefing (a few minutes): the team replies within 24 hours.",
  },
} as const;

export const privacy = {
  pt: {
    short: "Atendimento por IA. Se você informar e-mail ou telefone aqui, enviamos esta conversa ao nosso time.",
    toggle: "Privacidade",
    items: [
      "Quem responde: um assistente de IA (Google Gemini). Suas mensagens, inclusive nome e e-mail que você digitar aqui, são processadas pelo Google. No plano gratuito, o Google pode usar o conteúdo para melhorar os produtos dele. Por isso, não envie dados sensíveis aqui.",
      "O que guardamos: nada fica salvo no site. Só se você informar e-mail ou telefone, a conversa é enviada por e-mail ao time da Linkando Design, para respondermos a você.",
      `Responsável: Linkando Design, ${EMAIL}. Para acessar, corrigir ou apagar seus dados (LGPD, art. 18), escreva para esse e-mail.`,
    ],
  },
  en: {
    short: "AI-assisted chat. If you share an email or phone here, we send this conversation to our team.",
    toggle: "Privacy",
    items: [
      "Who replies: an AI assistant (Google Gemini). Your messages, including any name and email you type here, are processed by Google. On the free plan, Google may use content to improve its products, so please don't share sensitive data here.",
      "What we keep: nothing is stored on the site. Only if you share an email or phone is the conversation emailed to the Linkando Design team so we can reply.",
      `Controller: Linkando Design, ${EMAIL}. To access, correct or delete your data, write to that address.`,
    ],
  },
} as const;

const EMAIL_RE = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;
const PHONE_RE = /\+?\d[\d\s().-]{7,}\d/;

function findPhone(text: string): string | null {
  const m = text.match(PHONE_RE)?.[0].trim();
  if (!m) return null;
  const digits = m.replace(/\D/g, "").length;
  return digits >= 10 && digits <= 13 && !/^\d{4}-\d{2}-\d{2}$/.test(m) ? m : null;
}

const DONE_RE = /\[\[\s*diagnostico-completo\s*\]\]/i;
const OUT_RE = /\[\[\s*diagnostico-fora\s*\]\]/i;

export function stripMarkers(text: string): string {
  return text.replace(/\[\[[^\]]*\]\]/g, "").replace(/\[\[[^\]]*\]?$/, "").trimEnd();
}

type LeadStatus = "partial" | "complete" | "out";
type LeadState = "none" | LeadStatus;

function leadBody(locale: Locale, contact: string, status: LeadStatus, msgs: Message[]): string {
  return JSON.stringify({
    locale,
    contact,
    status,
    messages: msgs.map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text })),
  });
}

const LINKABLE = /(\/(?:briefing|apresentacoes(?:\/[a-z0-9-]+)?|portfolio|sobre|projeto\/[a-z0-9-]+)\b|https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;
export function renderText(text: string) {
  return text.split(LINKABLE).map((part, i) => {
    if (i % 2 === 0) return part;
    const cls = "font-semibold text-lime underline decoration-lime/50 underline-offset-2 hover:decoration-lime";
    if (part.startsWith("/"))
      return createElement(Link, { key: i, href: part, className: cls }, part);
    if (part.includes("@") && !part.startsWith("http"))
      return createElement("a", { key: i, href: `mailto:${part}`, className: cls }, part);
    return createElement(
      "a",
      { key: i, href: part, target: "_blank", rel: "noopener noreferrer", className: cls },
      part,
    );
  });
}

function fallbackReply(locale: Locale, input: string, greeting: string): string {
  const f = fallback[locale];
  const t = input.toLowerCase();
  if (/diagn[oó]stic|diagnos/.test(t)) return f.diagnosis;
  if (/or[cç]amento|proposta|\bquote\b|proposal|come[cç]ar|\bstart\b|contratar|\bhire\b/.test(t)) return f.cta;
  if (/quanto custa|preço|preco|valor|investimento|custo|how much|price|pricing|cost/.test(t)) {
    if (/marca|branding|identidade|brand|identity/.test(t)) return f.pricing.brand;
    if (/redesign/.test(t)) return f.pricing.redesign;
    if (/site|landing|página|pagina|web/.test(t)) return f.pricing.site;
    return f.pricing.general;
  }
  if (/prazo|tempo|quanto tempo|demora|data|entrega|timeline|how long|deadline|delivery/.test(t))
    return f.deadline;
  if (/como funciona|processo|etapas|metodologia|process|how does|method/.test(t)) {
    const steps = getDictionary(locale).home.method.steps;
    return f.process(steps.length, steps.map((s) => s.title).join(" → "));
  }
  if (/serviço|servico|o que voc|fazem|oferec|service|what do you/.test(t)) return f.services;
  if (/portfolio|portfólio|trabalhos anteriores|cases|projetos|projects|work/.test(t))
    return f.portfolio;
  const isGreeting = t.split(/[^a-zà-ÿ]+/).some((w) => ["oi", "olá", "ola", "hey", "hi", "hello"].includes(w));
  if (isGreeting || /bom dia|boa tarde|boa noite/.test(t)) return greeting;
  return f.cta;
}

export function useDiagnosisChat(locale: Locale) {
  const t = getDictionary(locale).chat;
  const [messages, setMessages] = useState<Message[]>([{ from: "agent", text: t.greeting }]);
  const [typing, setTyping] = useState(false);
  const busyRef = useRef(false);
  const contactRef = useRef<string | null>(null);
  const leadStateRef = useRef<LeadState>("none");
  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    function onPageHide() {
      const contact = contactRef.current;
      if (!contact || leadStateRef.current !== "none") return;
      leadStateRef.current = "partial";
      navigator.sendBeacon(
        "/api/chat/lead",
        new Blob([leadBody(locale, contact, "partial", messagesRef.current)], { type: "application/json" }),
      );
    }
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [locale]);

  function postLead(status: LeadStatus, msgs: Message[]) {
    const contact = contactRef.current ?? "";
    if (!contact && status !== "out") return;
    const prev = leadStateRef.current;
    leadStateRef.current = status;
    fetch("/api/chat/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: leadBody(locale, contact, status, msgs),
    }).catch(() => {
      leadStateRef.current = prev;
    });
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busyRef.current) return;
    busyRef.current = true;

    const nextMessages: Message[] = [...messages, { from: "user", text: trimmed }];
    const email = trimmed.match(EMAIL_RE)?.[0];
    if (email) contactRef.current = email;
    else if (!contactRef.current) contactRef.current = findPhone(trimmed);
    let reply = "";
    setMessages(nextMessages);
    setTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          messages: nextMessages.map((m) => ({
            role: m.from === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      if (!res.ok || !res.body) throw new Error(`status ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      let started = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        reply = acc;
        if (!started) {
          started = true;
          setTyping(false);
          setMessages((m) => [...m, { from: "agent", text: "" }]);
        }
        const current = stripMarkers(acc);
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { from: "agent", text: current };
          return copy;
        });
      }

      if (!started) throw new Error("resposta vazia");
    } catch {
      setTyping(false);
      setMessages((m) => [
        ...m,
        { from: "agent", text: fallbackReply(locale, trimmed, t.greeting) },
      ]);
    } finally {
      busyRef.current = false;
      setTyping(false);
      if (DONE_RE.test(reply) && leadStateRef.current !== "complete") {
        postLead("complete", [...nextMessages, { from: "agent", text: stripMarkers(reply) }]);
      } else if (OUT_RE.test(reply) && leadStateRef.current === "none") {
        postLead("out", [...nextMessages, { from: "agent", text: stripMarkers(reply) }]);
      }
    }
  }

  return { messages, typing, send };
}
