import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { projectCaseSEO } from './project-seo.mjs';

const root = path.resolve(import.meta.dirname, '..');
const projects = JSON.parse(await fs.readFile(path.join(root, 'public/data/projects.json'), 'utf8'));
const locales = {pt:'pt-BR', en:'en-US', es:'es'};
const sitemap = await fs.readFile(path.join(root,'public/sitemap.xml'),'utf8');
const allURLs = [ ...['pt','en','es'].map(l=>'/'+l+'/'), ...projects.flatMap(p=>Object.keys(locales).map(l=>'/'+l+'/projeto/?id='+p.id)) ];
for (const url of allURLs) {
  assert.ok(sitemap.includes('<loc>https://gdsantos-dev.com'+url+'</loc>'), 'Missing sitemap URL '+url);
  if(url.includes('projeto')) for (const l of Object.values(locales)) {
    assert.ok(sitemap.includes('hreflang="'+l+'"'), 'Missing hreflang in sitemap');
  }
}
assert.equal((sitemap.match(/<loc>/g)||[]).length,allURLs.length,'Unexpected sitemap URL count');
for (const p of projects) for(const l of Object.keys(locales)){
  const template = await fs.readFile(path.join(root,'public',l,'projeto/index.html'),'utf8');
  const result=projectCaseSEO(template,p,l);
  assert.ok(result.includes('<title>'+p.texts[l].title+' | Guilherme Santos</title>'));
  assert.ok(result.includes('<meta property="og:url" content="https://gdsantos-dev.com/'+l+'/projeto/?id='+p.id+'">'));
  assert.ok(result.includes('<meta name="description"'));
  assert.ok(result.includes('hreflang="x-default"'));
  assert.ok(result.includes('<meta name="twitter:description"'));
}
for(const [lang,title] of [['en','Guilherme Santos | Portfolio'],['es','Guilherme Santos | Portafolio']]){
 const html=await fs.readFile(path.join(root,'public',lang,'index.html'),'utf8');
 assert.ok(html.includes('<title>'+title+'</title>'));
 assert.ok(html.includes('<meta property="og:title" content="'+title+'">'));
 assert.ok(html.includes('<meta name="twitter:title" content="'+title+'">'));
}
// Verify real HTTP responses rather than relying solely on textual source tests.
const listener=createServer();
listener.listen(0,'127.0.0.1');
await once(listener,'listening');
const port=listener.address().port;
await new Promise((resolve,reject)=>listener.close(err=>err?reject(err):resolve()));
const child=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});
let log='';
child.stderr.on('data',chunk=>{log+=String(chunk)});
const origin='http://127.0.0.1:'+port;
try{
  let ready=false;
  for(let i=0;i<40;i++){
    if(child.exitCode!==null)break;
    try { const health=await fetch(origin+'/health');if(health.ok){ready=true;break;} }catch{}
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  assert.ok(ready,'Server not ready: '+log);
  for(const item of projects)for(const lang of Object.keys(locales)){
    const target='/'+lang+'/projeto/?id='+item.id;
    const response=await fetch(origin+target);
    assert.equal(response.status,200,target);
    const page=await response.text();
    assert.ok(page.includes('<title>'+item.texts[lang].title+' | Guilherme Santos</title>'),target);
    assert.ok(page.includes('https://gdsantos-dev.com'+target),target);
    assert.ok(page.includes('hreflang="'+locales[lang]+'"'),target);
    const headResponse=await fetch(origin+target,{method:'HEAD'});
    assert.equal(headResponse.status,200);
    assert.equal(await headResponse.text(),'');
  }
  const response=await fetch(origin+'/sitemap.xml');
  assert.equal(response.status,200);
  assert.equal(await response.text(),sitemap);
  const regular=await fetch(origin+'/pt/');
  assert.equal(regular.status,200);
  assert.ok((await regular.text()).includes('<title>Guilherme Santos | Portfólio</title>'));
}finally{
  child.kill();
  if(child.exitCode===null)await Promise.race([once(child,'exit'),new Promise(resolve=>setTimeout(resolve,2000))]);
}
console.log('SEO: 3 localized home titles, 6 project meta responses, 9 sitemap routes, GET/HEAD OK.');
