# scripts/deck — gravador de cenas

Grava cenas de um site no Google Chrome do sistema e gera mp4 + poster (`.jpg`, 35%) em `outDir`, com `manifest.json`.

Rodar: `node scripts/deck/record-scenes.mjs <site> [cena ...] [--sw]` (`--sw` força SwiftShader; `DECK_TMP` muda a pasta dos frames temporários).
Entrada: `scripts/deck/scenes/<site>.json` com `{site, url, outDir, cookies?, scenes:[{name, device: desktop|desktop-hd|mobile, recordFromStart?, setup:[], record:[]}]}` (`desktop-hd` = 1440×900, para efeitos que só aparecem em telas maiores; `recordFromStart` grava também o `setup`, por exemplo o carregamento inicial). `cookies` (opcional) é a lista do Playwright (`{name, value, url}`), aplicada ao contexto antes da cena: serve, por exemplo, para aceitar só o essencial num banner de consentimento. `setup` roda sem gravar; `record` é gravado.
Ops (`{"op": ...}`): `goto {url?}`, `wait {ms}`, `waitFor {selector, timeout?}`, `scroll {to: px | {selector, at: top|bottom, offsetVh?, offsetPx?}, ms}`, `move {to, ms}`, `hover {selector, ms}`, `click {selector|x,y|var, nth?}`, `drag {from?, by:{dx,dy}, ms, touch?}`, `press {key}`, `type {text, delay?}`, `css {text}`, `orbit {selector, ms, pad?}`, `seekHit {as, selector, hitClass, offsets}`.
Offsets positivos descem a vista. Com `at: bottom`, elemento pinado usa o fim do `.pin-spacer`. `drag` sem `from` continua de onde o mouse parou.
`css {text}` injeta uma `<style>` (`addStyleTag`): vale em `setup` e em `record`, para esconder a interface (ex.: `.hdr{visibility:hidden !important}`).
`type {text, delay?}` digita no elemento com foco (`delay` em ms por tecla, padrão 70): clique no campo antes. Sem `\n` no texto, senão o Enter envia o formulário.
Armadilha: o `--window-size` precisa bater com o viewport, senão o screencast corta a base (713 de 800 px). Por isso há um browser por dispositivo.
Armadilha: o screencast morre na troca de documento. O `goto` gravando reinicia a captura no commit, descartando o about:blank.
Armadilha: `recordVideo` descarta frames em site pesado em WebGL. A captura é por `Page.startScreencast`.
Armadilha: o frame só chega quando algo muda na tela. A duração de cada frame vai até o próximo timestamp.
Limite: o screencast do mobile sai 1x (390 px), não em device pixels. O mp4 é escalado para 520 px.
Limite: se o canvas WebGL sair preto, a cena tenta de novo com SwiftShader (fps < 8 ou luma < 10 também disparam).

Verificar o padrão de portfólio de um deck (vitrine, arquivos, registro, link): `node scripts/deck/check-standard.mjs <slug | --all> [--net]` (ver skill `add-portfolio-project`). `--net` confere o link real e acusa o SSO da Vercel.
