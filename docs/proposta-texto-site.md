# Proposta: texto do site alinhado ao CLAUDE.md

Rascunho para revisão. Nada disto foi gravado em `lib/i18n.ts`. Apague este arquivo depois de aplicar.

**Diagnóstico (copywriting):** situação B no hero, serviços e método: o estúdio tem voz própria (direta, de negócios) e o argumento mudou, então mantenho o tom e troco o ângulo. Situação A em diferencial, FAQ e Sobre, onde o texto antigo falava de operação e sistemas, que o `CLAUDE.md` não tem.
**Fontes dos fatos:** só `CLAUDE.md` (tagline, subtítulo, 5 serviços, 7 etapas, prazos, SEO, "9 anos", "4 países", "da França a Cabo Verde") e as regras do chat (proposta por e-mail em até 24h). Nada inventado.

---

## 1. Português

### meta (SEO, texto exato do CLAUDE.md)
- `meta.title`
  - Antes: Linkando Design — Design de interfaces, sites e marcas
  - Depois: Linkando Design — Estúdio de Marca e Desenvolvimento Web
- `meta.description`
  - Antes: Desenhamos interfaces limpas e organizadas para facilitar a gestão da sua empresa e transformar visitantes em clientes. 9 anos, clientes em 4 países.
  - Depois: Estúdio especializado em identidade visual, branding e desenvolvimento de sites. 9 anos de experiência, clientes em 4 países.

### Hero
- `home.hero.eyebrow`
  - Antes: Portfólio — marcas, sites e sistemas
  - Depois: Portfólio de marcas e sites
- `home.hero.title1` / `title2`
  - Antes: O digital da sua empresa / não precisa ser complicado.
  - Depois: Design que posiciona. / Sites que vendem.
- `home.hero.text`
  - Antes: Site que não gera contatos ou sistema que trava a equipe? Vamos transformar isso em mais vendas.
  - Depois: Estúdio de marca e desenvolvimento web. 9 anos, 4 países, clientes que crescem.
- CTA e botão secundário ficam como estão ("Solicitar diagnóstico", "Ver projetos").

### Diferencial (faixa escura)
- `home.band.title`
  - Antes: Você não precisa ter todas as respostas prontas.
  - Depois: Pesquisa e estratégia antes de qualquer tela.
- `home.band.text`
  - Antes: Nós não trabalhamos com achismos visuais. Usamos medidas exatas e padrões rigorosos de design para organizar cada tela. O resultado prático disso? O sistema fica extremamente intuitivo, o site não quebra e a sua equipe não precisa de um manual de instruções para usar o que criamos.
  - Depois: Antes de desenhar, entendemos o negócio, analisamos mercado e concorrência e definimos posicionamento e conceito. Depois vêm design e prototipação, para você validar antes de começarmos a desenvolver.
- `home.diff.text` (não aparece na tela, alimenta o chat)
  - Antes: (mesmo texto antigo da faixa)
  - Depois: Estúdio de marca e desenvolvimento web. Pesquisa, estratégia e prototipação vêm antes do desenvolvimento, em 7 etapas, e cada etapa é validada com o cliente antes de avançar. 9 anos de experiência, clientes em 4 países.

### Serviços (3 cartões cobrindo os 5 serviços)
- `home.services.title`
  - Antes: Onde dói na sua empresa hoje?
  - Depois: Do que a sua empresa precisa agora?
- 001
  - Antes: **A marca não passa credibilidade.** A primeira impressão decide a venda. Criamos identidades visuais que transmitem o nível de profissionalismo que a sua empresa realmente tem, para você cobrar o valor justo pelo seu serviço.
  - Depois: **Uma marca que posiciona.** Desenvolvimento de Marca cria a identidade visual estratégica do zero, com naming, logo e sistema de design. Redesign de Identidade evolui a marca que você já tem, com intenção e coerência.
