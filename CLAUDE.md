# Linkando Design — Site do Estúdio

## Visão Geral

Site de portfólio e conversão para o Linkando Design, estúdio de design de marca e desenvolvimento web com 9 anos de experiência e clientes internacionais. O objetivo principal é **fazer o site vender sozinho** — comunicar autoridade, processo e qualidade antes de qualquer conversa comercial.

Estilo visual: **maximalista-clean** — tipografia editorial grande, estrutura de grid precisa, paleta restrita com acento neon. Referências: portfólios no estilo Awwwards/Dribbble/Behance.

---

## Identidade Visual

### Cores
```
Background:   #27272B  (charcoal escuro — cor principal da marca)
Acento:       #EEFB6E  (lime neon — usado com parcimônia)
Texto:        #FFFFFF  (branco puro)
Texto suave:  rgba(255,255,255,0.6)
Labels/tags:  rgba(255,255,255,0.4)
CTA texto:    #27272B  (sobre fundo #EEFB6E)
```

### Tipografia
```
Display/Títulos:  Bricolage Grotesque — peso 800
Subtítulos:       Bricolage Grotesque — peso 500
Corpo:            Inter — peso 400
Labels/UI:        Inter — peso 600
```

Ambas as fontes via Google Fonts.

### Logo
Arquivo: `public/logo.svg`
- Ícone em `#EEFB6E`
- Wordmark em branco quando sobre fundo escuro
- Usar versão SVG inline para controle total

---

## Fluxo de design

Ao criar, redesenhar ou ajustar o visual de qualquer interface, siga a skill **`linkando-design-flow`** (`.claude/skills/linkando-design-flow/`): brief → marca → estilo de referência → taste-skill → `copywriting` (texto novo ou reescrito) → `executor` → verificação.

Quando duas fontes discordam, vence a de cima:
1. Este `CLAUDE.md` (cores, tipografia, logo, conteúdo, i18n)
2. Skills do projeto: `add-portfolio-project`, `build-site-deck`
3. `taste-skill:design-taste-frontend` e `copywriting` (texto de página; o texto fixado neste arquivo só muda se o Carlos pedir)
4. Estilos Awesome Design — só referência de grid, hierarquia, escala tipográfica e estados; nunca de paleta ou fonte
5. Verificadores: `web-design-guidelines`, `design:accessibility-review`

Estilos ativos no automático: `editorial`, `bold`, `power`, `premium`, `minimal`, `neobrutalism`. Os outros 61 só rodam se o Carlos chamar com `/nome`.

---

## Stack Técnica

```
Framework:    Next.js 14 (App Router)
Estilização:  Tailwind CSS
Animações:    Framer Motion
Deploy:       Vercel
Domínio:      linkandodesign.com
```

### Dependências principais
```bash
npm install framer-motion
npm install @next/font
```

### Estrutura de pastas
```
/app
  /page.tsx              → Home
  /trabalhos/page.tsx    → Portfólio completo
  /trabalhos/[slug]/page.tsx  → Case study individual
  /contato/page.tsx      → Contato + agente IA
/components
  /ui/                   → Componentes base (Button, Tag, etc.)
  /sections/             → Seções da home
  /layout/               → Header, Footer, Cursor
  /agent/                → Chat do agente comercial
/public
  /logo.svg
  /projects/             → Imagens dos cases
```

---

## Arquitetura de Páginas

### Home `/`

Ordem das seções:

1. **Hero** — Tagline principal + número de credibilidade + CTA
2. **Marquee** — Ticker com serviços em loop
3. **Serviços** — Cards dos 5 serviços
4. **Cases em destaque** — Grid editorial com 4 projetos
5. **Processo** — Linha do tempo da metodologia
6. **CTA Final** — Frase de encerramento + botão de contato

### Portfólio `/trabalhos`

Grid assimétrico com todos os projetos. Filtro por tipo (Branding, Site, UI/UX).

### Case Study `/trabalhos/[slug]`

Scroll storytelling:
- Header com nome do projeto, cliente, país e tipo
- Imagem hero fullscreen
- Contexto: problema + solução
- Processo em etapas visuais
- Resultado / link ao vivo
- Próximo projeto (navegação)

### Contato `/contato`

- Formulário simples (nome, email, tipo de projeto, orçamento, mensagem)
- Chat do agente IA comercial (canto inferior direito)
- Links diretos: WhatsApp e email

---

## Conteúdo

### Tagline principal (Hero)
```
Design que posiciona.
Sites que vendem.
```

Subtítulo:
```
Estúdio de marca e desenvolvimento web.
9 anos, 4 países, clientes que crescem.
```

CTA: `Iniciar projeto →`

### Serviços

