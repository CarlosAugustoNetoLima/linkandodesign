import type { Deck, Media } from "./types";

// Dossiê do deck do Hubber. Cada fato foi conferido em /Users/carloslima/hubber/hubber-site
// ou no site no ar. Nada de número estimado. O texto é para o público: simples, sem nome de
// arquivo, sem metáfora e sem termo técnico além do nome das linguagens. Não citar: IDs de
// pixel e de CRM, pasta de revisão, valores de preço, pendências de licença de fonte.
// A fonte de display original ("946 Latin Wide 3") não é redistribuída: o deck usa a
// Archivo Expandida no lugar e diz que ela faz o papel da original.
const BASE = "/decks/hubber";

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

export const hubber: Deck = {
  slug: "hubber",
  index: 2,
  name: "Hubber",
  client: "Hubber",
  year: 2026,
  sector: "Marketing · construção de departamento interno",
  location: "Brasil e Flórida (EUA)",
  flags: ["🇧🇷", "🇺🇸"],
  tagline: "Um site que muda de escuro para claro enquanto você desce.",
  liveUrl: "https://hubber-linkando.vercel.app/",
  extraLinks: [
    {
      label: "Ver o Hubber Reels",
      url: "https://hubber-linkando.vercel.app/reels",
      note: "O produto de conteúdo, com identidade própria",
    },
  ],
  stack: ["HTML", "CSS", "JavaScript", "Python"],
  theme: {
    accent: "#e3008d",
    accentInk: "#ffffff",
    fontKey: "archivo",
    displayWeight: 400,
    displayTracking: "0.01em",
    displayUppercase: true,
    // o site principal tem cantos retos (só a mídia leva 4 px)
    radius: "0px",
    displayStretch: 125,
    coverWeight: 400,
  },
  cover: desktop("hero-top-desktop", "Início do site: o logo da Hubber desenhado por partículas que fogem do cursor"),
  summary:
    "O logo é feito de pontos que reagem ao mouse, vira uma janela que muda a página de escura para clara e a cor dos rótulos vai do azul ao magenta enquanto se desce.",
  seo: {
    title: "Hubber — Apresentação | Linkando Design",
    description:
      "Como foi feito o site da Hubber: descoberta, identidade visual, estrutura das páginas, efeitos, desenvolvimento e testes.",
  },
  chapters: [
    {
      type: "cover",
      id: "capa",
      label: "Capa",
      kicker: "02 — Portfólio 2026 · Marketing · Brasil e Flórida",
      title: "Hubber",
      subtitle:
        "Site de uma empresa que constrói o departamento de marketing dentro do cliente: a página muda de escura para clara conforme se rola.",
      chips: ["HTML", "CSS", "JavaScript", "Python"],
      credit: "Linkando Design · 2026 · design e desenvolvimento com IA",
      backdrop: desktop("cover-desktop", "O logo da Hubber desenhado por pontos cinza, reagindo ao movimento do mouse"),
    },
    {
      type: "statement",
      id: "resumo",
      label: "Resumo",
      eyebrow: "O projeto",
      text: "A Hubber constrói o departamento de marketing dentro da empresa do cliente. O site parte de uma tese: contratar marketing é pagar aluguel pelo próprio crescimento. A página conduz o visitante por essa troca: o fundo passa de escuro para claro e o logo vira uma janela que se abre.",
      emphasis: ["aluguel", "claro", "janela"],
      stats: [
        { value: 12, label: "seções na página principal" },
        { value: 3, label: "sites num só projeto: principal, Reels e Briefing" },
        { value: 2, label: "idiomas: português e inglês" },
      ],
    },
    {
      type: "topics",
      id: "descoberta",
      label: "Descoberta",
      eyebrow: "Descoberta",
      title: "Entender o negócio antes de desenhar.",
      body: "O que o próprio site e o material do projeto mostram sobre o ponto de partida.",
      items: [
        {
          title: "Quem o site quer atrair",
          text: "Empresas brasileiras que faturam US$ 1 milhão ou mais nos Estados Unidos, como diz a primeira linha da página. O Reels fala com negócios de Orlando.",
        },
        {
          title: "A tese",
          text: "Nasceu de um caso real, contado na própria página: contratar agência é pagar aluguel pelo próprio crescimento. O site inteiro foi desenhado para fazer o visitante sentir essa troca.",
        },
        {
          title: "Dois produtos, duas páginas",
          text: "A página principal vende a construção do departamento de marketing. O Reels vende um dia de gravação que vira um mês de conteúdo. A oferta do Reels foi simplificada durante o projeto e o texto e o formulário mudaram junto.",
        },
        {
          title: "Material recebido",
          text: "Kit de marca, vídeo de apresentação de cinco minutos com legenda, três vídeos de depoimento de clientes e nove reels de portfólio.",
        },
        {
          title: "Idiomas",
          text: "Português e inglês. A página principal tem o português como padrão e uma versão em inglês; no Reels é o contrário.",
        },
        {
          title: "Um projeto, vários endereços",
          text: "O site principal, o Reels e o Briefing ficam no mesmo projeto e são separados pelo endereço de acesso. Assim o Reels foi criado sem mexer no site principal, e todo contato vai para um único sistema.",
        },
      ],
    },
    {
      type: "identity",
      id: "identidade",
      label: "Identidade",
      eyebrow: "Identidade visual",
      title: "Escuro, claro e um gradiente de azul a magenta.",
      swatches: [
        { name: "Magenta", hex: "#ff009e", role: "Marca-texto, botões e destaque no escuro" },
        { name: "Blue", hex: "#005cff", role: "Início do gradiente e destaque no claro" },
        { name: "Ink", hex: "#161616", role: "Fundo escuro e texto no claro" },
        { name: "Ink raised", hex: "#1f1f1f", role: "Painéis sobre o fundo escuro" },
        { name: "White", hex: "#ffffff", role: "Fundo claro e texto no escuro" },
        { name: "White raised", hex: "#f4f4f4", role: "Painéis sobre o fundo claro" },
      ],
      fonts: [
        {
          name: "946 Latin Wide 3",
          role: "Títulos",
          sample: "Você está pagando aluguel",
          weight: 400,
          size: "xl",
          wide: true,
          note: "Uma fonte larga, em caixa alta. Nesta apresentação, a Archivo Expandida, de aparência parecida, faz o papel dela.",
        },
        {
          name: "Archivo",
          role: "Texto corrido e botões",
          sample: "Marketing deixa de ser um serviço que você contrata e passa a ser um ativo que você domina.",
          weight: 400,
          size: "md",
          note: "Bastante espaço entre as linhas e no máximo 68 caracteres por linha.",
        },
        {
          name: "JetBrains Mono",
          role: "Rótulos",
          sample: "A virada",
          weight: 500,
          tracking: "0.13em",
          uppercase: true,
          size: "sm",
          note: "Rótulos pequenos em caixa alta, com letras espaçadas: títulos de seção, contadores e semanas. Nesta apresentação, aproximada pela Archivo.",
        },
      ],
    },
    {
      type: "topics",
      id: "sistema",
      label: "Sistema",
      eyebrow: "Sistema visual",
      title: "Uma marca de poucas cores e tamanhos que respeitam a tela.",
      body: "As cores, os tamanhos, os espaços e os tempos saem de um conjunto de variáveis, e cada seção só escolhe a superfície em que está.",
      items: [
        {
          title: "Cores com função",
          text: "Quatro cores base (magenta, azul, quase preto e branco) e dois degradês do azul ao magenta. Cada uma tem a versão certa para texto sobre claro e sobre escuro, mais cinzas de apoio, âmbar para avisos, vermelho para erro e verde para sucesso.",
        },
        {
          title: "Superfícies",
          text: "Cada seção é clara, escura ou na cor da marca. Trocar de superfície troca fundo, texto, destaque e linhas de uma vez, sem estilo extra. É o que permite a página virar de escura para clara no meio da rolagem.",
        },
        {
          title: "Tamanhos que acompanham a tela",
          text: "Os títulos são múltiplos de uma unidade que cresce com a largura: 200 para o maior, 109, 76 e 40 para os seguintes e 24 para o texto de apoio. A 1440 px de largura, uma unidade vale 1 px. No celular, os tamanhos passam a valores fixos.",
        },
        {
          title: "Espaço e largura",
          text: "Uma escala de espaços de 4 a 240 px, margens laterais de 20 a 64 px e espaço entre seções de 120 a 240 px (80 px no celular). O conteúdo tem no máximo 1600 px de largura.",
        },
        {
          title: "Movimento e cantos",
          text: "Uma só curva de movimento e três tempos: 0,3 s, 0,5 s e 0,8 s. Os cantos são retos; só a mídia tem um arredondado de 4 px.",
        },
        {
          title: "Peças compartilhadas",
          text: "Cabeçalho, rodapé e logo existem uma vez só e são montados em todas as páginas ao gerar o site. O português fica na raiz e o inglês espelha as mesmas páginas, e o seletor de idioma leva à página equivalente.",
        },
      ],
    },
    {
      type: "topics",
      id: "estrutura",
      label: "Estrutura",
      eyebrow: "Estrutura da página principal",
      title: "Doze seções, do problema à decisão.",
      body: "A ordem em que o visitante as encontra ao rolar a página em português.",
      items: [
        {
          title: "Início",
          text: "“Você está pagando aluguel…”: a promessa, o botão para pedir o diagnóstico e o logo feito de pontos.",
        },
        {
          title: "O vídeo (5 min)",
          text: "O vídeo de apresentação, que abre do centro para as bordas conforme a rolagem.",
        },
        {
          title: "O problema",
          text: "Quatro sintomas que o visitante reconhece na própria empresa.",
        },
        {
          title: "Onde a tese nasceu",
          text: "A origem da ideia, contada a partir de um caso de Orlando.",
        },
        {
          title: "A virada",
          text: "Uma tabela compara a agência com o modelo da Hubber, e o logo vira a janela que muda a página de escura para clara.",
        },
        {
          title: "O diferencial",
          text: "“Padrão americano. Custo de execução brasileiro.”",
        },
        {
          title: "O método",
          text: "Três fases em 90 dias.",
        },
        {
          title: "Prova",
          text: "Quatro métricas e o caso que as sustenta.",
        },
        {
          title: "Depoimentos",
          text: "Três vídeos de clientes, empilhados como cartas.",
        },
        {
          title: "Quem não deve contratar",
          text: "“Não serve para todo mundo”: uma seção que filtra quem não é o público.",
        },
        {
          title: "Outras rotas",
          text: "A seção “Outras rotas”, com duas alternativas: Agência e Core.",
        },
        {
          title: "A decisão",
          text: "Chamada final para pedir o diagnóstico, com o rodapé que mostra os relógios do Brasil e dos EUA.",
        },
      ],
    },
    {
      type: "topics",
      id: "estrutura-reels",
      label: "Estrutura Reels",
      eyebrow: "Estrutura do Reels",
      title: "Uma página de conversão, em inglês.",
      body: "O Reels tem 8 seções, agrupadas aqui em 6 blocos.",
      items: [
        {
          title: "Início",
          text: "“Turn one shoot into a full month of content.” (Transforme um dia de gravação em um mês de conteúdo.)",
        },
        {
          title: "O problema",
          text: "“If your business isn't showing up, someone else is.” (Se o seu negócio não aparece, outro aparece.)",
        },
        {
          title: "A oferta",
          text: "“One month of content. Handled.” com seis cartões que mostram o que está incluído.",
        },
        {
          title: "Como funciona",
          text: "“Simple for you…”: planejamos, gravamos e entregamos. Depois, “One shoot day. One price.” (Um dia de gravação. Um preço.)",
        },
        {
          title: "A objeção",
          text: "“But I'm not good on camera.” (Mas eu não vou bem na câmera.) Responde ao medo mais comum antes do pedido.",
        },
        {
          title: "Portfólio e contato",
          text: "Nove reels já gravados e o formulário “Request a 30 minute call.” (Peça uma conversa de 30 minutos.)",
        },
      ],
    },
    {
      type: "topics",
      id: "estrutura-paginas",
      label: "Outras páginas",
      eyebrow: "Estrutura das outras páginas",
      title: "Cada produto da Hubber tem a sua página e a sua pergunta.",
      body: "Além da página principal e do Reels, o site tem páginas para cada oferta, para a prova e para quem chega por um caminho específico. A maior parte existe também em inglês.",
      items: [
        {
          title: "Build",
          text: "Construir o departamento de marketing da empresa em 12 semanas: duas para recrutar, duas para instalar e oito para governar. Mostra o que fica com o cliente no fim, o que precisa estar pronto antes de começar, o caso e as perguntas frequentes.",
        },
        {
          title: "Agência",
          text: "Uma operação de marketing ligada a pipeline e receita, que começa em 10 dias úteis depois do contrato. Explica as duas frentes, a rotina de cada semana, mês e trimestre e o que precisa estar pronto.",
        },
        {
          title: "Core",
          text: "A estrutura digital essencial: ser achado, passar confiança e receber contato. Mostra o ciclo (auditar, montar, executar e revisar), o que entra na mensalidade e o que não entra, e o preço a partir de US$997 por mês.",
        },
        {
          title: "Cases",
          text: "A página de provas: o caso Florida Rental Car, que deu origem ao Build, e o trabalho de marca por trás do marketing, com os critérios para um caso entrar ali.",
        },
        {
          title: "Sobre",
          text: "Como a tese nasceu, quem fundou a Hubber, cinco regras de trabalho e por que a empresa fica entre o Brasil e a Flórida.",
        },
        {
          title: "Diagnóstico",
          text: "Um formulário em cinco passos que descobre o gargalo da empresa e devolve a rota mais indicada: Build, Agência, Core ou “ainda não é hora de contratar”.",
        },
        {
          title: "Connect",
          text: "Parcerias para criadores de conteúdo que vão viajar para Orlando e Miami: a Hubber liga o criador às empresas locais antes da viagem. Tem um formulário próprio de aplicação.",
        },
        {
          title: "Briefings",
          text: "Quatro briefings para quem já é cliente: marca, website, onboarding e designer, de 5 a 6 etapas cada, em português e em inglês. As respostas ficam salvas no navegador e somem depois de 24 horas sem alteração.",
        },
        {
          title: "Plastic",
          text: "Uma página em inglês para clínicas de cirurgia plástica nos Estados Unidos, com o problema, o método em quatro passos, a apresentação do fundador e um formulário de contato.",
        },
      ],
    },
    {
      type: "anatomy",
      id: "anatomia",
      label: "Primeira tela",
      eyebrow: "A primeira tela",
      title: "Cada elemento da primeira tela tem um motivo.",
      // início parado no topo; pins medidos no DOM a 1280×800
      media: desktop("hero-top-desktop", "Gravação do início do site da Hubber, parado no topo, com o mouse sobre as partículas"),
      pins: [
        {
          x: 82,
          y: 52,
          r: 20,
          title: "O logo é feito de pontos",
          why: "A marca é desenhada por pontos cinza que fogem do cursor e voltam ao lugar. Antes de qualquer promessa, o visitante já está mexendo no logo.",
        },
        {
          x: 52,
          y: 29.5,
          r: 14,
          title: "O marca-texto",
          why: "A frase mais forte (“pagando aluguel”) ganha um marca-texto magenta que se pinta linha a linha quando o título entra na tela.",
        },
        {
          x: 19,
          y: 20.5,
          r: 12,
          title: "Para quem é",
          why: "A primeira linha filtra: o site fala com empresas brasileiras que faturam US$ 1 milhão ou mais nos Estados Unidos, e diz isso antes de qualquer promessa.",
        },
        {
          x: 17.5,
          y: 77.3,
          r: 13,
          title: "Dois caminhos",
          why: "Um botão cheio leva ao diagnóstico; o outro, só de contorno, rola até o método. Uma ação principal e uma de apoio.",
        },
        {
          x: 86,
          y: 4.5,
          r: 14,
          title: "O pedido fica à mão",
          why: "“Solicitar diagnóstico” mora no cabeçalho, ao lado do seletor PT/EN, e acompanha a rolagem da página inteira.",
        },
      ],
    },
    {
      type: "feature",
      id: "pixels",
      label: "Pontos",
      eyebrow: "Início · logo de pontos",
      title: "O logo é desenhado com pontos.",
      body: "O início desenha a marca da Hubber com pontos, sem biblioteca de terceiros. Passe o mouse por cima: os pontos se afastam e voltam ao lugar.",
      media: desktop("pixels-desktop", "Gravação do início: o mouse varre os pontos do logo, que se afastam e retornam"),
      mediaKind: "desktop",
      side: "left",
      specs: [
        { k: "Desenho", v: "o contorno do logo vira uma grade de pontos pequenos, um pouco menores no celular" },
        { k: "Cores", v: "dois tons de cinza, em vários níveis de transparência" },
        { k: "Mouse", v: "os pontos perto do cursor se afastam e depois voltam" },
        { k: "Economia", v: "a animação para quando o início sai da tela ou a aba fica oculta" },
        { k: "No celular", v: "a marca sobe para cima do título" },
      ],
      decision: {
        title: "Quem prefere menos movimento recebe o logo pronto",
        text: "Com a opção de reduzir movimento ligada, os pontos não animam: cada um vai direto para a posição final e a marca é desenhada uma vez. O logo continua lá, só não reage ao mouse.",
      },
    },
    {
      type: "feature",
      id: "porta",
      label: "A virada",
      eyebrow: "A virada",
      title: "O logo vira uma janela que se abre.",
      body: "No meio da página, o título é digitado com um cursor piscando. Depois, o formato do logo vira uma janela que cresce até cobrir a tela e mostra a seção clara por dentro: o fundo passa de escuro para claro num só movimento.",
      media: desktop("door-desktop", "Gravação da seção A virada: título digitado e a janela em formato de logo se abrindo"),
      mediaKind: "desktop",
      side: "right",
      specs: [
        { k: "Fases", v: "entrada, digitação e abertura, nessa ordem, ao longo da rolagem" },
        { k: "Janela", v: "tem o formato exato do logo e cresce até passar do tamanho da tela" },
        { k: "Controle", v: "a rolagem comanda, com 0,6 s de suavização" },
        { k: "Camadas", v: "três: a seção escura que sai, a clara que entra e o preenchimento final" },
        { k: "Digitação", v: "cada letra aparece separada e o cursor acompanha a medida de cada uma" },
        { k: "Acessível", v: "leitores de tela recebem o título inteiro, não letra por letra" },
      ],
      decision: {
        title: "A marca é a transição",
        text: "A janela tem o formato exato do logo, o mesmo desenho que forma os pontos do início. A marca e a transição são o mesmo objeto, em vez de um logo enfeitando uma animação qualquer.",
      },
    },
    {
      type: "feature",
      id: "video",
      label: "Vídeo",
      eyebrow: "O vídeo do site",
      title: "O vídeo abre do centro e ganha um brilho próprio.",
      body: "O vídeo de cinco minutos aparece abrindo do centro para as bordas conforme a rolagem. Atrás dele, uma cópia desfocada do mesmo vídeo, sincronizada, serve de luz ambiente.",
      media: desktop("film-desktop", "Gravação da seção do vídeo: a moldura abre e o vídeo começa a tocar com o brilho atrás"),
      mediaKind: "desktop",
      side: "left",
      specs: [
        { k: "Abertura", v: "a moldura do vídeo abre do centro para as bordas" },
        { k: "Controle", v: "a rolagem comanda, com 0,6 s de suavização" },
        { k: "Brilho", v: "um segundo vídeo, sem som e bem desfocado, sincronizado com o principal" },
        { k: "Profundidade", v: "o brilho se desloca um pouco com a rolagem" },
        { k: "Pausa", v: "o vídeo pausa sozinho ao sair da tela" },
        { k: "No celular", v: "o brilho some e o vídeo vira um bloco comum" },
      ],
      decision: {
        title: "Controles só depois do clique",
        text: "O vídeo nasce sem os controles do navegador e com um botão de play próprio. Só no primeiro play os controles aparecem: a tela fica limpa até o visitante decidir assistir.",
      },
    },
    {
      type: "feature",
      id: "baralho",
      label: "Depoimentos",
      eyebrow: "Depoimentos",
      title: "Depoimentos em cartas que se empilham.",
      body: "Os depoimentos em vídeo aparecem como cartas empilhadas: cada carta nova sobe de baixo com um leve giro, e as anteriores encolhem, sobem e escurecem. Rolar a página passa para a carta seguinte.",
      media: desktop("deck-desktop", "Gravação da seção de depoimentos: cartas de vídeo se empilhando com a rolagem"),
      mediaKind: "desktop",
      side: "right",
      specs: [
        { k: "Cartas de trás", v: "a primeira fica a 60% de opacidade, a segunda a 35% e as demais somem" },
        { k: "Entrada", v: "a nova sobe com um giro de 3°; as anteriores encolhem um pouco a cada nível" },
        { k: "Rolagem", v: "com mouse, a rolagem encaixa em cada carta" },
        { k: "Contador", v: "01 / 03 e uma barra de progresso" },
        { k: "Vídeos", v: "só o da carta ativa toca; os outros pausam" },
        { k: "Altura", v: "só trava a tela em janelas com 640 px de altura ou mais" },
      ],
      decision: {
        title: "O foco leva à carta",
        text: "Quem navega pelo teclado e dá foco numa carta de trás é levado até ela. O efeito é pensado para o mouse, mas continua acessível sem ele.",
      },
    },
    {
      type: "feature",
      id: "profundidade",
      label: "Cor dos rótulos",
      eyebrow: "A cor muda com a rolagem",
      title: "A cor dos rótulos muda conforme você desce.",
      body: "A página principal alterna fundo escuro e claro de seção em seção. Por cima disso, um valor de 0 a 1 cresce com a rolagem e mistura a cor dos rótulos de azul para magenta. A linha do cabeçalho mostra o mesmo valor.",
      media: desktop("depth-desktop", "Gravação da página principal rolando: o fundo alterna entre escuro e claro e a cor dos rótulos muda"),
      mediaKind: "desktop",
      side: "left",
      specs: [
        { k: "Pontos", v: "0 no topo, 0,2 no começo da janela do logo, 0,8 no fim dela e 1 no rodapé" },
        { k: "Mistura", v: "a cor dos rótulos é uma mistura dos dois destaques, de acordo com esse valor" },
        { k: "À vista", v: "só os elementos visíveis recebem o valor" },
        { k: "Marca-texto", v: "cada marca se pinta em 0,9 s, com uma pequena defasagem entre uma e outra" },
      ],
      decision: {
        title: "O JavaScript mede, o CSS decide",
        text: "O código só informa em que ponto da página o visitante está. Quem escolhe a cor é o CSS: em um navegador antigo, o destaque simplesmente fica fixo e nada quebra.",
      },
    },
    {
      type: "feature",
      id: "reels",
      label: "Reels",
      eyebrow: "Hubber Reels",
      title: "Outro produto, outra identidade, o mesmo projeto.",
      body: "A Hubber vende um segundo produto: um dia de gravação vira um mês de vídeos. Ele fica em um endereço próprio, mas é servido pelo mesmo projeto, que escolhe a página pelo endereço de acesso.",
      media: desktop("reels-desktop", "Gravação da página do Hubber Reels rolando do início até o formulário de reserva"),
      mediaKind: "desktop",
      side: "right",
      specs: [
        { k: "Identidade", v: "âmbar sobre preto, com cantos levemente arredondados (o site principal tem cantos retos)" },
        { k: "Endereços", v: "o Reels e o Briefing apontam para pastas do mesmo projeto" },
        { k: "Idiomas", v: "inglês como padrão e uma versão em português" },
        { k: "Entrada", v: "os blocos aparecem ao rolar, sem biblioteca de animação" },
        { k: "Consentimento", v: "o pixel de anúncios só carrega depois do aceite" },
      ],
      decision: {
        title: "Consentimento primeiro",
        text: "A página avisa que o pixel grava dois cookies e oferece “Got it” ou “Opt out”. Se o visitante recusa, o pixel para, os cookies saem e a página funciona igual.",
      },
    },
    {
      type: "feature",
      id: "diagnostico",
      label: "Diagnóstico",
      eyebrow: "Página Diagnóstico",
      title: "Um diagnóstico em cinco passos que devolve a rota certa.",
      body: "O formulário tem cinco passos (Empresa, Gargalo, Prontidão, Objetivo e Contato), com uma barra de progresso no topo. Cada passo só avança com os campos corretos, e os erros aparecem no campo e num aviso geral. No fim, o visitante recebe uma de quatro respostas: Build, Agência, Core ou “ainda não é hora de contratar”, quando a empresa ainda não está pronta.",
      media: desktop("diagnostico-desktop", "Gravação do diagnóstico: o aviso de campos faltando, o preenchimento de quatro passos com dados de teste e a volta ao passo anterior, sem enviar"),
      mediaKind: "desktop",
      side: "left",
      specs: [
        { k: "Passos", v: "Empresa, Gargalo, Prontidão, Objetivo e Contato, com contador (“Passo 2 de 5”) e botão Voltar em cada um" },
        { k: "Validação", v: "cada passo confere os campos antes de continuar; o aviso geral lista o que falta e cada item leva ao campo" },
        { k: "Regra da rota", v: "abaixo de US$85 mil de faturamento por mês, ou sem verba para os próximos 90 dias, a resposta é “ainda não é hora”; com time interno, Build; para executar, Agência; para montar a base, Core" },
        { k: "Mesma regra", v: "o navegador e o servidor calculam a rota com a mesma função; só a do servidor vale e é a que vai para o sistema de contatos" },
        { k: "Resposta", v: "só aparece depois que o servidor confirma que gravou; se falhar, as respostas continuam preenchidas" },
        { k: "Proteção", v: "um campo escondido e um tempo mínimo de 3 s barram robôs, que recebem a resposta “ainda não é hora”" },
      ],
      decision: {
        title: "A resposta diz o que falta confirmar",
        text: "Cada resposta conta o que o formulário concluiu e o que ainda precisa de conversa. Se quem respondeu não é quem decide, o texto pede para trazer quem decide. Se a verba ainda está a definir, a conversa serve para dimensioná-la. Assim a página não promete mais do que sabe.",
      },
    },
    {
      type: "motion",
      id: "movimento",
      label: "Animações",
      eyebrow: "Animações",
      title: "Um único ritmo manda em quase tudo.",
      body: "A Hubber usa uma só curva de movimento, a mesma no JavaScript e no CSS. Cada cartão abaixo roda com a duração real do site.",
      tokens: [
        {
          name: "Movimento padrão",
          ease: [0.32, 0, 0.12, 1],
          duration: 1,
          usage: "Tudo que não declara outro movimento usa este.",
        },
        {
          name: "Marca-texto",
          ease: [0.32, 0, 0.12, 1],
          duration: 0.9,
          stagger: 0.16,
          usage: "A cor cresce de ponta a ponta, uma marca por vez.",
        },
        {
          name: "Carta que entra",
          ease: [0.215, 0.61, 0.355, 1],
          duration: 1,
          usage: "Sobe de baixo com um leve giro no baralho de depoimentos.",
        },
        {
          name: "Cartas anteriores",
          ease: [0.455, 0.03, 0.515, 0.955],
          duration: 1,
          usage: "Encolhem, sobem e escurecem enquanto a nova chega.",
        },
        {
          name: "Janela do logo e vídeo",
          ease: [0, 0, 1, 1],
          duration: 0.6,
          usage: "Sem curva: a rolagem é quem controla, com 0,6 s de suavização.",
        },
      ],
      notes: [
        "O movimento guiado pela rolagem é medido pelo código e desenhado pelo CSS.",
        "Tempos do CSS: 0,3 s rápido, 0,5 s normal e 0,8 s lento, todos com a mesma curva.",
        "Com a opção de reduzir movimento ligada, nada anima: o marca-texto já vem pintado e os pontos ficam parados.",
      ],
    },
    {
      type: "topics",
      id: "desenvolvimento",
      label: "Desenvolvimento",
      eyebrow: "Desenvolvimento",
      title: "Como o site foi construído.",
      body: "Sem framework e sem ferramenta de montagem para o código que roda no navegador.",
      items: [
        {
          title: "Linguagens",
          text: "HTML, CSS e JavaScript puros. Python junta as partes de cada página (cabeçalho, rodapé e seções) e gera o HTML final de todas as páginas, 49 no total.",
        },
        {
          title: "Bibliotecas",
          text: "A página principal usa GSAP (animações ligadas à rolagem) e Lenis (rolagem suave), hospedados no próprio site. O Reels usa só JavaScript próprio.",
        },
        {
          title: "Textos e idiomas",
          text: "Cada idioma é uma página própria. Uma tabela liga cada página ao seu par no outro idioma, e os dois lados se apontam entre si para os buscadores.",
        },
        {
          title: "Servidor",
          text: "Pequenas funções em Node.js, na Vercel, recebem o formulário do Reels. Um programa que roda antes de cada página escolhe qual servir pelo endereço de acesso.",
        },
        {
          title: "Formulário do Reels",
          text: "Validado no navegador e de novo no servidor, com campo-isca contra robôs e trava de 3 segundos. O pedido é guardado primeiro num armazenamento privado e depois vira um cartão no sistema de contatos, com até 3 tentativas. O que falhar é reenviado por uma tarefa diária.",
        },
        {
          title: "Desempenho e segurança",
          text: "Vídeos só carregam quando necessário, com imagem de capa; a parede de reels caiu de 530 MB para 13 MB. As regras de segurança limitam o que a página pode carregar, e a montagem falha se um script ficar fora da regra.",
        },
      ],
    },
    {
      type: "topics",
      id: "qualidade",
      label: "Qualidade",
      eyebrow: "Qualidade",
      title: "O que foi verificado.",
      body: "Testes automáticos em parte do projeto, e ajustes medidos de contraste e de toque no Reels.",
      items: [
        {
          title: "Testes automáticos",
          text: "55 testes escritos, que rodam com um único comando, cobrem o briefing, o consentimento do pixel e uma página de campanha. A página principal e o formulário do Reels não têm testes automáticos.",
        },
        {
          title: "Acessibilidade",
          text: "Link para pular ao conteúdo, seções nomeadas, menus pelo teclado, foco visível, opção de reduzir movimento, janela modal nativa e legenda no vídeo principal.",
        },
        {
          title: "Contraste e toque",
          text: "O Reels passou por 4 rodadas de contraste, com mínimo final de 5,27 para 1 (o recomendado é 4,5). Os alvos de toque menores que 44 px caíram de 18 para 0.",
        },
        {
          title: "Navegadores antigos",
          text: "Os efeitos de cor e de rolagem têm alternativa: em navegador antigo, ou com menos movimento, a página continua completa e legível.",
        },
        {
          title: "Privacidade",
          text: "No Reels, o pixel de anúncios só carrega depois do aceite, com opção de sair. Os testes cobrem essa regra.",
        },
        {
          title: "Buscadores",
          text: "Título, descrição, endereço canônico e idiomas alternativos na página principal e no Reels, que ainda tem dados estruturados e imagem de compartilhamento.",
        },
      ],
    },
    {
      type: "responsive",
      id: "responsivo",
      label: "Celular",
      eyebrow: "Celular",
      title: "No celular, cada efeito decide se cabe.",
      body: "Nada é só diminuído: cada efeito declara a tela mínima de que precisa e, abaixo dela, vira um bloco comum, sem travar a tela e sem truque.",
      desktop: desktop("hero-top-desktop", "Início do site no computador"),
      mobile: mobile("hero-mobile", "Início do site no celular"),
      notes: [
        { k: "Início", v: "a marca de pontos sobe para cima do título, com pontos um pouco menores" },
        { k: "Sintomas", v: "a lista com fade só trava a tela com 1100 px de largura e 620 px de altura" },
        { k: "Depoimentos", v: "só travam a tela com 640 px de altura ou mais" },
        { k: "Vídeo", v: "a abertura e o movimento de profundidade vêm a partir de 768 px; o brilho some no celular" },
        { k: "Encaixe", v: "o encaixe da rolagem só existe com mouse" },
        { k: "Títulos", v: "o tamanho cai para 3 rem abaixo de 768 px" },
      ],
    },
    {
      type: "cta",
      id: "projeto-real",
      label: "Ver projeto",
      title: "Agora veja o site de verdade.",
      body: "Tudo que você viu é o site no ar. Role a página, passe o mouse no logo de pontos e abra o Reels.",
      button: "Ver projeto real",
      note: "Abre em uma nova aba",
    },
  ],
};
