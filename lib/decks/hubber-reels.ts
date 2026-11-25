import type { Deck, Media } from "./types";

// Dossiê do deck do Hubber Reels, a página de conversão do segundo produto da Hubber.
// Cada fato foi conferido em /Users/carloslima/hubber/hubber-site (página, estilos, scripts,
// formulário da página, histórico) ou no site no ar. Coerente com o deck `hubber`, que tem um
// capítulo curto sobre o Reels. Não citar: preço (em nenhum lugar, nem nas gravações: o CSS
// das cenas tira o valor da tela), IDs de pixel e de CRM, nome de pessoas, Figma ou IA.
// A fonte de display original ("946 Latin Wide 3") não é redistribuída: o deck usa a
// Archivo Expandida no lugar, como o deck da Hubber.
// Desde o commit 74e69c9 (2026-11-21) a página é a versão de portfólio: destaque só em cor,
// formulário com envio simulado na própria página, sem rastreio e sem cookies.
const BASE = "/decks/hubber-reels";

const desktop = (name: string, alt: string): Media => ({
  src: `${BASE}/${name}.mp4`,
  poster: `${BASE}/${name}.jpg`,
  width: 1280,
  height: 800,
  alt,
});

const mobile = (name: string, alt: string): Media => ({
  src: `${BASE}/${name}.mp4`,
  poster: `${BASE}/${name}.jpg`,
  width: 520,
  height: 1126,
  alt,
});

