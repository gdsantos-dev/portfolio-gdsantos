import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const pages = [
  ['index.html','Menu','Fechar'],
  ['pt/index.html','Menu','Fechar'],
  ['en/index.html','Menu','Close'],
  ['es/index.html','Menú','Cerrar'],
  ['pt/projeto/index.html','Menu','Fechar'],
  ['en/projeto/index.html','Menu','Close'],
  ['es/projeto/index.html','Menú','Cerrar'],
];

for (const [file, closed, opened] of pages) {
 const html = readFileSync(path.join(root,'public',file),'utf8');
 assert.equal((html.match(/class="menu-toggle"/g)||[]).length,1,file);
 const button = html.match(/<button class="menu-toggle"[^>]*>(.*?)<\/button>/)?.[1];
 assert.ok(button,file+': missing mobile menu');
 assert.ok(html.includes('aria-controls="public-navigation"'),file);
 assert.ok(html.includes('aria-expanded="false"'),file);
 assert.ok(button.includes('<span class="menu-label--closed">'+closed+'</span>'),file);
 assert.ok(button.includes('<span class="menu-label--open">'+opened+'</span>'),file);
 assert.ok(button.includes('<span class="menu-symbol" aria-hidden="true"></span>'),file);
 assert.ok(html.includes('/style.css?v=20261030-menu1'),file+': stale CSS URL');
}
const css = readFileSync(path.join(root,'public/style.css'),'utf8');
assert.ok(css.includes('.menu-symbol::before,.menu-symbol::after'), 'Missing plus icon strokes');
assert.ok(css.includes('.menu-toggle[aria-expanded="true"] .menu-symbol{transform:rotate(45deg)}'), 'Missing open-to-close icon transition');
assert.ok(css.includes('.menu-toggle[aria-expanded="true"] .menu-label--open{display:inline}'), 'Missing accessible open label');
assert.ok(css.includes('.menu-toggle:focus-visible'), 'Missing keyboard focus');
assert.ok(!css.includes('.menu-symbol{position:relative;width:16px;height:12px;border-top:'), 'Old two-line icon still in use');
const js = readFileSync(path.join(root,'public/main.js'),'utf8');
assert.ok(js.includes('aria-expanded'), 'The existing toggle behavior must remain intact');
assert.ok(js.includes('Escape'), 'Menu must close using Escape');
console.log('Mobile menu: 7 pages, 3 languages, plus/close visual, focus and cached CSS validated.');
