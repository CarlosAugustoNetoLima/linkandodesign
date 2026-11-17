---
name: linkando-design-flow
description: Fluxo de design do Linkando Design — encadeia brief, regras da marca, estilo de referência, critério de gosto (taste-skill), texto (copywriting), implementação pelo executor e verificação sempre que uma interface do site é criada, redesenhada ou ajustada visualmente, ou o texto dela é escrito ou reescrito.
when_to_use: quando o usuário pedir para criar, redesenhar, melhorar ou ajustar o visual ou o texto de uma seção, página, componente, card, vitrine ou deck do site, ou disser que algo está genérico, feio, sem identidade ou com cara de IA
---

# Fluxo de design do Linkando

Esta skill não desenha nada sozinha: define **a ordem** em que as outras skills entram e **quem vence** quando duas discordam. A identidade do estúdio é fixa; as skills de estilo só ajudam a executá-la melhor.

## Quem vence (de cima para baixo)

1. **`CLAUDE.md` do projeto** — cores, tipografia, logo, conteúdo, i18n, responsividade, performance. Nada abaixo muda isso.
2. **Skills do projeto** — `add-portfolio-project` e `build-site-deck`. Se o pedido é projeto novo ou deck, siga a skill inteira; este fluxo só complementa. Em decks, o palco veste a identidade do site apresentado e só a moldura veste a marca Linkando.
3. **`taste-skill:design-taste-frontend` e `copywriting`** — critério contra o visual genérico e gate de acabamento (taste-skill); texto de página sem cara de IA e sem afirmação sem prova (copywriting). O texto já fixado no `CLAUDE.md` (tagline, subtítulo, serviços, descrição dos projetos) só muda se o Carlos pedir.
4. **Estilos Awesome Design** — referência, nunca receita.
5. **Verificadores** (`web-design-guidelines`, `design:accessibility-review`) — apontam problemas; a decisão segue a ordem acima.

## Passos

Pule o que não se aplica: um ajuste de espaçamento não precisa de brainstorming nem de taste-skill.

1. **Brief.** Coisa nova ou mudança de comportamento: `superpowers:brainstorming` primeiro. Registre em 2–3 linhas o que a seção precisa comunicar e qual ação espera do visitante.
2. **Marca.** Releia "Identidade Visual" e "Componentes-chave" do `CLAUDE.md`. Cores e fontes vêm de lá, sem exceção.
3. **Estilo de referência.** Escolha **um** (no máximo dois) da tabela abaixo e invoque com a ferramenta Skill. Extraia só: grid, proporção da escala tipográfica, hierarquia, estados de interação e ritmo de espaçamento. Descarte paleta, fontes, raios e sombras que contradigam a marca.
4. **Gosto.** Página ou seção nova, ou reforma: invoque `taste-skill:design-taste-frontend`. Ajuste pontual: não invoque.
5. **Texto.** Texto novo ou reescrito (hero, seção, CTA, página): invoque `copywriting`. Ela diagnostica antes (do zero, voz existente ou edição pontual) e só escreve o que consegue sustentar. Números e afirmações sobre o estúdio vêm do `CLAUDE.md` ou de evidência real; sem isso fica `[NEED: ...]`, nunca invente. Entregue PT e EN, nos dicionários de `lib/i18n.ts`. Troca de uma palavra ou de um CTA não precisa da skill.
6. **Construção.** Delegue ao `executor` (fluxo do `~/.claude/CLAUDE.md`). O brief leva: arquivos, o brief do passo 1, os tokens da marca, as regras extraídas no passo 3 e o critério de pronto. Decisão de design é sua, não do executor.
7. **Verificação.** Antes de dar por concluído:
   - preview no navegador em desktop e 375px, rolando de verdade para ver os efeitos de scroll;
   - `web-design-guidelines` nos arquivos alterados;
   - `design:accessibility-review` se mudou estrutura, contraste ou foco;
   - texto novo: nenhum `[NEED: ...]` aberto no que foi entregue e o mesmo conteúdo existe em PT e EN;
   - `npm run lint` e `npx tsc --noEmit`;
   - deck: `node scripts/deck/check-standard.mjs <slug> --net`.

   Corrija o que for achado real. O que contradiz a marca, registre e siga a marca.

## Estilos ativos

Só estes seis carregam sozinhos. Escolha pelo que a peça precisa:

| Estilo | Use em | Tome | Ignore |
|---|---|---|---|
| `editorial` | títulos grandes, case studies, textos longos | grade, medida de linha, hierarquia de leitura | serifas, paleta |
| `bold` | hero, CTA, números de credibilidade | peso tipográfico, contraste de escala | cores |
| `power` | seções escuras, cards de serviço | monocromia, títulos fortes, respiro | tons fora do charcoal/lime |
| `premium` | acabamento geral, hovers, espaçamento | precisão de espaçamento, estados refinados | fontes |
| `minimal` | processo, formulários, rodapé | respiro, contenção | — |
| `neobrutalism` | tags, botões, destaques em lime (uso pontual) | bordas firmes, contraste duro | cores vivas além do lime, fundos quentes |

Os outros 61 estilos estão desligados do automático (`disable-model-invocation: true` em `~/.claude/skills/<nome>/SKILL.md`) e só rodam se o Carlos chamar com `/nome`. Para ativar um, remova essa linha.

## Conflitos conhecidos (skills × Linkando)

Identificados na leitura das regras da taste-skill e da copywriting; leia a skill se surgir outro.

- **Fotos.** Ela aceita fotografias licenciadas "de apoio". Aqui as imagens são capturas reais dos cases (`public/projects/`, `public/decks/`); nunca use foto de banco no lugar de case.
- **Contatos.** Ela manda contatos em `.example` e sem telefone em formato real. Vale para sites fictícios; no site do estúdio os contatos reais entram quando o Carlos fornecer (ver `docs/lancamento.md`). Nunca invente.
- **Movimento.** Cursor próprio, marquee e animações com Framer Motion do `CLAUDE.md` valem mesmo que a taste-skill peça menos.
- **Gate.** Se o gate reprovar por regra que contradiz a marca, siga a marca e avise o Carlos no fechamento.
- **Idioma.** As listas de frases proibidas da `copywriting` são em inglês. Em PT aplique o mesmo critério (por exemplo "Mais do que X, é Y", "Descubra o poder de", listas de "sem X, sem Y"), sem traduzir a lista ao pé da letra.
