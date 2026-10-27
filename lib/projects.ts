import type { Locale } from "@/lib/i18n";

type Stat = { value: string; label: string };
type CraftNote = { title: string; text: string };
type Swatch = { hex: string; name: string };

type ProjectText = {
  type: string;
  country: string;
  deliverables: string[];
  context: string;
  problem: string;
  solution: string;
  process: string[];
  result: string;
  tags: string[];
  stats: Stat[];
  craft: CraftNote[]; // mesma ordem de craftMedia
  palette: Swatch[];
  dna: string;
  quote: string;
};

type ProjectFonts = { display: string; body: string; google?: string };

type CraftMedia = { desktop: string; mobile: string };

// Gravação ao vivo do site (scripts/record-sites.mjs → scripts/make-webp.sh).
// `base` é o prefixo dos arquivos em /public/projects/motion:
//   <base>-desktop.webp / <base>-mobile.webp  → animação
//   <base>-desktop-poster.webp / …            → primeiro frame, carregado de início
type Motion = { base: string; label?: Record<Locale, string> };

type ProjectBase = {
  slug: string;
  name: string;
  url: string;
  filter: "site" | "branding" | "uiux";
  flag: string;
  motion: Motion; // gravação principal, usada no card do portfólio
  motionExtra?: Motion[]; // outras rotas gravadas, exibidas no case
  image: string;
  imageMobile?: string; // vídeo/imagem mobile do hero (quando existe, o hero vira par desktop+mobile)
  liveLocal?: string; // mirror estático no próprio domínio (ex.: "/yanns"); usado no "ver site ao vivo"
  // par desktop + mobile por nota de craft, na mesma ordem das notas
  craftMedia: CraftMedia[];
  fonts: ProjectFonts; // fontes reais detectadas no site
  year: string;
  t: Record<Locale, ProjectText>;
};

export type Project = Omit<ProjectBase, "t"> & ProjectText;

