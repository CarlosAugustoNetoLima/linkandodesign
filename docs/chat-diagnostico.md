# Chat: diagnóstico feito pela IA

O botão "Solicitar diagnóstico" do site abre o chat. A IA conduz o diagnóstico inteiro e, no fim, o time recebe a conversa e envia a proposta por e-mail. O formulário `/briefing` continua existindo como alternativa e como plano B quando a IA cai.

## Fluxo

1. O site mostra a saudação (`chat.greeting` em `lib/i18n.ts`): "o que você faz e o que está travando hoje?".
2. A IA faz uma pergunta por vez: negócio e público, problema, serviço desejado, o que já existe, detalhes do tipo de projeto (marca, site, landing, redesign ou sistema), prazo e motivo, investimento previsto, quem decide.
3. **Nome e e-mail** entre a 3ª e a 5ª mensagem da pessoa (nunca antes da 3ª).
4. **Resumo** só a partir da 7ª mensagem da pessoa. A pessoa confirma ou corrige.
5. **Fechamento:** a IA diz que o time analisa a conversa e envia a proposta por e-mail, com prazos e valores, em até 24h. A última linha leva o marcador `[[diagnostico-completo]]`, que o `ChatAgent` esconde e usa para enviar a conversa ao time (`/api/chat/lead`, assunto "Diagnóstico completo").
6. Se a pessoa deixou o e-mail e fecha o chat no meio, vai uma cópia "Diagnóstico incompleto".

## Regras de negócio decididas

- Proposta por e-mail em **até 24h**. A IA nunca promete data de início, data de entrega, resultado, desconto, parcelamento, garantia nem número de revisões. Prazos são estimativas contadas do início efetivo (contrato assinado, sinal pago, materiais entregues).
- Valores só da tabela em `PRICING` (`lib/chat-context.ts`), sempre "a partir de", e só para visitante do Brasil. **Fora do Brasil não cita número nenhum**: os valores vêm em dólar na proposta.
- **Piso de R$ 1.500:** abaixo disso a IA encerra com educação, sem pedir e-mail. O piso não é preço de tabela e só é citado ao recusar. Entre R$ 1.500 e a referência do serviço, ela diz que o time avalia na proposta o que cabe.
- O que fica fora do escopo (textos, fotos, hospedagem, domínio, manutenção) "pode ficar fora"; a lista exata vem na proposta.
- Perguntas técnicas sobre como a entrega funciona (tecnologia, instalação, integração, suporte) não têm resposta: vão para a proposta e para a linha "Dúvidas para o time" do resumo.

## Onde está cada coisa

| Arquivo | O que faz |
| --- | --- |
| `lib/chat-context.ts` | Prompt do diagnóstico, tabela de preços, `DIAGNOSIS_COST`, estado da conversa e a trava de qualidade (`validateReply`, `repairReply`) |
| `app/api/chat/route.ts` | Gera a resposta inteira, tenta de novo se o modelo cortar, aplica a trava, cai no script offline se tudo falhar |
| `components/agent/ChatAgent.tsx` | Interface do chat, marcador de fim, envio ao time, script offline |
| `components/agent/OpenChatLink.tsx` | Botões "Solicitar diagnóstico" que abrem o chat |
| `app/api/chat/lead/route.ts` | Envia a conversa por e-mail (completa ou incompleta) |

## Por que existe uma trava no servidor

O modelo gratuito (Gemini flash-lite) ignora regras escritas no prompt. Nos testes ele resumia com 4 mensagens, pedia e-mail na 2ª, dizia "não usamos WhatsApp" e "o prazo cabe bem". Por isso o servidor:

- conta as mensagens da pessoa e cola o resultado no fim do prompt ("Estado desta conversa");
- confere cada resposta antes de enviar (resumo ou fechamento cedo demais, marcador sem e-mail, e-mail pedido cedo demais, R$ para quem é de fora do Brasil, frases proibidas);
- se reprovar, pede ao modelo para refazer com a razão anexada; depois de 3 tentativas, conserta a resposta no servidor (corta a frase proibida ou troca por uma pergunta de detalhe pronta).

## Como testar

Com o servidor de pé em `localhost:3011`:

```bash
node scripts/chat/chat-turn.mjs minha-sessao "oi, preciso de um site para minha clínica"
node scripts/chat/chat-turn.mjs minha-sessao --show
```

Cada chamada manda uma mensagem do visitante e imprime a resposta. Nenhum e-mail sai (não chama `/api/chat/lead`). Personas usadas no último teste:

1. Ideia no papel (só um caderno de referências, R$ 5.000)
2. Autônomo com Instagram (R$ 2.000, quer para ontem)
3. Clínica com site de 2017 (R$ 8.000, sócio decide junto)
4. Transportadora que precisa de sistema interno (sem orçamento)
5. Startup de Miami em inglês (US$ 15.000, demo day em 5 semanas)
6. Negociador (30% de desconto, 10x, garantia de vendas, WhatsApp)
7. Abaixo do piso (R$ 800)
8. Dona de padaria que responde "sei lá"
9. Diretora de rede de academias (R$ 60 mil, NDA, SLA, garantia de +30%)
10. Testador hostil (injeção de prompt, xingamento, depois colabora)

O que olhar em cada conversa: o e-mail veio entre a 3ª e a 5ª mensagem? O resumo veio só depois da 7ª? A IA recusou garantias sem inventar fatos? Citou preço só para o Brasil e só "a partir de"? O fechamento avisa da proposta em até 24h e termina com o marcador?

## Limites conhecidos

- **Só LLM gratuita.** Esta é uma restrição do projeto, não uma pendência: toda melhoria de confiabilidade tem que vir do prompt, da trava no servidor, das retentativas e do modelo reserva. O caminho opcional do Claude em `app/api/chat/route.ts` existe no código, mas fica desligado.
- O Gemini gratuito falha em 20–25% das chamadas (503, timeout, corte). O servidor tenta até 3 vezes; se tudo falhar, o chat mostra o script offline e aponta o `/briefing`.
- No plano gratuito o Google pode usar o conteúdo das conversas. O aviso de privacidade do chat já menciona nome e e-mail digitados.
- Perguntas de detalhe genéricas ("o que já foi tentado antes?") entram quando a trava força a IA a perguntar. Funcionam, mas soam um pouco padronizadas.

## Decisões em aberto

- O diagnóstico é gratuito? Preencher `DIAGNOSIS_COST` em `lib/chat-context.ts`. Enquanto estiver vazio, a IA diz "não tenho essa informação".
- O formulário `/briefing` em inglês tem faixas de orçamento em euro. Trocar para dólar quando houver os valores.
