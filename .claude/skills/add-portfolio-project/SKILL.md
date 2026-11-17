---
name: add-portfolio-project
description: Adiciona um projeto novo ao portfólio da Linkando Design no padrão do estúdio: o site em ação dentro do card (vitrine gravada com todos os efeitos, interações e a página rolando), a apresentação completa, o registro em todos os lugares do site e a verificação final.
when_to_use: quando o usuário pedir para adicionar, incluir ou publicar um projeto/site novo no portfólio, criar o card ou a vitrine de um projeto, ou refazer a vitrine de um projeto existente para o padrão
argument-hint: "<slug> <caminho-do-código> <url-vercel> <país(es)>"
---

# Projeto novo no portfólio

Todo projeto novo entra como **deck** (`lib/decks/<site>.ts`). O modelo antigo (`lib/projects.ts`, `/projeto/[slug]` e `docs/portfolio-playbook.md`) fica só para os 4 projetos legados: não use para projetos novos.

Esta skill é a porta de entrada. Ela define o que todo projeto precisa ter (a **vitrine**, o card com o site em ação) e amarra as outras peças. A apresentação completa é feita pela skill `build-site-deck`; as gravações, pelo gravador `scripts/deck/record-scenes.mjs`.

## O que o visitante vê de cada projeto

| Onde | O que aparece | De onde vem |
|---|---|---|
| Home · vitrine (palco) | navegador + celular em vídeo, **7 s por site** e troca | `deck.cover` + `hero-mobile.mp4` |
| Home · lista de projetos | painel que toca o vídeo | idem |
| `/apresentacoes` (hub) | card com bandeira e pôster; o **loop inteiro** toca ao passar o mouse | `deck.cover`, `deck.flags` |
| `/apresentacoes/<slug>` | a apresentação completa | `lib/decks/<site>.ts` |
| Home · "onde isso foi feito" | prova por serviço | `serviceProofs` em `lib/decks/showcase.ts` (escolha editorial) |
| Chat comercial | cita o caso | automático: `lib/chat-context.ts` lê `decks` |

## O padrão da vitrine

A vitrine é a gravação do **site de verdade em ação**, rolando e sendo usado, mostrando todos os efeitos e interações. Todo projeto tem duas:

**`vitrine-desktop`** (1280×800, mp4 sem áudio, 16–30 s, até 4 MB). É o `deck.cover`. Quatro atos:
1. **Abertura (2–3 s):** a primeira tela com a animação de entrada do site (comece depois de qualquer preloader longo).
2. **Rolagem guiada (8–14 s):** desce pelas seções na ordem do site, em ritmo de leitura, com easing (cada `scroll` com `ms` ≥ 1800). Em cada efeito-assinatura (scrub, pin, parallax, carrossel, faixa em loop) o vídeo **espera 1,5 s** para o efeito aparecer inteiro.
3. **Interações (4–8 s):** 3 a 5 interações-assinatura (passar o mouse em cards e botões, abrir menu ou modal, trocar idioma ou aba, digitar na busca, arrastar um carrossel). O cursor fica visível e cada resultado fica na tela por ≥ 1,2 s.
4. **Volta ao topo:** rola para cima e o último quadro ≈ o primeiro, para o loop fechar sem salto.

**`hero-mobile`** (390×844, sai em 520×1126, 10–20 s, até 2,5 MB). O nome é fixo porque `getShowcase()` e o capítulo "Celular" do deck procuram esse arquivo. Mesmo roteiro, curto: abertura, rolagem pelas seções, menu aberto e fechado, 1 interação por toque. Começa no topo.

Regras que valem para os dois:
- **Os 7 primeiros segundos contam mais:** a home corta em 7 s. Ponha ali a abertura, o melhor efeito e o início da rolagem. O hub toca o loop inteiro.
- **Cobertura:** todo efeito-assinatura da auditoria aparece pelo menos uma vez, e nenhuma seção importante é pulada. Se não couber em 30 s, escolha os 6 efeitos mais fortes e acelere só os trechos de rolagem (até 1,5×, com `setpts`). Nunca corte uma interação.
- **Sem tempo morto:** nada de mais de 1,5 s parado sem que algo mude na tela (o gravador só emite quadro quando algo muda: intercale movimentos do mouse nas esperas).
- **Limpeza:** esconda chat e banner de cookies (`css` no `setup` ou `cookies` no JSON), nunca envie formulário nem conclua pagamento (dados de teste só digitados), nada de tela preta/branca ou esqueleto de carregamento.
- **Conteúdo vencido** (promoção, evento que passou) aparece na gravação como está: **avise o dono**, não esconda.
- **Pôster:** o `.jpg` do quadro de ~1,2 s precisa ser bonito sozinho (é o que aparece com movimento reduzido e antes do play).
- `goto` no meio do `record` descarta o que veio antes: grave partes separadas e junte com `ffmpeg concat` (ver `build-site-deck`).

