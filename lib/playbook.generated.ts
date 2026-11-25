// GERADO por scripts/chat/build-playbook.mjs a partir de docs/playbook-diagnostico.md.
// NÃO EDITE À MÃO: edite o playbook e rode `npm run playbook` (o build da Vercel roda sozinho).

export type PlaybookType = "brand" | "identity" | "site" | "landing" | "siteRedesign" | "system";

export type PlaybookField = {
  id: string;
  question: { pt: string; en: string };
  types: PlaybookType[] | "all"; // onde a pergunta vale
  required: PlaybookType[] | "all"; // onde é obrigatória antes do e-mail ([] = só "bom saber")
};

export type PlaybookAlert = {
  id: string;
  text: { pt: string; en: string }; // quando o alerta acende
  types: PlaybookType[] | "all";
};

export const PLAYBOOK_FIELDS: PlaybookField[] = [
  { id: "business", question: { pt: "O que você faz e para quem vende?", en: "What do you do, and who do you sell to?" }, types: "all", required: "all" },
  { id: "problem", question: { pt: "O que está travando hoje e o que você espera do resultado?", en: "What is holding you back today, and what do you expect from the result?" }, types: "all", required: "all" },
  { id: "services", question: { pt: "O que você quer criar: marca, site, landing page, sistema, redesign, ou ainda não sabe?", en: "What do you want to create: a brand, website, landing page, system, redesign, or not sure yet?" }, types: "all", required: "all" },
  { id: "current", question: { pt: "O que já existe hoje: site, marca, logo, materiais?", en: "What already exists today: website, brand, logo, materials?" }, types: "all", required: "all" },
  { id: "deadline", question: { pt: "Para quando você precisa, e por quê? Tem alguma data fixa, como lançamento ou evento?", en: "When do you need it, and why? Is there a fixed date, such as a launch or event?" }, types: "all", required: "all" },
  { id: "budget", question: { pt: "Você tem uma faixa de investimento em mente, ou prefere conversar sobre isso na proposta?", en: "Do you have an investment range in mind, or would you rather discuss it in the proposal?" }, types: "all", required: "all" },
  { id: "decision", question: { pt: "Quem decide a contratação: só você ou mais alguém?", en: "Who makes the hiring decision: just you, or someone else too?" }, types: "all", required: "all" },
  { id: "company", question: { pt: "Qual é o nome da empresa?", en: "What is the company name?" }, types: "all", required: [] },
  { id: "reference", question: { pt: "Tem o link do site atual ou de uma referência que você gosta?", en: "Do you have a link to your current site or to a reference you like?" }, types: "all", required: [] },
  { id: "source", question: { pt: "Como você conheceu o estúdio?", en: "How did you hear about the studio?" }, types: "all", required: [] },
  { id: "brand_name", question: { pt: "O nome da marca já está definido ou você precisa de ajuda para criar o nome?", en: "Is the brand name already set, or do you need help creating it?" }, types: ["brand"], required: ["brand"] },
  { id: "brand_registry", question: { pt: "Se o nome já existe, ele tem registro no INPI ou em outro órgão, ou o pedido está em andamento?", en: "If the name exists, is it registered with the INPI or another office, or is the application in progress?" }, types: ["brand","identity"], required: ["brand"] },
  { id: "brand_availability", question: { pt: "O domínio do site e o @ nas redes com esse nome estão livres ou já são seus?", en: "Are the website domain and the social media handle with that name available or already yours?" }, types: ["brand"], required: ["brand"] },
  { id: "brand_audience", question: { pt: "Para quem é a marca: quem é o público que você quer atrair?", en: "Who is the brand for: which audience do you want to attract?" }, types: ["brand","identity"], required: ["brand","identity"] },
  { id: "brand_message", question: { pt: "Que valores e que personalidade a marca precisa transmitir?", en: "Which values and personality does the brand need to convey?" }, types: ["brand"], required: ["brand"] },
  { id: "brand_usage", question: { pt: "Onde a marca vai aparecer mais: digital, impresso, embalagem, fachada, uniforme?", en: "Where will the brand appear most: digital, print, packaging, signage, uniforms?" }, types: ["brand","identity"], required: ["brand","identity"] },
  { id: "brand_references", question: { pt: "Tem marcas que você ama e outras que não quer parecer de jeito nenhum?", en: "Are there brands you love, and others you definitely don't want to look like?" }, types: ["brand","identity"], required: ["brand","identity"] },
  { id: "brand_competitors", question: { pt: "Quem são os seus principais concorrentes?", en: "Who are your main competitors?" }, types: ["brand","identity"], required: [] },
  { id: "identity_issues", question: { pt: "O que não funciona na marca atual?", en: "What doesn't work in the current brand?" }, types: ["identity"], required: ["identity"] },
  { id: "identity_keep", question: { pt: "Tem algo da marca atual que precisa ser mantido, como nome, cor ou símbolo?", en: "Is there anything in the current brand that must be kept, such as the name, a colour or the symbol?" }, types: ["identity"], required: ["identity"] },
  { id: "brand_files", question: { pt: "Você tem os arquivos originais da marca atual (vetor, manual)?", en: "Do you have the original files of the current brand (vector, guidelines)?" }, types: ["identity"], required: [] },
  { id: "site_goal", question: { pt: "Qual é o objetivo principal do site e qual ação a pessoa deve fazer nele: pedir orçamento, comprar, agendar?", en: "What is the site's main goal, and what should visitors do on it: request a quote, buy, book?" }, types: ["site","siteRedesign"], required: ["site","siteRedesign"] },
  { id: "site_pages", question: { pt: "Quais páginas ou seções você imagina?", en: "Which pages or sections do you have in mind?" }, types: ["site","siteRedesign"], required: ["site","siteRedesign"] },
  { id: "site_content", question: { pt: "Quem vai fornecer os textos e as fotos?", en: "Who will provide the copy and photos?" }, types: ["site","siteRedesign","landing"], required: ["site","siteRedesign","landing"] },
  { id: "site_domain", question: { pt: "Você já tem domínio? Onde ele está registrado e quem tem o acesso?", en: "Do you already have a domain? Where is it registered, and who has access?" }, types: ["site","siteRedesign","landing"], required: ["site","siteRedesign","landing"] },
  { id: "site_hosting", question: { pt: "Já existe hospedagem? Com quem está e quem tem o acesso?", en: "Is there hosting already? With which provider, and who has access?" }, types: ["site","siteRedesign"], required: ["site","siteRedesign"] },
  { id: "site_features", question: { pt: "Precisa de alguma integração ou funcionalidade, como agenda, CRM, pagamento, loja ou formulário?", en: "Do you need any integration or feature, such as booking, CRM, payments, a shop or forms?" }, types: ["site","siteRedesign"], required: ["site","siteRedesign"] },
  { id: "site_languages", question: { pt: "Em quais idiomas o site precisa estar?", en: "Which languages does the site need?" }, types: ["site","siteRedesign"], required: ["site","siteRedesign"] },
  { id: "site_maintenance", question: { pt: "Depois de pronto, quem vai atualizar o site?", en: "Once it's live, who will update the site?" }, types: ["site","siteRedesign"], required: ["site","siteRedesign"] },
  { id: "site_email", question: { pt: "Vocês já têm e-mail profissional com o domínio da empresa?", en: "Do you already have professional email on the company domain?" }, types: ["site","siteRedesign"], required: [] },
  { id: "site_analytics", question: { pt: "Vocês têm acesso ao Google Analytics e ao Search Console do site?", en: "Do you have access to the site's Google Analytics and Search Console?" }, types: ["site","siteRedesign"], required: ["siteRedesign"] },
  { id: "site_current_issues", question: { pt: "Qual é o link do site atual e o que não funciona nele hoje?", en: "What is the link to the current site, and what doesn't work on it today?" }, types: ["siteRedesign"], required: ["siteRedesign"] },
  { id: "landing_offer", question: { pt: "Qual é a oferta ou o produto da página?", en: "What is the offer or product of the page?" }, types: ["landing"], required: ["landing"] },
  { id: "landing_action", question: { pt: "O que a pessoa deve fazer na página: comprar, se cadastrar ou entrar em contato?", en: "What should people do on the page: buy, sign up or get in touch?" }, types: ["landing"], required: ["landing"] },
  { id: "landing_traffic", question: { pt: "De onde vão vir as visitas: anúncios, Instagram, e-mail?", en: "Where will the visits come from: ads, Instagram, email?" }, types: ["landing"], required: ["landing"] },
  { id: "landing_tracking", question: { pt: "Vai precisar de pixel ou de medição, como Meta, Google Ads ou Analytics?", en: "Will you need a pixel or tracking, such as Meta, Google Ads or Analytics?" }, types: ["landing"], required: ["landing"] },
  { id: "landing_campaign", question: { pt: "Quando a campanha começa e até quando vai?", en: "When does the campaign start, and how long will it run?" }, types: ["landing"], required: ["landing"] },
  { id: "system_process", question: { pt: "Como o processo funciona hoje, passo a passo, e onde costuma dar errado?", en: "How does the process work today, step by step, and where does it usually go wrong?" }, types: ["system"], required: ["system"] },
  { id: "system_users", question: { pt: "Quem vai usar o sistema e quantas pessoas são?", en: "Who will use the system, and how many people?" }, types: ["system"], required: ["system"] },
  { id: "system_tools", question: { pt: "O que o sistema vai substituir: planilhas, outro sistema, WhatsApp?", en: "What will the system replace: spreadsheets, another system, WhatsApp?" }, types: ["system"], required: ["system"] },
  { id: "system_integrations", question: { pt: "Precisa conversar com algum outro sistema que vocês já usam?", en: "Does it need to connect to any other system you already use?" }, types: ["system"], required: ["system"] },
  { id: "system_data", question: { pt: "Tem dados que precisam ser levados para o sistema novo, como clientes, pedidos ou histórico?", en: "Is there data that needs to move to the new system, such as customers, orders or history?" }, types: ["system"], required: ["system"] },
  { id: "system_permissions", question: { pt: "Cada perfil vê e faz coisas diferentes? Por exemplo, o que o gerente pode e o vendedor não?", en: "Does each role see and do different things? For example, what can a manager do that a salesperson can't?" }, types: ["system"], required: ["system"] },
  { id: "system_reports", question: { pt: "Que números ou relatórios você precisa ver no sistema?", en: "Which numbers or reports do you need to see in the system?" }, types: ["system"], required: [] },
];

