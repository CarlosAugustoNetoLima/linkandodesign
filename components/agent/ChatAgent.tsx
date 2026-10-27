"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { MessageCircle, X, ArrowUp } from "lucide-react";
import { getDictionary, type Locale } from "@/lib/i18n";
import { EMAIL } from "@/lib/contact";

type Message = { from: "agent" | "user"; text: string };

// Fallback offline — usado só se a API do agente estiver indisponível
const fallback = {
  pt: {
    pricing: {
      brand:
        "Desenvolvimento de marca a partir de R$ 8.000 (Brasil) ou €2.000 (Europa/EUA). O valor final depende da complexidade do projeto.",
      site: "Sites completos a partir de R$ 6.000. Landing pages a partir de R$ 3.500. Quer me contar mais sobre o seu projeto?",
      redesign:
        "Redesigns de identidade a partir de R$ 5.000. Redesigns de site a partir de R$ 6.000.",
      general:
        "Os valores variam conforme o escopo. Me conta o que você precisa e consigo dar uma estimativa mais precisa.",
    },
    deadline:
      "Depende do serviço: landing pages em 1–2 semanas, sites completos em 4–8 semanas, branding completo em 3–6 semanas. Tem uma data específica em mente?",
    process:
      "Nosso processo tem 7 etapas: Briefing → Pesquisa → Estratégia → Design → Prototipação → Desenvolvimento → Entrega. Cada etapa é validada com o cliente antes de avançar.",
    services:
      "Trabalhamos com: Desenvolvimento de Marca, Redesign de Identidade, Criação de Site, Landing Page e Redesign de Site. Qual desses faz mais sentido para você agora?",
    portfolio:
      "Nosso portfólio inclui projetos em França, Portugal, Cabo Verde e outros países. Você pode ver os cases completos aqui mesmo no site. Quer que eu te conte sobre algum projeto específico?",
    cta: "Quer dar o próximo passo? Preencha o briefing em /briefing, leva poucos minutos, e respondemos em até 24h.",
  },
  en: {
    pricing: {
      brand:
        "Brand development starts at €2,000 (Europe/US) or R$ 8,000 (Brazil). The final price depends on the project's complexity.",
      site: "Full websites start at R$ 6,000. Landing pages start at R$ 3,500. Want to tell me more about your project?",
      redesign:
        "Identity redesigns start at R$ 5,000. Website redesigns start at R$ 6,000.",
      general:
        "Pricing varies with scope. Tell me what you need and I can give you a more precise estimate.",
    },
    deadline:
      "It depends on the service: landing pages in 1–2 weeks, full websites in 4–8 weeks, full branding in 3–6 weeks. Do you have a specific date in mind?",
    process:
      "Our process has 7 steps: Briefing → Research → Strategy → Design → Prototyping → Development → Delivery. Each step is validated with the client before moving on.",
    services:
      "We work with: Brand Development, Identity Redesign, Website Creation, Landing Pages and Website Redesign. Which of these makes the most sense for you right now?",
    portfolio:
      "Our portfolio includes projects in France, Portugal, Cape Verde and other countries. You can see the full cases right here on the site. Want me to tell you about a specific project?",
    cta: "Ready for the next step? Fill in the briefing at /briefing, it takes a few minutes, and we reply within 24 hours.",
  },
} as const;

// Aviso de privacidade do chat (LGPD, art. 9º: finalidade, forma, controlador,
// compartilhamento e direitos). Mantenha em sincronia com o que a rota
// /api/chat e /api/chat/lead realmente fazem.
const privacy = {
  pt: {
    short: "Atendimento por IA. Se você informar e-mail ou telefone aqui, enviamos esta conversa ao nosso time.",
    toggle: "Privacidade",
    items: [
      "Quem responde: um assistente de IA (Google Gemini). Suas mensagens são processadas pelo Google. No plano gratuito, o Google pode usar o conteúdo para melhorar os produtos dele. Por isso, não envie dados sensíveis aqui.",
      "O que guardamos: nada fica salvo no site. Só se você informar e-mail ou telefone, a conversa é enviada por e-mail ao time da Linkando Design, para respondermos a você.",
      `Responsável: Linkando Design, ${EMAIL}. Para acessar, corrigir ou apagar seus dados (LGPD, art. 18), escreva para esse e-mail.`,
    ],
  },
  en: {
    short: "AI-assisted chat. If you share an email or phone here, we send this conversation to our team.",
    toggle: "Privacy",
    items: [
      "Who replies: an AI assistant (Google Gemini). Your messages are processed by Google. On the free plan, Google may use content to improve its products, so please don't share sensitive data here.",
      "What we keep: nothing is stored on the site. Only if you share an email or phone is the conversation emailed to the Linkando Design team so we can reply.",
      `Controller: Linkando Design, ${EMAIL}. To access, correct or delete your data, write to that address.`,
    ],
  },
} as const;

const EMAIL_RE = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;
const PHONE_RE = /\+?\d[\d\s().-]{7,}\d/;

