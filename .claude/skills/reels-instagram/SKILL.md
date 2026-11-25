---
name: reels-instagram
description: Cria os reels de apresentação de projeto para o Instagram da Linkando Design no estilo aprovado pelo Carlos (4:5 para o feed, visual do site, capa, construção da página, detalhes, style guide e celulares, sem texto explicativo). - quando o usuário pedir reels, vídeo para o Instagram, apresentação em vídeo de um projeto, post do portfólio ou refazer os reels
---

# Reels do Instagram (estilo Linkando)

Vídeo de apresentação de produto, sem fala e sem texto explicativo, feito para quem olha querer um serviço igual e curtir o post. O motor já existe em `scripts/reels/`: esta skill diz o padrão e como usar. Todo projeto precisa ter deck (`lib/decks/<site>.ts`, skill `add-portfolio-project`): o reel sai das gravações e dos dados do deck.

## O padrão (aprovado pelo Carlos em 2026-11-25)

**Formato:** 1080×1350 (4:5, encaixa na grade do feed), 30 fps, H.264 alta qualidade, sem áudio. Mais a capa `<slug>-capa.jpg` no mesmo enquadramento.

**Visual = o do site, nunca fundo preto:** papel `#F4F3EE` com grade de pontos (prancheta da home), molduras brancas de navegador com sombra suave e barra **sem endereço**, celular com cantos suaves (34/26 px, nada de cantos muito redondos), brilho leve da cor do projeto atrás, logo `public/logo-ink.svg`, botão final tinta `#17171A` com texto lime `#EEFB6E` "linkandodesign.com →". Nunca mostrar link da Vercel; o único endereço é linkandodesign.com.

**Sem texto explicativo:** nada de legenda por parte ("Detalhes da interface", "Página completa"…). Texto só: nome do projeto na capa, "linkandodesign.com" discreto no rodapé e o botão final.

**Cenas, em ordem (site):**
1. **Capa (0–1,4 s):** navegador levemente inclinado com a página inicial + celular por cima, logo Linkando no topo e o nome do projeto embaixo (Bricolage 800 maiúsculo). Já é UI desde o primeiro quadro.
2. **Construção:** a página se desfaz em blocos, aparecem as linhas-guia (wireframe) e os blocos voltam um a um até a interface ficar pronta e começar a se mexer; o celular entra e a câmera faz órbita lenta.
3. **Detalhes:** TODOS os itens do capítulo "Cada peça, de perto" (`details`) do deck, um a um em leque 3D, cada um começando no instante do efeito (ex.: "A virada" do Hubber aparece abrindo logo de cara).
4. **Style guide:** paleta subindo em barras com os hex, tipografia real do projeto ("Aa" + amostra), ícones se desenhando traço a traço.
5. **Página completa:** a página inicial inteira, inclinada como mesa de luz, rolando.
6. **Celulares:** 3 celulares em leque, cada um numa página DIFERENTE (nunca repetir a gravação do começo), no trecho de mais movimento.
7. **Assinatura:** logo Linkando + botão "linkandodesign.com →".

**Marca:** capa = papelaria (ou versões do logo); construção = gravação da construção do símbolo; depois as aplicações (versões, papelaria, digital, redes, sinalização) em leque, style guide e assinatura. **Sistema** (ex.: JSYNQ Workspace): cartão sem barra de navegador (as gravações já trazem a janela).

**Ritmo:** suave e elegante (entradas com easing expo, câmera lenta, nada brusco). Duração: site 30–36 s, marca 21–25 s; quanto mais curto sem perder os detalhes, melhor para retenção e curtidas.

## Como fazer

Pré-requisito: o servidor de dev do site rodando na 3011 (`preview_start dev-decks`): o motor lê os vídeos de `/decks/*`. Não rode `next build` enquanto renderiza (divide a pasta `.next`).

```bash
npx -y tsx --tsconfig tsconfig.json scripts/reels/configs.ts > scripts/reels/configs.json
python3 -I scripts/reels/peaks.py
node scripts/reels/render.mjs <slug> --preview
node scripts/reels/render.mjs <slug>
```

- `configs.ts` lê o deck (tipo site/marca/sistema, gravações, paleta, fontes, ícones, celulares).
- `peaks.py` acha em cada detalhe e celular a janela com mais movimento (`from`) e escolhe os 3 celulares mais vivos.
- `--preview` grava um JPG a cada 0,5 s em `exports/reels/_preview/<slug>/`. Monte a folha e **olhe antes de renderizar**:
  `ffmpeg -pattern_type glob -i 'exports/reels/_preview/<slug>/*.jpg' -vf "scale=200:-1,tile=12x6" -frames:v 1 folha.png`
- Render final: `exports/reels/<slug>.mp4` + `exports/reels/<slug>-capa.jpg` (~9 min por reel; no máximo 3 em paralelo; vários: três filas com `&` e `wait`). `exports/` está fora do git e do deploy.

## Conferir antes de entregar

Folha de contato de cada reel (ou amostra de tipos diferentes) e a capa: primeiro quadro já é UI; nenhum texto explicativo; nenhum link da Vercel; detalhes começando no efeito; celulares com páginas diferentes; nada cortado na borda; style guide com cores e fonte certas; preço nunca aparece (as gravações dos decks já escondem). Se algo ficar errado, ajuste `scripts/reels/reel.html` (cenas e tempos no `setup`, movimento no `frame`) e gere a prévia de novo.

Tom de qualquer texto: simples e direto, sem poesia (ver o `CLAUDE.md`).
