# Chat: diagnóstico feito pela IA

Os botões "Solicitar diagnóstico" levam à página `/diagnostico` (`components/agent/DiagnosisChat.tsx` + hook `components/agent/useDiagnosisChat.ts`); o botão redondo do canto (`ChatAgent`) só aponta para ela. A IA conduz o diagnóstico inteiro, cobrindo os obrigatórios do **playbook** (`docs/playbook-diagnostico.md`, que o Carlos edita). No fim, o servidor manda ao Carlos alertas e placar, a classe do lead, as respostas campo a campo, uma **pré-proposta pronta para o cliente** com três opções, as notas internas e a conversa. O cliente não recebe nada automático: o Carlos revisa e encaminha. O formulário `/briefing` continua existindo como alternativa e como plano B quando a IA cai.

## Fluxo

1. O site mostra a saudação (`chat.greeting` em `lib/i18n.ts`): "o que você faz e o que está travando hoje?".
2. A IA percorre o **playbook**: primeiro as perguntas comuns, depois as do tipo de projeto, e por último prazo, investimento e quem decide. Uma pergunta por mensagem; pode juntar 2 itens curtos e parecidos ("Você já tem domínio e hospedagem? Com quem estão?"). Resposta vaga num obrigatório: aprofunda uma vez antes de seguir. "Bom saber" só se a conversa estiver fluindo. O que a pessoa já disse não é perguntado de novo. "Não sei" e "prefiro conversar" valem como resposta.
   - Prazo menor que a faixa típica: a IA diz com franqueza e pergunta se a data pode se estender ou se a pessoa aceita uma taxa de urgência (sem dizer o valor).
   - **Investimento abaixo do mínimo da opção Essencial** (o servidor compara, a IA não vê número): a IA diz com cuidado que esse escopo costuma pedir mais e pergunta se há flexibilidade ou se dá para começar por uma parte menor (ex.: landing em vez do site). Se a pessoa topa, segue. Se não há flexibilidade, agradece e fecha sem prometer proposta, com o marcador `[[diagnostico-fora]]`: a conversa vai ao Carlos com status `out` ("Fora do perfil"), sem pré-proposta, mesmo sem contato. A rota só aceita `out` sem contato se a conversa tem mesmo um valor abaixo do mínimo dito pelo visitante.
3. **Nome e e-mail só no fim**, depois de todos os itens obrigatórios. Nunca antes da 5ª mensagem da pessoa (`MIN_CONTACT_TURNS`). Se a pessoa adiantar o e-mail, a IA agradece e segue as perguntas.
4. **Resumo** logo depois do contato, nunca antes da 6ª mensagem (`MIN_SUMMARY_TURNS`). A pessoa confirma ou corrige; se corrigir, a IA ajusta e pergunta de novo.
5. **Fechamento** só depois do resumo confirmado: a IA diz que o time revisa e envia a proposta por e-mail, em até 24h. A última linha leva o marcador `[[diagnostico-completo]]`, que o hook esconde e usa para enviar a conversa ao time (`/api/chat/lead`, status `complete`, assunto "Diagnóstico completo").
6. Se a pessoa deixou e-mail ou telefone e sai da página no meio, vai uma cópia "Diagnóstico incompleto" (status `partial`, só a qualificação e a conversa).

## Playbook (`docs/playbook-diagnostico.md`)

Fonte da verdade do que a IA pergunta. Uma seção por tipo (Comum, Marca, Redesign de identidade, Site, Redesign de site, Landing page, Sistema interno), cada uma com três listas: **Obrigatório antes do e-mail**, **Bom saber** e **Alerta**. Uma linha por item: `- [id] Pergunta PT | Question EN`. A mesma pergunta em dois tipos = a mesma linha repetida com o mesmo id. Nome, e-mail e telefone ficam no código (`lib/briefing-fields.ts`), porque o fluxo depende deles.

`scripts/chat/build-playbook.mjs` converte o .md em `lib/playbook.generated.ts` (não edite à mão). Roda no `prebuild` (todo deploy da Vercel) e com `npm run playbook`; `--check` só confere se o gerado está em dia. Erro de formato (seção ou subtítulo desconhecido, linha malformada, id repetido na seção, id de pergunta igual ao de alerta) para o script com o número da linha: o build falha e a versão anterior continua no ar. Texto em inglês faltando só gera aviso (o chat em inglês usa o português como base).

