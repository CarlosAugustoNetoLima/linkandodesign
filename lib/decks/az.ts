import type { Deck, Media } from "./types";

// Dossiê do deck do AZ Car Rental. O link principal é a página do guia; o cotizador, a frota
// e a busca vêm da home e do cotizador do mesmo projeto. Cada fato foi conferido em
// /Users/carloslima/azcarental ou no site no ar. Figma entra porque há prova: a lista de
// páginas do guia guarda os ids de nós do Figma (31 páginas, PT e ES). O texto é para o
// público: simples, sem nome de arquivo, sem metáfora e sem termo técnico além do nome das
// linguagens. Não citar: valores de tabela, imposto, taxa e pedágio, mecânica de promoção,
// WhatsApp, IDs de medição, nomes de pessoas da prova social, e-mail e repositório do dono.
// Não chamar de "reais" as fotos do PDF (parecem geradas por IA).
const BASE = "/decks/az";

const desktop = (name: string, alt: string): Media => ({
  src: `${BASE}/${name}.mp4`,
  poster: `${BASE}/${name}.jpg`,
  width: 1280,
  height: 800,
  alt,
});

// gravada numa tela de 1920 px (mesma proporção 16:10, codificada em 1600 px)
const wide = (name: string, alt: string): Media => ({
  src: `${BASE}/${name}.mp4`,
  poster: `${BASE}/${name}.jpg`,
  width: 1600,
  height: 1000,
  alt,
});

const mobile = (name: string, alt: string): Media => ({
  src: `${BASE}/${name}.mp4`,
  poster: `${BASE}/${name}.jpg`,
  width: 520,
  height: 1126,
  alt,
});

