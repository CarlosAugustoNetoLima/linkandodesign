# Playbook do diagnóstico

Como editar: cada linha `- [id] Pergunta em português | Question in English` vira uma pergunta do chat; para mudar o peso, mova a linha entre "Obrigatório antes do e-mail", "Bom saber" e "Alerta" (no alerta, o texto diz quando o aviso acende no seu e-mail).
O id entre colchetes é interno: letras minúsculas, números e `_`; não troque o id de uma pergunta que já existe e, para a mesma pergunta valer em dois tipos, repita a linha com o mesmo id e o mesmo texto.
Ao salvar e subir, o deploy da Vercel atualiza o chat sozinho (para testar no computador: `npm run playbook`); se o arquivo tiver erro, o build para e mostra a linha.

Nome e e-mail não ficam aqui: o chat pede sempre no fim, depois de todos os obrigatórios. Preço nunca é dito no chat.

## Comum

### Obrigatório antes do e-mail
- [business] O que você faz e para quem vende? | What do you do, and who do you sell to?
- [problem] O que está travando hoje e o que você espera do resultado? | What is holding you back today, and what do you expect from the result?
- [services] O que você quer criar: marca, site, landing page, sistema, redesign, ou ainda não sabe? | What do you want to create: a brand, website, landing page, system, redesign, or not sure yet?
- [current] O que já existe hoje: site, marca, logo, materiais? | What already exists today: website, brand, logo, materials?
- [deadline] Para quando você precisa, e por quê? Tem alguma data fixa, como lançamento ou evento? | When do you need it, and why? Is there a fixed date, such as a launch or event?
- [budget] Você tem uma faixa de investimento em mente, ou prefere conversar sobre isso na proposta? | Do you have an investment range in mind, or would you rather discuss it in the proposal?
- [decision] Quem decide a contratação: só você ou mais alguém? | Who makes the hiring decision: just you, or someone else too?

### Bom saber
- [company] Qual é o nome da empresa? | What is the company name?
- [reference] Tem o link do site atual ou de uma referência que você gosta? | Do you have a link to your current site or to a reference you like?
- [source] Como você conheceu o estúdio? | How did you hear about the studio?

### Alerta
- [deadline_short] O prazo que o cliente quer é menor que a faixa típica do serviço (landing 1–2 semanas, site 4–8, marca 3–6; somadas quando há mais de um serviço) | The requested timeline is shorter than the typical range for the service
- [budget_low] O investimento declarado está abaixo do mínimo da base interna para o serviço (o servidor calcula, pela base de valores) | The stated investment is below the internal minimum for the service
- [not_decider] Quem conversa não decide sozinho: a decisão é de outra pessoa ou é dividida (sócio, diretoria) | The person chatting does not decide alone

## Marca

### Obrigatório antes do e-mail
- [brand_name] O nome da marca já está definido ou você precisa de ajuda para criar o nome? | Is the brand name already set, or do you need help creating it?
- [brand_registry] Se o nome já existe, ele tem registro no INPI ou em outro órgão, ou o pedido está em andamento? | If the name exists, is it registered with the INPI or another office, or is the application in progress?
- [brand_availability] O domínio do site e o @ nas redes com esse nome estão livres ou já são seus? | Are the website domain and the social media handle with that name available or already yours?
- [brand_audience] Para quem é a marca: quem é o público que você quer atrair? | Who is the brand for: which audience do you want to attract?
- [brand_message] Que valores e que personalidade a marca precisa transmitir? | Which values and personality does the brand need to convey?
- [brand_usage] Onde a marca vai aparecer mais: digital, impresso, embalagem, fachada, uniforme? | Where will the brand appear most: digital, print, packaging, signage, uniforms?
- [brand_references] Tem marcas que você ama e outras que não quer parecer de jeito nenhum? | Are there brands you love, and others you definitely don't want to look like?

### Bom saber
- [brand_competitors] Quem são os seus principais concorrentes? | Who are your main competitors?

### Alerta
- [name_unavailable] O nome que o cliente quer não tem domínio ou @ disponível, já tem registro de outra pessoa, ou ele não sabe e não verificou | The desired name has no available domain or handle, is registered by someone else, or was never checked

