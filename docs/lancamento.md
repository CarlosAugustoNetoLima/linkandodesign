# Lançamento: do código ao site recebendo leads

Estado em 2026-11-17. O projeto `linkandodesign` já existe na Vercel (time `linkando`), ligado ao GitHub `CarlosAugustoNetoLima/linkandodesign`, branch de produção `main`. Todo push em `main` publica em `linkandodesign.vercel.app`. O domínio `linkandodesign.com` ainda aponta para a página de "domínio estacionado" da Hostinger.

## Como o lead chega

| Entrada | Rota | Destino |
| --- | --- | --- |
| Chat "Solicitar diagnóstico" | `/api/chat` (conversa) e `/api/chat/lead` (envio ao time) | e-mail `[Site] Diagnóstico completo/incompleto — …` |
| Formulário `/briefing` | `/api/briefing` | e-mail `[Site] Novo pedido de diagnóstico — …` |
| Rodapé / WhatsApp | `lib/contact.ts` | `mailto:` enquanto `WHATSAPP` estiver vazio |

Tudo sai por SMTP da Hostinger (`lib/mail.ts`) para `MAIL_TO`. **Não há banco de dados**: se o SMTP falhar, o lead só existe no log da função na Vercel. O formulário avisa o visitante e sugere escrever para o e-mail; o chat cai no roteiro offline.

## Antes do primeiro deploy

1. **Variáveis de ambiente na Vercel (Production).** Sem elas o formulário responde 503 e o chat usa só o roteiro offline.
   `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_TO`, `GEMINI_API_KEY` (e, opcional, `GEMINI_MODEL`). Valores iguais aos do `.env.local`.
2. **Contatos reais em `lib/contact.ts`:** `WHATSAPP` (só dígitos, com DDI) e `SOCIAL` (Instagram, LinkedIn, Behance). Vazios, os CTAs caem para o e-mail e o rodapé não mostra redes.
3. **Commitar tudo.** O build depende de pastas ainda não versionadas (`app/apresentacoes`, `components/deck`, `lib/decks`, `public/decks`, etc.). Sem elas, o build da Vercel quebra.
4. **Tirar o cache do repositório:** `.mockup-tmp/` (613 arquivos rastreados) agora está no `.gitignore`; rodar `git rm -r --cached .mockup-tmp` antes do commit.

## Primeiro deploy (preview sem o domínio)

1. Push em `main`. A Vercel builda sozinha.
2. Em `https://linkandodesign.vercel.app`, testar de ponta a ponta (ver abaixo). **Não mexa no DNS antes disso.**
3. Se o build falhar com `Failed to fetch … from Google Fonts` (ou `Cannot read properties of null` em `lib/decks/fonts.ts`), é instabilidade momentânea do Google: Deployments → Redeploy. Aconteceu uma vez em 2026-11-17 num build sem cache e passou na tentativa seguinte.

## Apontar o domínio

1. Vercel → projeto `linkandodesign` → Settings → Domains → adicionar `linkandodesign.com` (e `www.linkandodesign.com` redirecionando para o apex). A Vercel mostra os valores exatos de DNS.
2. Hostinger hPanel → Domínios → DNS: trocar o registro **A do apex** (hoje `2.57.91.91`) e o **CNAME do `www`** pelos valores da Vercel.
3. **Não apagar nem editar os registros `MX` (mx1/mx2.hostinger.com) nem os `TXT`** (SPF/DKIM). São eles que fazem o e-mail `contato@linkandodesign.com` funcionar, e é nessa caixa que os leads chegam.
4. Esperar a Vercel marcar o domínio como válido e emitir o HTTPS.

## Teste de ponta a ponta (no preview e de novo no domínio)

- [ ] Home carrega, header e rodapé sem links quebrados; `/apresentacoes`, `/sobre`, `/briefing` abrem.
- [ ] Botão "Solicitar diagnóstico" abre o chat; a IA responde (não o roteiro offline) e conduz até o fechamento.
- [ ] Ao fechar o diagnóstico (ou fechar o chat depois de dar o e-mail), chega o e-mail `[Site] Diagnóstico …` na pasta Site.
- [ ] `/briefing` completo: chega o e-mail `[Site] Novo pedido de diagnóstico …` e "Responder" vai para o e-mail do visitante.
- [ ] Versão em inglês (seletor PT · EN) mostra o aviso de privacidade e responde em inglês.
- [ ] Celular: chat ocupa a tela, formulário usável, sem rolagem horizontal.
- [ ] Compartilhar o link no WhatsApp/LinkedIn mostra a imagem e o título (cache do WhatsApp demora; use o depurador do LinkedIn).
- [ ] `https://linkandodesign.com/robots.txt` e `/sitemap.xml` respondem.
- [ ] Vercel → Logs: nenhum `[briefing] falha ao enviar` / `[chat/lead] falha ao enviar`.

## Depois de abrir

- Olhar a pasta Site do webmail e os logs da Vercel diariamente na primeira semana.
- Gemini gratuito oscila (503/timeout em 20–25% das tentativas nos testes). O site não quebra, mas a conversa pode cair no roteiro offline. Acompanhar.
- Limite de envio é por instância (5 por hora por IP no formulário, 30 mensagens por 10 min no chat). Serve contra abuso simples, não contra ataque.

## Reverter

Vercel → Deployments → deploy anterior → "Promote to Production". Para o domínio, voltar o registro A para `2.57.91.91` (só se precisar).
