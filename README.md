# Portfólio | Guilherme Santos

Portfólio profissional público de Guilherme dos Santos, estudante de Ciência da Computação. Apresenta formação acadêmica, áreas de interesse, currículo e formas de contato.

**Site:** [gdsantos-dev.com](https://gdsantos-dev.com/)

![Prévia desktop do portfólio](docs/desktop.png)

## O que está disponível

- Páginas em português brasileiro, inglês e espanhol.
- Apresentação, formação, áreas de interesse e contato.
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

O arquivo `public/data/projects.json` está vazio nesta versão; os projetos serão incluídos quando estiverem prontos para divulgação.

> O currículo em `public/data/curriculos/` é parte do site público e também fica acessível neste repositório.
