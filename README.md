# Portfólio | Guilherme Santos

Portfólio profissional público de Guilherme dos Santos, estudante de Ciência da Computação. Apresenta formação acadêmica, áreas de interesse, currículo e formas de contato.

**Site:** [gdsantos-dev.com](https://gdsantos-dev.com/)

![Prévia desktop do portfólio](docs/desktop.png)

## O que está disponível

- Páginas em português brasileiro, inglês e espanhol.
- Apresentação, formação, áreas de interesse, projetos e contato.
- Vitrine editorial para ScoutLIQ e DashLIQ, com conteúdo PT/EN/ES e detalhes acessíveis.
- Estudos de caso em páginas próprias, com contexto, processo, escolhas de engenharia e limites de validação.
- Currículo em PDF para consulta e download.
- Layout responsivo e metadados de compartilhamento.

## Tecnologias

HTML, CSS e JavaScript, servidos por Node.js sem dependências externas. Dockerfile para deploy no Railway.

## Executar localmente

Requer Node.js 20 ou superior.

```bash
npm start
```

Acesse `http://localhost:3000/pt/` (ou `/en/` e `/es/`).

## Estrutura

- `public/`: versão estática publicada (HTML, CSS, JS, imagens, PDF e conteúdo).
- `server.mjs`: servidor HTTP para os arquivos públicos.
- `Dockerfile`: configuração de execução em contêiner.
- `docs/`: capturas de tela para a documentação do repositório.

## Desenvolvimento e publicação

Este repositório contém **somente a versão pública** do portfólio. O laboratório de desenvolvimento, seus arquivos de configuração e o banco local não fazem parte deste repositório.

Atualmente, o deploy do site é realizado manualmente no Railway. Alterar o código aqui **não atualiza automaticamente** o site publicado. Para publicar alterações, é necessário fazer novo deploy.

O arquivo `public/data/projects.json` mantém o conteúdo dos projetos próprios exibidos na seção editorial. A apresentação é gerada por `public/projects-cinema.js` e estilizada por `public/projects-cinema.css`. Links para repositórios privados e demonstrações não publicadas ficam de fora da vitrine.

As páginas de case são `/{pt|en|es}/projeto/?id=scoutliq` e `/{pt|en|es}/projeto/?id=dashliq`; o conteúdo fica em `public/data/projects.json` (chave `texts.<idioma>.case`) e é construído por `public/project-case.js`. O script de verificação é `node scripts/validate-project-showcase.mjs`, também executado no GitHub Actions.

As páginas do site não usam navegação que bloqueie o scroll. As transições são discretas, e `prefers-reduced-motion` é respeitado. A validação visual em desktop e celular deve acontecer antes de integrar esta alteração à branch principal.

> O currículo em `public/data/curriculos/` é parte do site público e também fica acessível neste repositório.