| Serviço | Descrição curta |
|---|---|
| Desenvolvimento de Marca | Identidade visual estratégica do zero — naming, logo, sistema de design |
| Redesign de Identidade | Sua marca atual evoluída com intenção e coerência |
| Criação de Site | Site completo com pesquisa, prototipação e desenvolvimento |
| Landing Page | Página de produto, serviço ou lançamento focada em conversão |
| Redesign de Site | Reformulação visual e estrutural de sites existentes |

### Projetos do Portfólio

#### YANNS — yannsmusic.com
- **Tipo:** Site completo
- **País:** França 🇫🇷
- **Entregáveis:** Pesquisa, prototipação, design e desenvolvimento
- **Contexto:** Site oficial de artista musical francês com mais de 176 milhões de visualizações no YouTube. Projeto estruturado com múltiplas línguas (FR/PT/EN), integração de agenda de shows, videoclipes e coleção de merchandise.
- **Tags:** Site · Multilingual · UI/UX

#### Festival Crato — festivalcrato.pt
- **Tipo:** Site com metodologia UX
- **País:** Portugal 🇵🇹
- **Entregáveis:** Design e desenvolvimento com IA
- **Contexto:** Site para festival cultural português. Entrega rápida com metodologia UX focada em design e uso de IA no processo produtivo.
- **Tags:** Site · Festival · UX

#### Wauw — wauw.cv
- **Tipo:** Site com metodologia UX
- **País:** Cabo Verde 🇨🇻
- **Entregáveis:** Design e desenvolvimento com IA
- **Contexto:** Site desenvolvido com metodologia UX orientada por IA, entregando qualidade de design em tempo reduzido.
- **Tags:** Site · UX · IA

#### Jsynq — jsynq.com
- **Tipo:** Site
- **País:** Internacional 🌍
- **Entregáveis:** Design e desenvolvimento
- **Contexto:** Site desenvolvido pelo estúdio.
- **Tags:** Site · UI/UX

### Novo projeto no portfólio

Todo projeto novo entra como deck (`lib/decks/`), pela skill **`add-portfolio-project`**: o card ganha a **vitrine** (o site em ação: efeitos, interações e a página rolando), a apresentação completa em `/apresentacoes/<slug>`, o registro em `lib/decks/index.ts` e a verificação com `node scripts/deck/check-standard.mjs <slug> --net`. Não use `lib/projects.ts` para projetos novos.

### Processo de Trabalho

```
01 Briefing     → Entender o negócio, objetivos e público
02 Pesquisa     → Análise de mercado, concorrência e referências
03 Estratégia   → Posicionamento, arquitetura e conceito criativo
04 Design       → Identidade visual ou layout de interface
05 Prototipação → Validação antes do desenvolvimento
06 Dev          → Construção técnica com performance e responsividade
07 Entrega      → Deploy, treinamento e suporte pós-entrega
```

---

## Componentes-chave

### Cursor personalizado
Substituir cursor padrão por um ponto circular em `#EEFB6E`. Ao passar sobre links e CTAs, o cursor expande com blend mode `mix-blend-mode: difference`.

### Marquee (ticker)
Faixa horizontal com scroll infinito exibindo:
```
Desenvolvimento de Marca · Redesign de Identidade · Criação de Site · Landing Page · UI/UX · Redesign de Site ·
```
Cor do texto: `#EEFB6E` sobre `#27272B`. Velocidade moderada, pausa no hover.

### Animações com Framer Motion
- Fade + translateY nas seções ao entrar no viewport (Intersection Observer)
- Transições de página com `AnimatePresence`
- Hover nos cards de projeto: escala leve + reveal de overlay com texto
- Stagger nos itens de lista

### Agente Comercial IA

Chat flutuante no canto inferior direito, aberto pelos botões "Solicitar diagnóstico". A IA conduz o **diagnóstico** inteiro (`app/api/chat/route.ts` + prompt em `lib/chat-context.ts`): entende o projeto, pede nome e e-mail no meio da conversa, resume, confirma e fecha avisando que a proposta chega por e-mail em até 24h; a conversa vai ao time por `/api/chat/lead`. Cita os cases (os 8 decks de `/apresentacoes`), conhece a tabela de preços/prazos, não inventa valores nem fatos do estúdio, não promete resultado, data ou desconto e tem piso de R$ 1.500. O formulário `/briefing` é a alternativa. Fluxo, regras, travas e como testar: `docs/chat-diagnostico.md`.

Provedores (ver `.env.local.example`): **Gemini no plano gratuito** primeiro (`GEMINI_API_KEY`), **Claude** opcional (`ANTHROPIC_API_KEY`, modelo em `ANTHROPIC_MODEL`, padrão `claude-sonnet-5-5`; `CHAT_PROVIDER=claude` o coloca como primeiro). **Fallback:** sem chave (ou com as APIs fora do ar), o chat usa as respostas roteirizadas abaixo em JavaScript puro — o site nunca quebra.

