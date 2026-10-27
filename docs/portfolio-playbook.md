# Playbook — Portfólio detalhado de projetos (estilo Behance)

Processo reutilizável para transformar cada site entregue pelo estúdio em um case
de portfólio rico, com capturas fiéis, dados "assados" e um mirror estático
servido em `linkandodesign.com/<nome-site>`.

Referência de implementação: **YANNS** (`/Users/carloslima/yanns`, PHP).

---

## Estrutura de entregáveis (por projeto)

```
public/projects/<slug>/
  data/
    store.json        # dados dinâmicos da loja (se houver API de e-commerce)
    videos.json       # vídeos/embeds dinâmicos (se houver API)
    dates.json        # agenda/eventos (API ou hardcoded)
    manifest.json     # índice do dataset + fontes
  shots/
    desktop/NN-rota.png   # full-page, 1440px
    mobile/NN-rota.png    # full-page, 390px
    states/*.png          # estados interativos (menu, modais, dropdowns)
  live/                # mirror estático fiel (servido em /<slug>)
```

Scripts de captura: `scripts/capture-<slug>.mjs` e `scripts/capture-<slug>-states.mjs`
(usam `puppeteer-core` + Chrome do sistema).

---

## Fase 1 — Discovery & dados

1. Mapear **rotas** (router/entrypoint) e **estados interativos** (modais, dropdown,
   carrinho, menu mobile, players).
2. Identificar o que vem de **API** vs. estático.
3. **Extrair os dados de API para JSON** com um script no próprio runtime do site
   (ex.: PHP CLI que instancia os Services e dá `json_encode`). Salvar em `data/`.
   - No YANNS: `LeBilletService` (loja, event 1816) e `YouTubeService` (vídeos,
     com fallback). Datas estavam hardcoded no `index.php` → extraídas via regex+eval.
4. Estruturar em `store.json` / `videos.json` / `dates.json` + `manifest.json`.

## Fase 2 — Varredura de capturas

1. Subir o site num servidor gerenciável (ex.: Claude Preview via `.claude/launch.json`).
2. Fixar **idioma** (no YANNS: cookie `yanns_lang=fr`).
3. Rodar `capture-<slug>.mjs`: cada rota em **desktop (1440)** e **mobile (390)**,
   full-page, com auto-scroll para disparar lazy-load.
4. Rodar `capture-<slug>-states.mjs`: clicar gatilhos e capturar estados.
5. Conferir visualmente algumas capturas (idioma, full-page, dados dinâmicos).

## Fase 3 — Mirror estático "ao vivo" (`/<slug>`)

- Gerar snapshot **fiel** do HTML/CSS/JS/imagens renderizados, com os dados do
  JSON já embutidos (sem depender do backend PHP nem das APIs externas).
- Servir como assets estáticos no domínio principal: `linkandodesign.com/<slug>`.
- Substituir chamadas de API por leitura dos JSONs de `data/` (ou inline no HTML).

## Fase 4 — Página de case estilo Behance

- Layout editorial vertical: **capa → contexto/desafio → seções com mockups grandes
  intercalados (desktop + mobile) → detalhes de craft → paleta/tipografia →
  CTA "ver site ao vivo"** (aponta para `/<slug>`).
- Reconstruir os **efeitos-chave** (transitions/hover) em CSS na própria página,
  documentando timing/easing extraídos do CSS original (abordagem "estados + CSS").
- Integrar ao app Next em `lib/projects.ts` + página de case existente.

---

## Decisões padrão (deste estúdio)

- **Motion:** estados como stills + reconstrução em CSS no case (GIF ao vivo só se
  a extensão Claude-in-Chrome estiver conectada).
- **Mirror:** snapshot estático fiel (não rebuild em Next).
- **Idioma das capturas:** o idioma oficial do cliente (YANNS → FR).