- 002
  - Antes: **O site é bonito, mas não vende.** Um site confuso afasta clientes. Desenhamos páginas limpas e rápidas. O objetivo é pegar o visitante pela mão e levá-lo direto para o botão de contato. Simples assim.
  - Depois: **Um site que vende.** Criação de Site entrega o site completo, com pesquisa, prototipação e desenvolvimento. Redesign de Site reformula o visual e a estrutura de um site que já existe.
- 003
  - Antes: **A operação virou uma bagunça.** (sistemas internos)
  - Depois: **Uma landing page que converte.** Página de produto, serviço ou lançamento focada em conversão, do design ao desenvolvimento.

### Método
- `home.method.title`
  - Antes: Sem surpresas no fim do mês.
  - Depois: Sete etapas, cada uma validada com você.
- `home.method.text`
  - Antes: Acreditamos que previsibilidade é tudo em um negócio. Trabalhamos com um cronograma estruturado e etapas de aprovação bem definidas. Assim, você acompanha a evolução do design com segurança, tendo clareza de como a solução está ganhando forma, sem pressa desnecessária e sem retrabalho.
  - Depois: Você acompanha o projeto do briefing à entrega e aprova cada etapa antes de a próxima começar.
- Etapas (hoje 4: Diagnóstico, Estrutura, Design, Entrega)
  - 01 Briefing: Entendemos o negócio, os objetivos e o público.
  - 02 Pesquisa: Analisamos mercado, concorrência e referências.
  - 03 Estratégia: Definimos posicionamento, arquitetura e conceito criativo.
  - 04 Design: Criamos a identidade visual ou o layout da interface.
  - 05 Prototipação: Validamos com você antes de desenvolver.
  - 06 Desenvolvimento: Construímos com foco em performance e responsividade.
  - 07 Entrega: Publicamos, treinamos a sua equipe e damos suporte depois da entrega.

### FAQ (hoje 3 perguntas, passa a 4)
- Quanto custa?
  - Depois: O valor depende do escopo de cada projeto. Depois do diagnóstico, enviamos a proposta por e-mail em até 24h, com prazos e valores.
- Quanto tempo demora?
  - Antes: Cada projeto exige um nível de arquitetura diferente. Na nossa fase de diagnóstico, mapeamos o cenário corporativo e definimos um cronograma realista. [...]
  - Depois: Depende do serviço: landing page em 1 a 2 semanas, site completo em 4 a 8, branding completo em 3 a 6. São estimativas; a proposta traz o cronograma do seu projeto.
- Como funciona?
  - Depois: São sete etapas: briefing, pesquisa, estratégia, design, prototipação, desenvolvimento e entrega. Você valida cada uma antes de a próxima começar.
- O que eu preciso ter para começar?
  - Antes: Apenas saber qual é o gargalo da sua empresa hoje. Não se preocupe em ter um planejamento perfeito, o desenho da solução nós fazemos juntos.
  - Depois: Só precisa saber o que quer resolver. O diagnóstico, pelo chat ou pelo formulário de briefing, ajuda a organizar o resto, e você não precisa ter tudo definido.
- Sai a pergunta "O sistema vai ser difícil de usar?" (era sobre sistemas internos).

### Rodapé
- `footer.title`
  - Antes: Vamos organizar a casa?
  - Depois: Vamos começar o seu projeto?

### Sobre
- `about.title`
  - Antes: Design que organiza a operação e sustenta o crescimento.
  - Depois: Um estúdio de marca e desenvolvimento web.
- `about.text`
  - Antes: O Linkando Design é um estúdio de design de interfaces, sites e marcas. Em 9 anos, atendemos empresas em 4 países — da França a Cabo Verde — desenhando produtos digitais que as equipes usam todos os dias sem precisar de manual.
  - Depois: O Linkando Design é um estúdio de marca e desenvolvimento web. Em 9 anos, atendemos clientes em 4 países, da França a Cabo Verde, criando identidades visuais e sites que posicionam e vendem.
