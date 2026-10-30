# Liquio no portfólio GDSantos

Base oficial: https://github.com/gdsantos-dev/portfolio-gdsantos
Commit da main usado: `f8f21252365a04c7d704533cf2b008e6140bc8a5`
Branch de desenvolvimento: `feat/liquio-contact`
Componente: Liquio 1.0.0

## Escopo

Liquio aparece somente no contato das páginas PT, EN e ES e na entrada raiz em português. Não aparece nos estudos de caso. Hero, currículo, navegação, projetos, rodapé, textos, imagens existentes e servidor foram preservados.

O slot `.contact-liquio` é filho de `#contato`, com posicionamento absoluto relativo ao card. Após revisão dos aumentos acumulados, o mascote foi reduzido para **120 × 150 px no desktop** e **80 × 100 px até 700 px de viewport**. O centro horizontal no desktop permanece aproximadamente a 81,2% da largura do card (`right: calc(18.8% - 60px)`), e a base do sprite fica próxima à borda superior (`bottom: calc(100% + 2px)`). O elemento permanece decorativo, sem alterar o fluxo nem o conteúdo do card. O arquivo CSS da integração recebe novo hash no parâmetro `?v=` em todas as páginas; após deploy, conferir no navegador o tamanho calculado e a composição visual. Não há posicionamento fixo ou acompanhamento independente do scroll.

O CSS específico da integração recebe um sufixo `?v=<12 primeiros caracteres do SHA-256 do arquivo>`. O teste `scripts/validate-liquio.mjs` calcula esse hash e exige que as quatro páginas HTML referenciem a versão correspondente. Sempre que `public/assets/liquio-contact.css` mudar, atualize o sufixo nas quatro páginas para evitar CSS antigo em cache após o deploy.

O slot não recebe ponteiro nem foco e é oculto da árvore de acessibilidade. Todos os links de contato foram testados por hit-test. A presença do slot não altera a grade do card.

## Fonte única

- `public/assets/liquio/1.0.0/`: cópia exata de `dist/` do standalone.
- `public/assets/liquio-contact.js`: inicialização e desmontagem; nenhuma lógica de animação.
- `public/assets/liquio-contact.css`: posicionamento responsivo.
- Quatro HTMLs: stylesheet, script de módulo externo e slot vazio.

Não altere a distribuição dentro do portfólio. No standalone, altere a fonte, incremente a versão em `package.json`, execute `npm test && npm run build` e:

```sh
node scripts/update-portfolio.mjs /caminho/para/portfolio-gdsantos-liquio
```

Depois, no portfólio:

```sh
npm run check
npm run check:liquio
node scripts/validate-project-showcase.mjs
node scripts/validate-project-seo.mjs
node scripts/validate-section-tracker.mjs
node scripts/smoke-liquio-docker.mjs
```

O último comando exige Docker instalado e em execução. Constrói uma imagem local, inicia um contêiner com nome único, verifica health, páginas, casos, sitemap e assets e remove seu próprio contêiner. Não publica nada. A imagem local fica disponível para inspeção.

A matriz de navegador está no standalone: `node tests/browser.mjs --portfolio=/caminho/para/este/portfolio --baseline=/caminho/para/main-original --out=test-results`.

## Segurança e execução

Não foi adicionada API, autenticação, banco, upload, integração externa, dependência de produção ou entrada de usuário. A CSP original segue restritiva, sem `unsafe-inline` ou `unsafe-eval`. Todo JavaScript é servido da mesma origem. O servidor, os headers e o Dockerfile originais foram preservados.

A revisão específica da alteração e os limites de validação estão em `docs/LIQUIO-VALIDACAO.md`. O workflow existente continua executando seus testes e agora também valida os hashes de Liquio e seus assets no smoke de Docker. Esse workflow não foi disparado remotamente nesta entrega.

## Branch e publicação

Esta implementação foi preparada na branch feat/liquio-contact, enviada ao GitHub a pedido do usuário. A main não foi alterada; não houve merge nem deploy. O ZIP contém o código completo, sem credenciais, diretório Git, dependências instaladas ou arquivos de ambiente. A branch local permanece no checkout de trabalho da entrega. Use sua rotina habitual de revisão antes de incorporar o código ao repositório remoto.
