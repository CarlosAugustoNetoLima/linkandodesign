import type { Deck, Media } from "./types";

// Dossiê do deck do Station One. Cada fato foi conferido em /Users/carloslima/stationone (README, componentes,
// estilos, scripts e textos) ou, nos efeitos, no site servido do código. Figma NÃO entra: o repositório não tem
// nenhuma referência a ele. A IA vem do briefing do dono (o README fala da "busca por IA", que é um recurso do
// site, e não do processo). O texto é para o público: simples, sem nome de arquivo e sem termo técnico além do
// nome das linguagens (bibliotecas só no capítulo de desenvolvimento). Não citar: e-mail e dados legais da
// empresa, ano de fundação, textos marcados como provisórios, o TODO do horário de um show e o identificador do
// projeto na Vercel. ATENÇÃO: o link da Vercel está atrás do login da Vercel (Deployment Protection), então
// todas as gravações saíram do código servido localmente (servidor PHP em localhost), com a data simulada de
// 1º de outubro de 2026 (`?_now=`, recurso de desenvolvimento do próprio site), quando os três espetáculos
// estavam em cartaz. Na janela de compra só foram passados o mouse e um clique num setor do mapa, sem
// adicionar bilhetes. A faixa de cartazes foi gravada a 1440 × 900, onde o efeito se vê melhor.
const BASE = "/decks/stationone";

const desktop = (name: string, alt: string): Media => ({
  src: `${BASE}/${name}.mp4`,
  poster: `${BASE}/${name}.jpg`,
  width: 1280,
  height: 800,
  alt,
});

const desktopHd = (name: string, alt: string): Media => ({
  src: `${BASE}/${name}.mp4`,
  poster: `${BASE}/${name}.jpg`,
  width: 1440,
  height: 900,
  alt,
});

const mobile = (name: string, alt: string): Media => ({
  src: `${BASE}/${name}.mp4`,
  poster: `${BASE}/${name}.jpg`,
  width: 520,
  height: 1126,
  alt,
});