**Fluxo do agente:**
```
1. Apresentação automática ao abrir
2. Pergunta sobre tipo de projeto
3. Qualificação: prazo e orçamento estimado
4. Resposta sobre o serviço + próximos passos
5. CTA final: WhatsApp ou email
```

**Respostas configuradas para:**
- "quanto custa" / "preço" / "valor"
- "prazo" / "tempo" / "quanto tempo"
- "como funciona" / "processo"
- "quais serviços"
- "quero um orçamento"
- "portfolio" / "trabalhos anteriores"

**Script de respostas (base):**

```javascript
const responses = {
  greeting: "Olá! Sou o assistente do Linkando Design. Como posso ajudar? Está pensando em um projeto de marca ou site?",
  
  pricing: {
    brand: "Desenvolvimento de marca a partir de R$ 8.000 (Brasil) ou €2.000 (Europa/EUA). O valor final depende da complexidade do projeto.",
    site: "Sites completos a partir de R$ 6.000. Landing pages a partir de R$ 3.500. Quer me contar mais sobre o seu projeto?",
    redesign: "Redesigns de identidade a partir de R$ 5.000. Redesigns de site a partir de R$ 6.000.",
    general: "Os valores variam conforme o escopo. Me conta o que você precisa e consigo dar uma estimativa mais precisa."
  },
  
  deadline: "Depende do serviço: landing pages em 1–2 semanas, sites completos em 4–8 semanas, branding completo em 3–6 semanas. Tem uma data específica em mente?",
  
  process: "Nosso processo tem 7 etapas: Briefing → Pesquisa → Estratégia → Design → Prototipação → Desenvolvimento → Entrega. Cada etapa é validada com o cliente antes de avançar.",
  
  services: "Trabalhamos com: Desenvolvimento de Marca, Redesign de Identidade, Criação de Site, Landing Page e Redesign de Site. Qual desses faz mais sentido para você agora?",
  
  portfolio: "Nosso portfólio inclui projetos em França, Portugal, Cabo Verde e outros países. Você pode ver os cases completos aqui mesmo no site. Quer que eu te conte sobre algum projeto específico?",
  
  cta: "Quer dar o próximo passo? Pode me chamar no WhatsApp para uma conversa rápida, ou preencher o formulário de contato que respondemos em até 24h."
}
```

---

## Idiomas (i18n)

Site bilíngue com detecção geográfica:
- **Brasil → português (`/pt`)** · **demais países → inglês (`/en`)**
- `middleware.ts` detecta o país (geo da Vercel em produção; `Accept-Language` em dev) e redireciona caminhos sem locale. Cookie `NEXT_LOCALE` persiste a escolha; o seletor **PT · EN** no header permite override manual.
- Rotas em `app/[locale]/…`, conteúdo nos dicionários de `lib/i18n.ts`, projetos com textos por idioma em `lib/projects.ts` (`getProjects(locale)`).
- O agente IA responde no idioma da versão visitada (hint de locale no system prompt) e o fallback offline tem scripts PT e EN.

---

## Responsividade

Mobile-first. Breakpoints:
```
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

Ajustes principais no mobile:
- Tipografia display reduzida (~50% do tamanho desktop)
- Grid de 1 coluna
- Marquee mantida
- Agente IA ocupa 90% da largura da tela
- Cursor personalizado desativado (touch devices)

---

## Performance

- Imagens com `next/image` (lazy load automático)
- Fontes com `next/font` (zero layout shift)
- Animações com `will-change: transform` apenas quando necessário
- Sem bibliotecas desnecessárias além das listadas

---

## SEO

```
title: "Linkando Design — Estúdio de Marca e Desenvolvimento Web"
description: "Estúdio especializado em identidade visual, branding e desenvolvimento de sites. 9 anos de experiência, clientes em 4 países."
og:image: /og-image.jpg (1200x630)
```

---

## Ordem de Construção Recomendada

```
1. Setup do projeto Next.js + Tailwind + Framer Motion
2. Design system (cores, tipografia, componentes base)
3. Layout global (Header + Footer + Cursor)
4. Home — seção Hero
5. Home — Marquee
6. Home — Serviços
7. Home — Cases em destaque
8. Home — Processo
9. Home — CTA Final
10. Página /trabalhos (grid de portfólio)
11. Página /trabalhos/[slug] (case study)
12. Página /contato + Agente IA
13. Responsividade geral
14. Animações e polish
15. SEO e deploy na Vercel
```

---

## Contato / Links do Estúdio

```
Site:       linkandodesign.com
Email:      (adicionar)
WhatsApp:   (adicionar)
Instagram:  (adicionar)
LinkedIn:   (adicionar)
Behance:    (adicionar)
```

*Preencher os campos acima antes do deploy.*
