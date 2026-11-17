---
name: build-site-deck
description: Constrói a apresentação animada (deck) de um site do portfólio da Linkando Design a partir do código e do site no ar — audita, grava loops reais, escreve o dossiê e valida no navegador.
when_to_use: quando o usuário pedir para criar, refazer ou atualizar a apresentação de portfólio de um dos sites (Cinnamon, Viva o Samba, Tickett, YANNS, Station One, Hubber, AZ Car Rental, Collision Auto Pros)
argument-hint: "<slug> <caminho-do-código> <url-vercel>"
---

# Deck de apresentação de um site

Um **deck** é uma página de scroll cinematográfica em `/apresentacoes/<slug>`: o palco veste a identidade do site apresentado, a moldura veste a marca Linkando, e o fim leva ao site real (Vercel) em nova aba. Nada é estático: loops gravados do site de verdade, scrub por scroll, pins que explicam decisões, curvas de easing rodando.

> Projeto novo no portfólio? Comece por `add-portfolio-project`: ela define a vitrine (o card com o site em ação), o registro e a verificação, e chama esta skill para a apresentação completa.

**Deck = DADO + MOTOR.** O motor (`components/deck/`) é genérico e já existe. Um site novo só precisa de:

| O quê | Onde |
|---|---|
| Dossiê (objeto serializável) | `lib/decks/<site>.ts` — tipo `Deck` em `lib/decks/types.ts` |
| Registro | `lib/decks/index.ts` (array `decks`, na ordem do hub) |
| Fonte do site, se for nova | `lib/decks/fonts.ts` (next/font exige declaração estática) |
| Gravações | `public/decks/<site>/*.mp4` + `.jpg`, geradas por `scripts/deck/record-scenes.mjs` |
| Cenas de gravação | `scripts/deck/scenes/<site>.json` |

Se o site tem um efeito que NÃO cabe nos 11 tipos de capítulo (cover, statement, identity, sequence, anatomy, feature, motion, process, topics, responsive, cta), crie um tipo novo (em `types.ts` + componente em `components/deck/chapters/`) em vez de forçar um tipo errado.

## Princípios (não negociáveis)

1. **Cada fato é rastreável.** Todo número, nome de técnica ou afirmação do dossiê vem de um arquivo lido ou do site no ar. Confira contagens no código, não no comentário (no Cinnamon o comentário diz 120 frames; o código usa 102 — o deck diz 102).
2. **Não afirmar o que não há evidência.** Figma e IA só entram onde há prova (spec do Figma no repo, agentes/prompt no repo). Não invente dados do cliente, métricas ou resultados. Meta de Lighthouse é meta, não resultado.
3. **Mostrar o que chama atenção, não tudo.** 3 a 5 efeitos-assinatura por site, cada um com uma gravação real e o PORQUÊ da decisão.
4. **Motion com propósito.** O deck respeita `prefers-reduced-motion` (estado final visível, sem animar).
5. **O link final tem que funcionar para o público.** Antes de publicar, `curl -sI <url>` não pode redirecionar para `vercel.com/sso-api` (Deployment Protection ligada). Se redirecionar, pare e avise o dono.
6. **Linguagem pública, simples e prática (pedido do dono, 2026-11-10).** O texto do deck é para quem contrata design: **nenhum nome de arquivo** (nada de `.js`, `.css`, `.json`, `motion.js`), **nenhuma metáfora ou palavra poética** (nada de "filme", "voo", "bastidores", "esteira", "pouso"), **nenhum termo técnico além do nome das linguagens** (HTML, CSS, JavaScript, TypeScript, Python, GLSL). Nome de biblioteca ou ferramenta (GSAP, Lenis, Three.js, Astro, WebGL, Vercel) só no capítulo de desenvolvimento, **com uma frase dizendo o que faz**. Nada de nome de curva (`power3.out`, `expo.out`), `clip-path`, `scrub`, `stagger`, `IntersectionObserver`, `aria-*`, nome de variável CSS: troque por o que o visitante vê ("sobe e aparece", "a rolagem controla", "a cor muda"). Antes de entregar, rode uma varredura (grep) por extensões de arquivo e por esses termos nos dossiês.

