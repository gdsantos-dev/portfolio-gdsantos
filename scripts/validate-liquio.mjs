import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const bootstrap=await fs.readFile(path.join(root,'public/assets/liquio-contact.js'),'utf8');
const version=/\.\/liquio\/(\d+\.\d+\.\d+)\//.exec(bootstrap)?.[1];
assert.ok(version, 'Versioned import missing');
const base=path.join(root,'public/assets/liquio',version);
const manifest=JSON.parse(await fs.readFile(path.join(base,'manifest.json'),'utf8'));
assert.equal(manifest.version,version);
for(const [file,hash]of Object.entries(manifest.files)){
 assert.equal(createHash('sha256').update(await fs.readFile(path.join(base,file))).digest('hex'),hash,file);
}
for(const lang of ['','pt/','en/','es/']){
 const html=await fs.readFile(path.join(root,'public',lang,'index.html'),'utf8');
 assert.equal((html.match(/data-liquio aria-hidden="true"/g)||[]).length,1);
 assert.ok(!html.includes('/assets/liquio/'+version+'/liquio.css'), lang+': Liquio animation CSS must remain paused');
 assert.ok(!html.includes('/assets/liquio-contact.css'), lang+': Liquio integration CSS must remain paused');
 assert.ok(!html.includes('/assets/liquio-contact.js'), lang+': Liquio animation bootstrap must remain paused');
 assert.ok(html.includes('/contact-open.css?v=20261124-v22-final'), 'Contact v22 cache key mismatch: '+lang);
 assert.ok(/<section id="contato"[^>]*><div class="contact-liquio"/.test(html));
}
for(const lang of ['pt','en','es']) {
 const html=await fs.readFile(path.join(root,'public',lang,'projeto/index.html'),'utf8');
 assert.ok(!html.includes('data-liquio'), lang+': animated Liquio slot must not appear on case pages');
 assert.ok(!html.includes('/assets/liquio-contact.js'), lang+': animation bootstrap must not appear on case pages');
}
const js=await fs.readFile(path.join(root,'public/assets/liquio-contact.js'),'utf8');
assert.ok(js.includes("./liquio/"+version+"/liquio.js"));
assert.ok(!js.includes('setTimeout'));
const css=await fs.readFile(path.join(root,'public/assets/liquio-contact.css'),'utf8');
assert.ok(css.includes('pointer-events: none')); assert.ok(!css.includes('fixed'));
const pausedCss=await fs.readFile(path.join(root,'public/contact-open.css'),'utf8');
assert.ok(pausedCss.includes('#contato>.contact-liquio{display:none!important}'));
console.log('Liquio: versioned checksums intact; runtime absent from 4 homepages; slot hidden; 3 case exclusions OK.');
