export const locales = ["pt", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pt";

// nomes exibidos no seletor de idioma
export const localeNames: Record<Locale, string> = {
  pt: "Português",
  en: "English",
};

// Copy conforme docs/copywriting: conversa de negócios direta, foco em
// usabilidade, organização e ganho de tempo. Sem jargão técnico de dev.
export const dictionaries = {
  pt: {
    htmlLang: "pt-BR",

    meta: {
      title: "Linkando Design — Design de interfaces, sites e marcas",
      description:
        "Desenhamos interfaces limpas e organizadas para facilitar a gestão da sua empresa e transformar visitantes em clientes. 9 anos, clientes em 4 países.",
    },

    nav: {
      about: "Sobre",
      portfolio: "Portfólio",
      cta: "Criar projeto",
      menu: "Menu",
      close: "Fechar",
    },

    home: {
      hero: {
        eyebrow: "Portfólio — marcas, sites e sistemas",
        secondary: "Ver projetos",
        title1: "O digital da sua empresa",
        title2: "não precisa ser complicado.",
        text: "Site que não gera contatos ou sistema que trava a equipe? Vamos transformar isso em mais vendas.",
        cta: "Vamos criar seu projeto juntos",
      },

      clients: {
        title: "Quem já confiou no nosso trabalho.",
        text: "Empresas que organizaram a rotina e melhoraram seus resultados com o nosso design.",
      },

      featured: {
        label: "Projetos em destaque",
        title: "Soluções que já tiramos do papel.",
        text: "Cada projeto abaixo está gravado ao vivo: é o site real, navegando em computador e telemóvel.",
        all: "Ver todos os projetos",
        case: "Ver o case",
      },

      services: {
        label: "Nossos serviços",
        title: "Onde dói na sua empresa hoje?",
        items: [
          {
            n: "001",
            title: "A marca não passa credibilidade",
            text: "A primeira impressão decide a venda. Criamos identidades visuais que transmitem o nível de profissionalismo que a sua empresa realmente tem, para você cobrar o valor justo pelo seu serviço.",
          },
          {
            n: "002",
            title: "O site é bonito, mas não vende",
            text: "Um site confuso afasta clientes. Desenhamos páginas limpas e rápidas. O objetivo é pegar o visitante pela mão e levá-lo direto para o botão de contato. Simples assim.",
          },
          {
            n: "003",
            title: "A operação virou uma bagunça",
            text: "É aqui que a equipe perde tempo. Projetamos sistemas internos focados em colaboração. Sem telas confusas. Cada botão tem um motivo para estar ali, garantindo que o fluxo de trabalho rode liso e sem dores de cabeça.",
          },
        ],
      },

      diff: {
        label: "Nosso diferencial",
        title: "Nosso jeito de trabalhar.",
        text: "Nós não trabalhamos com achismos visuais. Usamos medidas exatas e padrões rigorosos de design para organizar cada tela. O resultado prático disso? O sistema fica extremamente intuitivo, o site não quebra e a sua equipe não precisa de um manual de instruções para usar o que criamos.",
      },

      midCta: {
        title: "Você não precisa ter todas as respostas prontas.",
        text: "A comunicação da equipe está espalhada, os processos estão lentos ou a sua marca não acompanha mais o seu crescimento? Conta para a gente o que está travando o seu dia a dia. Nós desenhamos o melhor caminho.",
        cta: "Quero falar com um especialista",
      },

      method: {
        label: "Como trabalhamos",
        title: "Sem surpresas no fim do mês.",
        text: "Acreditamos que previsibilidade é tudo em um negócio. Trabalhamos com um cronograma estruturado e etapas de aprovação bem definidas. Assim, você acompanha a evolução do design com segurança, tendo clareza de como a solução está ganhando forma, sem pressa desnecessária e sem retrabalho.",
        steps: [
          { n: "01", title: "Diagnóstico", text: "Mapeamos o gargalo real da operação antes de desenhar qualquer tela." },
          { n: "02", title: "Estrutura", text: "Definimos a arquitetura da informação e o caminho que o usuário percorre." },
          { n: "03", title: "Design", text: "Telas organizadas com medidas exatas, validadas com você a cada etapa." },
          { n: "04", title: "Entrega", text: "Publicação, acompanhamento e ajustes com a equipe já usando." },
        ],
      },

      faq: {
        label: "FAQ",
        title: "Dúvidas frequentes.",
        items: [
          {
            q: "Quanto tempo demora?",
            a: "Cada projeto exige um nível de arquitetura diferente. Na nossa fase de diagnóstico, mapeamos o cenário corporativo e definimos um cronograma realista. Trabalhamos com foco total em qualidade e usabilidade, o que exige método, planejamento e etapas consistentes, fugindo de soluções feitas às pressas.",
          },
          {
            q: "O sistema vai ser difícil de usar?",
            a: "Muito pelo contrário. Nosso maior foco é a colaboração e a facilidade de uso no cotidiano. Se você precisar de um manual de 50 páginas para usar a interface que criamos, nós falhamos no design.",
          },
          {
            q: "O que eu preciso ter para começar?",
            a: "Apenas saber qual é o gargalo da sua empresa hoje. Não se preocupe em ter um planejamento perfeito, o desenho da solução nós fazemos juntos.",
          },
        ],
      },
    },

    footer: {
      title: "Vamos organizar a casa?",
      text: "Clique no botão abaixo para batermos um papo rápido e sem compromisso.",
      cta: "Falar no WhatsApp",
      nav: "Navegação",
      rights: "Todos os direitos reservados.",
    },

    portfolio: {
      label: "Portfólio",
      title: "Projetos que já estão no ar.",
      text: "Cada card mostra a navegação real do site, gravada em computador e telemóvel.",
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
      title: "Design que organiza a operação e sustenta o crescimento.",
      text: "O Linkando Design é um estúdio de design de interfaces, sites e marcas. Em 9 anos, atendemos empresas em 4 países — da França a Cabo Verde — desenhando produtos digitais que as equipes usam todos os dias sem precisar de manual.",
      authority: {
        title: "O que fazemos na prática.",
        text: "Trabalhamos onde a rotina trava: telas confusas, processos espalhados e marcas que não acompanham mais o tamanho do negócio. Desenhamos a estrutura antes da estética, para que a solução resolva gestão e colaboração — e não só a aparência.",
      },
      method: {
        title: "Por que o método importa.",
        text: "Planejamento sólido e etapas de validação rigorosas são o que separam uma interface definitiva de um retrabalho caro. Cada decisão de layout tem um motivo, cada espaçamento segue um padrão. É isso que faz o design durar.",
      },
      stats: [
        { value: "9", label: "anos de estúdio" },
        { value: "4", label: "países atendidos" },
        { value: "100%", label: "projetos entregues no ar" },
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
      ctaTitle: "Sua empresa tem um gargalo parecido?",
      ctaText: "Vamos mapear o seu cenário e desenhar o melhor caminho. Papo rápido, sem compromisso.",
      cta: "Falar no WhatsApp",
      deviceDesktop: "Computador",
      deviceMobile: "Telemóvel",
    },

    chat: {
      title: "Assistente Linkando",
      subtitle: "Tira-dúvidas em segundos",
      greeting:
        "Olá! Me conta o que está travando na sua empresa hoje — site que não vende, sistema confuso ou uma marca que não acompanha o crescimento? Ajudo a desenhar o próximo passo.",
      quick: ["Quanto custa?", "Quanto tempo demora?", "Como funciona?", "Quero um orçamento"],
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
      about: "About",
      portfolio: "Portfolio",
      cta: "Start a project",
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
        cta: "Let's create your project together",
      },

      clients: {
        title: "Who has trusted us so far.",
        text: "Companies that tidied up their routine and improved their results with our design.",
      },

      featured: {
        label: "Featured projects",
        title: "Solutions we've already shipped.",
        text: "Every project below is recorded live: the real site, navigating on desktop and mobile.",
        all: "See all projects",
        case: "See the case",
      },

      services: {
        label: "Our services",
        title: "Where does it hurt in your company today?",
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

      midCta: {
        title: "You don't need to have all the answers ready.",
        text: "Is the team's communication scattered, are processes slow, or has your brand stopped keeping up with your growth? Tell us what's holding up your day — we'll design the best way forward.",
        cta: "I want to talk to a specialist",
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
      subtitle: "Quick answers in seconds",
      greeting:
        "Hi! Tell me what's holding your company back today — a site that doesn't sell, a confusing system, or a brand that no longer matches your growth? I'll help you design the next step.",
      quick: ["How much does it cost?", "How long does it take?", "How does it work?", "I want a quote"],
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