## Redesign de identidade

### Obrigatório antes do e-mail
- [identity_issues] O que não funciona na marca atual? | What doesn't work in the current brand?
- [identity_keep] Tem algo da marca atual que precisa ser mantido, como nome, cor ou símbolo? | Is there anything in the current brand that must be kept, such as the name, a colour or the symbol?
- [brand_audience] Para quem é a marca: quem é o público que você quer atrair? | Who is the brand for: which audience do you want to attract?
- [brand_usage] Onde a marca vai aparecer mais: digital, impresso, embalagem, fachada, uniforme? | Where will the brand appear most: digital, print, packaging, signage, uniforms?
- [brand_references] Tem marcas que você ama e outras que não quer parecer de jeito nenhum? | Are there brands you love, and others you definitely don't want to look like?

### Bom saber
- [brand_registry] Se o nome já existe, ele tem registro no INPI ou em outro órgão, ou o pedido está em andamento? | If the name exists, is it registered with the INPI or another office, or is the application in progress?
- [brand_competitors] Quem são os seus principais concorrentes? | Who are your main competitors?
- [brand_files] Você tem os arquivos originais da marca atual (vetor, manual)? | Do you have the original files of the current brand (vector, guidelines)?

### Alerta
- [no_brand_files] O cliente não tem os arquivos originais da marca atual e quer manter algum elemento dela | The client lacks the original brand files but wants to keep elements of it

## Site

### Obrigatório antes do e-mail
- [site_goal] Qual é o objetivo principal do site e qual ação a pessoa deve fazer nele: pedir orçamento, comprar, agendar? | What is the site's main goal, and what should visitors do on it: request a quote, buy, book?
- [site_pages] Quais páginas ou seções você imagina? | Which pages or sections do you have in mind?
- [site_content] Quem vai fornecer os textos e as fotos? | Who will provide the copy and photos?
- [site_domain] Você já tem domínio? Onde ele está registrado e quem tem o acesso? | Do you already have a domain? Where is it registered, and who has access?
- [site_hosting] Já existe hospedagem? Com quem está e quem tem o acesso? | Is there hosting already? With which provider, and who has access?
- [site_features] Precisa de alguma integração ou funcionalidade, como agenda, CRM, pagamento, loja ou formulário? | Do you need any integration or feature, such as booking, CRM, payments, a shop or forms?
- [site_languages] Em quais idiomas o site precisa estar? | Which languages does the site need?
- [site_maintenance] Depois de pronto, quem vai atualizar o site? | Once it's live, who will update the site?

### Bom saber
- [site_email] Vocês já têm e-mail profissional com o domínio da empresa? | Do you already have professional email on the company domain?
- [site_analytics] Vocês têm acesso ao Google Analytics e ao Search Console do site? | Do you have access to the site's Google Analytics and Search Console?

### Alerta
- [no_domain_access] O cliente não tem acesso ao domínio ou não sabe quem tem (ex.: quem fez o site antigo) | The client has no access to the domain or doesn't know who has it
- [no_content] O cliente não tem textos nem fotos e espera que o estúdio produza (produção de conteúdo pode ficar fora do escopo) | The client has no copy or photos and expects the studio to produce them

## Redesign de site

### Obrigatório antes do e-mail
- [site_current_issues] Qual é o link do site atual e o que não funciona nele hoje? | What is the link to the current site, and what doesn't work on it today?
- [site_goal] Qual é o objetivo principal do site e qual ação a pessoa deve fazer nele: pedir orçamento, comprar, agendar? | What is the site's main goal, and what should visitors do on it: request a quote, buy, book?
- [site_pages] Quais páginas ou seções você imagina? | Which pages or sections do you have in mind?
- [site_content] Quem vai fornecer os textos e as fotos? | Who will provide the copy and photos?
- [site_domain] Você já tem domínio? Onde ele está registrado e quem tem o acesso? | Do you already have a domain? Where is it registered, and who has access?
- [site_hosting] Já existe hospedagem? Com quem está e quem tem o acesso? | Is there hosting already? With which provider, and who has access?
- [site_features] Precisa de alguma integração ou funcionalidade, como agenda, CRM, pagamento, loja ou formulário? | Do you need any integration or feature, such as booking, CRM, payments, a shop or forms?
- [site_languages] Em quais idiomas o site precisa estar? | Which languages does the site need?
- [site_maintenance] Depois de pronto, quem vai atualizar o site? | Once it's live, who will update the site?
- [site_analytics] Vocês têm acesso ao Google Analytics e ao Search Console do site? | Do you have access to the site's Google Analytics and Search Console?