// Transforma caminhos do site (/briefing, /portfolio, /projeto/x), URLs e
// e-mails do texto do assistente em links clicáveis. Só texto: nada de HTML
// vindo do modelo é interpretado.
const LINKABLE = /(\/(?:briefing|portfolio|sobre|projeto\/[a-z0-9-]+)\b|https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;
function renderText(text: string) {
  return text.split(LINKABLE).map((part, i) => {
    if (i % 2 === 0) return part;
    const cls = "font-semibold text-lime underline decoration-lime/50 underline-offset-2 hover:decoration-lime";
    if (part.startsWith("/"))
      return (
        <Link key={i} href={part} className={cls}>
          {part}
        </Link>
      );
    if (part.includes("@") && !part.startsWith("http"))
      return (
        <a key={i} href={`mailto:${part}`} className={cls}>
          {part}
        </a>
      );
    return (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={cls}>
        {part}
      </a>
    );
  });
}

function fallbackReply(locale: Locale, input: string, greeting: string): string {
  const f = fallback[locale];
  const t = input.toLowerCase();
  if (/quanto custa|preço|preco|valor|investimento|custo|how much|price|pricing|cost/.test(t)) {
    if (/marca|branding|identidade|brand|identity/.test(t)) return f.pricing.brand;
    if (/redesign/.test(t)) return f.pricing.redesign;
    if (/site|landing|página|pagina|web/.test(t)) return f.pricing.site;
    return f.pricing.general;
  }
  if (/prazo|tempo|quanto tempo|demora|data|entrega|timeline|how long|deadline|delivery/.test(t))
    return f.deadline;
  if (/como funciona|processo|etapas|metodologia|process|how does|method/.test(t))
    return f.process;
  if (/serviço|servico|o que voc|fazem|oferec|service|what do you/.test(t)) return f.services;
  if (/portfolio|portfólio|trabalhos anteriores|cases|projetos|projects|work/.test(t))
    return f.portfolio;
  if (/oi|olá|ola|bom dia|boa tarde|boa noite|hey|hi|hello/.test(t)) return greeting;
  return f.cta;
}

export default function ChatAgent({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).chat;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const leadRef = useRef<string | null>(null); // contato já enviado ao time nesta conversa
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    if (open && messages.length === 0) {
      // saudação imediata: a espera artificial só atrasava o primeiro contato
      setMessages([{ from: "agent", text: t.greeting }]);
    }
  }, [open, messages.length, t.greeting]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busyRef.current) return;
    busyRef.current = true;

    const nextMessages: Message[] = [...messages, { from: "user", text: trimmed }];
    // contato dito pelo visitante: ao fim da resposta, a conversa vai ao time
    const contact = (trimmed.match(EMAIL_RE) ?? trimmed.match(PHONE_RE))?.[0].trim();
    let reply = "";
    setMessages(nextMessages);
    setInput("");
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
        const current = acc;
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
      if (contact && leadRef.current !== contact) {
        leadRef.current = contact;
        const transcript = [...nextMessages, ...(reply ? [{ from: "agent" as const, text: reply }] : [])];
        fetch("/api/chat/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locale,
            contact,
            messages: transcript.map((m) => ({
              role: m.from === "user" ? "user" : "assistant",
              content: m.text,
            })),
          }),
        }).catch(() => {
          leadRef.current = null; // tenta de novo na próxima mensagem
        });
      }
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? t.closeAria : t.openAria}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-lg bg-ink text-lime shadow-btn transition-all duration-150 hover:-translate-y-0.5 hover:shadow-btn-hover"
      >
        {open ? (
          <X size={24} strokeWidth={2} aria-hidden />
        ) : (
          <MessageCircle size={24} strokeWidth={2} aria-hidden />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-5 z-50 flex h-[520px] w-[90vw] max-w-sm flex-col overflow-hidden rounded-3xl border border-white/15 bg-charcoal text-white shadow-dark"
            role="dialog"
            aria-label={t.dialogAria}
          >
            <div className="flex items-center gap-3 border-b border-white/15 bg-white/[0.04] px-5 py-4">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute h-full w-full animate-ping rounded-full bg-lime opacity-60" />
                <span className="h-2.5 w-2.5 rounded-full bg-lime" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{t.title}</p>
                <p className="text-xs text-white/70">{t.subtitle}</p>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.from === "agent"
                      ? "rounded-bl-sm bg-white/[0.12] text-white"
                      : "ml-auto rounded-br-sm bg-lime text-charcoal"
                  }`}
                >
                  {m.from === "agent" ? renderText(m.text) : m.text}
                </div>
              ))}
              {typing && (
                <div className="w-fit rounded-2xl rounded-bl-sm bg-white/[0.12] px-4 py-3">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/80 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/80 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/80 [animation-delay:300ms]" />
                  </span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {messages.length <= 1 && !typing && (
              <div className="flex flex-wrap gap-2 px-4 pb-3">
                {t.quick.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-md border border-white/30 px-3 py-1.5 text-xs text-white/90 transition-colors hover:border-lime hover:text-lime focus-visible:outline-lime"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {showPrivacy && (
              <div className="max-h-36 space-y-2 overflow-y-auto border-t border-white/15 bg-white/[0.06] px-4 py-3 text-xs leading-relaxed text-white/85">
                {privacy[locale].items.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            )}

            <form
              className="flex gap-2 border-t border-white/15 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.inputPh}
                aria-label={t.inputAria}
                className="flex-1 rounded-lg border border-white/30 bg-white/[0.08] px-4 py-2.5 text-sm text-white placeholder:text-white/60 focus:border-lime focus:outline-none focus:ring-2 focus:ring-lime/30"
              />
              <button
                type="submit"
                aria-label={t.sendAria}
                className="flex items-center justify-center rounded-lg bg-lime px-4 font-semibold text-charcoal focus-visible:outline-white"
              >
                <ArrowUp size={20} strokeWidth={2.5} aria-hidden />
              </button>
            </form>

            <p className="border-t border-white/10 px-4 py-2 text-[11px] leading-snug text-white/70">
              {privacy[locale].short}{" "}
              <button
                type="button"
                onClick={() => setShowPrivacy((v) => !v)}
                aria-expanded={showPrivacy}
                className="font-semibold text-lime underline underline-offset-2"
              >
                {privacy[locale].toggle}
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