export const hubberReels: Deck = {
  slug: "hubber-reels",
  index: 10,
  name: "Hubber Reels",
  client: "Hubber",
  year: 2026,
  sector: "Produção de vídeo · conteúdo para empresas locais",
  location: "Orlando, Flórida (EUA)",
  flags: ["🇺🇸"],
  tagline: "Uma página que leva o dono de negócio a pedir uma conversa de 30 minutos.",
  liveUrl: "https://hubber-linkando.vercel.app/reels/",
  largeMedia: true,
  credits: [{ name: "Carlos Lima", role: "Direção criativa, design e desenvolvimento" }],
  extraLinks: [
    {
      label: "Ver em português",
      url: "https://hubber-linkando.vercel.app/reels/pt/",
      note: "A mesma página, traduzida",
    },
  ],
  stack: ["HTML", "CSS", "JavaScript", "Python"],
  theme: {
    // o âmbar do site (#EE9B00) não tem contraste sobre o papel: usa o tom que o próprio
    // site aplica a textos de destaque na seção clara
    accent: "#9a6100",
    accentInk: "#ffffff",
    fontKey: "archivo",
    displayWeight: 400,
    displayTracking: "0.01em",
    displayUppercase: true,
    radius: "14px",
    displayStretch: 125,
    coverWeight: 400,
  },
  cover: desktop(
    "vitrine-desktop",
    "A página do Hubber Reels em uso: o vídeo do início, as seções descendo, os cartões acendendo, um reel tocando e ampliado, o formulário sendo preenchido sem envio e o menu de idioma",
  ),
  summary:
    "Página de conversão de um produto de vídeo para empresas: oito seções em preto e âmbar, títulos que ficam parados enquanto o conteúdo passa, uma parede com nove reels e um formulário curto para pedir a conversa.",
  seo: {
    title: "Hubber Reels — Apresentação | Linkando Design",
    description:
      "Como foi feita a página do Hubber Reels: processo, style guide, efeitos, formulário, celular e testes.",
  },
  chapters: [
    {
      type: "cover",
      id: "capa",
      label: "Capa",
      kicker: "Portfólio 2026 · Landing page · Vídeo para empresas",
      title: "Hubber Reels",
      subtitle:
        "A página de um produto de vídeo da Hubber. Um dia de gravação gera um mês de conteúdo, e tudo na página leva ao pedido de uma conversa de 30 minutos.",
      chips: ["HTML", "CSS", "JavaScript", "Python"],
      credit: "Linkando Design · 2026 · direção, design e desenvolvimento",
      backdrop: desktop(
        "fundo-desktop",
        "Início da página: o vídeo com cenas de gravação tocando na moldura e o botão de reserva acompanhando o mouse",
      ),
    },
    {
      type: "statement",
      id: "resumo",
      label: "Resumo",
      eyebrow: "O projeto",
      text: "A Hubber vende para empresas um dia de gravação que gera um mês de vídeos curtos. A página tem um objetivo: explicar a oferta em poucas telas, mostrar vídeos já gravados e levar o visitante a pedir uma conversa de 30 minutos.",
      emphasis: ["gravação", "mês", "conversa"],
    },
    {
      type: "identity",
      id: "identidade",
      label: "Style guide",
      eyebrow: "Style guide",
      title: "Cores, tipografia, espaçamentos e grid.",
      swatches: [
        { name: "Amber", hex: "#EE9B00", role: "Botões, palavras de destaque nos títulos e o fundo do formulário" },
        { name: "Amber soft", hex: "#F0A92B", role: "Destaques em texto e botão com o mouse em cima" },
        { name: "Amber deep", hex: "#C97D00", role: "Textos de apoio sobre a seção clara" },
        { name: "Void", hex: "#07080A", role: "Fundo da página e do início" },
        { name: "Base", hex: "#0C0D10", role: "Fundo das seções escuras" },
        { name: "Light", hex: "#F4F1EA", role: "A única seção clara: a da câmera" },
        { name: "On amber", hex: "#111111", role: "Texto sobre o âmbar" },
      ],
      fonts: [
        {
          name: "946 Latin Wide 3",
          role: "Títulos",
          sample: "Turn one shoot into a full month of content",
          weight: 400,
          size: "xl",
          wide: true,
          note: "A mesma fonte larga, em caixa alta, do site principal da Hubber. Nesta apresentação, a Archivo Expandida faz o papel dela.",
        },
        {
          name: "Archivo",
          role: "Texto corrido, cartões e botões",
          sample: "You run your business. We handle the content.",
          weight: 400,
          size: "md",
          note: "Texto com bastante espaço entre as linhas e no máximo 54 caracteres por linha nos blocos de leitura.",
        },
        {
          name: "JetBrains Mono",
          role: "Etiquetas",
          sample: "Professional content for Orlando businesses",
          weight: 500,
          tracking: "0.14em",
          uppercase: true,
          size: "sm",
          note: "Etiquetas pequenas em caixa alta, com letras espaçadas. Nesta apresentação, aproximada pela Archivo.",
        },
      ],
      icons: {
        title: "Ícones",
        note: "Ícones usados na página de reels.",
        animated: false,
        stroke: 1.5,
        items: [
          { label: "Conferido", shapes: '<path d="M5 12.4 9.4 17 19 7" />' },
          { label: "Voltar", shapes: '<path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />' },
          { label: "Ampliar", shapes: '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />' },
          { label: "Fechar", shapes: '<path d="M6 6l12 12M18 6 6 18" />' },
          { label: "Idioma", shapes: '<circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.36 2.36 3.6 5.46 3.6 8.5s-1.24 6.14-3.6 8.5c-2.36-2.36-3.6-5.46-3.6-8.5s1.24-6.14 3.6-8.5Z" />' },
        ],
      },
      system: {
        type: {
          title: "Escala tipográfica",
          note: "Sete tamanhos. Os títulos pedem peso 700 no CSS, mas a fonte de display do site só tem o 400: o navegador engrossa.",
          steps: [
            { name: "Título do início", min: 30.4, max: 48, weight: 700, tracking: "-0.01em", uppercase: true, sample: "Turn one shoot" },
            { name: "Título de seção", min: 27.2, max: 40, weight: 700, tracking: "-0.005em", uppercase: true, sample: "One month of content." },
            { name: "Destaque", min: 20.8, max: 20.8, weight: 500, sample: "You know your business." },
            { name: "Título de cartão", min: 19.2, max: 19.2, weight: 500, sample: "Booking bonus" },
            { name: "Texto corrido", min: 16.8, max: 16.8, weight: 400, sample: "Hubber prepares the scripts and coaches you through every take." },
            { name: "Botões", min: 15, max: 15, weight: 700, sample: "Book my content shoot" },
            { name: "Rótulos", min: 10.56, max: 10.56, weight: 400, tracking: "0.14em", uppercase: true, sample: "Professional content for Orlando businesses" },
          ],
        },
        spacing: {
          title: "Espaçamentos",
          note: "Variáveis de espaço de 8 a 240 px no CSS; as seções ficam entre 64 e 112 px, conforme a tela.",
          steps: [
            { px: 8, use: "Dentro das etiquetas, entre ícone e texto" },
            { px: 12, use: "Entre os itens de um cartão" },
            { px: 16, use: "Entre os cartões e entre os reels" },
            { px: 24, use: "Entre os parágrafos de apoio e dentro dos cartões" },
            { px: 32, use: "Do texto ao botão; entre título e conteúdo no celular" },
            { px: 48, use: "Do título à parede de reels e ao formulário" },
            { px: 64, use: "Acima e abaixo de cada seção, em telas menores" },
            { px: 80, use: "Espaço do primeiro bloco da página, no computador" },
            { px: 112, use: "Acima e abaixo de cada seção, no computador" },
          ],
        },
        grid: {
          title: "Grid",
          note: "Uma largura máxima, uma margem que cresce com a tela e duas divisões que se repetem nas seções.",
          items: [
            { k: "Largura máxima", v: "1360 px" },
            { k: "Margem lateral", v: "20 a 64 px" },
            { k: "Altura do menu", v: "56 px" },
            { k: "Cantos", v: "8, 14 e 20 px; botões em pílula" },
            { k: "Medida do texto", v: "54 caracteres por linha" },
            { k: "Muda para celular", v: "abaixo de 1024 px" },
          ],
          splits: [
            { name: "Título e conteúdo", cols: [4, 8] },
            { name: "Cartões em duas", cols: [1, 1] },
          ],
          dots: [],
        },
      },
      motion: {
        title: "Animações",
        note: "A página usa uma curva de movimento que começa rápido e chega devagar. Cada cartão abaixo roda com a duração real do site.",
        tokens: [
          {
            name: "Entrada dos blocos",
            ease: [0.22, 1, 0.36, 1],
            duration: 0.7,
            stagger: 0.07,
            usage: "Cada bloco sobe 20 px e aparece, um depois do outro.",
          },
          {
            name: "Cartões",
            ease: [0.22, 1, 0.36, 1],
            duration: 0.3,
            usage: "Sobem 4 px e clareiam com o mouse em cima.",
          },
          {
            name: "Botões",
            ease: [0.22, 1, 0.36, 1],
            duration: 0.18,
            usage: "Clareiam e sobem 1 px com o mouse em cima.",
          },
          {
            name: "Menu de idioma",
            ease: [0.22, 1, 0.36, 1],
            duration: 0.16,
            usage: "Desce 6 px e aparece ao clicar no globo.",
          },
          {
            name: "Destaque",
            ease: [0.32, 0, 0.12, 1],
            duration: 0.6,
            stagger: 0.16,
            usage: "As palavras de destaque mudam para âmbar, uma linha por vez.",
          },
        ],
      },
    },
    {
      type: "feature",
      id: "pagina-inicio",
      label: "Pág. Início",
      eyebrow: "Páginas",
      title: "Página inicial.",
      body: "A entrada do site, do topo ao rodapé, na ordem em que o visitante a percorre.",
      media: desktop("inicio-desktop", "Gravação da página inicial, do topo ao rodapé"),
      mediaKind: "desktop",
      side: "right",
      frameUrl: "/reels/",
      link: { url: "https://hubber-linkando.vercel.app/reels/", label: "Abrir a página inicial" },
      specs: [],
    },
    {
      type: "responsive",
      id: "menu",
      label: "Menu",
      eyebrow: "Menu",
      title: "Menu.",
      body: "O globo do cabeçalho abre a lista de idiomas, em português e inglês. No celular, o mesmo globo abre a lista no topo da página.",
      desktop: desktop("nav-desktop", "O globo de idioma no computador: a lista abre com português e inglês, e cada opção acende sob o cursor"),
      mobile: mobile("nav-mobile", "O globo de idioma no celular: a lista abre no topo e fecha"),
      notes: [],
    },
    {
      type: "feature",
      id: "inicio",
      label: "Início",
      eyebrow: "Início · vídeo e botão",
      title: "Início da página.",
      body: "O vídeo com cenas de gravação toca dentro de uma moldura de cantos arredondados, com uma cópia desfocada atrás que espalha a cor pelo fundo. O botão de reserva se inclina na direção do mouse.",
      media: desktop(
        "fundo-desktop",
        "Gravação do início: o mouse circula o botão de reserva, que acompanha o movimento, com o vídeo tocando atrás",
      ),
      mediaKind: "desktop",
      side: "left",
      specs: [
        { k: "Leitura", v: "uma sobreposição escura do lado esquerdo e embaixo deixa o texto legível sobre qualquer cena" },
      ],
      decision: {
        title: "O botão só se move com o mouse",
        text: "O efeito serve para chamar a atenção na tela grande. No celular, ou com a opção de reduzir movimento ligada, o botão fica parado.",
      },
    },
    {
      type: "feature",
      id: "secoes",
      label: "Seções",
      eyebrow: "Seções · título fixo e cartões",
      title: "Seções com título fixo.",
      body: "Cada seção tem o título à esquerda, parado no meio da tela, e o conteúdo à direita passando. Os cartões ganham brilho âmbar na posição do mouse.",
      media: desktop(
        "secoes-desktop",
        "Gravação das seções O que está incluído e Como funciona: títulos parados à esquerda, blocos aparecendo e cartões acendendo sob o mouse",
      ),
      mediaKind: "desktop",
      side: "right",
      specs: [
        { k: "Passos", v: "o número de cada passo (01, 02, 03) fica mais forte com o mouse em cima" },
      ],
      decision: {
        title: "O título da seção fica parado enquanto o conteúdo passa",
        text: "Com o título parado, quem lê os seis cartões ou os três passos continua vendo o título da seção. A página fica longa, e o título fixo mantém a referência durante a leitura.",
      },
    },
    {
      type: "feature",
      id: "parede",
      label: "Trabalhos",
      eyebrow: "Trabalhos · parede de reels",
      title: "Parede de reels.",
      body: "Nove vídeos verticais já gravados pela Hubber, cada um parado na capa com um botão de tocar. Tocar um pausa o anterior, e o vídeo pode ser ampliado numa janela.",
      media: desktop(
        "parede-desktop",
        "Gravação da parede de trabalhos: um reel começa a tocar, a barra de progresso é arrastada, o vídeo é ampliado e a janela é fechada",
      ),
      mediaKind: "desktop",
      side: "left",
      specs: [
        { k: "Controles", v: "a barra de progresso, o botão de voltar 10 segundos e o tempo só aparecem depois do play" },
      ],
    },
    {
      type: "feature",
      id: "formulario",
      label: "Formulário",
      eyebrow: "O pedido · formulário",
      title: "Formulário de contato.",
      body: "A última seção troca o preto pelo âmbar. À esquerda, o texto diz quem conduz a conversa e quando ela acontece; à direita, os campos do pedido.",
      media: desktop(
        "formulario-desktop",
        "Gravação do formulário: o nome e a empresa sendo digitados com dados de teste, o mouse passando pelas opções e pelo botão, sem enviar",
      ),
      mediaKind: "desktop",
      side: "right",
      specs: [
        { k: "Campos", v: "fundo escuro translúcido sobre o âmbar; blocos pretos sólidos seriam lidos como erro" },
        { k: "Opções", v: "a escolha de interesse aparece em botões lado a lado, já com uma marcada" },
        { k: "Erros", v: "cada campo vazio mostra a própria mensagem e o cursor vai ao primeiro que falta" },
      ],
      decision: {
        title: "O formulário pede contato, sem agenda",
        text: "A primeira versão tinha uma agenda com dias e horários. Ela saiu: o visitante só pede a conversa e a equipe combina o horário depois, pelo contato deixado. O texto ao lado do formulário diz isso de forma explícita, para ninguém esperar um convite na hora. Nesta versão de portfólio, o envio é simulado e a confirmação aparece na própria página.",
      },
    },
    {
      type: "phones",
      id: "responsivo",
      label: "Celular",
      eyebrow: "Celular",
      title: "O site no celular.",
      body: "A página passa a ter uma coluna só e o botão de reserva sai do cabeçalho para uma barra fixa no pé da tela.",
      phones: [
        { label: "Início", url: "/reels/", media: mobile("inicio-mobile", "Página do Reels no celular, do topo ao rodapé") },
        { label: "Idioma", media: mobile("nav-mobile", "O globo de idioma no celular: a lista abre no topo e fecha") },
        { label: "Abertura", media: mobile("hero-mobile", "A abertura no celular: o título e o botão de reserva sobre o vídeo") },
        { label: "Formulário", media: mobile("formulario-mobile", "O formulário no celular: os campos sobre fundo laranja, sem enviar") },
      ],
    },
    {
      type: "topics",
      id: "qualidade",
      label: "Qualidade",
      eyebrow: "Qualidade",
      title: "Testes e verificações.",
      body: "Ajustes medidos de contraste e de toque, e regras para quem prefere menos movimento. A página não tem testes automáticos próprios.",
      items: [
        {
          title: "Contraste",
          text: "As dicas dos campos sobre o âmbar mediam 3,96 para 1, abaixo do mínimo de 4,5 para texto pequeno, e o tom delas foi escurecido para corrigir.",
          stat: { value: "3,96 : 1", label: "contraste das dicas sobre o âmbar; o mínimo é 4,5 para 1" },
        },
        {
          title: "Toque",
          text: "Uma revisão no celular levou os alvos de toque a no mínimo 44 px: globo de idioma, logo, botão de ampliar os reels e os links dentro dos textos.",
          stat: { value: "44 px", label: "mínimo para os alvos de toque no celular" },
        },
        {
          title: "Teclado e leitores de tela",
          text: "Link para pular ao conteúdo, seções nomeadas, menu de idioma que fecha com Esc, foco visível em âmbar e controles dos reels com nome próprio.",
        },
        {
          title: "Menos movimento",
          text: "Com a opção ligada, nada se mexe: blocos visíveis desde o início, botões parados e vídeos sem repetição.",
        },
        {
          title: "Buscadores",
          text: "Título, descrição, endereço principal e as duas versões de idioma ligadas entre si, dados estruturados do negócio e do serviço e imagem própria para compartilhamento.",
          stat: { value: "2", label: "versões de idioma ligadas entre si" },
        },
        {
          title: "O que não há",
          text: "Os testes automáticos do projeto cobrem outras páginas da Hubber. O formulário e os efeitos do Reels não têm testes automáticos, nem medição de velocidade registrada.",
        },
      ],
    },
    {
      type: "cta",
      id: "projeto-real",
      label: "Ver projeto",
      title: "Página no ar.",
      body: "Tudo o que você viu está no ar. Passe o mouse no botão do início, toque um reel e troque o idioma pelo globo.",
      button: "Ver projeto real",
      note: "Abre em uma nova aba",
    },
  ],
};
