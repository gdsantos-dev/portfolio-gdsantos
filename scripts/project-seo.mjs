// Dynamic SEO metadata for the existing /{language}/projeto/?id={slug} routes.
// Keeps link previews meaningful without exposing unapproved interface screenshots.
const BASE_URL = 'https://gdsantos-dev.com';
const LOCALES = Object.freeze({ pt: 'pt-BR', en: 'en-US', es: 'es' });
const OG_LOCALES = Object.freeze({ pt: 'pt_BR', en: 'en_US', es: 'es_ES' });
const SITE_NAMES = Object.freeze({
  pt: 'Guilherme Santos | Portfólio',
  en: 'Guilherme Santos | Portfolio',
  es: 'Guilherme Santos | Portafolio',
});

const escapeHTML = value => String(value)
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

export function projectCaseSEO(html, project, lang) {
  if (!(lang in LOCALES) || !/^[a-z0-9-]+$/.test(project?.id || '')) return html;
  const content = project.texts?.[lang];
  if (!content?.title || !content.description) return html;

  const title = escapeHTML(content.title + ' | Guilherme Santos');
  const description = escapeHTML(content.description);
  const url = BASE_URL + '/' + lang + '/projeto/?id=' + encodeURIComponent(project.id);
  const tags = [
    '<link rel="canonical" href="' + url + '">',
    ...Object.entries(LOCALES).map(([code, hreflang]) =>
      '<link rel="alternate" hreflang="' + hreflang + '" href="' +
      BASE_URL + '/' + code + '/projeto/?id=' + encodeURIComponent(project.id) + '">'),
    '<link rel="alternate" hreflang="x-default" href="' + BASE_URL + '/pt/projeto/?id=' + encodeURIComponent(project.id) + '">',
    '<meta property="og:type" content="article">',
    '<meta property="og:site_name" content="' + escapeHTML(SITE_NAMES[lang]) + '">',
    '<meta property="og:locale" content="' + OG_LOCALES[lang] + '">',
    '<meta property="og:title" content="' + title + '">',
    '<meta property="og:description" content="' + description + '">',
    '<meta property="og:url" content="' + url + '">',
    '<meta name="twitter:card" content="summary">',
    '<meta name="twitter:title" content="' + title + '">',
    '<meta name="twitter:description" content="' + description + '">',
  ].join('\n');

  return html.replace(/<title>[^<]*<\/title>/, '<title>' + title + '</title>')
    .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + description + '">')
    .replace('</head>', tags + '\n</head>');
}
