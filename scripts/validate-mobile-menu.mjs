import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const pages = [
  ['index.html','Menu'], ['pt/index.html','Menu'], ['en/index.html','Menu'],
  ['es/index.html','Menú'], ['pt/projeto/index.html','Menu'],
  ['en/projeto/index.html','Menu'], ['es/projeto/index.html','Menu'],
];
for (const [file, label] of pages) {
 const html = readFileSync(path.join(root,'public',file),'utf8');
 assert.equal((html.match(/class="menu-toggle"/g)||[]).length,1,file);
 const button=html.match(/<button class="menu-toggle"[^>]*>(.*?)<\/button>/)?.[1];
 assert.equal(button,label+'<span class="menu-symbol" aria-hidden="true"></span>',file);
 assert.ok(html.includes('aria-controls="public-navigation"'),file);
 assert.ok(html.includes('aria-expanded="false"'),file);
 assert.ok(!html.includes('menu-label--open'),file+': close label should not appear');
 assert.ok(html.includes('/style.css?v=20261030-menu2'),file+': stale stylesheet');
}
const css=readFileSync(path.join(root,'public/style.css'),'utf8');
assert.ok(css.includes('.menu-symbol::before{transform:translateY(-5px)}'), 'Missing top closed stroke');
assert.ok(css.includes('.menu-symbol::after{transform:translateY(5px)}'), 'Missing bottom closed stroke');
assert.ok(css.includes('.menu-toggle[aria-expanded="true"] .menu-symbol::before{transform:rotate(45deg)}'), 'Missing upper X animation');
assert.ok(css.includes('.menu-toggle[aria-expanded="true"] .menu-symbol::after{transform:rotate(-45deg)}'), 'Missing lower X animation');
assert.ok(css.includes('transition:transform .24s cubic-bezier(.22,1,.36,1)'), 'Missing smooth transition');
assert.ok(css.includes('.menu-toggle:focus-visible'), 'Missing keyboard focus');
assert.ok(!css.includes('.menu-label--open'), 'Old close text CSS remains');
const js=readFileSync(path.join(root,'public/main.js'),'utf8');
assert.ok(js.includes('aria-expanded') && js.includes('Escape'),'Menu behavior or escape missing');
console.log('Mobile menu: two strokes morph to X without close label across 7 pages.');