## Fluxo (orquestrador + executor)

Você é o orquestrador: audita, decide, escreve o dossiê e revisa. Delegue ao subagent `executor` o trabalho mecânico (rodar/ajustar o gravador, componentes novos) com briefs que tragam arquivos, restrições e critério de pronto. Revise cada retorno olhando os frames/screenshots, não só o relatório.

### 1 · Auditar (código + site no ar)

Leia, nesta ordem: README / CLAUDE.md / specs do projeto; tokens (CSS variables, tailwind config, `FIGMA_SPEC.md`); módulos de motion/JS (cabeçalhos de comentário dizem muito); `package.json`/libs. Depois capture o site no ar em 8 pontos de scroll (Playwright, ver armadilhas) e olhe as folhas de contato.

**Leia a linha do tempo de cada efeito até o FIM.** No Cinnamon o hero tem uma cena depois dos 102 frames (o vídeo congela e a foto do banheiro entra em crossfade com zoom e escurecimento): o deck inicial parou nos frames e ficou incompleto, o dono notou. Confira no código quantas cenas o efeito tem, quando cada uma entra e use as janelas reais (e não terços iguais) nas legendas. Ao mexer em texto de capítulo fixo, meça com `node` + Playwright se a coluna cabe em 1280×800 e 1366×768 (todas as telas `.deck-screen` devem ter `scrollHeight` ≤ `clientHeight`).

Anote por site: paleta e fontes reais; stack; **efeitos-assinatura** (o que ninguém mais faz); interações (hover, drag, cursor, modais); decisões de UI com o motivo; regras de acessibilidade/performance que o código declara; processo (agentes, Figma) **se houver prova**; bloqueios (SSO, link quebrado). **Também levante, com prova (README, specs, commits, CI, testes):** o ponto de partida (objetivo, público, material recebido, decisões iniciais), a ordem real das seções com os títulos visíveis, as linguagens e integrações, e o que foi verificado (testes, CI, acessibilidade, medições). Registre o que NÃO existe (sem testes, sem CI, sem medição): o capítulo de qualidade diz isso em vez de inventar.

### 2 · Escolher os capítulos

Ordem padrão (corte o que o site não tiver):

`cover` → `statement` (conceito + 3 números verificados) → `process` (etapas; só com prova de como foi feito) → `topics` **Descoberta** (ponto de partida, público, material recebido, regras) → `identity` (paleta e tipografia; sem lista de regras) → `topics` **Estrutura da página** (ordem real das seções com os títulos visíveis; uma por página relevante) → `sequence` (se o hero usa imagens controladas pela rolagem) → `anatomy` (pins sobre a gravação do hero) → `feature` × 3–5 (um por efeito-assinatura, com `specs` em linguagem simples e `decision`) → `motion` (movimentos e durações reais, com demonstração) → `topics` **Desenvolvimento** (linguagens, bibliotecas explicadas, idiomas, formulário/integrações, imagens, publicação) → `topics` **Qualidade** (testes, acessibilidade, celular, buscadores, medições; diga também o que não existe) → `responsive` → `cta`.

Texto em pt-BR, curto e na linguagem do princípio 6 (simples, prático, sem arquivos, sem metáforas). **Diga o que as coisas são:** é um site/uma página, não um "filme" (o dono estranhou a metáfora); "filme" só se a própria seção do site tiver um vídeo com esse nome, e mesmo assim prefira "vídeo". Evite metáforas que o visitante teria de decifrar: toda sigla técnica ganha uma frase de contexto. `why`/`decision` explicam **a razão**, não descrevem a tela. **Sem blocos de código nos decks** (pedido do dono em 2026-11-10): a decisão se explica em texto, e as `specs` citam o mínimo de nomes técnicos. O conteúdo ocupa largura generosa (`.deck-container` até 1720 px): não estreite colunas nem textos. **Equilíbrio:** em layouts lado a lado, texto e mídia ficam alinhados pelo centro vertical (`items-center`, nada de mídia sticky no topo); cada capítulo é uma tela (min-height 100svh) com conteúdo centralizado e o mesmo padding.

