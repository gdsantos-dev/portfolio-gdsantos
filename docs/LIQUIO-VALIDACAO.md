# Validação da entrega Liquio 1.0.0

Data: 30/10/2026. Execução local em Windows, Node.js 24.19.0 e Chrome 156.0.8078.74, via Playwright 1.62.1.

## Resultado

| Verificação | Resultado |
| --- | --- |
| Testes unitários do standalone | 9/9 passaram |
| Etapas finais de build, sintaxe, atualização e testes existentes | 15/15 passaram |
| Verificações no navegador | 142 passaram, 0 falhas |
| Matriz do portfólio | PT/EN/ES × 320/375/768/1440 px: 12 casos |
| Demonstração | Inspeção das 8 poses nas 4 larguras |
| Geometria e conteúdo contra a main | Iguais; tolerância de comparação de 0,01 px |
| Links de contato | Hit-tests passaram nos 12 casos |
| Estudos de caso | Liquio ausente nos 6 casos |
| Página raiz | Liquio presente apenas no contato |
| Recursos externos / erros de navegador | Nenhum |
| HTTP local | /health, páginas principais, sitemap, currículos e assets: 200 |
| Docker | **Pendente: executável não instalado** |
| Deploy, merge, push e execução remota do CI | Não realizados |

As 15 etapas incluem novamente os 9 testes de unidade: são agrupamentos diferentes, não 24 testes de unidade.

## Animações e ciclo de vida

A máquina de estados foi exercitada por 10.000 transições, com todas as ações especiais, sem repetição consecutiva e dentro dos intervalos definidos. No navegador, 180 segundos de relógio simulado registraram 14 ações especiais, cobrindo olhar, inclinação, orelha, cachecol e sono. Os intervalos medidos entre inícios foram de 10.127 a 14.911 ms.

Cada sequência individual voltou à pose normal. Movimento reduzido foi alternado no navegador, e duas capturas da instância permaneceram idênticas após 60 segundos simulados. A animação CSS ficou desativada.

Os testes de ciclo de vida verificam: inicialização idempotente, destruição repetida, preservação dos filhos originais, pausa ao receber visibilitychange, retomada com novos intervalos, mudança de preferência e 100 montagens/desmontagens sem eventos ou temporizadores restantes. A mudança de visibilidade é simulada nesse teste de unidade; não é uma homologação do gerenciamento de abas em todos os sistemas operacionais.

## Preservação do portfólio

A comparação de navegador mede posição, tamanho e texto do hero, apresentação, interesses, projetos, contato e seus conteúdos, navegação e rodapé. As alterações de produção ficaram restritas ao slot decorativo, aos imports e aos assets de Liquio. O JavaScript principal, os estilos gerais, o servidor, o Dockerfile, os dados e os documentos existentes permanecem iguais à base.

O teste de SEO existente passou após executar servidor e navegador fora do isolamento de rede local. Uma primeira tentativa dentro do ambiente restrito falhou por indisponibilidade da conexão local; esse resultado não foi tratado como falha do site nem omitido como uma aprovação.

## Inspeção visual

Foram inspecionadas as capturas do standalone, integração desktop, 320 px em PT, 375 px em ES e 768 px em EN. Os sprites são PNG RGBA com alpha real; o atlas mede 512 × 80 px, com oito quadros de 64 × 80 px. O filtro CSS é pixelated. A folha de autoria foi gerada com imagegen a partir da referência e processada por recorte/redução com vizinho mais próximo; a imagem de referência inteira não faz parte da interface.

## Revisão de segurança proporcional ao escopo

- Sem dependências de produção adicionadas; HTML/CSS/JS e PNG locais.
- Sem segredos, credenciais, arquivos de ambiente, diretório Git ou node_modules nos pacotes.
- CSP existente preservada: scripts e estilos da mesma origem, sem unsafe-inline/eval.
- Nenhuma chamada externa, coleta de dados, analytics ou acesso a armazenamento pelo componente.
- Nenhum HTML não confiável, eval, comando de sistema, fetch de URL de usuário ou manipulação de dados de terceiros pelo componente.
- Nenhum elemento interativo ou navegação no personagem.
- Integridade da distribuição verificada por SHA-256; atualização aceita somente arquivos esperados e versão semver.
- Servidor, tratamento de erros e headers existentes preservados; teste HTTP confirmou CSP e nosniff.
- Autenticação, autorização de objetos, IDOR/BOLA, mass assignment, privilégios, SQL/NoSQL, CSRF, cookies/tokens, pagamentos, uploads, webhooks, rate limiting de formulários e idempotência financeira: não se aplicam a esta adição decorativa, que não introduz esses recursos.
- A imagem base de Docker não foi baixada nem auditada neste ambiente. HTTPS de produção não foi revalidado; não houve deploy.

## Limites

Não houve execução em Docker, dispositivo móvel físico, Safari, Firefox, leitor de tela real ou servidor de produção. Responsividade foi verificada por viewport de navegador, não apresentada como teste em aparelho físico. Não foi executada uma suíte Axe; acessibilidade do componente foi verificada por semântica decorativa, ausência de foco/interação, movimento reduzido, hit-tests e navegação de menu por teclado.

O teste Docker está em `scripts/smoke-liquio-docker.mjs` no portfólio. Antes de publicar, executá-lo com Docker disponível. O workflow original preserva o smoke de contêiner e ganhou as verificações de assets; não foi executado remotamente nesta entrega.

As evidências brutas são `browser-report.json` e `code-report.json`, incluídas na documentação dos pacotes.