- `about.authority.text`
  - Antes: Trabalhamos onde a rotina trava: telas confusas, processos espalhados e marcas que não acompanham mais o tamanho do negócio. [...]
  - Depois: Criamos identidades visuais do zero, evoluímos marcas que já existem e construímos sites e landing pages, da pesquisa à entrega. Marca e site saem do mesmo estúdio.
- `about.method.title` / `text`
  - Antes: Por que o método importa. / Planejamento sólido e etapas de validação rigorosas são o que separam uma interface definitiva de um retrabalho caro. [...]
  - Depois: O método em sete etapas. / Do briefing à entrega, são sete etapas. Pesquisa, estratégia e prototipação vêm antes do desenvolvimento, e cada etapa é validada com você antes de avançar.
- `about.stats` (a faixa escura usa as duas primeiras)
  - Antes: 9 anos de estúdio · 4 países atendidos · 100% projetos entregues no ar
  - Depois: 9 anos de estúdio · 4 países atendidos · 7 etapas, cada uma validada com você

### Páginas de projeto e portfólio
- `project.ctaTitle`
  - Antes: Sua empresa tem um gargalo parecido?
  - Depois: Tem um projeto parecido?
- `project.ctaText`
  - Antes: Vamos mapear o seu cenário e desenhar o melhor caminho. Papo rápido, sem compromisso.
  - Depois: Conte o que você precisa e desenhamos o melhor caminho. Papo rápido, sem compromisso.
- `portfolio.text` e `project.deviceMobile` (correção de idioma, site pt-BR)
  - Antes: "...gravada em computador e telemóvel." / "Telemóvel"
  - Depois: "...gravada em computador e celular." / "Celular"

---

## 2. English (mesma estrutura)

### meta
- `meta.title`
  - Before: Linkando Design — Interface, website and brand design
  - After: Linkando Design — Brand and Web Development Studio
- `meta.description`
  - Before: We design clean, organised interfaces that make your company easier to run and turn visitors into clients. 9 years, clients across 4 countries.
  - After: A studio specialised in visual identity, branding and website development. 9 years of experience, clients in 4 countries.

### Hero
- eyebrow
  - Before: Portfolio — brands, websites and systems
  - After: Portfolio of brands and websites
- title
  - Before: Your company's digital side / doesn't have to be complicated.
  - After: Design that positions. / Websites that sell.
- text
  - Before: A website that doesn't bring in enquiries, or a system that slows your team down? Let's turn that into more sales.
  - After: Brand and web development studio. 9 years, 4 countries, clients that grow.

### Diferencial
- title
  - Before: You don't need to have all the answers ready.
  - After: Research and strategy before any screen.
- text
  - Before: We don't design on gut feeling. We use exact measurements and strict design standards [...]
  - After: Before designing, we learn the business, analyse the market and competitors, and define positioning and concept. Design and prototyping come next, so you can validate before we start developing.
- `home.diff.text` (feeds the chat)
  - After: A brand and web development studio. Research, strategy and prototyping come before development, in 7 stages, and each stage is approved by the client before moving on. 9 years of experience, clients in 4 countries.

### Services
- title
  - Before: Where does it hurt in your company today?
  - After: What does your company need right now?
- 001
  - Before: The brand doesn't look credible.
  - After: **A brand that positions.** Brand Development builds a strategic visual identity from scratch, with naming, logo and design system. Identity Redesign evolves the brand you already have, with intent and coherence.
- 002
  - Before: The site looks good but doesn't sell.
  - After: **A website that sells.** Website Creation delivers the complete site, with research, prototyping and development. Website Redesign reworks the look and structure of a site that already exists.
- 003
  - Before: The operation has become a mess.
  - After: **A landing page that converts.** A product, service or launch page focused on conversion, from design to development.

### Method
- title
  - Before: No surprises at the end of the month.
  - After: Seven stages, each one approved by you.
- text
  - After: You follow the project from briefing to delivery and approve each stage before the next one starts.