Por que gerar em vez de ler o .md em runtime: o .md não vai junto das funções serverless da Vercel sem configuração extra (`outputFileTracingIncludes`), um erro de digitação derrubaria o chat em produção em vez de parar o build, e o arquivo gerado é tipado e conferido pelo `tsc`.

Alertas: a IA de extração acende os da lista com o motivo; `budget_low` é calculado pelo servidor (base de valores), nunca pela IA.

## Onde a pré-proposta é gerada

Em `/api/chat/lead` (`prepareLeadExtras` em `lib/lead-proposal.ts`), com os mesmos provedores e a mesma ordem de fallback do chat (`lib/llm.ts`: Gemini grátis primeiro):

1. **Extração** (status `complete` e `out`): a IA lê a conversa e devolve JSON campo a campo (`respondido`, `nao-sabe` ou `sem-resposta`), os alertas do playbook com o motivo e os sinais (decisor, prazo, flexibilidade do investimento, naming, site avançado). O servidor valida contra o playbook.
2. **Classe e placar** (`scorecard`): ✅/⚠️/❌ para investimento, decisor, prazo e clareza do escopo. **Qualificado** = investimento ≥ mínimo da opção Essencial (ou não declarado), quem conversa decide ou o decisor foi identificado, e prazo viável ou taxa de urgência aceita. **Fora do perfil** = status `out` ou investimento abaixo do mínimo sem flexibilidade. O resto é **A avaliar**. Investimento abaixo do mínimo sem a pergunta de flexibilidade conta como ⚠️, não ❌.
3. **Pré-proposta** (só `complete` que não seja Fora do perfil): a IA escreve, para o cliente, o entendimento, o escopo pelas 7 etapas (da opção Recomendado), três opções (Essencial, Recomendado marcada como sugerida, Completo) com escopo, prazo, horas e valor, uma linha com a diferença entre elas e o que pesou no valor. **Quem decide os números é o código** (`priceOptions`):
   - faixa do `PRICING_BASE` para os serviços (com `siteAdvanced` e `naming` quando os sinais pedem), nunca abaixo de `PRICE_FLOOR`;
   - nenhuma opção abaixo de horas × `HOURLY_MIN` (teto da conferência em `HOURLY_MAX`);
   - arredondado para centenas; Essencial < Recomendado < Completo (se a faixa achatar, avisa);
   - prazo menor que a faixa típica: taxa de urgência entre `URGENCY_MIN` e `URGENCY_MAX` (padrão `URGENCY_DEFAULT`), definida pela IA e limitada pelo código, **por cima** da faixa.
4. **Condições e contrato** saem de variáveis de ambiente, nunca da IA: `PAYMENT_SMALL_UPTO`, `PAYMENT_SMALL`, `PAYMENT_LARGE`, `PIX_DISCOUNT_PCT`, `CARD_NO_INTEREST`, `CARD_WITH_INTEREST`, `REVISION_ROUNDS` e `PROPOSAL_VALIDITY_DAYS`. A entrada vai junto com o contrato e pode ser maior, nunca menor; Pix ou cartão. Contrato: começa com assinatura e entrada; arquivos, domínio e acessos liberados com o pagamento quitado; prazo depende de conteúdo e acessos do cliente. `checkPaymentPlan` confere cada plano. Frases da IA com valor, percentual ou condição de pagamento saem do texto do cliente.

O e-mail leva, nesta ordem: (1) alertas e placar, (2) qualificação (classe), (3) respostas do briefing, (4) a PRÉ-PROPOSTA PARA O CLIENTE com o botão "Encaminhar ao cliente" (`mailto:` com o e-mail do cliente, assunto e corpo; acima de ~1800 caracteres o corpo leva só a saudação e "segue a proposta abaixo", e o Carlos cola o resto), (5) notas internas (faixa, valores sugeridos × finais, correções do servidor, riscos, pontos em aberto, perguntas), (6) a conversa. O assunto traz a classe e o número de alertas. Se a extração ou a pré-proposta falhar, o e-mail sai mesmo assim, com a conversa e um aviso.

## Regras de negócio decididas