## Fluxo

Você é o orquestrador (regra global do dono): audita, decide o roteiro, revisa. Delegue ao subagent `executor` o trabalho mecânico, sempre com brief (arquivos, o que fazer, critério de pronto), e revise o resultado olhando os quadros, não só o relatório.

**0 · Intake.** Pergunte só o que faltar: slug, nome, cliente, ano, setor, **país(es)**, URL do site no ar, pasta do código, idioma do site e se há prova de Figma ou IA (sem prova, não afirmar). Bandeiras: uma por país (`🇧🇷 🇵🇹 🇫🇷 🇺🇸 …`); `🌍` só se o projeto atende o mundo todo.

**1 · Link.** `curl -sI <url>`: se redirecionar para `vercel.com/sso-api`, pare e avise o dono (Deployment Protection ligada). Sem isso o botão "Ver projeto real" leva a uma tela de login.

**2 · Auditoria.** Siga o passo 1 de `build-site-deck` (código + site no ar) e produza, além do dossiê, a **lista de efeitos e interações**: efeito | onde (seção/seletor) | quando aparece | como disparar | assinatura? Essa lista é o roteiro da vitrine.

**3 · Roteiro.** Copie `.claude/skills/add-portfolio-project/vitrine.template.json` para `scripts/deck/scenes/<site>.json` e preencha (seletores medidos no DOM, não chutados). Cada ato do padrão vira um bloco de ops; os campos `_nota` explicam o que vai onde e podem ser apagados.

**4 · Gravar e revisar.** `node scripts/deck/record-scenes.mjs <site> vitrine-desktop hero-mobile`. Monte a folha de contato:

```bash
ffmpeg -i public/decks/<dir>/vitrine-desktop.mp4 -vf "fps=1,scale=420:-1,tile=5x4" -frames:v 1 folha.png
```

Responda olhando a folha: (1) todo efeito da lista aparece? (2) o cursor está visível nas interações? (3) não há quadro preto, branco ou esqueleto? (4) o loop fecha? (5) os 7 primeiros segundos são fortes? (6) há conteúdo vencido ou placeholder? Se uma cena falhar, **diga**, não troque por imagem parada sem avisar.

**5 · Apresentação completa.** Rode `build-site-deck` para o dossiê e as demais gravações. No dossiê: `cover: desktop("vitrine-desktop", "…")` e `flags` preenchido.

**6 · Registro.** Acrescente o deck em `lib/decks/index.ts` na ordem do hub (o `index` do dossiê é a posição). Se o projeto prova um dos 3 serviços da home, inclua o slug em `serviceProofs` (`lib/decks/showcase.ts`); é escolha editorial, não obrigatória. Tudo o mais (hub, vitrine da home, chat) é automático.

**7 · Verificar.** `node scripts/deck/check-standard.mjs <slug> --net` precisa terminar sem ✖ (vitrine, arquivos, registro, link, texto). Depois os scripts de `build-site-deck` (`verify-deck`, `check-reveals`, `check-balance`, `check-overflow`) e `npx tsc --noEmit -p .`. Verifique no Playwright, nunca no Browser pane (a aba roda oculta).

**8 · Entregar.** Resuma: o que a vitrine mostra, o que foi gravado e o que falhou, os links (`/apresentacoes/<slug>` e o site real) e qualquer alerta (SSO, conteúdo vencido, afirmação que precisa da confirmação do dono).

## Estado atual

Hoje nenhum dos 8 decks tem a vitrine no padrão: as capas são loops da primeira tela. `node scripts/deck/check-standard.mjs --all` lista o que falta em cada um. Refazer as vitrines existentes é um pedido à parte.

Decisão em aberto: a vitrine da home troca de site a cada 7 s (`.stage-progress`). Para a home tocar a vitrine inteira, o tempo do palco teria de acompanhar a duração do vídeo.