export const az: Deck = {
  slug: "az-car-rental",
  index: 4,
  name: "AZ Car Rental",
  client: "AZ Car Rental",
  year: 2026,
  sector: "Locadora de veículos · guia gratuito e cotação",
  location: "Flórida (EUA)",
  flags: ["🇺🇸"],
  tagline: "Um guia gratuito e uma cotação que cabe num link.",
  liveUrl: "https://azcarental-linkando.vercel.app/guia",
  extraLinks: [
    {
      label: "Abrir o cotizador",
      url: "https://azcarental-linkando.vercel.app/cotizador",
      note: "A cotação que cabe num link",
    },
    {
      label: "Ver a home e a frota",
      url: "https://azcarental-linkando.vercel.app/",
      note: "A frota em loop e a busca do site",
    },
  ],
  stack: ["HTML", "CSS", "JavaScript", "Python"],
  theme: {
    // o vermelho escuro do site, que tem contraste sobre o papel
    accent: "#c01840",
    accentInk: "#ffffff",
    fontKey: "interTight",
    displayWeight: 700,
    displayTracking: "-0.04em",
    displayUppercase: false,
    radius: "1rem",
    coverWeight: 700,
  },
  cover: desktop("pointer-desktop", "Início do guia: um SUV preto, a capa do guia e três cartões que seguem o mouse"),
  summary:
    "Página de um guia gratuito para quem vai dirigir na Flórida, com início que segue o mouse, formulário que orienta o erro e um cotizador que guarda a cotação no link.",
  seo: {
    title: "AZ Car Rental — Apresentação | Linkando Design",
    description:
      "Como foi feito o site da AZ Car Rental: descoberta, identidade visual, estrutura, efeitos, cotizador, guia em PDF montado a partir do Figma, desenvolvimento e testes.",
  },
  chapters: [
    {
      type: "cover",
      id: "capa",
      label: "Capa",
      kicker: "04 — Portfólio 2026 · Locadora · Flórida",
      title: "AZ Car\nRental",
      subtitle:
        "Página de um guia gratuito para quem vai dirigir na Flórida pela primeira vez, mais um cotizador que guarda a cotação no link.",
      chips: ["HTML", "CSS", "JavaScript", "Python"],
      credit: "Linkando Design · 2026 · design e desenvolvimento com IA e Figma",
      backdrop: desktop("pointer-desktop", "O início do guia com o carro, os cartões e a capa seguindo o mouse"),
    },
    {
      type: "statement",
      id: "resumo",
      label: "Resumo",
      eyebrow: "O projeto",
      text: "A AZ aluga carros na Flórida, em português e pelo WhatsApp. O site tem duas missões: tirar a dúvida de dirigir nos Estados Unidos com um guia gratuito e transformar a pergunta de preço numa cotação que cabe num link.",
      emphasis: ["guia", "cotação", "link"],
      stats: [
        { value: 22, label: "categorias de carro no cotizador, do econômico ao Escalade" },
        { value: 31, label: "páginas no guia em PDF, montadas a partir do Figma" },
        { value: 3, label: "idiomas no site: português, espanhol e inglês" },
      ],
    },
    {
      type: "process",
      id: "etapas",
      label: "Etapas",
      eyebrow: "Como foi feito",
      title: "Do Figma ao PDF, e do site ao cliente.",
      body: "O guia em PDF e o site nasceram ligados: o Figma alimenta um programa, o programa gera o PDF e a página do guia reúne o formulário e o download. No fim, o site é do dono.",
      steps: [
        {
          n: "01",
          name: "Figma",
          output: "31 páginas em PT e ES",
          note: "O guia nasce no Figma, página a página, com espaços de foto que dizem o que fotografar.",
        },
        {
          n: "02",
          name: "Lista de páginas",
          output: "Posições e textos",
          note: "O Figma vira uma lista: cada página guarda a identificação do desenho, a posição e o texto de cada espaço de foto.",
        },
        {
          n: "03",
          name: "Montagem",
          output: "PDF de revisão por idioma",
          note: "Um programa em Python encaixa as fotos nos espaços, com foco e cantos arredondados, desenha o mapa da Flórida por código e gera um PDF em português e outro em espanhol.",
        },
        {
          n: "04",
          name: "Site",
          output: "Página com formulário",
          note: "A página do guia reúne o formulário, a página de obrigado com o link do PDF e os eventos de download.",
        },
        {
          n: "05",
          name: "Cliente",
          output: "Site nas mãos do dono",
          note: "O dono edita preço, texto e foto pelo GitHub, e a Vercel publica em cerca de um minuto.",
        },
      ],
      footnote: "O site é HTML puro de propósito: sem painel de edição e sem etapa de montagem. A diária de todos os cartões vem de uma única tabela.",
    },
    {
      type: "topics",
      id: "descoberta",
      label: "Descoberta",
      eyebrow: "Descoberta",
      title: "Entender quem dirige na Flórida.",
      body: "O que o próprio site e o material do projeto mostram sobre o ponto de partida.",
      items: [
        {
          title: "Quem é o cliente",
          text: "Uma locadora de carros na Flórida que atende em português e pelo WhatsApp. A home promete que o preço não muda depois que o cliente pousa.",
        },
        {
          title: "As duas missões",
          text: "Primeiro, tirar a dúvida de quem vai dirigir nos Estados Unidos, com um guia gratuito. Segundo, transformar a pergunta de preço numa cotação que cabe num link.",
        },
        {
          title: "Para quem",
          text: "Brasileiros e latino-americanos que dirigem nos EUA, muitos pela primeira vez. O guia existe em português e espanhol, e o formulário em espanhol pergunta o país do visitante.",
        },
        {
          title: "As dúvidas mais comuns",
          text: "O guia reúne as perguntas que mais aparecem antes da viagem, em seis temas: pedágio, CNH, caução, retirada sem balcão, trânsito e seguro.",
        },
        {
          title: "A cotação antes da conversa",
          text: "O cotizador mostra o total na hora, com 22 categorias de carro e 4 aeroportos de retirada, e leva a cotação pronta para o WhatsApp.",
        },
        {
          title: "O dono edita sozinho",
          text: "Texto e preço mudam pelo GitHub: o dono confirma a mudança e a Vercel publica em cerca de um minuto. Categoria nova, layout e fotos são pedidos ao estúdio.",
        },
      ],
    },
    {
      type: "identity",
      id: "identidade",
      label: "Identidade",
      eyebrow: "Identidade visual",
      title: "Grafite, um vermelho e muito branco.",
      swatches: [
        { name: "Grafite", hex: "#272c32", role: "Blocos escuros e texto" },
        { name: "Red", hex: "#da1e48", role: "Botões e destaques da frase" },
        { name: "Red deep", hex: "#c01840", role: "Destaque ao passar o mouse e texto vermelho" },
        { name: "Red tint", hex: "#fbe8ed", role: "Fundo de ícones e selos" },
        { name: "Gray 05", hex: "#f4f4f5", role: "Campos e cartões" },
        { name: "White", hex: "#ffffff", role: "A página inteira" },
      ],
      fonts: [
        {
          name: "Inter Tight · Light",
          role: "Primeira parte do título",
          sample: "Primeira vez nos EUA?",
          weight: 300,
          tracking: "-0.035em",
          size: "xl",
          note: "A pergunta fala baixo: peso leve, cor cinza e letras um pouco mais juntas.",
        },
        {
          name: "Inter Tight · Bold",
          role: "Segunda parte do título",
          sample: "Saiba o que ninguém conta",
          weight: 700,
          tracking: "-0.04em",
          size: "lg",
          note: "A resposta fala alto: peso forte, entrelinha apertada e o final da frase em vermelho.",
        },
        {
          name: "Inter Tight · Regular",
          role: "Texto corrido",
          sample: "Pedágio, documento, caução e distância.",
          weight: 400,
          size: "md",
          note: "Se a Inter Tight demorar a chegar, uma fonte reserva com ajuste de tamanho evita que o texto pule de lugar.",
        },
      ],
    },
    {
      type: "topics",
      id: "sistema",
      label: "Sistema",
      eyebrow: "Sistema de design",
      title: "As regras que o site repete em cada página.",
      body: "O site foi feito página a página, com a mesma base de cores, as mesmas letras e algumas peças que se repetem.",
      items: [
        {
          title: "A base de cores",
          text: "Grafite (#272c32) e um grafite mais escuro (#1e2227) para os blocos escuros. Vermelho (#da1e48) para botões e destaques e um vermelho mais fechado (#c01840) para quando o mouse passa. Fundo em cinza bem claro (#f6f6f6), linhas em #e5e7eb e texto de apoio em #6b7280.",
        },
        {
          title: "Cores por assunto",
          text: "A página de cada aeroporto ganha um verde-azulado (#0e7c86) para o que é água e natureza, com fundo suave (#e6f4f4). Os avisos usam um rosa claro (#fdf0f3) com texto vinho (#a31237), e há um verde de confirmação para o que está incluso.",
        },
        {
          title: "O verde da conversa",
          text: "Os botões que abrem a conversa com a AZ usam um verde próprio (#25d366), que também aparece nas marcas de confirmação da comparação de preços. Os demais botões de ação são vermelhos.",
        },
        {
          title: "Duas famílias de letra",
          text: "A home, o cotizador e a página de seguros usam Anton nos títulos e Jost no texto, ambas do Google Fonts. O guia usa Inter Tight, hospedada no próprio site.",
        },
        {
          title: "Peças que se repetem",
          text: "As quatro páginas de aeroporto usam as mesmas peças: etiqueta de tipo (“Como funciona”, “O que fazer”), caixa de destaque com filete vermelho, botões de escolha e um painel que responde ao toque.",
        },
        {
          title: "Cada página guarda o seu estilo",
          text: "Não há um arquivo de estilo compartilhado: as cores e regras ficam dentro de cada página. O vermelho é o mesmo em todas, mas com nomes diferentes de uma página para outra.",
        },
      ],
    },
    {
      type: "topics",
      id: "estrutura-guia",
      label: "Estrutura guia",
      eyebrow: "Estrutura do guia e do cotizador",
      title: "Duas páginas, dois objetivos.",
      body: "A página do guia coleta o contato. O cotizador transforma a dúvida de preço numa conversa.",
      items: [
        {
          title: "Guia · início",
          text: "“Primeira vez nos EUA?” com o formulário já na primeira tela: nome, e-mail e consentimento.",
        },
        {
          title: "Guia · dentro do guia",
          text: "Uma faixa em movimento e a seção “Dentro do guia”, com os seis temas que o PDF responde.",
        },
        {
          title: "Guia · autoria e perguntas",
          text: "“Escrito por quem entrega o carro na vaga do aeroporto”, quatro perguntas frequentes e uma chamada final com um segundo formulário. Depois do envio, a página de obrigado.",
        },
        {
          title: "Cotizador · carro e aeroporto",
          text: "O carro é escolhido num carrossel de 22 miniaturas, e o aeroporto de retirada, entre Orlando, Miami, Fort Lauderdale e Tampa.",
        },
        {
          title: "Cotizador · datas e quantidade",
          text: "Retirada e devolução com hora, nome, e-mail (opcional), quantidade de carros e número de parcelas.",
        },
        {
          title: "Cotizador · resultado",
          text: "O total aparece na hora, com o botão de falar no WhatsApp e a opção de copiar o link da cotação. Abaixo, o que já está incluso, as dúvidas e a prova social.",
        },
      ],
    },
    {
      type: "topics",
      id: "estrutura-home",
      label: "Estrutura home",
      eyebrow: "Estrutura da home",
      title: "A página inicial, do primeiro anúncio à chamada final.",
      body: "Nove blocos, na ordem em que o visitante os encontra ao rolar.",
      items: [
        {
          title: "Início",
          text: "A chamada principal do momento e o botão “Faça sua cotação em 30 segundos”.",
        },
        {
          title: "Frota nova e confiança",
          text: "Uma faixa de frota nova e a barra de confiança: sem surpresas, 100% WhatsApp, retirada rápida, frota premium e melhor preço.",
        },
        {
          title: "Quem já alugou",
          text: "“Eles já rodaram com a gente”, a prova social, e a seção “Patrocinador oficial”.",
        },
        {
          title: "Nossa frota",
          text: "Os cartões de carro correm em loop, com setas, filtro por tipo e um seletor para ir direto a um modelo.",
        },
        {
          title: "Como funciona",
          text: "Quatro passos: manda mensagem, escolhe o carro, confirma e paga, retira e dirige.",
        },
        {
          title: "Por que a AZ e roteiros",
          text: "As razões para escolher a AZ e sugestões de roteiros pela Flórida.",
        },
        {
          title: "Onde estamos",
          text: "A localização da locadora.",
        },
        {
          title: "Depoimentos e perguntas",
          text: "O que dizem os clientes e as perguntas frequentes, que tiram as objeções antes da cotação.",
        },
        {
          title: "Chamada final",
          text: "“Então bora pra Flórida”, o convite de encerramento da página.",
        },
      ],
    },
    {
      type: "topics",
      id: "estrutura-paginas",
      label: "Páginas",
      eyebrow: "Páginas do projeto",
      title: "Do guia à reserva confirmada.",
      body: "Além da home, do guia e do cotizador, o site tem páginas que respondem às dúvidas de cada momento da viagem.",
      items: [
        {
          title: "Guia e obrigado",
          text: "O guia gratuito e a página que confirma o envio existem em português e espanhol. Em inglês não há guia.",
        },
        {
          title: "Dezessete páginas nos três idiomas",
          text: "Home, cotizador, categorias, pagamento, reserva confirmada, os quatro aeroportos, retirada, devolução, seguros, pedágios, acidente, elétricos, privacidade e termos existem em português, espanhol e inglês.",
        },
        {
          title: "Um guia por aeroporto",
          text: "Orlando, Miami, Fort Lauderdale e Tampa têm página própria, com o ponto onde o carro espera, o que fazer na região e as perguntas de quem aluga ali.",
        },
        {
          title: "Retirada e devolução",
          text: "Onde fica o carro, o que levar, onde deixá-lo em cada aeroporto e as 4 horas de cortesia além do horário previsto. Nada de balcão: a retirada é combinada por voo.",
        },
        {
          title: "Seguro, franquia e caução",
          text: "Oito blocos em ordem de dúvida: o que é franquia, o que já vem incluído, como baixá-la, as três opções lado a lado, por que a caução é outra coisa, quando a proteção cai, a regra de o carro não sair da Flórida e o que nenhum plano cobre.",
        },
        {
          title: "Pedágios e acidente",
          text: "Os pedágios mostram as duas opções que a AZ oferece. A página de acidente traz cinco passos em ordem, o que fazer num pneu furado ou numa pane e o que guardar para depois.",
        },
        {
          title: "Carro elétrico",
          text: "Um guia em sete partes para quem vai dirigir um Tesla ou outro elétrico: onde carregar, quanto tempo leva, autonomia real, o que ninguém conta no primeiro dia, piloto automático, outros modelos e a devolução. Fecha com os erros mais comuns.",
        },
        {
          title: "Reserva confirmada",
          text: "Uma página só para quem já reservou, em seis etapas: antes de viajar, no dia da retirada, o que está coberto, durante a viagem, na devolução e se algo mudar. Fica fora dos buscadores.",
        },
        {
          title: "Campanhas e patrocínio",
          text: "Duas páginas de campanha respondem em endereços próprios no domínio da AZ e ficam fora dos buscadores. Há ainda a página do patrocínio do Orlando Pirates e os textos de privacidade e de termos de locação.",
        },
      ],
    },
    {
      type: "anatomy",
      id: "anatomia",
      label: "Primeira tela",
      eyebrow: "A primeira tela do guia",
      title: "Cada elemento da primeira tela tem um motivo.",
      // início parado no topo; pins medidos no DOM a 1280×800
      media: desktop("hero-top-desktop", "Gravação do início do guia, parado no topo, com o formulário logo abaixo"),
      pins: [
        {
          x: 25,
          y: 35,
          r: 20,
          title: "Duas vozes no título",
          why: "A pergunta vem fina e cinza; a resposta, pesada, com o final da frase em vermelho. A hierarquia vem do peso e da cor.",
        },
        {
          x: 71.6,
          y: 17.7,
          r: 11,
          title: "Cartões que antecipam o guia",
          why: "Pedágio sem susto, CNH e documentos e Cartão e caução mostram o conteúdo antes do formulário. Cada um flutua num ritmo próprio e segue o mouse um pouco mais que o carro.",
        },
        {
          x: 62.9,
          y: 46.4,
          r: 14,
          title: "A capa do guia é feita no código",
          why: "A capa do PDF aparece como um objeto feito de HTML e CSS: entra girando e se inclina com o mouse, sem imagem e sem biblioteca 3D.",
        },
        {
          x: 50,
          y: 85,
          r: 22,
          title: "O formulário já está na primeira tela",
          why: "Nome, e-mail e um aceite, logo abaixo do início. Qualquer botão “Receber o guia” rola até ele e deixa o cursor no primeiro campo.",
        },
        {
          x: 89.8,
          y: 5.2,
          r: 11,
          title: "O cabeçalho vira vidro",
          why: "Ele nasce transparente e vira vidro (branco, com fundo desfocado) quando o início sai da tela. O pedido do guia e o seletor de idioma ficam sempre à mão.",
        },
      ],
    },
    {
      type: "feature",
      id: "mouse",
      label: "Mouse",
      eyebrow: "Início · profundidade",
      title: "O carro, os cartões e a capa seguem o mouse.",
      body: "Cada camada do início se move numa velocidade diferente, e a capa vai no sentido contrário, criando profundidade. O carro ainda desce devagar enquanto você rola. Tudo isso só liga com mouse: no toque a cena fica parada.",
      media: desktop("pointer-desktop", "Gravação do início: o mouse varre a cena e o carro, os cartões e a capa se deslocam em profundidades diferentes"),
      mediaKind: "desktop",
      side: "left",
      specs: [
        { k: "Seguir", v: "o carro, cada cartão e a capa acompanham o mouse com um atraso suave de 1,2 s" },
        { k: "Camadas", v: "o carro anda pouco, os cartões andam mais e a capa vai ao contrário, girando levemente" },
        { k: "Cartões", v: "entram um depois do outro e flutuam suavemente, cada um num ritmo diferente" },
        { k: "Capa", v: "sobe girando de -16° até ficar reta, em 1,1 s" },
        { k: "Rolagem", v: "o carro desce 8% da própria altura ao longo do início" },
        { k: "Só com mouse", v: "no toque o efeito não liga e a cena fica parada" },
      ],
      decision: {
        title: "Profundidade sem 3D pesado",
        text: "Três velocidades e uma capa que gira bastam para dar profundidade. Sai barato, não carrega biblioteca 3D e some sozinho em telas de toque.",
      },
    },
    {
      type: "feature",
      id: "formulario",
      label: "Formulário",
      eyebrow: "Formulário",
      title: "Um formulário que orienta o erro.",
      body: "Se algo falta, o campo fica marcado, o formulário treme, a mensagem aparece e o foco vai direto ao primeiro erro. Ao digitar, a marca some. Por baixo, a origem da visita acompanha o cadastro.",
      media: desktop("form-desktop", "Gravação do formulário: clique vazio, erro e tremor, depois campos preenchidos e consentimento marcado"),
      mediaKind: "desktop",
      side: "right",
      specs: [
        { k: "Validação", v: "nome preenchido, e-mail com formato válido e consentimento marcado" },
        { k: "Erro", v: "o campo fica marcado, o formulário treme por 0,5 s e o foco vai ao primeiro campo com erro; a marca some quando a pessoa digita" },
        { k: "Envio", v: "o botão trava com “Enviando…”; se a rede falha, o rótulo volta e a mensagem explica" },
        { k: "Origem", v: "a origem da visita (anúncio, campanha, página) fica guardada e vai junto com o cadastro" },
        { k: "Medição", v: "o envio e cada download são registrados como eventos, para analisar as campanhas" },
        { k: "Obrigado", v: "a página seguinte mostra o e-mail digitado" },
      ],
      decision: {
        title: "Funciona antes de ter destino",
        text: "Sem um destino configurado, o formulário simula o envio (0,7 s) e segue para a página de obrigado. Dá para mostrar e testar a página inteira sem tocar na lista de e-mails.",
      },
    },
    {
      type: "feature",
      id: "cotizador",
      label: "Cotizador",
      eyebrow: "Cotizador",
      title: "A cotação cabe num link.",
      body: "Escolha o carro, o aeroporto e as datas: o valor aparece na hora, calculado no navegador. Cada escolha reescreve o endereço da página, então a cotação pode ser copiada e enviada, e o botão de falar com a AZ já leva a conversa pronta para o WhatsApp.",
      media: desktop("cotizador-desktop", "Gravação do cotizador: troca de carro, de aeroporto e de quantidade, com o total mudando"),
      mediaKind: "desktop",
      side: "left",
      specs: [
        { k: "Cálculo", v: "diárias de 24 h, arredondadas para cima, com mínimo de 3, mais imposto, taxas e pedágio" },
        { k: "Pedágio", v: "cobrado por dia, até um teto, com valores diferentes por aeroporto" },
        { k: "Miami", v: "tem um valor mínimo por carro, e o Econômico fica indisponível ali: o botão se desativa" },
        { k: "Link", v: "carro, aeroporto, datas, horários, quantidade e nome vão para o endereço, sem recarregar a página" },
        { k: "WhatsApp", v: "a mensagem já sai com o carro, as datas e o total" },
        { k: "Limite", v: "22 categorias, do econômico ao Escalade, e até 6 carros por cotação" },
      ],
      decision: {
        title: "Um só lugar para os preços",
        text: "A tabela de diárias vive num único arquivo de dados: mudou ali, mudam os 22 cartões, em português e espanhol, de uma vez. O preço escrito na página é só reserva, caso o arquivo não carregue.",
      },
    },
    {
      type: "feature",
      id: "frota",
      label: "Frota",
      eyebrow: "Home · frota",
      title: "A frota corre em loop.",
      body: "Os cartões de carro correm sozinhos em loop, como a faixa de logos do site. Quem quer controlar usa as setas, o filtro por tipo ou o seletor “Ir para um modelo”.",
      media: desktop("frota-desktop", "Gravação da frota: a faixa corre, as setas e o filtro de SUV funcionam e o seletor de modelo abre"),
      mediaKind: "desktop",
      side: "right",
      specs: [
        { k: "Loop", v: "os cartões são repetidos e deslocados a cada quadro, a mesma lógica da faixa de patrocinadores" },
        { k: "Controle", v: "setas para rolar à mão e um seletor que pula direto para o modelo" },
        { k: "Filtros", v: "Todos, SUV, Minivan, Van e Luxury" },
        { k: "Cartões", v: "288 px de largura, 242 px em telas de até 560 px" },
        { k: "Idiomas", v: "o mesmo código serve português, espanhol e inglês" },
      ],
      decision: {
        title: "O carrossel se instala sozinho",
        text: "O código cria o próprio estilo e só age se achar a grade da frota. Sem ele, a frota continua sendo uma grade normal de cartões.",
      },
    },
    {
      type: "feature",
      id: "busca",
      label: "Busca",
      eyebrow: "Navegação",
      title: "Busca sem servidor e idioma sem página quebrada.",
      body: "A busca funciona no próprio navegador: uma lista de perguntas de clientes, cada uma apontando para a página e o trecho que responde. O seletor de idioma leva à mesma página nas páginas da sua lista e à página inicial do idioma nas demais.",
      media: desktop("busca-desktop", "Gravação da busca aberta com o atalho barra, resultados para pedágio e o seletor de idioma"),
      mediaKind: "desktop",
      side: "left",
      specs: [
        { k: "Atalho", v: "a tecla / ou Ctrl/⌘+K abre a busca; setas, Enter e Esc navegam" },
        { k: "Lista", v: "cada entrada é algo que o cliente pergunta, com a página, o trecho e as palavras-chave" },
        { k: "Bandeiras", v: "desenhadas como imagens, não como emoji: no Windows o emoji de bandeira vira duas letras" },
        { k: "Regra", v: "uma lista no código diz em quais cinco páginas o link leva à mesma página; nas demais, ele leva à página inicial do idioma" },
        { k: "Pedido do cliente", v: "o seletor por bandeiras veio de uma conversa com o dono" },
      ],
      decision: {
        title: "Perguntas, não só palavras",
        text: "A lista é escrita a partir do que o cliente pergunta, com palavras-chave por trás, e leva à página e ao trecho que respondem. Quem não sabe o nome da página chega nela do mesmo jeito.",
      },
    },
    {
      type: "feature",
      id: "menus",
      label: "Menus",
      eyebrow: "Navegação · menus",
      title: "Menus que levam direto ao assunto.",
      body: "Quatro itens do cabeçalho abrem uma lista ao passar o mouse: a frota em quatro colunas, as seis páginas de “Como funciona”, os quatro aeroportos e as perguntas mais comuns. A gravação foi feita numa tela larga, de 1920 px.",
      media: wide("menus-desktop","Gravação do cabeçalho: os menus de categorias, como funciona, locais e perguntas abrindo um a um"),
      mediaKind: "desktop",
      side: "right",
      specs: [
        { k: "Frota", v: "quatro colunas (econômico e sedan, SUV, minivan e van, elétrico e especiais), cada modelo com um carro de exemplo" },
        { k: "Como funciona", v: "retirada, devolução, pagamento, seguro, pedágios e acidente" },
        { k: "Locais", v: "Orlando, Miami, Fort Lauderdale e Tampa, com a sigla de cada aeroporto, e um link para todos" },
        { k: "Perguntas", v: "oito perguntas que levam direto à resposta, já aberta, mais um link para todas" },
        { k: "Como abre", v: "ao passar o mouse ou ao focar pelo teclado, em cerca de 0,16 s" },
        { k: "Idiomas", v: "os mesmos menus existem em português, espanhol e inglês" },
      ],
      decision: {
        title: "Só mostra o que existe",
        text: "Antes de haver versão em espanhol e inglês de “Como funciona” e de “Locais”, esses menus nem apareciam nessas línguas: melhor sem menu do que um menu que leva a um erro. Em telas de até 700 px, o menu largo de carros some.",
      },
    },
    {
      type: "feature",
      id: "perguntas",
      label: "Perguntas",
      eyebrow: "Home · perguntas",
      title: "As perguntas cabem na tela.",
      body: "As 24 perguntas frequentes ficam em 7 temas fechados, cada um com a contagem ao lado, e só o primeiro começa aberto. Um campo de busca no topo abre sozinho os temas que têm resposta.",
      media: desktop("faq-desktop", "Gravação das perguntas: a busca por caução, uma busca sem resultado e os temas abrindo e fechando"),
      mediaKind: "desktop",
      side: "left",
      specs: [
        { k: "Temas", v: "sete temas que abrem e fecham, com a quantidade de perguntas ao lado" },
        { k: "Busca", v: "ignora acentos: digitar “caucao” encontra as perguntas sobre caução" },
        { k: "Contagem", v: "mostra quantas perguntas foram encontradas e esconde os temas sem resposta" },
        { k: "Sem resultado", v: "uma mensagem convida a chamar a AZ para tirar a dúvida" },
        { k: "Limpar", v: "Esc ou o X limpam a busca e os temas voltam como estavam" },
        { k: "Links", v: "um endereço com a pergunta abre o tema, abre a pergunta e rola até ela" },
      ],
      decision: {
        title: "Escolher o tema, não rolar a lista",
        text: "Quem chega escolhe o tema em vez de rolar as 24 perguntas, e a busca atende quem já sabe o que quer perguntar. O mesmo código serve português, espanhol e inglês.",
      },
    },
    {
      type: "feature",
      id: "aeroporto",
      label: "Aeroporto",
      eyebrow: "Orlando · uma página por aeroporto",
      title: "A página do aeroporto responde antes de a pessoa perguntar.",
      body: "Cada aeroporto tem a própria página, escrita como um guia local. A de Orlando diz onde o carro espera, ajuda a escolher o carro pelo passeio, indica restaurantes no caminho das nascentes e conta quanto tempo se dirige até cada destino.",
      media: desktop("orlando-desktop", "Gravação da página de Orlando: a escolha do carro, o alternador de restaurantes e o tempo até cada destino"),
      mediaKind: "desktop",
      side: "right",
      specs: [
        { k: "Onde o carro fica", v: "a vaga é combinada para o voo e chega numa foto com o andar e o número; não há balcão, de propósito" },
        { k: "Que carro", v: "oito carros por tipo de passeio; ao escolher, a foto, o texto e os números de pessoas e malas mudam" },
        { k: "Onde comer", v: "um alternador entre Winter Garden e Mount Dora troca a foto, a descrição e os restaurantes" },
        { k: "Quanto tempo", v: "nove destinos: ao tocar, o painel mostra o tempo de carro, o caminho e uma observação" },
        { k: "Fotos", v: "o crédito e a licença de cada foto ficam no pé da página" },
        { k: "Perguntas", v: "a página termina com as perguntas de quem aluga naquele aeroporto" },
      ],
      decision: {
        title: "O convite fica ao lado da resposta",
        text: "O botão de cotar acompanha cada carro escolhido, em vez de ficar só no fim: a informação vem primeiro e o convite aparece junto dela. As quatro páginas de aeroporto usam as mesmas peças.",
      },
    },
    {
      type: "motion",
      id: "movimento",
      label: "Animações",
      eyebrow: "Animações",
      title: "O movimento chega depois: a página já funciona sem ele.",
      body: "A biblioteca de animação (GSAP) só chega depois do carregamento, em tempo ocioso, e o site já está completo sem ela. Cada cartão abaixo roda com a duração real do site.",
      tokens: [
        {
          name: "Entrada de bloco",
          ease: [0.215, 0.61, 0.355, 1],
          duration: 1,
          usage: "Sobe e aparece, uma única vez, quando o bloco chega a 88% da tela.",
        },
        {
          name: "Grupos em sequência",
          ease: [0.215, 0.61, 0.355, 1],
          duration: 1,
          stagger: 0.1,
          usage: "Os itens de um grupo entram um a um.",
        },
        {
          name: "Seguir o mouse",
          ease: [0.215, 0.61, 0.355, 1],
          duration: 1.2,
          usage: "Carro, cartões e capa acompanham o ponteiro.",
        },
        {
          name: "Cartões que entram",
          ease: [0.22, 1, 0.36, 1],
          duration: 0.9,
          usage: "Surgem crescendo e se deslocando, um depois do outro.",
        },
        {
          name: "Capa que gira",
          ease: [0.22, 1, 0.36, 1],
          duration: 1.1,
          usage: "Sobe girando de -16° até ficar reta.",
        },
        {
          name: "Carro que desce",
          ease: [0, 0, 1, 1],
          duration: 1,
          usage: "Sem curva: a rolagem controla, e o carro desce 8% da altura.",
        },
      ],
      notes: [
        "A biblioteca de animação só carrega depois da página, em tempo ocioso, com limite de 8 s: se falhar, o site continua inteiro.",
        "Sem JavaScript a página já está completa: o movimento é um acréscimo, não uma condição.",
        "O efeito do mouse só liga com ponteiro fino; no toque a cena fica parada.",
      ],
    },
    {
      type: "topics",
      id: "desenvolvimento",
      label: "Desenvolvimento",
      eyebrow: "Desenvolvimento",
      title: "Como o site foi construído.",
      body: "Sem framework e sem etapa de montagem: o site é um conjunto de páginas simples que a Vercel publica direto.",
      items: [
        {
          title: "Linguagens",
          text: "HTML, CSS e JavaScript puros. O guia em PDF é gerado com Python.",
        },
        {
          title: "Bibliotecas e fontes",
          text: "A página do guia usa GSAP para as animações e a fonte Inter Tight, hospedada no próprio site. A home e o cotizador usam fontes do Google (Anton e Jost).",
        },
        {
          title: "O cálculo da cotação",
          text: "Feito no navegador, sem servidor: diárias, imposto, taxas e pedágio por aeroporto. O resultado vira o endereço da página e a mensagem do WhatsApp.",
        },
        {
          title: "Idiomas",
          text: "Páginas separadas em português, espanhol e inglês (o guia existe em português e espanhol). Um seletor de bandeiras leva à mesma página nas cinco páginas da sua lista e à página inicial do idioma nas demais.",
        },
        {
          title: "Preços e edição",
          text: "Uma tabela única de preços alimenta a home, as categorias e o cotizador, nos três idiomas. O dono edita pelo GitHub, sem painel de administração.",
        },
        {
          title: "Publicação e medição",
          text: "Vercel, com publicação automática, cache e cabeçalhos de segurança. Cadastros, downloads e origem das visitas ficam registrados, e as ferramentas de medição só carregam depois de uma interação ou de 3,5 s.",
        },
      ],
    },
    {
      type: "topics",
      id: "qualidade",
      label: "Qualidade",
      eyebrow: "Qualidade",
      title: "O que foi verificado, e o que não foi.",
      body: "O projeto não tem testes automáticos: as conferências foram feitas à mão durante o trabalho.",
      items: [
        {
          title: "Formulário",
          text: "Valida nome, e-mail e consentimento antes de enviar, e o aviso de erro é lido por leitores de tela.",
        },
        {
          title: "Acessibilidade",
          text: "Opção de reduzir movimento, foco visível, perguntas com estado aberto ou fechado anunciado e campos com rótulo. Na home, 43 das 44 imagens têm texto alternativo.",
        },
        {
          title: "Celular",
          text: "O layout muda em cinco larguras de tela, e a rolagem lateral no celular foi corrigida em três ajustes seguidos, em 1º de outubro.",
        },
        {
          title: "Buscadores",
          text: "Endereço canônico, idiomas alternativos, imagem de compartilhamento, dados estruturados de perguntas no guia, mapa do site com 53 endereços e um arquivo de instruções para IAs. As páginas de campanha e a de obrigado ficam fora dos buscadores.",
        },
        {
          title: "Desempenho",
          text: "As imagens do carro e da capa têm versões de 480, 800 e 1200 px, e a biblioteca de animação só carrega em tempo ocioso, com limite de 8 s.",
        },
        {
          title: "Revisão do guia em PDF",
          text: "O PDF é gerado por um programa em duas versões de revisão, uma em português e outra em espanhol, com as 31 páginas cada.",
        },
      ],
    },
    {
      type: "responsive",
      id: "responsivo",
      label: "Celular",
      eyebrow: "Celular",
      title: "No celular, o início para de brincar e vira leitura.",
      body: "O efeito do mouse não existe em telas de toque, então a cena fica parada e o título assume o primeiro plano, em tamanho menor.",
      desktop: desktop("hero-top-desktop", "Início do guia no computador"),
      mobile: mobile("hero-mobile", "Início do guia no celular"),
      notes: [
        { k: "Imagens", v: "o carro e a capa têm versões de 480, 800 e 1200 px, escolhidas pelo navegador" },
        { k: "Mouse", v: "o efeito de seguir o ponteiro só liga com mouse" },
        { k: "Título", v: "cai para um tamanho entre 38 e 56 px no celular" },
        { k: "Frota", v: "cartões de 242 px em telas de até 560 px e setas menores até 700 px" },
        { k: "Sem JavaScript", v: "o conteúdo aparece pronto; o movimento só entra se a biblioteca de animação carregar" },
      ],
    },
    {
      type: "cta",
      id: "projeto-real",
      label: "Ver projeto",
      title: "Agora veja o site de verdade.",
      body: "Tudo que você viu é o site no ar. Abra o guia, tente enviar o formulário vazio, mexa o mouse no início e monte uma cotação.",
      button: "Ver projeto real",
      note: "Abre em uma nova aba",
    },
  ],
};
