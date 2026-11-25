export const locales = ["pt", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pt";

// nomes exibidos no seletor de idioma
export const localeNames: Record<Locale, string> = {
  pt: "Português",
  en: "English",
};

// Copy conforme o CLAUDE.md (posicionamento, serviços e processo) e o
// .agents/product-marketing.md: conversa de negócios direta, sem jargão técnico de dev.
export const dictionaries = {
  pt: {
    htmlLang: "pt-BR",

    meta: {
      title: "Linkando Design | Criação de Sites, Marca e Sistemas Internos",
      description:
        "Estúdio de design de marca e desenvolvimento web: identidade visual, criação de site, landing page, redesign e sistemas internos. 9 anos, clientes em 5 países. Diagnóstico gratuito.",
    },

    nav: {
      home: "Início",
      about: "Sobre",
      portfolio: "Portfólio",
      briefing: "Briefing",
      cta: "Solicitar diagnóstico",
      menu: "Menu",
      close: "Fechar",
    },

    home: {
      hero: {
        secondary: "Ver projetos",
        title1: "Marcas, sites",
        title2: "e sistemas.",
        text: "Estúdio de marca e desenvolvimento web. Criamos identidade visual, sites, landing pages e sistemas internos para empresas que querem vender mais.",
        facts: ["9 anos", "5 países", "Diagnóstico gratuito"],
        cta: "Solicitar diagnóstico",
        starter: {
          placeholder: "Conte o que você precisa: um site, uma marca, um sistema…",
          send: "Enviar e abrir o diagnóstico",
          note: "Comece pelo diagnóstico gratuito",
          quickAria: "Atalhos para começar",
        },
      },

      featured: {
        all: "Ver todos os projetos",
        case: "Ver o case",
      },

      index: {
        label: "Projetos de 2026",
        title: "Nossos projetos.",
        text: "Cada projeto abre uma apresentação com os efeitos, as decisões de design e o link do site no ar.",
        all: "Ver todas as apresentações",
        open: "Abrir apresentação",
        view: "Ver apresentação",
        live: "Site no ar",
        thumbAlt: "Site",
        note: "",
      },


      services: {
        label: "Nossos serviços",
        title: "Serviços.",
        ctas: ["Quero uma identidade visual", "Quero um site", "Quero uma landing page", "Quero um sistema"],
        proof: "Onde isso foi feito",
        proofAlt: "Site",
        items: [
          {
            n: "001",
            title: "Desenvolvimento de marca e identidade visual",
            tagline: "Marca nova ou redesign da atual",
            text: "Desenvolvimento de Marca cria a identidade visual estratégica do zero, com naming, logo e sistema de design. Redesign de Identidade evolui a marca que você já tem, com intenção e coerência.",
          },
          {
            n: "002",
            title: "Criação e redesign de site",
            tagline: "Site novo ou redesign do atual",
            text: "Criação de Site entrega o site completo, com pesquisa, prototipação e desenvolvimento. Redesign de Site reformula o visual e a estrutura de um site que já existe.",
          },
          {
            n: "003",
            title: "Landing page",
            tagline: "Página de produto, serviço ou lançamento",
            text: "Página de produto, serviço ou lançamento focada em conversão, do design ao desenvolvimento.",
          },
          {
            n: "004",
            title: "Sistemas internos para a equipe",
            tagline: "Painéis e telas de gestão",
            text: "Painéis e interfaces de gestão para a sua equipe: diagnóstico do gargalo, arquitetura da informação, design das telas e acompanhamento com a equipe já usando.",
          },
        ],
      },


      finalCta: {
        title: "Solicite o diagnóstico gratuito.",
        text: "O diagnóstico é gratuito e a proposta chega por e-mail em até 24h.",
        cta: "Solicitar diagnóstico",
      },

      diff: {
        label: "Nosso diferencial",
        title: "Nosso jeito de trabalhar.",
        text: "Estúdio de marca e desenvolvimento web. Pesquisa, estratégia e prototipação vêm antes do desenvolvimento, em 7 etapas, e cada etapa é validada com o cliente antes de avançar. 9 anos de experiência, clientes em 5 países.",
      },

      method: {
        label: "Como trabalhamos",
        title: "Sete etapas, cada uma validada com você.",
        text: "Você acompanha o projeto do briefing à entrega e aprova cada etapa antes de a próxima começar.",
        steps: [
          { n: "01", title: "Briefing", text: "Entendemos o negócio, os objetivos e o público." },
          { n: "02", title: "Pesquisa", text: "Analisamos mercado, concorrência e referências." },
          { n: "03", title: "Estratégia", text: "Definimos posicionamento, arquitetura e conceito criativo." },
          { n: "04", title: "Design", text: "Criamos a identidade visual ou o layout da interface." },
          { n: "05", title: "Prototipação", text: "Validamos com você antes de desenvolver." },
          { n: "06", title: "Desenvolvimento", text: "Construímos com foco em performance e responsividade." },
          { n: "07", title: "Entrega", text: "Publicamos, treinamos a sua equipe e damos suporte depois da entrega." },
        ],
      },

      faq: {
        label: "FAQ",
        title: "Dúvidas frequentes.",
        more: "Sua dúvida não está aqui?",
        cta: "Perguntar no chat",
        items: [
          {
            q: "Quanto custa?",
            a: "O diagnóstico é gratuito e feito pelo chat. O valor do projeto depende do escopo: depois do diagnóstico, enviamos a proposta por e-mail em até 24h, com prazos e valores.",
          },
          {
            q: "Quanto tempo demora?",
            a: "Depende do serviço: landing page em 1 a 2 semanas, site completo em 4 a 8, branding completo em 3 a 6. São estimativas; a proposta traz o cronograma do seu projeto.",
          },
          {
            q: "Como funciona?",
            a: "São sete etapas: briefing, pesquisa, estratégia, design, prototipação, desenvolvimento e entrega. Você valida cada uma antes de a próxima começar.",
          },
          {
            q: "O que eu preciso ter para começar?",
            a: "Só precisa saber o que quer resolver. O diagnóstico, pelo chat ou pelo formulário de briefing, ajuda a organizar o resto, e você não precisa ter tudo definido.",
          },
        ],
      },
    },

    footer: {
      title: "Solicite um diagnóstico.",
      text: "O diagnóstico é gratuito e a proposta chega por e-mail em até 24h.",
      cta: "Falar no WhatsApp",
      nav: "Navegação",
      rights: "Todos os direitos reservados.",
    },

    portfolio: {
      label: "Portfólio",
      title: "Projetos que já estão no ar.",
      text: "Cada card mostra a navegação real do site, gravada em computador e celular.",
      filters: {
        all: "Todos",
        site: "Sites",
        branding: "Identidade visual",
        system: "Sistemas",
      },
      empty: "Nenhum projeto nesta categoria ainda.",
    },

    about: {
      label: "Sobre nós",
      title: "Um estúdio de marca e desenvolvimento web.",
      text: "O Linkando Design é um estúdio de marca e desenvolvimento web. Em 9 anos, atendemos clientes em 5 países (Portugal, França, Cabo Verde, EUA e Brasil), criando identidades visuais, sites, landing pages e sistemas internos.",
      authority: {
        title: "O que fazemos na prática.",
        text: "Criamos identidades visuais do zero, evoluímos marcas que já existem, construímos sites e landing pages e desenhamos sistemas internos, da pesquisa à entrega. Marca e site saem do mesmo estúdio.",
      },
      method: {
        title: "O método em sete etapas.",
        text: "Do briefing à entrega, são sete etapas. Pesquisa, estratégia e prototipação vêm antes do desenvolvimento, e cada etapa é validada com você antes de avançar.",
      },
      stats: [
        { value: "9", label: "anos de estúdio" },
        { value: "5", label: "países atendidos" },
        { value: "7", label: "etapas, cada uma validada com você" },
      ],
    },

    project: {
      back: "Todos os projetos",
      challenge: "Desafio",
      solution: "Solução",
      result: "Resultado",
      context: "O contexto",
      gallery: "A solução, tela a tela",
      results: "Ganhos na rotina",
      live: "Ver site ao vivo",
      next: "Próximo projeto",
      typeLabel: "Tipo",
      countryLabel: "País",
      yearLabel: "Ano",
      siteLabel: "Site",
      deliverables: "Entregáveis",
      process: "O processo",
      numbers: "Em números",
      palette: "Paleta & tipografia",
      dna: "DNA visual",
      ctaTitle: "Tem um projeto parecido?",
      ctaText: "Conte o que você precisa e desenhamos o melhor caminho. Papo rápido, sem compromisso.",
      cta: "Falar no WhatsApp",
      deviceDesktop: "Computador",
      deviceMobile: "Celular",
    },

    chat: {
      title: "Assistente Linkando",
      subtitle: "Diagnóstico do seu projeto",
      greeting:
        "Olá! Eu conduzo o diagnóstico gratuito do seu projeto por aqui. São algumas perguntas rápidas, uma de cada vez, e no final o time analisa e envia a proposta por e-mail, com prazos e valores. Para começar: o que você faz e o que está travando hoje?",
      quick: ["Quero criar um site", "Quero criar ou renovar minha marca", "Preciso de uma landing page", "Preciso de um sistema interno"],
      inputPh: "Escreva a sua mensagem…",
      openAria: "Abrir o assistente",
      closeAria: "Fechar o assistente",
      dialogAria: "Conversa com o assistente do Linkando Design",
      inputAria: "Mensagem para o assistente",
      sendAria: "Enviar mensagem",
    },
  },

  en: {
    htmlLang: "en",

    meta: {
      title: "Linkando Design | Website, Brand Identity and Internal Systems Studio",
      description:
        "Brand and web development studio: visual identity, website creation, landing pages, redesign and internal systems. 9 years, clients in 5 countries. Free diagnosis.",
    },

    nav: {
      home: "Home",
      about: "About",
      portfolio: "Portfolio",
      briefing: "Briefing",
      cta: "Request a diagnosis",
      menu: "Menu",
      close: "Close",
    },

    home: {
      hero: {
        secondary: "See projects",
        title1: "Brands, websites",
        title2: "and systems.",
        text: "Brand and web development studio. We create visual identities, websites, landing pages and internal systems for companies that want to sell more.",
        facts: ["9 years", "5 countries", "Free diagnosis"],
        cta: "Request a diagnosis",
        starter: {
          placeholder: "Tell us what you need: a website, a brand, a system…",
          send: "Send and open the diagnosis",
          note: "Start with a free diagnosis",
          quickAria: "Shortcuts to get started",
        },
      },

      featured: {
        all: "See all projects",
        case: "See the case",
      },

      index: {
        label: "2026 projects",
        title: "Our projects.",
        text: "Each project opens a presentation with its effects, design decisions and a link to the live site.",
        all: "See all presentations",
        open: "Open presentation",
        view: "View presentation",
        live: "Live site",
        thumbAlt: "Website",
        note: "The presentations are written in Portuguese.",
      },


      services: {
        label: "Our services",
        title: "Services.",
        ctas: ["I want a visual identity", "I want a website", "I want a landing page", "I want a system"],
        proof: "Where we did this",
        proofAlt: "Website",
        items: [
          {
            n: "001",
            title: "Brand development and visual identity",
            tagline: "New brand or a redesign",
            text: "Brand Development builds a strategic visual identity from scratch, with naming, logo and design system. Identity Redesign evolves the brand you already have, with intent and coherence.",
          },
          {
            n: "002",
            title: "Website creation and redesign",
            tagline: "New website or a redesign",
            text: "Website Creation delivers the complete site, with research, prototyping and development. Website Redesign reworks the look and structure of a site that already exists.",
          },
          {
            n: "003",
            title: "Landing pages",
            tagline: "Product, service or launch page",
            text: "A product, service or launch page focused on conversion, from design to development.",
          },
          {
            n: "004",
            title: "Internal systems for your team",
            tagline: "Management dashboards and screens",
            text: "Dashboards and management interfaces for your team: diagnosis of the bottleneck, information architecture, screen design and follow-up once the team is using it.",
          },
        ],
      },


      finalCta: {
        title: "Request your free diagnosis.",
        text: "The diagnosis is free and the proposal reaches you by email within 24h.",
        cta: "Request a diagnosis",
      },

      diff: {
        label: "What sets us apart",
        title: "The way we work.",
        text: "A brand and web development studio. Research, strategy and prototyping come before development, in 7 stages, and each stage is approved by the client before moving on. 9 years of experience, clients in 5 countries.",
      },

      method: {
        label: "How we work",
        title: "Seven stages, each one approved by you.",
        text: "You follow the project from briefing to delivery and approve each stage before the next one starts.",
        steps: [
          { n: "01", title: "Briefing", text: "We learn the business, the goals and the audience." },
          { n: "02", title: "Research", text: "We analyse the market, competitors and references." },
          { n: "03", title: "Strategy", text: "We define positioning, architecture and creative concept." },
          { n: "04", title: "Design", text: "We create the visual identity or the interface layout." },
          { n: "05", title: "Prototyping", text: "We validate with you before developing." },
          { n: "06", title: "Development", text: "We build with a focus on performance and responsiveness." },
          { n: "07", title: "Delivery", text: "We publish, train your team and support you after delivery." },
        ],
      },

      faq: {
        label: "FAQ",
        title: "Frequently asked questions.",
        more: "Not seeing your question?",
        cta: "Ask in the chat",
        items: [
          {
            q: "How much does it cost?",
            a: "The diagnosis is free and done in the chat. The price of the project depends on the scope: after the diagnosis, we send the proposal by email within 24 hours, with timelines and values.",
          },
          {
            q: "How long does it take?",
            a: "It depends on the service: landing pages in 1 to 2 weeks, complete websites in 4 to 8, full branding in 3 to 6. These are estimates; the proposal sets the schedule for your project.",
          },
          {
            q: "How does it work?",
            a: "Seven stages: briefing, research, strategy, design, prototyping, development and delivery. You approve each one before the next starts.",
          },
          {
            q: "What do I need to get started?",
            a: "Just an idea of what you want to solve. The diagnosis, by chat or through the briefing form, helps organise the rest, and you don't need everything defined.",
          },
        ],
      },
    },

    footer: {
      title: "Request a diagnosis.",
      text: "The diagnosis is free and the proposal reaches you by email within 24h.",
      cta: "Chat on WhatsApp",
      nav: "Navigation",
      rights: "All rights reserved.",
    },

    portfolio: {
      label: "Portfolio",
      title: "Projects already live.",
      text: "Each card shows the real site navigating, recorded on desktop and mobile.",
      filters: {
        all: "All",
        site: "Websites",
        branding: "Brand identity",
        system: "Systems",
      },
      empty: "No projects in this category yet.",
    },

    about: {
      label: "About us",
      title: "A brand and web development studio.",
      text: "Linkando Design is a brand and web development studio. Over 9 years we've worked with clients in 5 countries (Portugal, France, Cape Verde, the USA and Brazil), creating visual identities, websites, landing pages and internal systems.",
      authority: {
        title: "What we actually do.",
        text: "We create visual identities from scratch, evolve brands that already exist, build websites and landing pages, and design internal systems, from research to delivery. Brand and site come from the same studio.",
      },
      method: {
        title: "The method in seven stages.",
        text: "Seven stages, from briefing to delivery. Research, strategy and prototyping come before development, and each stage is approved by you before moving on.",
      },
      stats: [
        { value: "9", label: "years as a studio" },
        { value: "5", label: "countries served" },
        { value: "7", label: "stages, each approved by you" },
      ],
    },

    project: {
      back: "All projects",
      challenge: "Challenge",
      solution: "Solution",
      result: "Result",
      context: "The context",
      gallery: "The solution, screen by screen",
      results: "Gains in the routine",
      live: "Visit live site",
      next: "Next project",
      typeLabel: "Type",
      countryLabel: "Country",
      yearLabel: "Year",
      siteLabel: "Site",
      deliverables: "Deliverables",
      process: "The process",
      numbers: "In numbers",
      palette: "Palette & typography",
      dna: "Visual DNA",
      ctaTitle: "Have a similar project?",
      ctaText: "Tell us what you need and we'll design the best way forward. Quick chat, no strings.",
      cta: "Chat on WhatsApp",
      deviceDesktop: "Desktop",
      deviceMobile: "Mobile",
    },

    chat: {
      title: "Linkando Assistant",
      subtitle: "Diagnosis of your project",
      greeting:
        "Hi! I run the free diagnosis of your project right here. It's a few quick questions, one at a time, and at the end the team reviews it and sends the proposal by email, with timelines and values. To start: what do you do, and what is holding you back today?",
      quick: ["I want a new website", "I want to create or refresh my brand", "I need a landing page", "I need an internal system"],
      inputPh: "Type your message…",
      openAria: "Open the assistant",
      closeAria: "Close the assistant",
      dialogAria: "Chat with the Linkando Design assistant",
      inputAria: "Message to the assistant",
      sendAria: "Send message",
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