**Cuidados de conteúdo:** não publique conteúdo privado de pastas internas (briefings, conversas com o cliente), IDs de pixel/CRM/medição, preços, mecânica de promoção, números de telefone, nomes de pessoas da prova social, nem frases como "sem licença" sobre fontes do cliente (use a fonte parecida e diga só que ela faz o papel da original). Fotos que parecem geradas por IA não se chamam de "reais". Se o site no ar mostra algo incompleto (formulário em modo demonstração, PDF 404, promoção vencida), **o deck não promete o que não existe** e você avisa o dono na entrega.

### 3 · Gravar as cenas

`scripts/deck/scenes/<site>.json` descreve cada cena (`setup` não grava, `record` grava) com ops: `goto, wait, waitFor, scroll, move, hover, click, drag, press, orbit, seekHit, css`. A op `css {text}` injeta CSS: use no `setup` para esconder a interface e gravar um fundo limpo para a capa (ex.: só um canvas decorativo). Rode `node scripts/deck/record-scenes.mjs <site> [cena…]`. Detalhes e formato em `scripts/deck/README.md`.

- Desktop 1280×800; mobile 390×844 DPR 2. Saída: mp4 h264 sem áudio + poster jpg, ~10–12 s, desktop < 4 MB.
- Loops de scroll: desce e volta ao topo (o loop fecha sem salto).
- Revise cada vídeo pela folha de contato (`scratchpad/deck-review/`): cursor visível nas cenas de mouse? WebGL não ficou preto? Texto legível? Se uma cena falhar, **diga** — não substitua por imagem parada sem avisar.

### 4 · Escrever o dossiê

Copie a estrutura de `lib/decks/cinnamon.ts` (ou `hubber.ts`). Preencha `Media.width/height` a partir de `public/decks/<site>/manifest.json`. Depois de criar o dossiê: registrar em `lib/decks/index.ts` **e** tirar o nome da faixa "Em produção" em `app/apresentacoes/page.tsx`.

**Palco padronizado:** todos os decks usam o papel claro da Linkando (`lib/decks/stage.ts`), igual às outras páginas do portfólio: NÃO existem `bg/fg/line` no tema. O tema traz só `accent` (use a variante do site que tenha contraste sobre o papel, ex.: o `--accent-ink` ou o magenta de texto), `accentInk`, fonte, pesos e `radius`. **Campos opcionais** para fontes diferentes: `displayStretch` (eixo `wdth`, em %, para fonte larga) e `coverWeight` (peso do título da capa, padrão 200). A capa mostra o `backdrop` (vídeo do site) numa moldura em destaque. `fonts[].wide` mostra o exemplo na largura do display. **Duas fontes** (título e texto): `displayFontKey` no tema (a fonte dos títulos e da capa; `fontKey` segue como a do texto) e `fonts[].fontKey` na identidade (mostra o exemplo na fonte real). Só valem as duas chaves usadas pelo tema (`fontKey` e `displayFontKey`), porque só essas duas classes de fonte vão para a raiz do deck; fontes novas entram em `lib/decks/fonts.ts` (Viva o Samba: `bebasNeue` nos títulos, `plusJakarta` no texto; Bebas só tem peso 400, então `displayWeight` e `coverWeight` = 400). `Deck.extraLinks` coloca outros endereços do projeto (ex.: um produto em subdomínio) no CTA final.

**Fontes: licença primeiro.** Antes de copiar qualquer fonte do site para este repositório, veja o nome do arquivo e a licença. No Hubber a fonte de display é um `…DEV-PREVIEW.woff2` (prévia, sem licença para redistribuir): **não copie**; use uma Google Font equivalente (ex.: Archivo com `wdth`) em `lib/decks/fonts.ts` e diga isso no `note` da fonte e ao dono.