- **O diagnóstico é gratuito** e é feito pela IA, no chat (decisão do Carlos, 2026-11-17). A frase que a IA usa está em `DIAGNOSIS_COST` (`lib/chat-context.ts`), nos dois idiomas.
- Proposta por e-mail em **até 24h**. A IA nunca promete data de início, data de entrega, resultado, desconto, parcelamento, garantia nem número de revisões. Prazos são estimativas contadas do início efetivo (contrato assinado, sinal pago, materiais entregues).
- **Preço nunca é passado no chat** nem em outro canal: só na proposta enviada por e-mail (decisão do Carlos, 2026-11-17). O prompt não tem nenhum número, e a trava `price-leak` barra qualquer valor que o visitante não tenha dito.
- **Qualificação pelo servidor:** `lib/pricing-base.ts` compara o último valor que o visitante disse com o mínimo da opção Essencial dos serviços pedidos (`PRICING_BASE`, fora do git) e passa ao modelo só a instrução, sem número: abaixo, a pergunta de flexibilidade (e, sem flexibilidade, o fechamento `[[diagnostico-fora]]`); dentro do perfil, segue. Tabela legível em `docs/privado/base-de-valores.md` (fora do git).
- O que fica fora do escopo (textos, fotos, hospedagem, domínio, manutenção) "pode ficar fora"; a lista exata vem na proposta.
- Perguntas técnicas sobre como a entrega funciona (tecnologia, instalação, integração, suporte) não têm resposta: vão para a proposta e para a linha "Dúvidas para o time" do resumo.

## Onde está cada coisa

| Arquivo | O que faz |
| --- | --- |
| `lib/chat-context.ts` | Prompt do diagnóstico (sem preços), `DIAGNOSIS_COST`, estado da conversa e a trava de qualidade (`validateReply`, `repairReply`) |
| `lib/pricing-base.ts` | Base interna de valores (lida de `PRICING_BASE`), identificação do valor e dos serviços ditos pelo visitante, classificação do lead |
| `app/api/chat/route.ts` | Gera a resposta inteira, tenta de novo se o modelo cortar, aplica a trava e o portão da lista do briefing, cai no script offline se tudo falhar |
| `docs/playbook-diagnostico.md` | Playbook que o Carlos edita: perguntas obrigatórias, bom saber e alertas por tipo |
| `scripts/chat/build-playbook.mjs` | Converte o playbook em `lib/playbook.generated.ts` (prebuild e `npm run playbook`) |
| `lib/briefing-fields.ts` | Lê o playbook gerado, junta os campos de contato e oferece as consultas (`requiredFor`, `alertsFor`, `checklistText`) |
| `lib/llm.ts` | Provedores e ordem de fallback, usados pelo chat e pela proposta |
| `lib/lead-proposal.ts` | Extração (respostas, alertas, sinais), classe e placar, pré-proposta com três opções, validação de valores e pagamento, e-mail do lead |
| `components/agent/DiagnosisChat.tsx` | Interface do chat na página `/diagnostico` |
| `components/agent/useDiagnosisChat.ts` | Envio das mensagens, marcador de fim, envio ao time, script offline |
| `components/agent/ChatAgent.tsx` | Botão redondo do canto, que leva a `/diagnostico` |
| `components/agent/OpenChatLink.tsx` | Botões "Solicitar diagnóstico" |
| `app/api/chat/lead/route.ts` | Envia o e-mail do lead (completo ou incompleto); `LEAD_DRY_RUN=1` só grava em arquivo |
| `scripts/chat/chat-turn.mjs` | Simula um turno do visitante contra `/api/chat` |
| `scripts/chat/lead-dry-run.mjs` | Gera o e-mail do lead de uma conversa simulada, sem enviar |

## Por que existe uma trava no servidor

O modelo gratuito (Gemini flash-lite) ignora regras escritas no prompt. Nos testes antigos ele resumia com 4 mensagens, pedia e-mail na 2ª, dizia "não usamos WhatsApp" e "o prazo cabe bem". Por isso o servidor:

- conta as mensagens da pessoa e cola o resultado no fim do prompt ("Estado desta conversa");
- confere cada resposta antes de enviar (`validateReply`): contato pedido antes da 5ª mensagem, resumo sem contato ou cedo demais, marcador sem contato, **marcador sem resumo confirmado** (a mensagem anterior da IA tem de ser o resumo e a pessoa tem de ter confirmado, sem correção), valor que a pessoa não disse, frases proibidas;
- **portão da lista do briefing:** quando a resposta pede nome e e-mail ou traz o resumo, a rota roda a mesma extração do e-mail do lead e, se faltar item obrigatório para o tipo do projeto (no resumo, também nome e e-mail), manda refazer perguntando o que falta. Se a extração falhar, não segura. A partir da 18ª mensagem (`LONG_TURNS`) o portão desliga;
- se reprovar, pede ao modelo para refazer com a razão anexada; depois das tentativas, conserta a resposta no servidor (corta a frase proibida, troca o resumo pela pergunta que falta ou tira o marcador).

