"use client";

import { createElement, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/i18n";
import { EMAIL } from "@/lib/contact";

export type Message = { from: "agent" | "user"; text: string };

// Fallback offline — usado só se a API do agente estiver indisponível
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

// Aviso de privacidade do chat (LGPD, art. 9º: finalidade, forma, controlador,
// compartilhamento e direitos). Mantenha em sincronia com o que a rota
// /api/chat e /api/chat/lead realmente fazem.
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

// Telefone só com 10 a 13 dígitos e que não seja data (2026-12-01): sem isso, um
// número qualquer da conversa (data, orçamento) viraria o "contato" do visitante.
function findPhone(text: string): string | null {
  const m = text.match(PHONE_RE)?.[0].trim();
  if (!m) return null;
  const digits = m.replace(/\D/g, "").length;
  return digits >= 10 && digits <= 13 && !/^\d{4}-\d{2}-\d{2}$/.test(m) ? m : null;
}

// Marcador que a IA escreve ao concluir o diagnóstico. Não aparece na tela nem
// vai para o histórico: só diz ao código que a conversa terminou.
const DONE_RE = /\[\[\s*diagnostico-completo\s*\]\]/i;
// Fim sem proposta (investimento abaixo do mínimo e sem flexibilidade): a conversa vai
// ao time marcada "Fora do perfil", mesmo sem contato.
const OUT_RE = /\[\[\s*diagnostico-fora\s*\]\]/i;

// Tira os marcadores [[...]] do texto, inclusive um "[[" ainda incompleto no fim
// (enquanto o stream chega).
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

// Transforma caminhos do site (/briefing, /apresentacoes, /projeto/x), URLs e
// e-mails do texto do assistente em links clicáveis. Só texto: nada de HTML
// vindo do modelo é interpretado. /portfolio continua aceito: redireciona.
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
  // saudação só como palavra inteira: "oi" dentro de "pois" ou "hi" dentro de "this" não conta
  const isGreeting = t.split(/[^a-zà-ÿ]+/).some((w) => ["oi", "olá", "ola", "hey", "hi", "hello"].includes(w));
  if (isGreeting || /bom dia|boa tarde|boa noite/.test(t)) return greeting;
  return f.cta;
}

export function useDiagnosisChat(locale: Locale) {
  const t = getDictionary(locale).chat;
  // saudação imediata: a espera artificial só atrasava o primeiro contato
  const [messages, setMessages] = useState<Message[]>([{ from: "agent", text: t.greeting }]);
  const [typing, setTyping] = useState(false);
  const busyRef = useRef(false);
  const contactRef = useRef<string | null>(null); // contato mais recente dito pelo visitante
  const leadStateRef = useRef<LeadState>("none"); // o que já foi enviado ao time nesta conversa
  const messagesRef = useRef<Message[]>([]); // espelho de messages para o handler de pagehide

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // saiu da página antes do fim: sendBeacon continua valendo durante o unload
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

  // envia a conversa ao time; se a rede falhar, volta ao estado anterior para tentar de novo
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
    // e-mail sempre vence telefone (a proposta vai por e-mail); o telefone só vale
    // enquanto não houver e-mail
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
      // API indisponível — responde com o script offline
      setTyping(false);
      setMessages((m) => [
        ...m,
        { from: "agent", text: fallbackReply(locale, trimmed, t.greeting) },
      ]);
    } finally {
      busyRef.current = false;
      setTyping(false);
      // a IA marcou o fim do diagnóstico: a conversa vai ao time como completa
      if (DONE_RE.test(reply) && leadStateRef.current !== "complete") {
        postLead("complete", [...nextMessages, { from: "agent", text: stripMarkers(reply) }]);
      } else if (OUT_RE.test(reply) && leadStateRef.current === "none") {
        // encerrado como fora do perfil: vai ao time sem pré-proposta
        postLead("out", [...nextMessages, { from: "agent", text: stripMarkers(reply) }]);
      }
    }
  }

  return { messages, typing, send };
}
