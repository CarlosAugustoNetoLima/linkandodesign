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
      title: "Linkando Design — Estúdio de Marca e Desenvolvimento Web",
      description:
        "Estúdio especializado em identidade visual, branding e desenvolvimento de sites. 9 anos de experiência, clientes em 4 países.",
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
        eyebrow: "Portfólio de marcas e sites",
        secondary: "Ver projetos",
        title1: "Design que posiciona.",
        title2: "Sites que vendem.",
        text: "Estúdio de marca e desenvolvimento web. 9 anos, 4 países, clientes que crescem.",
        cta: "Solicitar diagnóstico",
        stage: {
          aria: "Vitrine dos projetos",
          tabs: "Escolher projeto",
          view: "Ver apresentação",
          desktop: "Computador",
          mobile: "Celular",
        },
      },

      featured: {
        all: "Ver todos os projetos",
        case: "Ver o case",
      },

      index: {
        label: "Projetos de 2026",
        title: "Do briefing ao ar, em movimento.",
        text: "Toque ou passe o mouse para ver cada site em movimento. Cada projeto abre uma apresentação com os efeitos, as decisões de design e o link do site real.",
        all: "Ver todas as apresentações",
        open: "Abrir apresentação",
        note: "",
      },

      band: {
        label: "Nosso diferencial",
        title: "Pesquisa e estratégia antes de qualquer tela.",
        text: "Antes de desenhar, entendemos o negócio, analisamos mercado e concorrência e definimos posicionamento e conceito. Depois vêm design e prototipação, para você validar antes de começarmos a desenvolver.",
        cta: "Solicitar diagnóstico",
        sites: "sites entregues em 2026",
      },

      services: {
        label: "Nossos serviços",
        title: "Do que a sua empresa precisa agora?",
        proof: "Onde isso foi feito",
        items: [
          {
            n: "001",
            title: "Uma marca que posiciona",
            text: "Desenvolvimento de Marca cria a identidade visual estratégica do zero, com naming, logo e sistema de design. Redesign de Identidade evolui a marca que você já tem, com intenção e coerência.",
          },
          {
            n: "002",
            title: "Um site que vende",
            text: "Criação de Site entrega o site completo, com pesquisa, prototipação e desenvolvimento. Redesign de Site reformula o visual e a estrutura de um site que já existe.",
          },
          {
            n: "003",
            title: "Uma landing page que converte",
            text: "Página de produto, serviço ou lançamento focada em conversão, do design ao desenvolvimento.",
          },
        ],
      },

      diff: {
        label: "Nosso diferencial",
        title: "Nosso jeito de trabalhar.",
        text: "Estúdio de marca e desenvolvimento web. Pesquisa, estratégia e prototipação vêm antes do desenvolvimento, em 7 etapas, e cada etapa é validada com o cliente antes de avançar. 9 anos de experiência, clientes em 4 países.",
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
            a: "O valor depende do escopo de cada projeto. Depois do diagnóstico, enviamos a proposta por e-mail em até 24h, com prazos e valores.",
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
      title: "Vamos começar o seu projeto?",
      text: "Clique no botão abaixo para batermos um papo rápido e sem compromisso.",
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
      text: "O Linkando Design é um estúdio de marca e desenvolvimento web. Em 9 anos, atendemos clientes em 4 países, da França a Cabo Verde, criando identidades visuais e sites que posicionam e vendem.",
      authority: {
        title: "O que fazemos na prática.",
        text: "Criamos identidades visuais do zero, evoluímos marcas que já existem e construímos sites e landing pages, da pesquisa à entrega. Marca e site saem do mesmo estúdio.",
      },
      method: {
        title: "O método em sete etapas.",
        text: "Do briefing à entrega, são sete etapas. Pesquisa, estratégia e prototipação vêm antes do desenvolvimento, e cada etapa é validada com você antes de avançar.",
      },
      stats: [
        { value: "9", label: "anos de estúdio" },
        { value: "4", label: "países atendidos" },
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
        "Olá! Eu conduzo o diagnóstico do seu projeto por aqui. São algumas perguntas rápidas, uma de cada vez, e no final o time analisa e envia a proposta por e-mail, com prazos e valores. Para começar: o que você faz e o que está travando hoje?",
      quick: ["Quero fazer o diagnóstico", "Quanto custa?", "Quanto tempo demora?", "Como funciona?"],
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
      title: "Linkando Design — Interface, website and brand design",
      description:
        "We design clean, organised interfaces that make your company easier to run and turn visitors into clients. 9 years, clients across 4 countries.",
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
        eyebrow: "Portfolio — brands, websites and systems",
        secondary: "See projects",
        title1: "Your company's digital side",
        title2: "doesn't have to be complicated.",
        text: "A website that doesn't bring in enquiries, or a system that slows your team down? Let's turn that into more sales.",
        cta: "Request a diagnosis",
        stage: {
          aria: "Project showcase",
          tabs: "Choose a project",
          view: "See the presentation",
          desktop: "Desktop",
          mobile: "Mobile",
        },
      },

      featured: {
        all: "See all projects",
        case: "See the case",
      },

      index: {
        label: "2026 projects",
        title: "From brief to launch, in motion.",
        text: "Tap or hover to see each site in motion. Every project opens a presentation with the effects, the design decisions and a link to the real site.",
        all: "See all presentations",
        open: "Open presentation",
        note: "The presentations are written in Portuguese.",
      },

      band: {
        label: "What sets us apart",
        title: "You don't need to have all the answers ready.",
        text: "We don't design on gut feeling. We use exact measurements and strict design standards to organise every screen. What that means in practice: the system becomes genuinely intuitive, the site doesn't break, and your team doesn't need a manual to use what we built.",
        cta: "Request a diagnosis",
        sites: "sites shipped in 2026",
      },

      services: {
        label: "Our services",
        title: "Where does it hurt in your company today?",
        proof: "Where we did this",
        items: [
          {
            n: "001",
            title: "The brand doesn't look credible",
            text: "First impressions close the sale. We build visual identities that show the level of professionalism your company actually has — so you can charge what your work is worth.",
          },
          {
            n: "002",
            title: "The site looks good but doesn't sell",
            text: "A confusing site drives clients away. We design clean, fast pages. The goal is to take visitors by the hand and lead them straight to the contact button. That simple.",
          },
          {
            n: "003",
            title: "The operation has become a mess",
            text: "This is where teams lose time. We design internal systems built for collaboration. No confusing screens. Every button has a reason to be there, so the workflow runs smoothly and without headaches.",
          },
        ],
      },

      diff: {
        label: "What sets us apart",
        title: "The way we work.",
        text: "We don't design on gut feeling. We use exact measurements and strict design standards to organise every screen. What that means in practice: the system becomes genuinely intuitive, the site doesn't break, and your team doesn't need a manual to use what we built.",
      },

      method: {
        label: "How we work",
        title: "No surprises at the end of the month.",
        text: "We believe predictability is everything in business. We work to a structured timeline with clearly defined approval stages. That way you follow the design with confidence, seeing exactly how the solution takes shape — without unnecessary rush and without rework.",
        steps: [
          { n: "01", title: "Diagnosis", text: "We map the real bottleneck in your operation before designing a single screen." },
          { n: "02", title: "Structure", text: "We define the information architecture and the path the user takes." },
          { n: "03", title: "Design", text: "Organised screens built to exact measurements, validated with you at every stage." },
          { n: "04", title: "Delivery", text: "Launch, follow-up and adjustments with your team already using it." },
        ],
      },

      faq: {
        label: "FAQ",
        title: "Frequently asked questions.",
        more: "Not seeing your question?",
        cta: "Ask in the chat",
        items: [
          {
            q: "How long does it take?",
            a: "Every project needs a different level of architecture. During our diagnosis phase we map your business scenario and set a realistic timeline. We focus entirely on quality and usability, and that takes method, planning and consistent stages — never rushed solutions.",
          },
          {
            q: "Will the system be hard to use?",
            a: "Quite the opposite. Our main focus is collaboration and everyday ease of use. If you need a 50-page manual to use the interface we built, we failed at the design.",
          },
          {
            q: "What do I need to have to get started?",
            a: "Just an idea of where your company's bottleneck is today. Don't worry about having a perfect plan — we design the solution together.",
          },
        ],
      },
    },

    footer: {
      title: "Shall we tidy the house?",
      text: "Click the button below for a quick, no-strings chat.",
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
      title: "Design that organises the operation and supports growth.",
      text: "Linkando Design is a studio for interface, website and brand design. Over 9 years we've worked with companies in 4 countries — from France to Cape Verde — designing digital products teams use every day without needing a manual.",
      authority: {
        title: "What we actually do.",
        text: "We work where the routine jams: confusing screens, scattered processes and brands that no longer match the size of the business. We design the structure before the aesthetics, so the solution fixes management and collaboration — not just how things look.",
      },
      method: {
        title: "Why method matters.",
        text: "Solid planning and strict validation stages are what separate a definitive interface from expensive rework. Every layout decision has a reason, every spacing follows a standard. That's what makes design last.",
      },
      stats: [
        { value: "9", label: "years as a studio" },
        { value: "4", label: "countries served" },
        { value: "100%", label: "projects shipped live" },
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
      ctaTitle: "Does your company have a similar bottleneck?",
      ctaText: "Let's map your scenario and design the best way forward. Quick chat, no strings.",
      cta: "Chat on WhatsApp",
      deviceDesktop: "Desktop",
      deviceMobile: "Mobile",
    },

    chat: {
      title: "Linkando Assistant",
      subtitle: "Diagnosis of your project",
      greeting:
        "Hi! I run the diagnosis of your project right here. It's a few quick questions, one at a time, and at the end the team reviews it and sends the proposal by email, with timelines and values. To start: what do you do, and what is holding you back today?",
      quick: ["I want to start the diagnosis", "How much does it cost?", "How long does it take?", "How does it work?"],
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