export const PLAYBOOK_ALERTS: PlaybookAlert[] = [
  { id: "deadline_short", text: { pt: "O prazo que o cliente quer é menor que a faixa típica do serviço (landing 1–2 semanas, site 4–8, marca 3–6; somadas quando há mais de um serviço)", en: "The requested timeline is shorter than the typical range for the service" }, types: "all" },
  { id: "budget_low", text: { pt: "O investimento declarado está abaixo do mínimo da base interna para o serviço (o servidor calcula, pela base de valores)", en: "The stated investment is below the internal minimum for the service" }, types: "all" },
  { id: "not_decider", text: { pt: "Quem conversa não decide sozinho: a decisão é de outra pessoa ou é dividida (sócio, diretoria)", en: "The person chatting does not decide alone" }, types: "all" },
  { id: "name_unavailable", text: { pt: "O nome que o cliente quer não tem domínio ou @ disponível, já tem registro de outra pessoa, ou ele não sabe e não verificou", en: "The desired name has no available domain or handle, is registered by someone else, or was never checked" }, types: ["brand"] },
  { id: "no_brand_files", text: { pt: "O cliente não tem os arquivos originais da marca atual e quer manter algum elemento dela", en: "The client lacks the original brand files but wants to keep elements of it" }, types: ["identity"] },
  { id: "no_domain_access", text: { pt: "O cliente não tem acesso ao domínio ou não sabe quem tem (ex.: quem fez o site antigo)", en: "The client has no access to the domain or doesn't know who has it" }, types: ["site","siteRedesign","landing"] },
  { id: "no_content", text: { pt: "O cliente não tem textos nem fotos e espera que o estúdio produza (produção de conteúdo pode ficar fora do escopo)", en: "The client has no copy or photos and expects the studio to produce them" }, types: ["site","siteRedesign"] },
  { id: "no_hosting_access", text: { pt: "O cliente não sabe onde está a hospedagem ou não tem o acesso", en: "The client doesn't know where the hosting is or has no access" }, types: ["siteRedesign"] },
  { id: "no_tracking", text: { pt: "A campanha é paga e o cliente não tem pixel nem medição configurados", en: "The campaign is paid and the client has no pixel or tracking set up" }, types: ["landing"] },
  { id: "integration_unknown", text: { pt: "O sistema depende de integração com outro sistema e o cliente não sabe se ele tem API ou quem dá o acesso", en: "The system depends on an integration and the client doesn't know if there is an API or who grants access" }, types: ["system"] },
  { id: "data_migration", text: { pt: "Há dados antigos a migrar de planilhas, papel ou outro sistema (pode pesar no prazo e no valor)", en: "There is old data to migrate from spreadsheets, paper or another system" }, types: ["system"] },
];