- Stages
  - 01 Briefing: We learn the business, the goals and the audience.
  - 02 Research: We analyse the market, competitors and references.
  - 03 Strategy: We define positioning, architecture and creative concept.
  - 04 Design: We create the visual identity or the interface layout.
  - 05 Prototyping: We validate with you before developing.
  - 06 Development: We build with a focus on performance and responsiveness.
  - 07 Delivery: We publish, train your team and support you after delivery.

### FAQ
- How much does it cost? It depends on the scope of each project. After the diagnosis, we send the proposal by email within 24 hours, with timelines and values.
- How long does it take? It depends on the service: landing pages in 1 to 2 weeks, complete websites in 4 to 8, full branding in 3 to 6. These are estimates; the proposal sets the schedule for your project.
- How does it work? Seven stages: briefing, research, strategy, design, prototyping, development and delivery. You approve each one before the next starts.
- What do I need to get started? Just an idea of what you want to solve. The diagnosis, by chat or through the briefing form, helps organise the rest, and you don't need everything defined.

### Footer
- Before: Shall we tidy the house? → After: Shall we start your project?

### About
- title: A brand and web development studio.
- text: Linkando Design is a brand and web development studio. Over 9 years we've worked with clients in 4 countries, from France to Cape Verde, creating visual identities and websites that position and sell.
- authority.text: We create visual identities from scratch, evolve brands that already exist, and build websites and landing pages, from research to delivery. Brand and site come from the same studio.
- method: The method in seven stages. / Seven stages, from briefing to delivery. Research, strategy and prototyping come before development, and each stage is approved by you before moving on.
- stats: 9 years as a studio · 4 countries served · 7 stages, each approved by you (before: 100% projects shipped live)

### Project pages
- ctaTitle: Have a similar project?
- ctaText: Tell us what you need and we'll design the best way forward. Quick chat, no strings.

---

## 3. Fica igual (de propósito)
- Botões "Solicitar diagnóstico" / "Ver projetos" / "Falar no WhatsApp", menu e rodapé de navegação.
- Seção "Projetos de 2026" e a faixa "sites entregues em 2026".
- Saudação do chat e rótulos do briefing ("o que está travando hoje?"). Seguem o fluxo documentado em `docs/chat-diagnostico.md`.

## 4. Mudanças fora de `lib/i18n.ts` que esta troca exige
O chat monta o prompt a partir deste dicionário e tem rótulos próprios em `lib/chat-context.ts`:
- Linhas 189 e 332: a apresentação diz "estúdio de design de interfaces, sites, marcas e sistemas internos" → "estúdio de marca e desenvolvimento web" (PT e EN).
- Linhas 296 e 440: "As três dores que resolvemos" → "Os serviços" (agora os cartões são serviços, não dores).
- Linhas 305 e 449: "Processo (4 etapas...)" → "Processo (7 etapas...)".
- A linha de serviços com "sistemas internos" (e a mesma menção em `ChatAgent.tsx`, linhas 30 e 52) fica como está até você decidir se sistemas internos são um serviço.

## 5. O que eu não resolvo aqui (precisa de você)
1. **"4 países" ao lado de 5 bandeiras.** O hero lista Portugal, França, Cabo Verde, EUA e Brasil logo abaixo do texto "4 países". É código do componente (`HomeHero.tsx`), não texto.
2. **Provas dos cartões de serviço.** `lib/decks/showcase.ts` liga cada cartão a 2 sites, por posição. Hoje: cartão 1 = Cinnamon e Viva o Samba, cartão 2 = Collision e AZ, cartão 3 = Tickett e Station One. Nenhum dos 8 decks é um trabalho de marca, e Collision e AZ são páginas de captação (landing). Sugiro: cartão 1 sem prova de marca (decidir), cartão 2 com sites completos, cartão 3 com Collision e AZ.
3. **"Clientes que crescem"** (subtítulo do `CLAUDE.md`) não tem prova no projeto. Mantive por estar no `CLAUDE.md`.
4. **Layout do método:** 7 etapas na grade de 4 colunas viram 4 + 3 no desktop.
5. **CTA** "Iniciar projeto →" (hero no `CLAUDE.md`) ou "Solicitar diagnóstico" (como está)?