const data: ProjectBase[] = [
  {
    slug: "yanns",
    name: "YANNS",
    url: "https://yannsmusic.com",
    filter: "site",
    flag: "🇫🇷",
    motion: { base: "yanns" },
    motionExtra: [
      {
        base: "yanns-collections",
        label: { pt: "A loja — /collections", en: "The store — /collections" },
      },
    ],
    image: "/projects/yanns.mp4",
    imageMobile: "/projects/yanns-mobile.mp4",
    liveLocal: "/yanns",
    craftMedia: [
      { desktop: "/projects/details/yanns-nav.png", mobile: "/projects/details/yanns-mob1.png" },
      { desktop: "/projects/details/yanns-d1.png", mobile: "/projects/details/yanns-mob2.png" },
      { desktop: "/projects/details/yanns-videos-d.png", mobile: "/projects/details/yanns-videos-m.png" },
      { desktop: "/projects/details/yanns-d2.png", mobile: "/projects/details/yanns-mob3.png" },
      { desktop: "/projects/details/yanns-d3.png", mobile: "/projects/details/yanns-mob4.png" },
      { desktop: "/projects/details/yanns-d4.png", mobile: "/projects/details/yanns-mob5.png" },
    ],
    fonts: { display: "Inter", body: "Inter" },
    year: "2024",
    t: {
      pt: {
        type: "Site completo",
        country: "França",
        deliverables: ["Pesquisa", "Prototipação", "Design", "Desenvolvimento"],
        context:
          "Site oficial de artista musical francês com mais de 176 milhões de visualizações no YouTube. Projeto estruturado com múltiplas línguas (FR/PT/EN), integração de agenda de shows, videoclipes e coleção de merchandise.",
        problem:
          "Um artista com audiência global precisava de uma casa digital à altura: agenda de shows sempre atualizada, videoclipes em destaque e loja de merchandise, tudo em três idiomas e sem fricção.",
        solution:
          "Estrutura multilíngue (FR/PT/EN) com navegação editorial, hero em vídeo, integração de datas de turnê, player de clipes e vitrine de coleções. Design que respira a identidade visual do artista.",
        process: [
          "Pesquisa de referências no mercado musical",
          "Arquitetura de informação multilíngue",
          "Prototipação navegável e validação",
          "Design de interface e desenvolvimento",
        ],
        result:
          "Plataforma oficial consolidada para uma audiência de milhões, com agenda, vídeos e merch em um só lugar.",
        tags: ["Site", "Multilingual", "UI/UX"],
        stats: [
          { value: "176M+", label: "visualizações no YouTube" },
          { value: "3", label: "idiomas: francês, português e inglês" },
          { value: "6+", label: "datas de turnê integradas ao site" },
        ],
        craft: [
          {
            title: "Navegação que respeita o palco",
            text: "Menu enxuto, com redes sociais de um lado e loja e idiomas do outro. Fã, imprensa e comprador encontram seu caminho na mesma barra, sem disputar atenção com o artista.",
          },
          {
            title: "Agenda que se atualiza sozinha",
            text: "As datas da turnê e os clipes vêm de integrações, com contagem de visualizações puxada do YouTube. Quando surge um show novo, o site acompanha sem que ninguém mexa em código.",
          },
          {
            title: "Clipes com a contagem que importa",
            text: "Os videoclipes aparecem em grade, cada um com a contagem real de views puxada do YouTube. A prova social não é dita, é mostrada: milhões de visualizações ao lado do play.",
          },
          {
            title: "Merch com tratamento editorial",
            text: "A coleção é apresentada como vitrine: fotografia grande, miniaturas laterais e um único botão de ação. O produto tem espaço para respirar.",
          },
          {
            title: "Loja com checkout integrado",
            text: "As coleções viram uma loja de verdade, com grade de produtos, preços e carrinho sempre presente na navegação. O pagamento é concluído em um checkout de terceiros integrado ao site, sem atrito para o fã.",
          },
          {
            title: "Biografia com números de carreira",
            text: "A página de biografia conta a trajetória e mostra os números do artista: streams, álbuns vendidos, bilhetes e datas de turnê. Prova social desenhada como interface, não como texto corrido.",
          },
        ],
        palette: [
          { hex: "#FCFCFC", name: "Branco gelo" },
          { hex: "#171E2D", name: "Azul tinta" },
          { hex: "#930C2E", name: "Vinho turnê" },
          { hex: "#020612", name: "Preto profundo" },
        ],
        dna: "Tipografia condensada em caixa alta, preto e branco de editorial e o vermelho da turnê como único ponto de cor. A grade é larga, os respiros são generosos e o conteúdo do artista conduz a página.",
        quote: "Cada pixel a serviço do palco.",
      },
      en: {
        type: "Full website",
        country: "France",
        deliverables: ["Research", "Prototyping", "Design", "Development"],
        context:
          "Official website for a French music artist with over 176 million YouTube views. Multilingual structure (FR/PT/EN) with tour dates, music videos and a merchandise collection.",
        problem:
          "An artist with a global audience needed a digital home to match: an always-current tour schedule, featured music videos and a merch store, in three languages and without friction.",
        solution:
          "Multilingual structure (FR/PT/EN) with editorial navigation, video hero, tour date integration, video player and collection showcase. Design that breathes the artist's visual identity.",
        process: [
          "Reference research in the music market",
          "Multilingual information architecture",
          "Navigable prototyping and validation",
          "Interface design and development",
        ],
        result:
          "A consolidated official platform for an audience of millions, with tour dates, videos and merch in one place.",
        tags: ["Website", "Multilingual", "UI/UX"],
        stats: [
          { value: "176M+", label: "YouTube views" },
          { value: "3", label: "languages: French, Portuguese and English" },
          { value: "6+", label: "tour dates integrated into the site" },
        ],
        craft: [
          {
            title: "Navigation that respects the stage",
            text: "A lean menu, with social links on one side and store and languages on the other. Fans, press and buyers each find their way in the same bar, without competing with the artist.",
          },
          {
            title: "A schedule that updates itself",
            text: "Tour dates and videos come from integrations, with view counts pulled from YouTube. When a new show is announced, the site keeps up without anyone touching code.",
          },
          {
            title: "Clips with the count that matters",
            text: "The music videos appear in a grid, each with its real view count pulled from YouTube. Social proof isn't claimed, it's shown: millions of views right next to play.",
          },
          {
            title: "Merch with editorial treatment",
            text: "The collection is presented as a showcase: large photography, side thumbnails and a single action button. The product has room to breathe.",
          },
          {
            title: "A store with integrated checkout",
            text: "The collections become a real store, with a product grid, prices and a cart that never leaves the navigation. Payment is completed in a third party checkout integrated into the site, with no friction for the fan.",
          },
          {
            title: "A biography with career numbers",
            text: "The biography page tells the story and shows the artist's numbers: streams, albums sold, tickets and tour dates. Social proof designed as interface, not as plain text.",
          },
        ],
        palette: [
          { hex: "#FCFCFC", name: "Ice white" },
          { hex: "#171E2D", name: "Ink navy" },
          { hex: "#930C2E", name: "Tour burgundy" },
          { hex: "#020612", name: "Deep black" },
        ],
        dna: "Condensed uppercase typography, editorial black and white, and the tour red as the only point of colour. The grid is wide, the spacing is generous and the artist's content leads the page.",
        quote: "Every pixel in service of the stage.",
      },
    },
  },
  {
    slug: "festival-crato",
    motion: { base: "festivalcrato" },
    name: "Festival Crato",
    url: "https://www.festivalcrato.pt",
    filter: "site",
    flag: "🇵🇹",
    image: "/projects/festivalcrato.mp4",
    craftMedia: [
      { desktop: "/projects/details/festivalcrato-nav.png", mobile: "/projects/details/festivalcrato-mob1.png" },
      { desktop: "/projects/details/festivalcrato-d1.png", mobile: "/projects/details/festivalcrato-mob2.png" },
      { desktop: "/projects/details/festivalcrato-news-d.png", mobile: "/projects/details/festivalcrato-news-m.png" },
      { desktop: "/projects/details/festivalcrato-d2.png", mobile: "/projects/details/festivalcrato-mob3.png" },
      { desktop: "/projects/details/festivalcrato-camp-d.png", mobile: "/projects/details/festivalcrato-camp-m.png" },
    ],
    fonts: { display: "Bebas Neue", body: "Inter", google: "Bebas+Neue" },
    year: "2025",
    t: {
      pt: {
        type: "Site com metodologia UX",
        country: "Portugal",
        deliverables: ["Design", "Desenvolvimento", "IA"],
        context:
          "Site para festival cultural português. Entrega rápida com metodologia UX focada em design e uso de IA no processo produtivo.",
        problem:
          "Um festival com data marcada não espera. O site precisava vender bilhetes, comunicar o lineup e aguentar picos de acesso, tudo dentro de um prazo curto.",
        solution:
          "Metodologia UX enxuta acelerada por IA: hierarquia clara de bilheteira, programação por dia e contagem regressiva. Visual de alto impacto fiel à energia do festival.",
        process: [
          "Imersão na identidade do festival",
          "Definição de fluxos de bilheteira",
          "Design acelerado por IA",
          "Desenvolvimento e entrega expressa",
        ],
        result:
          "Entrega rápida sem sacrificar qualidade: bilheteira e programação no ar dentro do prazo.",
        tags: ["Site", "Festival", "UX"],
        stats: [
          { value: "9", label: "artistas anunciados no lineup" },
          { value: "4", label: "modalidades de bilhete na loja" },
          { value: "15€", label: "preço de entrada do bilhete diário" },
        ],
        craft: [
          {
            title: "Navegação a serviço da bilheteira",
            text: "Bilheteira, lineup e programa ficam a um clique, com as datas dos shows na própria barra. Quem chega com pressa compra sem precisar procurar.",
          },
          {
            title: "Lineup com hierarquia de cartaz",
            text: "Cada artista aparece com gênero e dia, em cards com textura de fotografia. A energia do palco continua presente, agora com ordem.",
          },
          {
            title: "Anúncios que mantêm o público quente",
            text: "Cada confirmação de artista vira notícia com data e capa própria. Entre uma edição e outra, o site continua vivo e dá motivo para voltar.",
          },
          {
            title: "Preços que se explicam sozinhos",
            text: "Passes e bilhetes diários ficam lado a lado, com as diferenças visíveis em segundos. Comparar fica simples, e decidir também.",
          },
          {
            title: "Campismo explicado antes da dúvida",
            text: "Quem vem de longe precisa saber onde fica. A página de campismo antecipa a pergunta com localização, condições e o clima do parque, ao lado do passe que já o inclui.",
          },
        ],
        palette: [
          { hex: "#C8111F", name: "Vermelho Crato" },
          { hex: "#E8311A", name: "Vermelho quente" },
          { hex: "#0C0306", name: "Preto de palco" },
          { hex: "#FFFFFF", name: "Branco cartaz" },
        ],
        dna: "Vermelho de cartaz sobre preto, títulos com peso e fotografia com clima de show ao vivo. Um sistema visual que recebe um lineup novo a cada edição sem perder a identidade.",
        quote: "Prazo curto não justifica descuido. Cada card, preço e contagem no lugar certo.",
      },
      en: {
        type: "Website with UX methodology",
        country: "Portugal",
        deliverables: ["Design", "Development", "AI"],
        context:
          "Website for a Portuguese cultural festival. Fast delivery with a UX methodology focused on design and AI in the production process.",
        problem:
          "A festival with a fixed date cannot wait. The site had to sell tickets, communicate the lineup and handle traffic spikes, all within a tight deadline.",
        solution:
          "Lean UX methodology accelerated by AI: clear ticketing hierarchy, day-by-day programme and countdown. High-impact visuals true to the festival's energy.",
        process: [
          "Immersion in the festival's identity",
          "Ticketing flow definition",
          "AI-accelerated design",
          "Development and express delivery",
        ],
        result:
          "Fast delivery without sacrificing quality: ticketing and programme live on schedule.",
        tags: ["Website", "Festival", "UX"],
        stats: [
          { value: "9", label: "artists announced in the lineup" },
          { value: "4", label: "ticket types in the store" },
          { value: "€15", label: "entry price for the day ticket" },
        ],
        craft: [
          {
            title: "Navigation in service of ticketing",
            text: "Ticketing, lineup and programme sit one click away, with show dates in the bar itself. Visitors in a hurry can buy without hunting around.",
          },
          {
            title: "A lineup with poster hierarchy",
            text: "Each artist appears with genre and day, in cards with photographic texture. The stage energy is still there, now with order.",
          },
          {
            title: "Announcements that keep fans warm",
            text: "Every artist confirmation becomes a dated news card with its own cover. Between editions, the site stays alive and gives a reason to come back.",
          },
          {
            title: "Prices that explain themselves",
            text: "Passes and day tickets sit side by side, with the differences visible in seconds. Comparing becomes simple, and so does deciding.",
          },
          {
            title: "Camping explained before the question",
            text: "People coming from afar need to know where they'll stay. The camping page answers ahead of time with location, conditions and the vibe of the park, next to the pass that already includes it.",
          },
        ],
        palette: [
          { hex: "#C8111F", name: "Crato red" },
          { hex: "#E8311A", name: "Warm red" },
          { hex: "#0C0306", name: "Stage black" },
          { hex: "#FFFFFF", name: "Poster white" },
        ],
        dna: "Poster red over black, heavy titles and photography with a live-show feel. A visual system that welcomes a new lineup every edition without losing its identity.",
        quote: "A short deadline does not excuse sloppiness. Every card, price and countdown in its right place.",
      },
    },
  },
  {
    slug: "wauw",
    motion: { base: "wauw" },
    name: "WAUW",
    url: "https://wauw.cv",
    filter: "site",
    flag: "🇨🇻",
    image: "/projects/wauw.mp4",
    craftMedia: [
      { desktop: "/projects/details/wauw-nav.png", mobile: "/projects/details/wauw-mob1.png" },
      { desktop: "/projects/details/wauw-d1.png", mobile: "/projects/details/wauw-mob2.png" },
      { desktop: "/projects/details/wauw-gallery-d.png", mobile: "/projects/details/wauw-gallery-m.png" },
      { desktop: "/projects/details/wauw-d2.png", mobile: "/projects/details/wauw-mob3.png" },
      { desktop: "/projects/details/wauw-sponsors-d.png", mobile: "/projects/details/wauw-sponsors-m.png" },
      { desktop: "/projects/details/wauw-cta-d.png", mobile: "/projects/details/wauw-cta-m.png" },
    ],
    fonts: { display: "Inter", body: "Inter" },
    year: "2025",
    t: {
      pt: {
        type: "Site com metodologia UX",
        country: "Cabo Verde",
        deliverables: ["Design", "Desenvolvimento", "IA"],
        context:
          "Site desenvolvido com metodologia UX orientada por IA, entregando qualidade de design em tempo reduzido.",
        problem:
          'Um palco global para a criatividade africana precisava de uma presença digital com a mesma ambição do lema "Where Africa Unites The World", e em tempo recorde.',
        solution:
          "Metodologia UX orientada por IA do primeiro wireframe ao deploy: visual vibrante, lineup, bilhetes e informação do evento com hierarquia clara.",
        process: [
          "Briefing e posicionamento do evento",
          "Wireframes orientados por IA",
          "Design de interface vibrante",
          "Desenvolvimento e publicação",
        ],
        result:
          "Qualidade de design internacional entregue em tempo reduzido, conectando Cabo Verde ao mundo.",
        tags: ["Site", "UX", "IA"],
        stats: [
          { value: "30+", label: "artistas internacionais" },
          { value: "15+", label: "países representados" },
          { value: "10k", label: "visitantes por edição" },
        ],
        craft: [
          {
            title: "Identidade desde a primeira tela",
            text: "Manifesto, marca e bilhetes dividem a primeira dobra com calma. O rosa elétrico guia o olhar na ordem certa: o que é, onde acontece, onde comprar.",
          },
          {
            title: "Cada dia com seu bilhete",
            text: "Os dias do festival têm card, data e botão próprios, e a compra abre direto no fluxo da bilheteira parceira integrada. Fica claro o que se está comprando, e ninguém leva o dia errado para casa.",
          },
          {
            title: "A galeria que prova a festa",
            text: "Fotos das edições anteriores em mosaico — palco, público e luz. Quem nunca foi entende a energia em segundos; quem já foi, quer voltar.",
          },
          {
            title: "História e números lado a lado",
            text: "Os pilares do evento aparecem junto das métricas reais de edições, artistas, países e público. A emoção vem acompanhada de prova.",
          },
          {
            title: "Apoiadores como selo de confiança",
            text: "Promotor e parceiro estratégico aparecem com destaque, seguidos de um convite direto a novos parceiros. Credibilidade institucional e captação na mesma dobra.",
          },
          {
            title: "Um último empurrão para o bilhete",
            text: "Antes do rodapé, uma chamada de alto contraste fecha a visita: não percas o próximo WAUW. O caminho para a compra fica sempre a um toque.",
          },
        ],
        palette: [
          { hex: "#EF1060", name: "Rosa elétrico" },
          { hex: "#00A34B", name: "Verde Cabo Verde" },
          { hex: "#0D0D0D", name: "Preto noite" },
          { hex: "#FFFFFF", name: "Branco" },
        ],
        dna: "Rosa elétrico sobre preto, losangos como assinatura geométrica e tipografia de manifesto. Um visual afrourbano contemporâneo, fácil de reconhecer de longe.",
        quote: "Uma identidade que atravessa o Atlântico sem perder o sotaque.",
      },
      en: {
        type: "Website with UX methodology",
        country: "Cape Verde",
        deliverables: ["Design", "Development", "AI"],
        context:
          "Website built with an AI-driven UX methodology, delivering design quality in reduced time.",
        problem:
          'A global stage for African creativity needed a digital presence with the same ambition as its motto, "Where Africa Unites The World", and in record time.',
        solution:
          "AI-driven UX methodology from the first wireframe to deploy: vibrant visuals, lineup, tickets and event information with clear hierarchy.",
        process: [
          "Briefing and event positioning",
          "AI-driven wireframes",
          "Vibrant interface design",
          "Development and launch",
        ],
        result:
          "International design quality delivered in reduced time, connecting Cape Verde to the world.",
        tags: ["Website", "UX", "AI"],
        stats: [
          { value: "30+", label: "international artists" },
          { value: "15+", label: "countries represented" },
          { value: "10k", label: "visitors per edition" },
        ],
        craft: [
          {
            title: "Identity from the first screen",
            text: "Manifesto, brand and tickets share the first fold calmly. Electric pink guides the eye in the right order: what it is, where it happens, where to buy.",
          },
          {
            title: "Each day with its own ticket",
            text: "Every festival day has its own card, date and button, and purchase opens directly in the integrated partner ticketing flow. It is clear what you are buying, and nobody takes the wrong day home.",
          },
          {
            title: "A gallery that proves the party",
            text: "Photos from past editions in a mosaic — stage, crowd and light. Newcomers grasp the energy in seconds; veterans want to go back.",
          },
          {
            title: "Story and numbers side by side",
            text: "The event's pillars appear next to real metrics for editions, artists, countries and audience. Emotion comes with proof.",
          },
          {
            title: "Partners as a trust mark",
            text: "Promoter and strategic partner are shown with prominence, followed by a direct invitation to new partners. Institutional credibility and outreach in the same fold.",
          },
          {
            title: "A final nudge toward the ticket",
            text: "Just before the footer, a high-contrast call closes the visit: don't miss the next WAUW. The path to purchase stays one tap away.",
          },
        ],
        palette: [
          { hex: "#EF1060", name: "Electric pink" },
          { hex: "#00A34B", name: "Cape Verde green" },
          { hex: "#0D0D0D", name: "Night black" },
          { hex: "#FFFFFF", name: "White" },
        ],
        dna: "Electric pink over black, diamonds as a geometric signature and manifesto typography. A contemporary Afro-urban look that is easy to recognize from afar.",
        quote: "An identity that crosses the Atlantic without losing its accent.",
      },
    },
  },
  {
    slug: "jsynq",
    motion: { base: "jsynq" },
    name: "JSYNQ",
    url: "https://jsynq.com",
    filter: "uiux",
    flag: "🌍",
    image: "/projects/jsynq.mp4",
    craftMedia: [
      { desktop: "/projects/details/jsynq-nav.png", mobile: "/projects/details/jsynq-mob1.png" },
      { desktop: "/projects/details/jsynq-hero-d.png", mobile: "/projects/details/jsynq-hero-m.png" },
      { desktop: "/projects/details/jsynq-d1.png", mobile: "/projects/details/jsynq-mob2.png" },
      { desktop: "/projects/details/jsynq-d2.png", mobile: "/projects/details/jsynq-mob3.png" },
      { desktop: "/projects/details/jsynq-specialists-d.png", mobile: "/projects/details/jsynq-specialists-m.png" },
      { desktop: "/projects/details/jsynq-pricing-d.png", mobile: "/projects/details/jsynq-pricing-m.png" },
    ],
    fonts: { display: "Inter", body: "Inter" },
    year: "2025",
    t: {
      pt: {
        type: "Site",
        country: "Internacional",
        deliverables: ["Design", "Desenvolvimento"],
        context:
          "Site para plataforma de workspace com agentes de IA: funcionários de IA trabalhando ao lado da equipe.",
        problem:
          "Um produto SaaS de IA precisava explicar uma proposta nova, a de funcionários de IA dentro do workspace, e converter visitantes em testes grátis.",
        solution:
          "Landing de produto com narrativa progressiva: proposta de valor direta, prova social e CTAs de conversão em cada dobra.",
        process: [
          "Estudo do produto e do público",
          "Arquitetura de conversão",
          "Design de interface SaaS",
          "Desenvolvimento e otimização",
        ],
        result:
          "Site de produto claro e orientado a conversão para uma plataforma de IA em crescimento.",
        tags: ["Site", "UI/UX"],
        stats: [
          { value: "4.8/5", label: "nota média dos usuários" },
          { value: "7.000+", label: "equipes usando a plataforma" },
          { value: "6", label: "ferramentas que o workspace substitui" },
        ],
        craft: [
          {
            title: "Navegação de produto",
            text: "Recursos, comparação, preços e FAQ aparecem na ordem natural de quem avalia um software. O botão de teste grátis fica sempre à vista.",
          },
          {
            title: "A proposta dita na primeira linha",
            text: "\"Funcionários de IA ao lado da equipe\" — a promessa aparece grande, com prova social e teste grátis logo abaixo. Em uma dobra, o visitante entende e pode agir.",
          },
          {
            title: "Narrativa em três passos",
            text: "A proposta se desenrola em etapas numeradas: centralizar, visualizar, automatizar. Cada dobra responde a uma dúvida antes de ela aparecer.",
          },
          {
            title: "Complexidade explicada com calma",
            text: "O fluxo de automação virou um diagrama legível, com nós, conexões e resultado. Dá para entender a engenharia em um olhar, sem jargão.",
          },
          {
            title: "Agentes com função e cara",
            text: "Cada agente de IA ganha categoria, nome e descrição — vendas, marketing, jurídico, contabilidade. O abstrato vira concreto: dá para imaginar cada um no time.",
          },
          {
            title: "Preço que compara sozinho",
            text: "Quatro planos lado a lado, com o mais popular destacado e a alternância mensal/anual à vista. A decisão fica fácil porque a diferença é visível.",
          },
        ],
        palette: [
          { hex: "#45AD7E", name: "Verde produto" },
          { hex: "#191B1C", name: "Grafite" },
          { hex: "#0A0A10", name: "Seção noturna" },
          { hex: "#FFFFFF", name: "Branco" },
        ],
        dna: "Verde de confiança sobre off-white, cards numerados e diagramas limpos. Um design system de SaaS preciso, sem deixar de ser acolhedor.",
        quote: "Produto complexo, página que se explica sozinha.",
      },
      en: {
        type: "Website",
        country: "International",
        deliverables: ["Design", "Development"],
        context:
          "Website for an AI-agent workspace platform: AI employees working alongside the team.",
        problem:
          "An AI SaaS product needed to explain a new proposition, AI employees inside the workspace, and convert visitors into free trials.",
        solution:
          "Product landing with progressive storytelling: direct value proposition, social proof and conversion CTAs in every fold.",
        process: [
          "Product and audience study",
          "Conversion architecture",
          "SaaS interface design",
          "Development and optimization",
        ],
        result: "A clear, conversion-driven product site for a growing AI platform.",
        tags: ["Website", "UI/UX"],
        stats: [
          { value: "4.8/5", label: "average user rating" },
          { value: "7,000+", label: "teams using the platform" },
          { value: "6", label: "tools the workspace replaces" },
        ],
        craft: [
          {
            title: "Product navigation",
            text: "Features, comparison, pricing and FAQ appear in the natural order of someone evaluating software. The free trial button stays in sight.",
          },
          {
            title: "The promise stated in the first line",
            text: "\"AI employees working alongside your team\" — the pitch lands big, with social proof and a free trial right below. In one fold, the visitor gets it and can act.",
          },
          {
            title: "A story in three steps",
            text: "The proposition unfolds in numbered steps: centralize, visualize, automate. Each fold answers a question before it comes up.",
          },
          {
            title: "Complexity explained calmly",
            text: "The automation flow became a readable diagram, with nodes, connections and outcome. You can understand the engineering at a glance, no jargon needed.",
          },
          {
            title: "Agents with a role and a face",
            text: "Each AI agent gets a category, a name and a description — sales, marketing, legal, accounting. The abstract turns concrete: you can picture each one on the team.",
          },
          {
            title: "Pricing that compares itself",
            text: "Four plans side by side, with the most popular highlighted and a monthly/yearly toggle in view. The decision is easy because the difference is visible.",
          },
        ],
        palette: [
          { hex: "#45AD7E", name: "Product green" },
          { hex: "#191B1C", name: "Graphite" },
          { hex: "#0A0A10", name: "Night section" },
          { hex: "#FFFFFF", name: "White" },
        ],
        dna: "Trust green over off-white, numbered cards and clean diagrams. A precise SaaS design system that still feels welcoming.",
        quote: "A complex product, a page that explains itself.",
      },
    },
  },
];

export const projectSlugs = data.map((p) => p.slug);

export function getProjects(locale: Locale): Project[] {
  return data.map(({ t, ...base }) => ({ ...base, ...t[locale] }));
}

export function getProject(locale: Locale, slug: string): Project | undefined {
  return getProjects(locale).find((p) => p.slug === slug);
}

export function nextProject(locale: Locale, slug: string): Project {
  const all = getProjects(locale);
  const i = all.findIndex((p) => p.slug === slug);
  return all[(i + 1) % all.length];
}