**Pontos de dado:** número que vem do copy do cliente (US$, "90 dias") só entra se estiver literal no site; contagens técnicas (módulos, hosts, idiomas) saem do código.

**Pins do `anatomy` (regra de ouro):** a mídia do capítulo tem que ser uma gravação **parada no topo** (cena `hero-top-desktop`), nunca o loop que rola — senão os pins apontam para conteúdo que já saiu da tela. E as posições **não se estimam olhando a imagem**: meça no DOM com `node scripts/deck/measure-elements.mjs <url> '{"nome":"seletor"}' 1280 800` (devolve x/y do centro e w/h em % — exatamente o que `Pin.x/y/r` esperam). No Cinnamon o chute visual errou o "Role" por 8 pontos de %.

**Capa:** o `backdrop` aparece numa moldura ao lado do título (não em tela cheia). Pode ser uma gravação real do site (ex.: o hero com o mouse passando) ou, se o site tem frames/vídeo limpo, um loop sem UI (`ffmpeg … reverse + concat` para ping-pong).

**Espaço:** textos de `specs` e `body` curtos — o capítulo `sequence` tem que caber em 100svh (900 px). Se estourar, corte um item.

### 5 · Registrar e verificar

Acrescente o deck em `lib/decks/index.ts`. Suba o dev server com `preview_start` nome **`dev-decks`** (porta 3011). A porta 3010 do config `dev` costuma estar ocupada por outro projeto: **nunca** mate esse processo. Nunca `npm run build` com o dev ligado.

**Não verifique no Browser pane:** a aba roda oculta (rAF/IntersectionObserver/scroll não disparam e screenshots abaixo da dobra saem em branco). Use os scripts de `scripts/deck/` (Playwright com `channel: 'chrome'`):

| Script | Para quê |
|---|---|
| `verify-deck.mjs <url> <pasta> [w] [h] [capítulos,…]` | rola cada capítulo, captura (CDP) e lista erros de console/404. `REDUCE=1` liga reduced-motion. Monte folhas de contato com ffmpeg `xstack`/`hstack` para revisar. |
| `check-reveals.mjs <url> [w] [h]` | rolagem em ritmo humano, capítulo a capítulo: todo título animado tem que ficar visível. |
| `check-overflow.mjs <url> [390]` | lista elementos que passam da largura da tela (o `.deck` usa `overflow-x: clip`, que ESCONDE o estouro: `scrollWidth` não acusa). |

Roteiro mínimo: desktop 1440×900 (todos os capítulos), mobile 390×844, `REDUCE=1`. Console limpo (o 404 de `favicon.ico` e o warning do framer sobre "non-static position" são do site/dev, não do deck). "Ver projeto real" com `target=_blank rel=noopener noreferrer`.

**Capturas escondem bugs de tempo:** o título leva ~1,5 s para revelar; espere ≥ 2,5 s depois de rolar antes de concluir que algo não apareceu.

### 6 · Entregar

Resuma ao usuário: o que o deck mostra, o que foi gravado e o que falhou, os links (`/apresentacoes/<slug>` e o `liveUrl`), e qualquer alerta (SSO, afirmações que precisam da confirmação dele).

## Armadilhas conhecidas