export const stationOne: Deck = {
  slug: "station-one",
  index: 8,
  name: "Station One",
  client: "Station One Entertainment",
  year: 2026,
  sector: "Promotora de concertos",
  location: "Lisboa e Porto, Portugal",
  flags: ["🇵🇹"],
  tagline: "O site de uma promotora de concertos, com agenda, bilhetes e uma página de erro em forma de bilhete.",
  liveUrl: "https://stationone-linkando.vercel.app/",
  extraLinks: [
    {
      label: "Abrir a página de erro 404",
      url: "https://stationone-linkando.vercel.app/pagina-que-nao-existe",
      note: "O bilhete que se inclina com o mouse e a luz que segue o cursor",
    },
  ],
  stack: ["PHP", "HTML", "CSS", "JavaScript"],
  theme: {
    // a marca é preta e branca, como o logo: o destaque do palco é o próprio preto do site
    accent: "#0b0c0e",
    accentInk: "#ffffff",
    fontKey: "archivo",
    displayWeight: 800,
    displayTracking: "-0.01em",
    displayUppercase: false,
    radius: "1.25rem",
    coverWeight: 800,
    displayStretch: 122,
  },
  cover: desktop("hero-desktop", "Início do site: o baralho de cartas com a próxima data de cada espetáculo"),
  summary:
    "Site de uma promotora de concertos em Lisboa e no Porto, com um baralho de cartas na primeira tela, agenda com datas que giram, fila de cartazes que se move ao rolar, compra com mapa de lugares e uma página 404 em forma de bilhete.",
  seo: {
    title: "Station One — Apresentação | Linkando Design",
    description:
      "Como foi feito o site da Station One: do conteúdo à identidade preta e branca, o baralho de cartas, o painel de datas, a compra com mapa de setores, o vídeo da página Sobre e a página 404.",
  },
  chapters: [
    {
      type: "cover",
      id: "capa",
      label: "Capa",
      kicker: "08 — Portfólio 2026 · Concertos · Lisboa e Porto",
      title: "Station One",
      subtitle: "O site de uma promotora de concertos: baralho de cartas na primeira tela, agenda, compra com mapa de lugares e uma 404 em forma de bilhete.",
      chips: ["PHP", "CSS", "JavaScript", "PT · EN"],
      credit: "Linkando Design · 2026 · design e desenvolvimento com IA",
      backdrop: desktop("hero-desktop", "O baralho de cartas passando de um espetáculo para o seguinte"),
    },
    {
      type: "statement",
      id: "resumo",
      label: "Resumo",
      eyebrow: "O projeto",
      text: "A Station One é uma promotora e produtora de espetáculos com sede em Lisboa. O site mostra a agenda, leva ao bilhete numa janela com a identidade da marca e tem até uma página de erro em forma de bilhete.",
      emphasis: ["agenda", "bilhete", "janela", "marca"],
      stats: [
        { value: 3, label: "espetáculos em cartaz, cada um com cartaz, datas e bilhetes" },
        { value: 6, label: "datas em 3 recintos: Gondomar, Lisboa e Porto" },
        { value: 2, label: "idiomas: português de Portugal e inglês" },
      ],
    },
    {
      type: "process",
      id: "etapas",
      label: "Etapas",
      eyebrow: "Como foi feito",
      title: "De uma base própria à prévia para o cliente.",
      body: "O projeto parte de uma base em PHP que o estúdio já usava e ganha uma camada nova de SEO, busca por IA, acessibilidade e movimento.",
      steps: [
        {
          n: "01",
          name: "Base",
          output: "PHP puro",
          note: "A base é a mesma de outros sites do estúdio: PHP puro, com os textos em dois idiomas e as páginas montadas por componentes.",
        },
        {
          n: "02",
          name: "Conteúdo",
          output: "3 espetáculos, 6 datas",
          note: "Cada espetáculo tem cartaz, recintos e datas num único registro. Dele saem a agenda, as páginas, o calendário, o mapa do site e a imagem de compartilhamento.",
        },
        {
          n: "03",
          name: "Visual",
          output: "Preto, branco e Archivo",
          note: "A marca é preta e branca, como o logo, com a fonte Archivo de largura variável, faixas claras e escuras e uma cor de destaque para cada espetáculo.",
        },
        {
          n: "04",
          name: "Venda e movimento",
          output: "Compra e efeitos",
          note: "A compra da Tickett.com abre numa janela com o visual da Station One. Os efeitos são o baralho de cartas, o painel de datas, a fila de cartazes, o manifesto e a página 404.",
        },
        {
          n: "05",
          name: "Prévia",
          output: "Primeiro commit em 22/10/2026",
          note: "Uma prévia na Vercel para mostrar ao cliente, com a busca bloqueada e os formulários desligados. A publicação final será em servidor Apache com PHP.",
        },
      ],
      footnote: "Esta base serviu depois de ponto de partida para outros sites do estúdio, como o do Viva o Samba.",
    },
    {
      type: "topics",
      id: "descoberta",
      label: "Descoberta",
      eyebrow: "Descoberta",
      title: "Duas pessoas chegam ao site, com dois pedidos.",
      body: "O site precisa vender bilhetes a quem vai ao concerto e mostrar o que a empresa faz a quem trabalha com espetáculos.",
      items: [
        {
          title: "Quem é a Station One",
          text: "Uma promotora e produtora de espetáculos com sede em Lisboa. Traz concertos de artistas internacionais e os apresenta nas principais salas de Lisboa e do Porto.",
        },
        {
          title: "Dois públicos",
          text: "O fã quer saber a data e comprar o bilhete. O profissional da indústria quer saber o que a empresa faz e como falar com ela. Cada um tem o seu caminho: agenda e compra, de um lado; Parcerias e formulário, do outro.",
        },
        {
          title: "Bilhetes",
          text: "A venda é da Tickett.com. O site mostra o preço a partir de e o estado da venda de cada data, e abre a compra numa janela, sem tirar o visitante da página.",
        },
        {
          title: "Três salas",
          text: "Multiusos de Gondomar, Sagres Campo Pequeno e Super Bock Arena. Cada data traz o endereço do recinto e, quando há, como chegar de metrô.",
        },
        {
          title: "Dois idiomas",
          text: "Português de Portugal na raiz do endereço e inglês em /en. Cada página leva ao mesmo destino no outro idioma.",
        },
        {
          title: "Um registro só",
          text: "Os espetáculos e as datas vivem num único registro. Quando uma data passa, ela vai sozinha para o arquivo de concertos realizados.",
        },
      ],
    },
    {
      type: "identity",
      id: "identidade",
      label: "Identidade",
      eyebrow: "Identidade visual",
      title: "Preto, branco e neutros frios.",
      swatches: [
        { name: "Papel", hex: "#ffffff", role: "Fundo da página" },
        { name: "Cinza claro", hex: "#f1f2f4", role: "Faixas alternadas e cartões" },
        { name: "Linha", hex: "#d9dbdf", role: "Divisórias" },
        { name: "Cinza", hex: "#5e6168", role: "Texto de apoio" },
        { name: "Tinta", hex: "#0b0c0e", role: "Texto, botões e faixas escuras" },
        { name: "Verde", hex: "#0b7a3e", role: "Bilhetes à venda" },
        { name: "Âmbar", hex: "#a85600", role: "Últimos bilhetes" },
        { name: "Vermelho", hex: "#b3121c", role: "Esgotado ou cancelado" },
      ],
      fonts: [
        {
          name: "Archivo · ExtraBold, larga",
          role: "Títulos",
          sample: "Os grandes concertos",
          weight: 800,
          wide: true,
          size: "xl",
          note: "Títulos em peso 800 e largura de 120 a 125%. Um único arquivo de fonte variável serve aos títulos e ao texto, com uma fonte de reserva de métricas parecidas para o texto não saltar quando ela chega.",
        },
        {
          name: "Archivo · Regular a SemiBold",
          role: "Texto e interface",
          sample: "Sagres Campo Pequeno · portas 20:00",
          weight: 500,
          size: "md",
          note: "Texto de 17 a 19 px. Os rótulos pequenos têm 13 px, ficam em maiúsculas, levam espaço entre as letras e usam uma largura um pouco maior.",
        },
      ],
    },
    {
      type: "topics",
      id: "sistema",
      label: "Sistema",
      eyebrow: "Sistema visual",
      title: "Poucas regras, usadas em todo o site.",
      body: "O CSS é organizado em primitivas: medidas de espaço, receitas de texto, faixas e cores que mudam por espetáculo.",
      items: [
        {
          title: "Quatro medidas de espaço",
          text: "Do cabeçalho ao conteúdo, de um título ao seu conteúdo, entre partes de uma seção e entre blocos: quatro medidas regem todo o espaço vertical, e nenhuma seção usa um número solto.",
        },
        {
          title: "Faixas claras e escuras",
          text: "As faixas claras alternam entre branco e cinza claro só por CSS, sem classe no HTML. As faixas escuras, como o manifesto, trocam as variáveis de cor e ficam pretas.",
        },
        {
          title: "Uma cor por espetáculo",
          text: "Cada espetáculo tem a sua cor de destaque (vermelho, azul e vermelho-escuro). Ela vem dos dados, vira uma classe gerada e veste a página daquele espetáculo.",
        },
        {
          title: "Estado da venda",
          text: "O ponto nas cartas e nas linhas mostra só o estado da venda: verde à venda, âmbar últimos bilhetes, vermelho esgotado ou cancelado, cinza em breve ou adiado. A cor do artista não entra, para não parecer fechado.",
        },
        {
          title: "Receitas de texto",
          text: "Os tamanhos de título, subtítulo, texto e rótulo são receitas prontas. Os componentes não repetem tamanho, peso nem espaço.",
        },
        {
          title: "CSS sem estilo solto",
          text: "Nenhuma página escreve estilo na própria tag. O que vem dos dados vira classe gerada, e só o movimento em tempo real escreve estilos pelo JavaScript.",
        },
      ],
    },
    {
      type: "topics",
      id: "estrutura-home",
      label: "Estrutura",
      eyebrow: "Estrutura da página inicial",
      title: "Da próxima data à conversa com a produção.",
      body: "Seis blocos, na ordem em que o visitante os encontra ao rolar.",
      items: [
        {
          title: "Cabeçalho",
          text: "O logo, sete destinos (Agenda, Arquivo, Sobre, Parcerias, Imprensa, Contactos e Ajuda), o globo de idioma e o botão Bilhetes. Fica fixo no topo.",
        },
        {
          title: "Primeira tela",
          text: "O título em três linhas, os botões Ver agenda e Falar com a produção e o baralho de cartas com a próxima data de cada espetáculo.",
        },
        {
          title: "Partidas",
          text: "A agenda: até 8 datas, cada uma com dia, espetáculo, cidade e recinto, horário, estado da venda, preço e botão de compra.",
        },
        {
          title: "Em cartaz",
          text: "Uma fila com o cartaz de cada espetáculo, datas, cidades, estado e preço, e um último cartão: Novas datas a caminho, com o botão Avisem-me.",
        },
        {
          title: "A Station One",
          text: "Uma faixa preta com uma frase da empresa, quatro números (espetáculos, datas, recintos e temporada) e o link para a página Sobre.",
        },
        {
          title: "Indústria, parceiros e novidades",
          text: "Quatro serviços numerados ao lado de uma foto, uma faixa com os recintos e parceiros que corre sem parar, o cadastro de novidades e o rodapé.",
        },
      ],
    },
    {
      type: "topics",
      id: "estrutura-paginas",
      label: "Outras páginas",
      eyebrow: "Estrutura das outras páginas",
      title: "Cada página responde a uma pergunta.",
      body: "As páginas que o visitante abre depois da inicial, nos dois idiomas.",
      items: [
        {
          title: "Agenda e arquivo",
          text: "Todas as datas por vir, com filtro por cidade (Todas, Porto e Lisboa). Os concertos que já passaram vão sozinhos para o arquivo.",
        },
        {
          title: "Espetáculo",
          text: "Cartaz, datas, portas, início, recinto com como chegar, preço e idade; botão de compra, calendário, mapa e perguntas frequentes. Uma barra de bilhetes fixa aparece quando o botão do topo sai da tela.",
        },
        {
          title: "Sobre",
          text: "Quem é a empresa, um vídeo com momentos dos concertos e uma tabela “Em resumo” com os fatos, como atividade, onde atua, recintos e artistas em agenda.",
        },
        {
          title: "Parcerias",
          text: "Para a indústria: quatro serviços (promoção, produção executiva, bilhética e comunicação, patrocínios) e um botão que abre o formulário já com o assunto Parcerias.",
        },
        {
          title: "Imprensa e contactos",
          text: "Texto de apresentação e cartazes para baixar, por espetáculo. O formulário tem assunto, mensagem e consentimento, com uma lista de opções desenhada para o site.",
        },
        {
          title: "Ajuda, legais e 404",
          text: "Perguntas frequentes com busca, privacidade, termos e cookies, e uma página de erro em forma de bilhete.",
        },
      ],
    },
    {
      type: "anatomy",
      id: "anatomia",
      label: "Primeira tela",
      eyebrow: "A primeira tela",
      title: "Cada elemento da primeira tela tem um motivo.",
      // gravação do início com o baralho passando; os pins (medidos no DOM a 1280×800) apontam para o que não se mexe
      media: desktop("hero-top-desktop", "Primeira tela do site: o título, os botões e o baralho de cartas passando"),
      pins: [
        {
          x: 7.5,
          y: 4.7,
          r: 6,
          title: "O logo leva ao início",
          why: "Em qualquer página, o logo volta à página inicial, e leitores de tela ouvem “Station One, página inicial”.",
        },
        {
          x: 46.5,
          y: 4.7,
          r: 24,
          title: "Sete destinos, sempre à vista",
          why: "Agenda, Arquivo, Sobre, Parcerias, Imprensa, Contactos e Ajuda. O cabeçalho fica fixo e só ganha uma linha por baixo quando a página sai do topo. À direita, o globo troca o idioma e o botão Bilhetes leva à agenda.",
        },
        {
          x: 24,
          y: 46.3,
          r: 22,
          title: "O que a empresa faz, em três linhas",
          why: "“Os grandes concertos estão aqui.” em Archivo extralarga e peso 800, com o nome da empresa numa etiqueta pequena logo acima e uma frase de apoio logo abaixo.",
        },
        {
          x: 22.9,
          y: 80.6,
          r: 14,
          title: "Um botão para cada público",
          why: "Ver agenda, o botão cheio, é para o fã e leva às datas. Falar com a produção, o de contorno, é para a indústria e leva à página Parcerias.",
        },
        {
          x: 79.4,
          y: 54.7,
          r: 22,
          title: "O baralho de cartas",
          why: "A carta da frente é a próxima data de um espetáculo: cartaz, “Próxima estação: cidade”, data, local, botão de compra e preço. Atrás, as cartas dos outros espetáculos espreitam, inclinadas.",
        },
        {
          x: 79.4,
          y: 91.4,
          r: 16,
          title: "Controles do baralho",
          why: "Setas para a carta anterior e a seguinte, o contador (1 / 3) e o botão de pausa, com um anel que enche no ritmo da troca.",
        },
      ],
    },
    {
      type: "feature",
      id: "baralho",
      label: "Baralho",
      eyebrow: "Primeira tela · baralho de cartas",
      title: "Um baralho que passa sozinho e pausa.",
      body: "O baralho mostra a próxima data de cada espetáculo. A carta da frente sai girando para a direita e volta para o fim; as outras avançam. A troca é automática, mas para quando o mouse ou o foco estão em cima, com o botão de pausa, e também há setas e deslize com o dedo.",
      media: desktop("hero-desktop", "Gravação do baralho: as cartas passam sozinhas, o mouse as pausa e as setas e o botão de pausa são usados"),
      mediaKind: "desktop",
      side: "left",
      specs: [
        { k: "Troca", v: "a cada 6,5 s; a carta que sai gira 16° e voa em 0,55 s, e as outras avançam em 0,8 s" },
        { k: "Pilha", v: "as cartas de trás ficam menores e inclinadas (2,6° e −3°), com o topo à mostra" },
        { k: "Anel", v: "o contorno do botão de pausa enche no ritmo da troca e guarda o tempo que falta durante as pausas" },
        { k: "Para quando", v: "mouse ou foco por cima, botão de pausa, baralho fora da tela, aba em segundo plano ou menos movimento" },
        { k: "Controle", v: "setas do teclado e deslize de mais de 48 px; a carta da frente é a única que recebe cliques e foco" },
        { k: "Gravação", v: "feita com a data simulada de 1º de outubro de 2026, quando os 3 espetáculos estavam em cartaz" },
      ],
      decision: {
        title: "As cartas de trás esperam a página carregar",
        text: "O cartaz da frente e o texto da primeira tela chegam primeiro. As imagens das outras cartas só são pedidas depois do carregamento da página, para não competir com o que o visitante vê. O grão do vidro das cartas é uma imagem pronta, porque um filtro desenhado na hora custava cerca de 1,3 s no tempo de carregamento.",
      },
    },
    {
      type: "feature",
      id: "agenda",
      label: "Agenda",
      eyebrow: "Agenda · painel de partidas",
      title: "Datas que giram e um cartaz que segue o mouse.",
      body: "A agenda lista as próximas datas como um painel de partidas. Ao chegar nela, as linhas sobem em sequência e as letras e os números das datas giram até o valor certo. Com o mouse sobre uma linha, o cartaz do espetáculo acompanha o cursor.",
      media: desktop("agenda-desktop", "Gravação da agenda: as linhas entram, as datas giram e o cartaz do espetáculo segue o mouse"),
      mediaKind: "desktop",
      side: "right",
      specs: [
        { k: "Entrada das linhas", v: "sobem 28 px e aparecem em 0,8 s, uma a cada 0,07 s" },
        { k: "Data que vira", v: "cada caractere troca de símbolo por 0,26 s e se fixa 0,055 s depois do anterior" },
        { k: "Cartaz", v: "segue o cursor com atraso de 0,5 s; só no computador, com mouse" },
        { k: "Estado da venda", v: "ponto verde, âmbar, vermelho ou cinza, conforme a venda" },
        { k: "Preço", v: "vem da Tickett.com e fica guardado por um tempo; a atualização nunca acontece enquanto o visitante espera" },
        { k: "Leitores de tela", v: "leem a data fixa, não a que está girando" },
      ],
      decision: {
        title: "Uma só fonte de dados",
        text: "A agenda, o baralho, a fila de cartazes e os números da temporada saem do mesmo registro de espetáculos e datas. Nada é editado duas vezes, e quando uma data passa ela sai sozinha da agenda.",
      },
    },
    {
      type: "feature",
      id: "cartazes",
      label: "Cartazes",
      eyebrow: "Em cartaz · fila de cartazes",
      title: "Uma fila de cartazes que anda com a rolagem.",
      body: "Em telas grandes, a seção Espetáculos fica parada na tela e a rolagem vertical empurra a fila de cartazes para o lado, até aparecer o último cartão (Novas datas a caminho). Cada cartaz mostra datas, espetáculo, cidades, estado e preço.",
      media: desktopHd("cartazes-hd", "Gravação a 1440 × 900: ao rolar, a seção fica parada e a fila de cartazes anda para o lado"),
      mediaKind: "desktop",
      side: "left",
      specs: [
        { k: "Movimento", v: "a fila anda só o que falta para mostrar tudo (cerca de 325 px a 1440 × 900), com um atraso suave de 0,6 s" },
        { k: "Quando existe", v: "em telas de 1024 px ou mais, e só se os cartazes não cabem; senão a fila fica parada" },
        { k: "Teclado", v: "com Tab, o cartaz com foco vem para dentro da tela" },
        { k: "Sem o efeito", v: "a fila rola de lado com o dedo ou o mouse, e também recebe foco no teclado" },
        { k: "Cartaz", v: "no formato 4:5, sem corte, porque o cartaz tem texto" },
        { k: "Último cartão", v: "Novas datas a caminho, com o botão Avisem-me, que leva ao cadastro de novidades" },
      ],
      decision: {
        title: "A rolagem que o visitante já usa vira o movimento",
        text: "A seção fica parada e a rolagem vertical, que todo mundo já usa, empurra a fila para o lado. Ninguém precisa descobrir uma barra de rolagem horizontal. A 1280 × 800 o deslocamento é pequeno (cerca de 145 px), porque os cartazes quase cabem.",
      },
    },
    {
      type: "feature",
      id: "manifesto",
      label: "Manifesto",
      eyebrow: "A Station One · faixa preta",
      title: "Palavras que se acendem e números que contam.",
      body: "Depois dos cartazes, uma faixa preta traz a frase da empresa. Conforme o visitante rola, as palavras ganham tinta, uma a uma. Embaixo, quatro números (espetáculos, datas, recintos e temporada) contam de zero até o valor.",
      media: desktop("manifesto-desktop", "Gravação do manifesto: as palavras se acendem ao rolar e os números chegam ao valor"),
      mediaKind: "desktop",
      side: "right",
      specs: [
        { k: "Texto", v: "as palavras partem de 42% de opacidade e chegam a 100% ao longo da rolagem, 0,06 s uma da outra" },
        { k: "Números", v: "contam de zero em 1,4 s, quando chegam a 90% da altura da tela" },
        { k: "Origem", v: "os números saem do mesmo registro dos espetáculos; a temporada aparece como 2026/27" },
        { k: "Leitores de tela", v: "leem uma cópia fixa da frase, não as palavras que estão acendendo" },
        { k: "Faixa", v: "preta, com as cores trocadas por variáveis; é a única faixa escura da página, além do rodapé" },
        { k: "Menos movimento", v: "a frase já aparece inteira e os números já mostram o valor final" },
      ],
      decision: {
        title: "O texto nunca fica ilegível",
        text: "As palavras partem de 42% de opacidade, e não de zero. Mesmo antes de se acenderem, o texto continua legível, com contraste suficiente, e quem passa rápido ainda lê a frase.",
      },
    },
    {
      type: "feature",
      id: "compra",
      label: "Compra",
      eyebrow: "Compra de bilhetes",
      title: "Uma compra com mapa de lugares.",
      body: "O botão de comprar abre uma janela com três passos: Bilhetes, Os seus dados e Pagamento. Quem vende é a Tickett.com; o site troca o visual e os textos. Nos shows com mapa de setores, como o The Calling, o mapa aparece à esquerda, com nome, preço e lote ao passar o mouse, e o carrinho fica à direita.",
      media: desktop("compra-desktop", "Gravação da janela de compra: o mapa de setores mostra o preço de cada setor, um setor é aberto e a janela fecha no X"),
      mediaKind: "desktop",
      side: "left",
      specs: [
        { k: "Passos", v: "Bilhetes, Os seus dados e Pagamento, com o passo atual marcado e o crédito da Tickett.com" },
        { k: "Mapa", v: "ao passar o mouse, cada setor mostra nome, preço e lote; ao clicar, os bilhetes do setor aparecem ao lado" },
        { k: "Textos", v: "português de Portugal e inglês completos, no lugar do português do Brasil e de textos sem tradução do sistema original" },
        { k: "Janela", v: "tela cheia, com o foco preso dentro dela; Esc, o X e o botão voltar do navegador fecham" },
        { k: "Privacidade", v: "o pixel de anúncios, o tradutor automático e a medição de terceiros do sistema original são removidos" },
        { k: "Sem JavaScript", v: "o botão é um link normal para a página do evento na Tickett.com" },
      ],
      decision: {
        title: "O mapa tem a altura que sobra",
        text: "O mapa de lugares do sistema original mede a própria altura pensando no desenho dele. Aqui, o visual da Station One fixa a geometria por CSS: o mapa ocupa exatamente a altura que sobra ao lado do carrinho, e os controles do mapa de setores ficam escondidos enquanto o visor de lugares está aberto.",
      },
    },
    {
      type: "feature",
      id: "sobre",
      label: "Vídeo",
      eyebrow: "Página Sobre · vídeo",
      title: "Um vídeo que repete sem corte.",
      body: "A página Sobre mostra um vídeo ao lado do título, com momentos dos concertos e o logo da Station One no começo e no fim. O último quadro liga com o primeiro, por isso ele repete sem pulo. Há um botão de pausa, e o vídeo não faz barulho.",
      media: desktop("sobre-desktop", "Gravação da página Sobre: o vídeo toca ao lado do título e a tabela Em resumo aparece ao rolar"),
      mediaKind: "desktop",
      side: "right",
      specs: [
        { k: "Vídeo", v: "sem som, em duas versões: H.264 (3,0 MB) e AV1 (2,1 MB, um terço mais leve) para os navegadores que a reproduzem" },
        { k: "Antes do vídeo", v: "a moldura mostra uma imagem, o primeiro quadro; o vídeo entra por cima quando começa" },
        { k: "Carga", v: "só é pedido depois da página carregar e com a moldura à vista; para fora da tela" },
        { k: "Menos movimento", v: "com a opção ligada ou com economia de dados, fica só a imagem e o botão põe o vídeo a andar" },
        { k: "Em resumo", v: "uma tabela de fatos: nome, atividade, onde atua, recintos, artistas em agenda e bilhética" },
        { k: "Botão", v: "Pausar o vídeo e Reproduzir o vídeo, com nome para leitores de tela" },
      ],
      decision: {
        title: "Um programa monta o vídeo",
        text: "O vídeo não foi editado à mão. Um programa do projeto corta os planos escolhidos de vídeos dos shows (a lista fica no topo do programa), desenha o logo quadro a quadro no Chrome e junta tudo. Para trocar um plano, basta mudar a lista e rodar o programa de novo.",
      },
    },
    {
      type: "feature",
      id: "erro",
      label: "404",
      eyebrow: "Página de erro",
      title: "Uma página de erro em forma de bilhete.",
      body: "Quem erra o endereço vê Não está na lista: um palco escuro, com luzes, e um bilhete de brincadeira para “A Página Fantasma”. O número 404 gira como um conta-quilômetros, um carimbo cai com “Não válido”, o bilhete se inclina para o mouse e uma luz segue o cursor.",
      media: desktop("404-desktop", "Gravação da página 404: o número gira, o carimbo cai, o bilhete se inclina com o mouse e as pistas aparecem ao rolar"),
      mediaKind: "desktop",
      side: "left",
      specs: [
        { k: "Número", v: "cada dígito gira por 1,1 s mais 0,45 s por posição, começando em 0,3 s" },
        { k: "Carimbo", v: "cai aos 2,3 s, em 0,7 s, e o bilhete dá um tranco aos 2,45 s" },
        { k: "Mouse", v: "a luz segue o cursor com atraso suave, e o bilhete se inclina até 14° e 10°" },
        { k: "Fita", v: "uma faixa inclinada com frases de passagem de som corre em ciclos de 38 s" },
        { k: "Pistas", v: "três cartões (o concerto já passou, uma letra a mais, perdido de verdade) levam ao arquivo, ao início e à ajuda" },
        { k: "Menos movimento", v: "tudo aparece já no estado final, e a página continua respondendo 404" },
      ],
      decision: {
        title: "O erro também leva a uma saída",
        text: "Em vez de um beco sem saída, a página oferece caminhos: ver os próximos concertos, voltar ao início e as três pistas. As próximas datas aparecem logo abaixo. O estado do servidor continua sendo 404.",
      },
    },
    {
      type: "motion",
      id: "movimento",
      label: "Animações",
      eyebrow: "Animações",
      title: "Cada efeito tem uma curva e uma duração.",
      body: "O movimento usa uma biblioteca de animação, mais CSS nas cartas e na página 404. Cada cartão abaixo roda com a duração real do site.",
      tokens: [
        {
          name: "Carta do baralho",
          ease: [0.16, 1, 0.3, 1],
          duration: 0.8,
          usage: "As cartas avançam e se inclinam.",
        },
        {
          name: "Carta que sai",
          ease: [0.5, 0, 0.75, 0.4],
          duration: 0.55,
          usage: "Gira 16° e voa para a direita em 0,55 s.",
        },
        {
          name: "Troca automática",
          ease: [0, 0, 1, 1],
          duration: 6.5,
          usage: "O anel enche em 6,5 s e a carta passa.",
        },
        {
          name: "Títulos",
          ease: [0.16, 1, 0.3, 1],
          duration: 0.9,
          stagger: 0.08,
          usage: "Cada linha do título sobe até o lugar.",
        },
        {
          name: "Linhas da agenda",
          ease: [0.16, 1, 0.3, 1],
          duration: 0.8,
          stagger: 0.07,
          usage: "Sobem 28 px e aparecem.",
        },
        {
          name: "Números do manifesto",
          ease: [0.215, 0.61, 0.355, 1],
          duration: 1.4,
          usage: "Contam de zero até o valor.",
        },
      ],
      notes: [
        "Só movimento e transparência são animados, o que mantém a rolagem leve. O que já aparece ao abrir a página não é animado por JavaScript, para não piscar nem atrasar.",
        "Com a opção de reduzir movimento ligada, nenhuma animação em JavaScript roda: o baralho só avança pelos botões, o vídeo não começa sozinho e a página 404 já aparece no estado final.",
        "A seção fixa dos cartazes e os efeitos de cursor (o cartaz da agenda, a luz da 404 e a rolagem suave) só existem no computador.",
      ],
    },
    {
      type: "topics",
      id: "desenvolvimento",
      label: "Desenvolvimento",
      eyebrow: "Desenvolvimento",
      title: "Como o site foi construído.",
      body: "Um site simples de publicar, sem framework, com o movimento por cima do conteúdo.",
      items: [
        {
          title: "Linguagens",
          text: "PHP puro, HTML, CSS e JavaScript simples. Basta ter PHP 8.1 ou mais, com duas extensões comuns. Só o vídeo da página Sobre pede mais: o programa de vídeo ffmpeg, o Chrome e o Node.",
        },
        {
          title: "Bibliotecas de movimento",
          text: "GSAP (cria as animações), ScrollTrigger (dispara cada animação ao rolar e prende a seção dos cartazes), SplitText (divide o título em linhas e o manifesto em palavras) e Lenis (suaviza a rolagem, só com mouse).",
        },
        {
          title: "Um registro de espetáculos",
          text: "Para acrescentar um espetáculo, basta preencher uma entrada, pôr o cartaz e rodar o build. Agenda, página, baralho, calendário, mapa do site, arquivo para IA e imagem de compartilhamento saem dessa entrada.",
        },
        {
          title: "Preço e compra",
          text: "O preço e o estado de cada data vêm dos dados públicos do evento na Tickett.com, guardados por um tempo e renovados fora do pedido do visitante. A compra passa por uma página intermediária do próprio site, que a veste com a identidade da Station One.",
        },
        {
          title: "Imagens e vídeo",
          text: "6 imagens geradas em AVIF, WebP e JPG, em vários tamanhos, num total de 60 arquivos. O navegador escolhe o melhor. O vídeo do Sobre tem duas versões, e o CSS minificado vai dentro da página.",
        },
        {
          title: "Publicação",
          text: "Uma prévia na Vercel, com PHP 8.3, em modo demonstração: busca bloqueada e formulários desligados. A versão final será num servidor Apache com PHP. O número de versão dos arquivos usa o identificador de cada publicação, para o navegador atualizar.",
        },
      ],
    },
    {
      type: "topics",
      id: "qualidade",
      label: "Qualidade",
      eyebrow: "Qualidade",
      title: "O que foi verificado, e o que não foi.",
      body: "O projeto não tem testes automáticos. As conferências foram feitas olhando o site, e o README registra o que foi testado.",
      items: [
        {
          title: "Sem testes automáticos",
          text: "Não há testes automáticos nem teste de varredura das páginas. O mapa de setores foi conferido em computador e celular, só abrindo setores e o visor, sem escolher lugares.",
        },
        {
          title: "Acessibilidade no código",
          text: "O baralho é um carrossel nomeado, com as cartas de trás desativadas para o teclado e as setas do teclado funcionando. Datas animadas e o manifesto têm cópia fixa para leitores de tela. Janelas prendem o foco, e Esc fecha. Alvos de toque de 44 px.",
        },
        {
          title: "Desempenho",
          text: "O cartaz da frente é pré-carregado com prioridade e as cartas de trás esperam a página carregar. A rolagem suave nem é baixada no toque, e o vídeo só carrega com a moldura à vista.",
        },
        {
          title: "Buscadores e IA",
          text: "Mapa do site, dados de cada evento (data, local e preço), indicação de português e inglês, imagem de compartilhamento de 1200 × 630 e um arquivo de texto para assistentes de IA com os fatos e as próximas datas.",
        },
        {
          title: "Formulários",
          text: "Validação sem sair da página, um campo escondido contra robôs, caixa de consentimento e lista de opções desenhada para o site. No modo demonstração, os envios são recusados com um aviso.",
        },
        {
          title: "Versão de demonstração",
          text: "A prévia na Vercel pede aos buscadores para não indexar e desliga os formulários de contato e de novidades. As páginas legais mostram um aviso de rascunho até os dados da empresa serem preenchidos.",
        },
      ],
    },
    {
      type: "responsive",
      id: "responsivo",
      label: "Celular",
      eyebrow: "Celular",
      title: "No celular, o baralho fica embaixo do texto.",
      body: "O layout é pensado primeiro para o celular. O cabeçalho vira o botão Bilhetes e um menu de tela cheia, e o baralho de cartas passa por deslize ou pelas setas.",
      desktop: desktop("hero-desktop", "Primeira tela no computador"),
      mobile: mobile("hero-mobile", "Primeira tela no celular, com o menu em tela cheia e o baralho passando"),
      notes: [
        { k: "Ponto de virada", v: "a partir de 768 px o início tem duas colunas; abaixo, o baralho fica embaixo do texto" },
        { k: "Cabeçalho", v: "abaixo de 1024 px, o menu vira um botão que abre uma tela cheia, com os dois idiomas e o Instagram" },
        { k: "Baralho", v: "passa com o dedo (mais de 48 px) ou pelas setas, e a carta da frente é a única que recebe toque" },
        { k: "Cartazes", v: "sem a seção fixa: a fila rola de lado com o dedo" },
        { k: "Texto", v: "tamanhos que se ajustam à tela, com mínimo legível: de 17 a 19 px" },
        { k: "Toque", v: "o cartaz que segue o mouse e a luz da 404 não existem; toda área clicável tem pelo menos 44 px" },
      ],
    },
    {
      type: "cta",
      id: "projeto-real",
      label: "Ver projeto",
      title: "Agora veja o site de verdade.",
      body: "Abra a página inicial, deixe o baralho passar, role até a fila de cartazes e erre o endereço de propósito para ver a página 404.",
      button: "Ver projeto real",
      note: "Abre em uma nova aba",
    },
  ],
};