## Como testar

Com o servidor de pé (o padrão do script é `localhost:3011`; use `CHAT_URL` para outro):

```bash
export CHAT_URL=http://localhost:3010/api/chat CHAT_SIM_DIR=/tmp/linkando-chat-sim
node scripts/chat/chat-turn.mjs minha-sessao "oi, preciso de um site para minha clínica"
node scripts/chat/chat-turn.mjs minha-sessao --show
```

Cada chamada manda uma mensagem do visitante e imprime a resposta. O script não chama `/api/chat/lead`: nenhum e-mail sai.

Para ver o e-mail que o Carlos receberia (alertas, placar, briefing, pré-proposta, notas), sem enviar nada:

```bash
LEAD_DRY_RUN_DIR=/tmp/linkando-lead node scripts/chat/lead-dry-run.mjs minha-sessao
```

O script lê a conversa simulada, usa `GEMINI_API_KEY`, `PRICING_BASE`, `PRICE_FLOOR` e `PROPOSAL_VALIDITY_DAYS` do `.env.local` (só lê; o SMTP é apagado do ambiente do processo; variáveis já definidas no processo valem sobre o arquivo) e grava `.txt`, `.html` e `.json`. Conversa que terminou com `[[diagnostico-fora]]` sai como `out`. Para testar a rota de verdade, suba um servidor com `LEAD_DRY_RUN=1`: ela grava o e-mail em `LEAD_DRY_RUN_DIR` em vez de enviar.

O que olhar em cada conversa: a IA cobriu todos os obrigatórios do playbook (o `.json` do dry-run lista os que ficaram sem resposta)? Em quantas mensagens? Pediu e-mail só no fim? O resumo veio depois do e-mail e o fechamento só depois da confirmação? Não citou nenhum valor que o visitante não disse? Recusou garantias sem inventar fatos?

Personas úteis: ideia no papel; autônomo com Instagram que quer para ontem; clínica com site antigo e sócia que decide junto; transportadora que precisa de sistema interno (sem orçamento); startup de Miami em inglês; negociador (desconto, parcelas, garantia); abaixo do piso configurado; quem responde "sei lá"; quem adianta o e-mail logo no começo; testador hostil.

## Limites conhecidos

- **Só LLM gratuita.** Esta é uma restrição do projeto, não uma pendência: toda melhoria de confiabilidade tem que vir do prompt, da trava no servidor, das retentativas e do modelo reserva. O caminho opcional do Claude em `app/api/chat/route.ts` existe no código, mas fica desligado.
- O Gemini gratuito falha em 20–25% das chamadas (503, timeout, corte). O servidor tenta até 3 vezes; se tudo falhar, o chat mostra o script offline e aponta o `/briefing`.
- No plano gratuito o Google pode usar o conteúdo das conversas. O aviso de privacidade do chat já menciona nome e e-mail digitados.
- Perguntas de detalhe genéricas ("o que já foi tentado antes?") entram quando a trava força a IA a perguntar. Funcionam, mas soam um pouco padronizadas.
- O portão da lista e o e-mail completo gastam chamadas extras da cota gratuita: uma extração quando a IA pede contato ou resume, e uma extração mais a pré-proposta no fim.
- O portão confere se o obrigatório tem resposta, não se a resposta é boa: "o domínio é nosso" conta como respondido mesmo sem dizer onde está nem quem tem o acesso. O "aprofunde uma vez" depende do modelo.
- No chat, a comparação do investimento ainda identifica os serviços por palavras (`servicesIn`): "o sistema que a recepção usa" conta como sistema interno e "a gente tem um logo" como marca, o que soma mínimos a mais e pode disparar a pergunta de flexibilidade sem necessidade. No e-mail, a classe e a faixa usam os tipos da extração, que acertam mais.

## Decisões em aberto

- O formulário `/briefing` em inglês tem faixas de orçamento em euro. Trocar para dólar quando houver os valores.