**Do motor (já resolvidas — não reintroduzir):**
- Gatilho de `whileInView` em elemento que começa **fora da máscara** (`overflow:hidden` + `y:110%`) nunca dispara: o IntersectionObserver o considera recortado. O gatilho vive na raiz do título (`WordReveal`). **Mesma regra para qualquer elemento que entra com `scale 0`** (ex.: os swatches da paleta): um elemento com `scaleY: 0` tem área zero e o IntersectionObserver pode nunca disparar (a paleta ficou invisível em janelas de ~1000 px). Gatilho no PAI (que sempre tem área) + `variants` nos filhos. Teste a 1000, 1280, 1440 e 1920 px, não só em um tamanho.
- `useReducedMotion()` do framer devolve `null` no SSR e `true` no 1º render de quem prefere menos movimento → erro de hidratação. Use `useReduced()` (`components/deck/useReduced.tsx`): lê um contexto cujo `ReducedProvider` (já em `DeckPlayer` e `DeckCard`) aplica a preferência só depois de montar e **remonta a subárvore** (key) quando ela muda. Só trocar o valor depois de montar NÃO basta: o framer não reaplica `initial` quando `whileInView` vira `undefined` e os elementos ficam presos invisíveis.
- Grid de uma coluna sem `minmax(0,1fr)` deixa o conteúdo empurrar a largura no celular (e o `overflow-x: clip` esconde). Sempre `grid-cols-[minmax(0,1fr)]` como base.
- Em `lg`, quando a mídia vai para a direita, o grid precisa inverter as frações (`1fr_1.5fr`), senão a coluna larga fica com o texto.
- easing GSAP→cubic-bezier: `power2.out = [.25,.46,.45,.94]`, `power2.inOut = [.455,.03,.515,.955]`, `power3.out = [.215,.61,.355,1]`, `expo.out = [.16,1,.3,1]`. `[.455,.03,.515,.955]` NÃO é `out`.
- Pills (`rounded-full`) quebram regras de marca (Cinnamon proíbe qualquer border-radius): chips usam `var(--d-radius)` do tema.

**Da gravação:**
- O screencast só emite frame quando algo **muda** na tela: cena ociosa dá 0 frames e reprova. Para um hero parado, inclua um micro-scroll (0 → 40 px → 0).
- Com `at: top` e offset 0, o título da seção fica cortado pelo header fixo: use `offsetVh: -0.12` nos `setup`.
- Mobile sai 1× (390 px) escalado para 520 px.
- Comportamento real do site aparece no vídeo (ex.: o hero piscando ~1 s antes do preloader no Cinnamon). Avise o dono em vez de esconder ou "consertar" a gravação.

