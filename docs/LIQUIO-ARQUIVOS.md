# Arquivos da integração Liquio

Base: f8f21252365a04c7d704533cf2b008e6140bc8a5 · branch local feat/liquio-contact.

## Modificados

- `.github/workflows/validate-project-pages.yml`
- `README.md`
- `package.json`
- `public/en/index.html`
- `public/es/index.html`
- `public/index.html`
- `public/pt/index.html`

## Adicionados

- .gitattributes: mantém LF na distribuição para preservar hashes após clone.

- `docs/LIQUIO-VALIDACAO.md`
- `docs/LIQUIO.md`
- `docs/liquio-browser-report.json`
- `docs/liquio-code-report.json`
- `docs/liquio-desktop.png`
- `docs/liquio-mobile.png`
- `public/assets/liquio-contact.css`
- `public/assets/liquio-contact.js`
- `public/assets/liquio/1.0.0/liquio-cycle.js`
- `public/assets/liquio/1.0.0/liquio.css`
- `public/assets/liquio/1.0.0/liquio.js`
- `public/assets/liquio/1.0.0/manifest.json`
- `public/assets/liquio/1.0.0/sprites/liquio.png`
- `scripts/smoke-liquio-docker.mjs`
- `scripts/validate-liquio.mjs`
- `docs/LIQUIO-ARQUIVOS.md` (este inventário)

Os quatro HTMLs recebem somente os imports e o slot decorativo dentro do contato. O workflow e package.json ganham verificação de distribuição; os testes existentes são preservados. README e docs registram a integração. O standalone completo foi adicionado em sua própria pasta, com src, dist, art, demo, scripts, tests e docs.
