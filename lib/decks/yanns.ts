import type { Deck, Media } from "./types";

// Dossiê do deck do YANNS. Cada fato foi conferido em /Users/carloslima/yanns (README, componentes,
// estilos, scripts, textos e histórico de commits) ou no site no ar. Figma entra porque há prova: o
// README e os comentários dos estilos citam o desenho, as medidas e o quadro de cada componente (os
// identificadores dos quadros não são citados). A IA vem do briefing do dono. O texto é para o público:
// simples, sem nome de arquivo, sem metáfora e sem termo técnico além do nome das linguagens (nomes de
// serviços só onde explicam a decisão). Não citar: números de carreira do artista (são texto do cliente
// na página de biografia), chaves, banco de dados, pacotes de publicação por FTP, id do evento na
// LeBillet e os defeitos do site no ar (links legais do rodapé sem página, datas já passadas na lista).
// As gravações saíram todas do site na Vercel; na página do produto só foram escolhidos tamanho e
// quantidade, sem adicionar ao carrinho. Atenção: na Vercel a chave do YouTube não está definida, e a
// seção de vídeos mostra a lista de reserva do código (números e "il y a 11 jours" fixos); o deck diz isso.
const BASE = "/decks/yanns";

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

export const yanns: Deck = {
  slug: "yanns",
  index: 7,
  name: "YANNS",
  client: "YANNS",
  year: 2026,
  sector: "Música · artista",
  location: "França",
  flags: ["🇫🇷"],
  tagline: "O site oficial de um artista da música pop urbana francesa, com vídeo, turnê, clipes e loja.",
  liveUrl: "https://yanns-linkando.vercel.app/",
  extraLinks: [
    {
      label: "Abrir o guia de estilo",
      url: "https://yanns-linkando.vercel.app/styleguide.php",
      note: "A página que lista os componentes do site, em todos os estados",
    },
  ],
  stack: ["PHP", "HTML", "CSS", "JavaScript"],
  theme: {
    // o vinho do site (#930C2E) tem bom contraste sobre o papel claro do palco
    accent: "#930c2e",
    accentInk: "#ffffff",
    fontKey: "inter",
    displayWeight: 800,
    displayTracking: "0.02em",
    displayUppercase: true,
    radius: "0px",
    coverWeight: 800,
  },
  cover: desktop("hero-desktop", "Início do site: vídeo em tela cheia com botões de plataformas de música"),
  summary:
    "Site oficial em francês, português e inglês, com vídeo na primeira tela, datas da turnê com link de venda, clipes do YouTube, biografia e uma loja ligada ao sistema LeBillet.",
  seo: {
    title: "YANNS — Apresentação | Linkando Design",
    description:
      "Como foi feito o site do YANNS: do desenho no Figma ao código em PHP, com vídeo na primeira tela, datas de turnê, clipes, carrossel de coleção, loja e três idiomas.",
  },
  chapters: [
    {
      type: "cover",
      id: "capa",
      label: "Capa",
      kicker: "07 — Portfólio 2026 · Música · França",
      title: "YANNS",
      subtitle: "O site oficial de um artista francês: vídeo na primeira tela, datas da turnê, clipes e loja, em três idiomas.",
      chips: ["PHP", "CSS", "JavaScript", "FR · PT · EN"],
      credit: "Linkando Design · 2026 · design e desenvolvimento com IA e Figma",
      backdrop: desktop("hero-desktop", "A primeira tela: vídeo em tela cheia, botões de vidro das plataformas de música e controles"),
    },
    {
      type: "statement",
      id: "resumo",
      label: "Resumo",
      eyebrow: "O projeto",
      text: "O YANNS é um artista francês da música pop urbana. O site leva o fã do vídeo da primeira tela até a bilheteria de cada show, aos clipes e à loja da nova coleção, em francês, português e inglês.",
      emphasis: ["vídeo", "bilheteria", "loja", "francês"],
      stats: [
        { value: 3, label: "idiomas: francês, português e inglês" },
        { value: 18, label: "datas de turnê, de agosto de 2026 a novembro de 2027, em 4 países" },
        { value: 8, label: "vídeos do YouTube na página inicial: 4 recentes e 4 mais vistos" },
      ],
    },
    {
      type: "process",
      id: "etapas",
      label: "Etapas",
      eyebrow: "Como foi feito",
      title: "Do desenho no Figma à publicação.",
      body: "O projeto começou em fevereiro de 2026, com o desenho do Figma como referência. Os componentes vieram primeiro, depois a venda, os idiomas, a coleção e, por fim, a publicação.",
      steps: [
        {
          n: "01",
          name: "Figma",
          output: "Desenho e medidas",
          note: "O código foi feito para ser fiel ao Figma: o README e os comentários dos estilos citam o desenho, as medidas (a primeira tela tem 1440 × 608 px) e o quadro de cada componente.",
        },
        {
          n: "02",
          name: "Componentes",
          output: "Peças reutilizáveis",
          note: "De 25/02 a 12/03/2026: cabeçalho, botões, campos, menus e cartões, cada um com o seu CSS, e uma página de guia de estilo que os lista.",
        },
        {
          n: "03",
          name: "Venda e idiomas",
          output: "Compra e 3 idiomas",
          note: "Em abril e maio: a ligação com a compra do LeBillet, a loja com produtos e estoque reais e a tradução para francês, português e inglês (7 de maio).",
        },
        {
          n: "04",
          name: "Coleção e páginas",
          output: "Carrossel e biografia",
          note: "De 6 a 8 de maio: otimização para celular, o carrossel da coleção Coco Choco e Toké Toké e as páginas Biographie e Musique.",
        },
        {
          n: "05",
          name: "Publicação",
          output: "Site na Vercel",
          note: "Em 25 e 26 de outubro: vídeos puxados do YouTube, otimização de mídia, o ambiente PHP na Vercel e ajustes nos links do catálogo.",
        },
      ],
      footnote: "O projeto guarda peças desligadas de uma coleção descontinuada (um banner e uma faixa de novidades), mantidas no código para reuso.",
    },
    {
      type: "topics",
      id: "descoberta",
      label: "Descoberta",
      eyebrow: "Descoberta",
      title: "Reunir o que o fã procura em um só lugar.",
      body: "O site do artista tem cinco destinos e dois tipos de venda: ingressos de show e produtos da loja.",
      items: [
        {
          title: "O que o fã procura",
          text: "Ouvir, ver os clipes, achar a data do show e comprar. As cinco páginas do menu seguem esse caminho: Accueil, Musique & Vidéo, Dates, Collections e Biographie.",
        },
        {
          title: "Três idiomas",
          text: "O francês é o idioma padrão. Português e inglês estão a um clique, no cabeçalho.",
        },
        {
          title: "Ingressos",
          text: "Cada casa de show vende por uma bilheteria diferente, como Weezevent, Fnac Spectacles e Ticketmaster. O site reúne todas as datas e leva ao link certo de cada uma.",
        },
        {
          title: "Loja",
          text: "A loja de camisetas e bonés usa o sistema de vendas LeBillet. Os produtos, o estoque e o carrinho vêm de lá.",
        },
        {
          title: "Nova coleção",
          text: "A coleção Coco Choco e Toké Toké ganhou destaque na página inicial, com carrossel de fotos e logos próprios.",
        },
        {
          title: "Música e vídeo",
          text: "O YouTube é a casa dos clipes. Os vídeos mais recentes e os mais vistos entram no site e abrem numa janela, sem sair da página.",
        },
      ],
    },
    {
      type: "identity",
      id: "identidade",
      label: "Identidade",
      eyebrow: "Identidade visual",
      title: "Claro, quase preto e um vinho.",
      swatches: [
        { name: "Vinho", hex: "#930c2e", role: "Menu ativo, anos e rótulos" },
        { name: "Quase preto", hex: "#020612", role: "Botões, títulos e cartões" },
        { name: "Cinza-azul", hex: "#526078", role: "Texto de apoio" },
        { name: "Branco gelo", hex: "#fcfcfc", role: "Fundo da página" },
        { name: "Cinza claro", hex: "#eef2f7", role: "Faixas e fundos de cartão" },
        { name: "Linha", hex: "#dbe2ec", role: "Bordas e divisórias" },
        { name: "Rosa", hex: "#dca0aa", role: "Cartão rosa e entrada gratuita" },
      ],
      fonts: [
        {
          name: "Inter · ExtraBold",
          role: "Títulos",
          sample: "DATES DE TOURNÉE",
          weight: 800,
          uppercase: true,
          size: "xl",
          note: "Títulos de seção em caixa alta e peso extraforte; o título de Musique & Vidéo chega a 120 px.",
        },
        {
          name: "Inter · Regular a SemiBold",
          role: "Texto e interface",
          sample: "Fri. 21 Aug. · 20:00",
          weight: 500,
          size: "md",
          note: "Texto, rótulos e botões, de 12 a 18 px. Os rótulos pequenos ficam em caixa alta e com espaço entre as letras. A fonte é a Inter, carregada do Google Fonts.",
        },
      ],
    },
    {
      type: "topics",
      id: "sistema",
      label: "Sistema",
      eyebrow: "Do Figma ao código",
      title: "Cada peça do desenho virou uma peça do código.",
      body: "O projeto organiza o visual em cores, espaços e componentes, para o site inteiro falar a mesma língua.",
      items: [
        {
          title: "Cores em escala",
          text: "Cada cor tem uma escala numerada: o vinho vai de 100 a 700 e os cinzas de 0 a 1100, além de escalas de aviso, erro, sucesso e informação. Os estilos usam esses nomes, e não o código da cor.",
        },
        {
          title: "Espaços em escala",
          text: "Uma escala de medidas de 2 a 120 px, usada em margens, intervalos e tamanhos, para que dois componentes nunca precisem de um número solto.",
        },
        {
          title: "Um CSS por componente",
          text: "29 arquivos de estilo, um para cada componente: cartão de data, botão, menu, cartão de vídeo. Cada um começa com um comentário que cita o quadro do Figma de onde veio.",
        },
        {
          title: "32 componentes em PHP",
          text: "Cada componente recebe dados e devolve o HTML. O mesmo botão, por exemplo, serve ao cartão de data, à página de música e à de produto.",
        },
        {
          title: "Guia de estilo",
          text: "Uma página própria lista 16 grupos de componentes (botões, campos, abas, menus, cartões de data, cartões de vídeo, ícones, rodapé…) em todos os estados.",
        },
        {
          title: "Medidas do desenho",
          text: "No computador, a primeira tela tem 1440 × 608 px, como no Figma. No celular, ela ocupa a altura da tela menos o cabeçalho de 80 px.",
        },
      ],
    },
    {
      type: "topics",
      id: "estrutura-home",
      label: "Estrutura",
      eyebrow: "Estrutura da página inicial",
      title: "Do vídeo à loja.",
      body: "Seis blocos, na ordem em que o visitante os encontra ao rolar.",
      items: [
        {
          title: "Cabeçalho",
          text: "As redes sociais (Instagram, TikTok, YouTube e Snapchat) à esquerda, o logo grande no centro, carrinho e idioma à direita e o menu logo abaixo.",
        },
        {
          title: "Primeira tela",
          text: "Um vídeo em tela cheia com cinco botões de plataformas de música, os controles de pausa e som e o ícone de rolagem.",
        },
        {
          title: "Datas",
          text: "Seis cartões com as próximas datas e o botão Voir plus, que leva à página completa de datas.",
        },
        {
          title: "Vídeos",
          text: "“Les plus récents” e “Les plus vus”, com quatro vídeos em cada fileira e os títulos gigantes ao lado.",
        },
        {
          title: "Nova coleção",
          text: "O título, os logos das duas linhas (Coco Choco e Toké Toké), o botão Découvrir e um carrossel de fotos com duas abas.",
        },
        {
          title: "Rodapé",
          text: "O logo, o menu repetido, a frase de direitos reservados e os links legais.",
        },
      ],
    },
    {
      type: "topics",
      id: "estrutura-paginas",
      label: "Outras páginas",
      eyebrow: "Estrutura das outras páginas",
      title: "Cada página tem um papel na ida ao show ou na compra.",
      body: "As páginas que o visitante abre depois da inicial.",
      items: [
        {
          title: "Musique & Vidéo",
          text: "Título gigante com o logo ao fundo, os botões das plataformas, o último clipe em destaque, todos os clipes oficiais e uma seção para ouvir em qualquer plataforma.",
        },
        {
          title: "Dates",
          text: "Todas as datas, agrupadas por ano. Cada cartão tem o seu link de venda, e o texto “Billetterie officielle” fica girado na lateral.",
        },
        {
          title: "Collections",
          text: "Uma grade com todos os produtos (camisetas e bonés), com foto, nome e preço, montada ao abrir a página.",
        },
        {
          title: "Produto",
          text: "Fotos, cor, tamanho, quantidade, indicador de estoque, símbolos de composição e lavagem e o botão Ajouter au panier.",
        },
        {
          title: "Biographie",
          text: "Introdução com colagem de fotos, números de carreira, distinções, a seção “Sur scène” e uma chamada final para a turnê.",
        },
        {
          title: "Janelas",
          text: "Duas janelas abrem sobre a página: o player do YouTube e o carrinho com a compra do LeBillet.",
        },
      ],
    },
    {
      type: "anatomy",
      id: "anatomia",
      label: "Primeira tela",
      eyebrow: "A primeira tela",
      title: "Cada elemento da primeira tela tem um motivo.",
      // gravação do início, sem o mouse; os pins (medidos no DOM a 1280×800) apontam para elementos que não se mexem
      media: desktop("hero-top-desktop", "Primeira tela do site, com o vídeo tocando e sem o mouse sobre os botões"),
      pins: [
        {
          x: 12.8,
          y: 6.4,
          r: 8,
          title: "Redes sociais à mão",
          why: "Instagram, TikTok, YouTube e Snapchat ficam no canto esquerdo do cabeçalho, em ícones discretos que levam aos perfis oficiais.",
        },
        {
          x: 50,
          y: 6.4,
          r: 14,
          title: "O logo é o maior elemento",
          why: "O logo YANNS fica grande, no centro, em quase preto sobre o fundo claro. É o que identifica o site à primeira vista, em todas as páginas.",
        },
        {
          x: 87.2,
          y: 6.4,
          r: 7,
          title: "Carrinho e idioma",
          why: "O carrinho mostra um contador quando há itens. O seletor de idioma abre uma lista com francês, português e inglês.",
        },
        {
          x: 50,
          y: 16.5,
          r: 22,
          title: "Menu de cinco destinos",
          why: "Accueil, Musique & Vidéo, Dates, Collections e Biographie, em caixa alta e peso forte. A página atual fica em vinho e um pouco maior.",
        },
        {
          x: 21.7,
          y: 87.5,
          r: 18,
          title: "Cinco plataformas, em vidro",
          why: "Botões de vidro fosco (YouTube Music, Apple Music, Spotify, Amazon Music e Deezer) ficam sobre o vídeo. Só o ícone aparece; ao passar o mouse, o botão se abre e mostra o nome.",
        },
        {
          x: 88.1,
          y: 87.5,
          r: 9,
          title: "Controles do vídeo",
          why: "Pausa e som ficam no canto direito. O vídeo começa sem som, e o ícone de rolagem, no centro, indica que há mais conteúdo abaixo.",
        },
      ],
    },
    {
      type: "feature",
      id: "hero",
      label: "Vídeo",
      eyebrow: "Primeira tela · vídeo",
      title: "Um vídeo em tela cheia com botões de vidro.",
      body: "A página abre com um vídeo em loop, sem som, coberto por uma camada de linhas verticais finas. Sobre ele ficam cinco botões de vidro fosco das plataformas de música e os controles de pausa e som. Ao passar o mouse, cada botão se abre e mostra o nome do serviço.",
      media: desktop("hero-desktop", "Gravação da primeira tela: o mouse passa pelos cinco botões de plataformas, pausa e retoma o vídeo"),
      mediaKind: "desktop",
      side: "left",
      specs: [
        { k: "Vídeo", v: "em loop e sem som, com 10 MB; começa a carregar junto com a página, com uma imagem de capa de 11 KB" },
        { k: "Linhas", v: "uma imagem vetorial por cima do vídeo, em modo de mistura, que não bloqueia cliques" },
        { k: "Botões", v: "vidro fosco com borda clara; abrem em 0,3 s para mostrar o nome de cada plataforma" },
        { k: "Controles", v: "pausa e som trocam de ícone, e o nome para leitores de tela acompanha o estado" },
        { k: "Rolagem", v: "um ícone de roda se move em ciclos de 1,5 s para indicar que há mais abaixo" },
        { k: "Altura", v: "608 px no computador; no celular, a altura da tela menos 80 px" },
      ],
      decision: {
        title: "O vídeo vem desligado, e o controle é do visitante",
        text: "O vídeo é o primeiro contato com o artista, por isso ocupa a largura toda. Ele começa sem som, e os botões de pausa e som dão controle a quem não quer o movimento ou o áudio. As plataformas de música ficam sobre ele, a um clique.",
      },
    },
    {
      type: "feature",
      id: "datas",
      label: "Datas",
      eyebrow: "Turnê · datas",
      title: "Cartões que mostram o detalhe ao passar o mouse.",
      body: "A página de datas agrupa a turnê por ano. Cada data é um cartão com o logo ao fundo, o dia e a cidade. Ao passar o mouse, o cartão mostra a data completa, o local, a abertura das portas e o botão de reservar. Na página inicial, os cartões ficam pretos e mostram o texto Billetterie.",
      media: desktop("datas-desktop", "Gravação da página de datas: o mouse passa por seis cartões, que mostram local, horário e botão de reserva"),
      mediaKind: "desktop",
      side: "right",
      specs: [
        { k: "Lista", v: "18 datas, de agosto de 2026 a novembro de 2027, em França, Bélgica, Marrocos e Canadá" },
        { k: "Página inicial", v: "o cartão fica preto em 0,4 s e o texto muda para Billetterie" },
        { k: "Página de datas", v: "o cartão troca a cidade pelos detalhes em 0,15 s" },
        { k: "Com link", v: "botão Réserver mon billet, que abre a bilheteria daquele show em nova aba" },
        { k: "Sem link", v: "botão Bientôt disponible, desativado, no lugar de esconder a data" },
        { k: "Gratuito", v: "o cartão mostra Gratuit e não tem botão" },
      ],
      decision: {
        title: "Cada data leva à sua própria bilheteria",
        text: "Cada casa de show vende por um sistema diferente, então o site não tenta vender: ele reúne as datas e leva ao link certo, em nova aba. Quando ainda não há link, o cartão avisa que a venda em breve abre.",
      },
    },
    {
      type: "feature",
      id: "videos",
      label: "Vídeos",
      eyebrow: "Música · vídeos",
      title: "Clipes que abrem numa janela, sem sair da página.",
      body: "A página inicial mostra os quatro vídeos mais recentes e os quatro mais vistos do canal. Os títulos Les plus récents e Les plus vus são imagens gigantes ao lado de cada fileira. Ao clicar num cartão, o clipe abre numa janela sobre a página e começa a tocar.",
      media: desktop("videos-desktop", "Gravação dos vídeos: o mouse passa pelos cartões, um clipe abre numa janela e é fechado com Esc"),
      mediaKind: "desktop",
      side: "left",
      specs: [
        { k: "Origem", v: "o serviço de dados do YouTube, quando a chave de acesso está configurada, com a resposta guardada por 6 horas" },
        { k: "Reserva", v: "sem a chave, ou se o serviço falha, uma lista fixa mantém a seção; é ela que a cópia na Vercel mostra hoje" },
        { k: "Texto", v: "visualizações e tempo desde a publicação saem no idioma da página (1,6 M · il y a 2 mois)" },
        { k: "Janela", v: "o player só é criado ao abrir e é destruído ao fechar, o que também para o som" },
        { k: "Fechar", v: "Esc, o botão X ou um clique fora da janela" },
        { k: "Rolagem", v: "a página fica parada enquanto a janela está aberta" },
      ],
      decision: {
        title: "O player só existe quando alguém pede",
        text: "O player do YouTube é pesado. A página mostra só as miniaturas e cria o player no clique, destruindo-o ao fechar. Assim a página abre leve e o vídeo nunca continua tocando escondido.",
      },
    },
    {
      type: "feature",
      id: "colecao",
      label: "Coleção",
      eyebrow: "Loja · nova coleção",
      title: "Um carrossel que troca de foto sozinho.",
      body: "A nova coleção tem duas abas: Coco Choco e Toké Toké. As fotos avançam sozinhas a cada 3 segundos, com uma barra que mostra o tempo. Ao terminar uma coleção, a barra recomeça e a próxima aba abre. As miniaturas ficam numa coluna ao lado, com setas quando há mais fotos do que cabem.",
      media: desktop("colecao-desktop", "Gravação do carrossel: as fotos avançam sozinhas, o mouse troca de aba e escolhe miniaturas"),
      mediaKind: "desktop",
      side: "right",
      specs: [
        { k: "Fotos", v: "9 na Coco Choco e 7 na Toké Toké, em WebP" },
        { k: "Tempo", v: "3 s por foto, com uma barra de progresso linear" },
        { k: "Fim da coleção", v: "a barra reinicia e a próxima aba abre sozinha" },
        { k: "Pausa", v: "enquanto o mouse ou o foco está no carrossel e com a aba do navegador em segundo plano" },
        { k: "Miniaturas", v: "numa coluna vertical; as setas só aparecem quando há mais fotos do que cabem" },
        { k: "Foto principal", v: "na proporção 2:3, inteira, sobre uma versão desfocada dela mesma" },
      ],
      decision: {
        title: "A foto aparece inteira",
        text: "A foto ocupa a proporção 2:3 sem corte, sobre uma versão desfocada dela. Assim nenhuma pose é cortada e o espaço ao lado não fica vazio. Quando o visitante pega o mouse para escolher uma foto, o avanço automático para.",
      },
    },
    {
      type: "feature",
      id: "loja",
      label: "Loja",
      eyebrow: "Loja · produtos e carrinho",
      title: "Uma loja ligada ao sistema de vendas.",
      body: "A página Collections monta a grade de produtos ao abrir, com uma lista que o servidor entrega. Cada produto tem a sua página, com cor, tamanho, quantidade, indicador de estoque e os símbolos de composição e lavagem. O carrinho é o do LeBillet, e um contador no cabeçalho mostra quantos itens há nele.",
      media: desktop("loja-desktop", "Gravação da loja: a grade de produtos carrega e, na página de um produto, são escolhidos tamanho e quantidade"),
      mediaKind: "desktop",
      side: "left",
      specs: [
        { k: "Lista", v: "14 produtos no momento da gravação, guardados por 5 minutos; com estados de carregando, erro e vazio" },
        { k: "Produto", v: "preço, cor (Blanc e Noir), tamanhos de S a XL, quantidade e estoque" },
        { k: "Estoque", v: "a quantidade nunca passa do estoque menos o que já está no carrinho; ao chegar ao limite, um aviso aparece" },
        { k: "Variantes", v: "idade (Adulte e Enfant) e tamanho aparecem sozinhos quando o sistema os informa" },
        { k: "Contador", v: "é conferido com o carrinho real a cada carga de página" },
        { k: "Compra", v: "o ícone do carrinho abre a compra do LeBillet numa janela" },
      ],
      decision: {
        title: "O carrinho é o do sistema de vendas",
        text: "O site não guarda pedidos nem estoque. Produtos, estoque e carrinho vêm do LeBillet, e o navegador guarda só um contador, que é corrigido com o carrinho real a cada página. Assim nunca há um número diferente do real.",
      },
    },
    {
      type: "feature",
      id: "idioma",
      label: "Idioma",
      eyebrow: "Cabeçalho · idioma",
      title: "Três idiomas, trocados num clique.",
      body: "O seletor de idioma fica no cabeçalho. Ao escolher, a página volta no mesmo lugar em francês, português ou inglês: menus, botões, títulos e até a frase de cada vídeo (“il y a 2 mois”, “há 2 meses”, “2 months ago”) mudam.",
      media: desktop("idioma-desktop", "Gravação da troca de idioma: a lista abre e a página inicial aparece em português e depois em inglês"),
      mediaKind: "desktop",
      side: "right",
      specs: [
        { k: "Idiomas", v: "francês (padrão), português e inglês, com 114 textos em cada um" },
        { k: "Escolha", v: "fica guardada por 1 ano e o endereço volta limpo, sem o parâmetro de idioma" },
        { k: "Navegador", v: "o idioma não é adivinhado pelo navegador: sem escolha, o site abre em francês" },
        { k: "Números", v: "1,6 M em francês, 1,6 mi em português e 1.6M em inglês" },
        { k: "Produtos", v: "nomes como Criança e Adulto viram Enfant e Adulte no francês" },
        { k: "Celular", v: "os três idiomas ficam à vista no menu de tela cheia" },
      ],
      decision: {
        title: "O padrão é o francês",
        text: "O site abre em francês, o idioma do artista, sem tentar adivinhar pelo navegador. Quem prefere outro idioma escolhe uma vez, e a escolha vale por um ano.",
      },
    },
    {
      type: "feature",
      id: "biografia",
      label: "Biografia",
      eyebrow: "Página Biographie",
      title: "Uma biografia com colagem, números em blocos e distinções.",
      body: "A página abre com o nome gigante, um texto de apresentação e uma colagem de três fotos sobrepostas. Depois vêm os números de carreira em blocos grandes, a lista de distinções, uma seção com foto de palco e uma faixa escura de chamada para a turnê.",
      media: desktop("biografia-desktop", "Gravação da biografia: a colagem de fotos, os números, as distinções, a foto de palco e a faixa final"),
      mediaKind: "desktop",
      side: "left",
      specs: [
        { k: "Fundo", v: "o logo YANNS enorme e quase transparente atrás do título" },
        { k: "Colagem", v: "três fotos sobrepostas; ao passar o mouse, a foto cresce 5% em 0,6 s" },
        { k: "Números", v: "cinco blocos numa grade; ao passar o mouse, o bloco fica vinho em 0,25 s" },
        { k: "Distinções", v: "uma lista numerada; o item avança 16 px ao passar o mouse" },
        { k: "Palco", v: "foto e texto lado a lado, com zoom de 4% sob o mouse" },
        { k: "Final", v: "uma faixa escura com a chamada para a turnê e o botão Voir la tournée" },
      ],
      decision: {
        title: "Os números ficam em blocos",
        text: "Os números de carreira vêm em blocos grandes, separados do texto, para serem lidos de relance. O que o artista conta em palavras fica na introdução e na seção de palco.",
      },
    },
    {
      type: "motion",
      id: "movimento",
      label: "Animações",
      eyebrow: "Animações",
      title: "Quase tudo é CSS, com um pouco de JavaScript.",
      body: "O site não usa biblioteca de animação. Quase tudo é transição de CSS; o JavaScript cuida do carrossel, do vídeo do início e da janela dos clipes. Cada cartão abaixo roda com a duração real do site.",
      tokens: [
        {
          name: "Cartão de data (início)",
          ease: [0.4, 0, 0.2, 1],
          duration: 0.4,
          usage: "O cartão fica preto e mostra Billetterie.",
        },
        {
          name: "Cartão de data (página)",
          ease: [0.42, 0, 0.58, 1],
          duration: 0.15,
          usage: "A cidade dá lugar aos detalhes e ao botão.",
        },
        {
          name: "Botão de plataforma",
          ease: [0.25, 0.1, 0.25, 1],
          duration: 0.3,
          usage: "O botão se abre e mostra o nome do serviço.",
        },
        {
          name: "Carrossel da coleção",
          ease: [0, 0, 1, 1],
          duration: 3,
          usage: "A barra de progresso enche em 3 s e a foto muda.",
        },
        {
          name: "Janela do vídeo",
          ease: [0.25, 0.1, 0.25, 1],
          duration: 0.3,
          usage: "A janela aparece e some em 0,3 s.",
        },
        {
          name: "Foto da biografia",
          ease: [0.25, 0.1, 0.25, 1],
          duration: 0.6,
          usage: "A foto cresce 5% sob o mouse.",
        },
      ],
      notes: [
        "A cor do cartão de data, os botões de vidro e a lista de distinções só dependem de CSS e funcionam mesmo se o JavaScript falhar.",
        "Só o ícone de rolagem respeita a opção de reduzir movimento. O vídeo do início e o carrossel continuam rodando; o visitante pode pausar o vídeo no botão do canto.",
        "O ícone de rolagem repete um ciclo de 1,5 s para mostrar que a página continua.",
      ],
    },
    {
      type: "topics",
      id: "desenvolvimento",
      label: "Desenvolvimento",
      eyebrow: "Desenvolvimento",
      title: "Como o site foi construído.",
      body: "Um site simples, sem framework, com cada peça escrita à mão.",
      items: [
        {
          title: "Linguagens",
          text: "PHP puro, HTML, CSS e JavaScript simples. Não usa framework de PHP, Composer, Node, Tailwind nem Bootstrap: basta ter o PHP instalado para rodar.",
        },
        {
          title: "Componentes",
          text: "32 componentes em PHP (cabeçalho, botões, cartões, menus, vídeo…) e 29 folhas de CSS, uma por componente. Cada página é uma composição dessas peças.",
        },
        {
          title: "Idiomas",
          text: "Francês, português e inglês, com 114 textos em cada. A escolha vem do endereço (?lang=) e fica num cookie de 1 ano, sem detectar o navegador.",
        },
        {
          title: "Dados",
          text: "As datas e os links de venda estão escritos no código (18 datas). Os vídeos vêm da API do YouTube, com resposta guardada por 6 horas, ou de uma lista de reserva quando a chave não está configurada (o caso da cópia na Vercel). Os produtos e o estoque vêm do LeBillet, guardados por 5 minutos.",
        },
        {
          title: "Compra",
          text: "A compra é do LeBillet, aberta numa janela e acessada por uma página intermediária do próprio site, para o carrinho funcionar no mesmo endereço.",
        },
        {
          title: "Publicação",
          text: "O site roda na Vercel com PHP 8. O CSS e o JavaScript levam um número de versão, a data do arquivo, para o navegador atualizar a cada publicação. As imagens da coleção são WebP.",
        },
      ],
    },
    {
      type: "topics",
      id: "qualidade",
      label: "Qualidade",
      eyebrow: "Qualidade",
      title: "O que foi verificado, e o que não foi.",
      body: "O projeto não tem testes automáticos. O guia de estilo serve de conferência visual dos componentes.",
      items: [
        {
          title: "Sem testes automáticos",
          text: "Não há testes automáticos nem teste de varredura das páginas. As conferências dependem de olhar o site no navegador.",
        },
        {
          title: "Guia de estilo",
          text: "Uma página lista 16 grupos de componentes em todos os estados: botões, campos, abas, menus, cartões, ícones e rodapé. Serve para comparar o código com o Figma.",
        },
        {
          title: "Acessibilidade no código",
          text: "Nomes para leitores de tela nos botões de pausa, som, carrinho e menu, o carrossel com papéis e setas nomeadas, e a pausa do carrossel quando há foco. Os cartões de vídeo abrem só com clique, sem teclado.",
        },
        {
          title: "Desempenho",
          text: "O vídeo do início tem 10 MB e carrega junto com a página, com uma imagem de capa de 11 KB. O CSS está em 30 arquivos pequenos, e as imagens da coleção são WebP.",
        },
        {
          title: "Buscadores",
          text: "Cada página tem só o título (por exemplo, “YANNS - Accueil”). Não há descrição, imagem de compartilhamento nem mapa do site.",
        },
        {
          title: "Segredos fora do código",
          text: "A chave da API do YouTube não está no código: vem de uma variável do ambiente. Sem ela, ou se a API falha, a seção de vídeos usa a lista de reserva. Na cópia da Vercel a chave ainda não foi definida.",
        },
      ],
    },
    {
      type: "responsive",
      id: "responsivo",
      label: "Celular",
      eyebrow: "Celular",
      title: "No celular, o menu ocupa a tela e os botões descem para o pé do vídeo, em duas fileiras.",
      body: "O layout de celular vale até 768 px de largura. O cabeçalho vira uma barra com o logo e o botão de menu, e o menu abre em tela cheia, com os três idiomas e as redes sociais.",
      desktop: desktop("hero-desktop", "Primeira tela no computador"),
      mobile: mobile("hero-mobile", "Primeira tela no celular, com o menu aberto em tela cheia"),
      notes: [
        { k: "Ponto de virada", v: "até 768 px vale o layout de celular; acima, o de computador" },
        { k: "Cabeçalho", v: "uma barra com o logo e o botão de menu; carrinho e idioma ficam no menu" },
        { k: "Primeira tela", v: "a altura da tela menos 80 px, com no mínimo 500 px" },
        { k: "Plataformas e controles", v: "descem para o pé do vídeo, em duas fileiras centralizadas" },
        { k: "Datas", v: "os cartões ficam numa coluna só" },
        { k: "Idiomas", v: "francês, português e inglês ficam à vista no menu" },
      ],
    },
    {
      type: "cta",
      id: "projeto-real",
      label: "Ver projeto",
      title: "Agora veja o site de verdade.",
      body: "Abra a página inicial, passe o mouse pelos botões de plataforma, abra um clipe e confira os produtos da loja.",
      button: "Ver projeto real",
      note: "Abre em uma nova aba",
    },
  ],
};