- O Chromium do Playwright pode não estar baixado: use `channel: 'chrome'` (Chrome do sistema).
- Não grave com `recordVideo` do Playwright (baixa qualidade, descarta frames): o gravador usa `Page.startScreencast` com timestamps + ffmpeg concat.
- Sites com Lenis: faça o scroll por timeline rAF (`window.scrollTo` a cada frame), não por `mouse.wheel`.
- WebGL em headless: tente primeiro com a GPU real; se ficar preto, `--use-angle=swiftshader --enable-unsafe-swiftshader`.
- O ffmpeg local não tem encoder webp (use `img2webp`/`cwebp` se precisar de webp); tem libx264.
- Sites atrás de SSO da Vercel (Station One): não dá para gravar o link público; grave a partir do código servido localmente ou peça para desligar a proteção.
- Hubber tem dois alvos (`/` e `/reels`): decida se vira um deck com dois capítulos ou dois decks.
- Tickett: só o `frontend/` é UI; a pasta tem backend PHP que não é parte da apresentação.
- Banner de cookies e bolha de chat cobrem a gravação: o JSON da cena aceita `cookies` (ex.: consentimento essencial) e o `css` do `setup` esconde a bolha. Interação com formulário (digitar, validar) só em servidor local (`localhost`) com dados de teste e **sem enviar**; no site na Vercel só olhe e role.
- Efeito de cursor que mostra algo (cartaz que segue o mouse, hover): estacione o mouse **fora** da área do efeito antes de gravar (ex.: na margem direita, `x: 1268`), senão o primeiro quadro já mostra o efeito preso. Marque `move` para fora também no fim da cena.
- A cena de iframe (janela de compra de terceiros) não deixa clicar por seletor: use `click {x,y}` com coordenadas medidas na captura (a 1280×800). O screencast reprova com menos de 8 fps: nas esperas longas, intercale `move` do mouse (hover gera quadros), em vez de um `wait` de vários segundos.
- Detalhe minúsculo da interface (ícone de 28 px, como um seletor de idioma) não aparece em 1280×800: faça um **close-up** com `css` no `setup` (esconda o resto com `visibility:hidden` e aplique `transform: scale(3.4)` só no componente) e diga no deck que a gravação está ampliada. Dê espaço para os painéis que abrem (um painel de 5× saiu cortado na esquerda).
- Um `goto` no meio do `record` **descarta o que já foi gravado** (o screencast reinicia). Para mostrar várias páginas num vídeo só, grave cenas separadas e emende com `ffmpeg` (`concat` em filtro, `-r 30`, crf 26–31, abaixo de 4 MB), tire o poster de 1,2 s e acerte o `manifest.json`. `recordFromStart: true` grava o carregamento inicial (o estado “carregando” de uma lista).
- Dado que parece real no site no ar pode ser a **lista de reserva do código**. No YANNS, a chave da API do YouTube não está na Vercel e os vídeos (“il y a 11 jours”, 6,2 k vues) são fixos. Compare o texto da página com os dados de reserva do código antes de dizer que algo vem de uma API em tempo real, e diga no deck o que a cópia no ar de fato faz.
- **Site atrás do SSO da Vercel (Station One):** grave do código servido localmente (entrada temporária no `.claude/launch.json` com `php -S 127.0.0.1:<porta> -t public tools/router.php`, e remova-a no fim), avise no deck que a gravação é local e que o link só abre ao público depois que o dono liberar a proteção. Sites com `?_now=AAAA-MM-DD` de desenvolvimento permitem gravar com uma data simulada (no Station One, 2026-10-01, para os 3 espetáculos aparecerem); diga a data no deck e ao dono.
- `scroll` com `offsetVh`/`offsetPx` **positivo passa do elemento** (a página desce além do alvo): para um efeito preso ao scroll (pin, scrub, palavras que se acendem) comece com offset **negativo** (elemento entrando por baixo) e vá subindo; senão a cena já começa no fim do efeito.
- Clique por seletor logo depois de uma rolagem em site com Lenis erra o alvo (o elemento ainda anda): role com `ms: 0` no `setup`, espere ~1,8 s e deixe o botão **já à vista** antes do `click`. Se o efeito só aparece em telas grandes (a fila de cartazes do Station One anda 145 px a 1280×800 e 325 px a 1440×900), use `device: "desktop-hd"` (1440×900, mesma proporção; a `Media` do capítulo leva `width: 1440, height: 900`).
- Leia o componente antes de afirmar o que um elemento faz: no YANNS o logo é só uma imagem (não é link) e a lista de datas é um array fixo no código, que não tira as datas já passadas.
- No carrinho de um sistema de terceiros (Tickett), adicionar e retirar bilhetes basta para mostrar o fluxo; **não avance** para os dados pessoais e avise o dono de que o carrinho foi mexido.
- Antes de gravar, confira com `curl -s -o /dev/null -w "%{http_code}"` cada página que o deck vai mostrar: no Tickett as páginas de eventos dão 500 na Vercel (API recusa o token); grave o que funciona e avise o dono do que está quebrado.
- Clique em chips vizinhos por coordenadas pode não registrar na gravação: passe o mouse sobre o alvo (`hover` com `ms` ~500) e só então `click`.
- Cena que precisa do banner de cookies/consentimento de verdade: `"noCookies": true` na cena (o JSON do site pode trazer o cookie de aceite para as demais).
- Em produção o Next troca as classes de CSS Modules por `Nome-module__hash__classe`: seletores por atributo (`[class*="Nome-module"][class*="__section"]`), nunca por `Nome_section`. Conteúdo lazy (foto que troca no clique): aqueça a imagem no `setup` clicando e voltando, senão o vídeo mostra a foto antiga.
- Menus largos podem estourar a tela em 1280/1440 px (ex.: mega-menu do AZ sai 90 px pela esquerda): grave no dispositivo `desktop-fhd` (1920×1200, codificado em 1600 px; `Media` com 1600×1000) e **avise o dono** do corte em telas menores.
- Confira se a "regra" lida num script (ex.: lista de páginas por idioma) ainda bate com o que existe no site: no AZ a lista do seletor de idioma tem 5 páginas, mas 17 existem nos três idiomas.
