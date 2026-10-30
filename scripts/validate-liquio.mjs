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
const contactCss=await fs.readFile(path.join(root,'public/assets/liquio-contact.css'));
const contactCssHash=createHash('sha256').update(contactCss).digest('hex').slice(0,12);
for(const lang of ['','pt/','en/','es/']){
 const html=await fs.readFile(path.join(root,'public',lang,'index.html'),'utf8');
 assert.equal((html.match(/data-liquio aria-hidden="true"/g)||[]).length,1);
 assert.ok(html.includes('/assets/liquio/'+version+'/liquio.css'));
 assert.ok(html.includes('/assets/liquio-contact.css?v='+contactCssHash+'"'), 'Contact CSS cache key mismatch: '+lang);
 assert.ok(/<section id="contato"[^>]*><div class="contact-liquio"/.test(html));
}
for(const lang of ['pt','en','es']) assert.ok(!(await fs.readFile(path.join(root,'public',lang,'projeto/index.html'),'utf8')).includes('liquio'));
const js=await fs.readFile(path.join(root,'public/assets/liquio-contact.js'),'utf8');
assert.ok(js.includes("./liquio/"+version+"/liquio.js"));
assert.ok(!js.includes('setTimeout'));
const css=await fs.readFile(path.join(root,'public/assets/liquio-contact.css'),'utf8');
assert.ok(css.includes('pointer-events: none')); assert.ok(!css.includes('fixed'));
console.log('Liquio: versioned checksums, 4 homepages, 3 case exclusions, isolated bootstrap and anchored placement OK.');
