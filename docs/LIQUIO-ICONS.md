# Liquio: ícones do portfólio

- Referência dos ícones de instalação: visual aprovado do Liquio, preservado como PNG indexado em `public/assets/liquio/icon-source.png`.
- Ícone de tela inicial (iOS): `public/assets/apple-touch-icon.png` (180×180).
- Android/instalação: `public/assets/icon-192.png`, `public/assets/icon-512.png` e `public/manifest.webmanifest`.
- Navegador: **G vermelho original**, restaurado em `public/assets/favicon.svg` (fonte Georgia, crimson `#e63950`), `public/assets/favicon-32.png` e `public/favicon.ico`. Não usar Liquio nas abas.
- iPhone/Android: **Liquio** continua como ícone da tela inicial (sem mudança no manifesto ou nos metadados da instalação).
- Nome curto do atalho: **GDSantos**, sem alterar o título SEO das páginas.
- Rota padrão do app: `/pt/`. Aplicação é apenas um atalho do portfólio, sem service worker, push ou mudanças de funcionalidade.
- Links dos novos ícones são iguais em raiz, PT, EN, ES e três páginas de projetos.

Para regerar os PNGs a partir da fonte compacta: `python -m pip install pillow==11.3.0 cairosvg==2.8.2`, `python scripts/generate-liquio-icons.py`, `node scripts/validate-liquio-icons.mjs`.

O workflow `Build Liquio icons` executa a geração e registra as saídas em Git automaticamente quando o arquivo-fonte ou o gerador é alterado.

Após publicar, remova o atalho antigo da tela inicial do iPhone e adicione o site novamente pelo Safari. O iOS pode manter uma cópia antiga do ícone/nome do atalho anterior.

Não há alterações de layout, textos, scripts do Liquio animado ou funcionalidades do portfólio.