### Bom saber
- [site_email] Vocês já têm e-mail profissional com o domínio da empresa? | Do you already have professional email on the company domain?

### Alerta
- [no_domain_access] O cliente não tem acesso ao domínio ou não sabe quem tem (ex.: quem fez o site antigo) | The client has no access to the domain or doesn't know who has it
- [no_hosting_access] O cliente não sabe onde está a hospedagem ou não tem o acesso | The client doesn't know where the hosting is or has no access
- [no_content] O cliente não tem textos nem fotos e espera que o estúdio produza (produção de conteúdo pode ficar fora do escopo) | The client has no copy or photos and expects the studio to produce them

## Landing page

### Obrigatório antes do e-mail
- [landing_offer] Qual é a oferta ou o produto da página? | What is the offer or product of the page?
- [landing_action] O que a pessoa deve fazer na página: comprar, se cadastrar ou entrar em contato? | What should people do on the page: buy, sign up or get in touch?
- [landing_traffic] De onde vão vir as visitas: anúncios, Instagram, e-mail? | Where will the visits come from: ads, Instagram, email?
- [landing_tracking] Vai precisar de pixel ou de medição, como Meta, Google Ads ou Analytics? | Will you need a pixel or tracking, such as Meta, Google Ads or Analytics?
- [landing_campaign] Quando a campanha começa e até quando vai? | When does the campaign start, and how long will it run?
- [site_domain] Você já tem domínio? Onde ele está registrado e quem tem o acesso? | Do you already have a domain? Where is it registered, and who has access?
- [site_content] Quem vai fornecer os textos e as fotos? | Who will provide the copy and photos?

### Alerta
- [no_tracking] A campanha é paga e o cliente não tem pixel nem medição configurados | The campaign is paid and the client has no pixel or tracking set up
- [no_domain_access] O cliente não tem acesso ao domínio ou não sabe quem tem (ex.: quem fez o site antigo) | The client has no access to the domain or doesn't know who has it

## Sistema interno

### Obrigatório antes do e-mail
- [system_process] Como o processo funciona hoje, passo a passo, e onde costuma dar errado? | How does the process work today, step by step, and where does it usually go wrong?
- [system_users] Quem vai usar o sistema e quantas pessoas são? | Who will use the system, and how many people?
- [system_tools] O que o sistema vai substituir: planilhas, outro sistema, WhatsApp? | What will the system replace: spreadsheets, another system, WhatsApp?
- [system_integrations] Precisa conversar com algum outro sistema que vocês já usam? | Does it need to connect to any other system you already use?
- [system_data] Tem dados que precisam ser levados para o sistema novo, como clientes, pedidos ou histórico? | Is there data that needs to move to the new system, such as customers, orders or history?
- [system_permissions] Cada perfil vê e faz coisas diferentes? Por exemplo, o que o gerente pode e o vendedor não? | Does each role see and do different things? For example, what can a manager do that a salesperson can't?

### Bom saber
- [system_reports] Que números ou relatórios você precisa ver no sistema? | Which numbers or reports do you need to see in the system?

### Alerta
- [integration_unknown] O sistema depende de integração com outro sistema e o cliente não sabe se ele tem API ou quem dá o acesso | The system depends on an integration and the client doesn't know if there is an API or who grants access
- [data_migration] Há dados antigos a migrar de planilhas, papel ou outro sistema (pode pesar no prazo e no valor) | There is old data to migrate from spreadsheets, paper or another system
