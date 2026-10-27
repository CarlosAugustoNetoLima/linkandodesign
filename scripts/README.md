# Scripts

## Gravação dos cards de portfólio (motion)

Gera os webp animados (desktop + mobile) que aparecem nos cards do portfólio.

```bash
node scripts/record-sites.mjs            # grava os 5 alvos em /tmp/live/*.webm
node scripts/record-sites.mjs yanns      # ou um alvo só
./scripts/make-webp.sh                    # corta pelos marcadores + gera public/projects/motion/*.webp
```

**Como funciona**

- `record-sites.mjs` — abre cada site no Chrome (Playwright), fecha o banner de
  cookies pelo nome acessível exato (nunca por substring: "OK" casa com títulos
  como "TOKÉ TOKÉ" e abriria modais), roda uma timeline de scroll de 9,8s via
  rAF (começa e termina no topo para o loop fechar) e cerca a timeline com dois
  bursts magenta que marcam início e fim. Grava desktop (1280×800) e mobile
  (390×844).
- `make-webp.sh` — detecta os marcadores magenta, corta a timeline exata e
  **reestica** o trecho para 9,8s (o webm do Playwright é CFR 25fps e descarta
  frames em sites pesados; sem reesticar, o scroll tocaria acelerado e em
  velocidade diferente por site). Extrai frames e monta o webp animado com
  `img2webp -kmax 1` (todo frame é keyframe — sem isso a predição inter-frame
  corrompe o meio da animação num scroll). Gera também um `-poster.webp` do
  primeiro frame.

Requer: `playwright` (+ `npx playwright install ffmpeg`), `img2webp` e `cwebp`
(pacote `webp`), `ffmpeg`.

Saída: `public/projects/motion/<base>-{desktop,mobile}.webp` e `-poster.webp`.
O card só anima um par por vez (ver `components/ui/motionController.ts`).

## Vídeos do card de vidro do hero

Gera os mp4 que rodam dentro do card 3D do hero (`HeroShowcase3D.tsx`).

```bash
node scripts/record-hero-sites.mjs            # festivalcrato, wauw, jsynq
node scripts/record-hero-sites.mjs wauw       # ou um alvo só
```

Saída: `public/projects/<name>.mp4`, 960×600, ~15s, h264.

**Regras deste conjunto**

- **Desktop puro, sangrando de borda a borda.** O referencial é o `yanns.mp4`.
  Nada de moldura de browser, celular ao lado ou fundo colorido — isso é o que
  o `generate-mockups.mjs` faz, e dentro do card de vidro vira mockup dentro de
  mockup. Os mockups antigos ficaram preservados como `<name>-mockup.mp4`.
- **960×600 (16:10), não 1280×800.** A textura sobe para a GPU a cada frame e o
  card nunca ocupa mais que ~600px de tela. `VIDEO_ASPECT` no componente é
  derivado dessa proporção — mudar a resolução aqui exige mudar lá.

**Armadilha (custou uma rodada inteira):** `festivalcrato.pt` e `jsynq.com` usam
scroll suavizado por JS, que roda o próprio rAF e reescreve a posição todo
frame. `window.scrollTo` é desfeito antes de pintar e a gravação sai **100%
parada** — com tamanho de arquivo plausível, então só se percebe olhando frame a
frame. Por isso o scroll é dirigido por `page.mouse.wheel` (entra pelo pipeline
de input, que essas bibliotecas respeitam) e o script imprime quanto da página
realmente rolou, avisando abaixo de 50%.

## Mirror estático do YANNS (`/yanns`)

`build-yanns-mirror.mjs`, `capture-yanns*.mjs`, `recapture-yanns-collection.mjs`
constroem o snapshot fiel servido em `linkandodesign.com/yanns`
(`public/yanns/`, rewrite em `next.config.mjs`).
