import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const bootstrap=await fs.readFile(path.join(root,'public/assets/liquio-contact.js'),'utf8');
const version=/\.\/liquio\/(\d+\.\d+\.\d+)\//.exec(bootstrap)?.[1];
assert.ok(version, 'Liquio version missing');
const name='portfolio-liquio-smoke-'+Date.now();
const run=(args)=>{const r=spawnSync('docker',args,{cwd:root,windowsHide:true,stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)throw Error('Docker failed: '+args[0]);};
const dockerVersion=spawnSync('docker',['version'],{windowsHide:true,stdio:'inherit'});
if(dockerVersion.error||dockerVersion.status!==0)throw Error('Docker executable/daemon unavailable. Start Docker before running this smoke test.');
let started=false;
try{
 run(['build','-t',name,'.']);
 run(['run','-d','--name',name,'-p','127.0.0.1::3000',name]);started=true;
 const port=spawnSync('docker',['port',name,'3000/tcp'],{windowsHide:true,encoding:'utf8'});
 assert.equal(port.status,0);
 const origin='http://'+port.stdout.trim().split(/\r?\n/)[0];
 let ready=false;
 for(let i=0;i<60;i++){try{if((await fetch(origin+'/health')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}
 assert.ok(ready,'Container did not become healthy');
 for(const route of ['/health','/pt/','/en/','/es/','/sitemap.xml','/assets/liquio/'+version+'/liquio.js','/assets/liquio/'+version+'/sprites/liquio.png',...['pt','en','es'].flatMap(l=>['scoutliq','dashliq'].map(id=>'/'+l+'/projeto/?id='+id))]){
  assert.equal((await fetch(origin+route)).status,200,route);
 }
 console.log('Docker: build, health, localized pages, 6 cases, sitemap and Liquio assets OK.');
}finally{
 if(started)run(['rm','-f',name]);
 // Keep the tagged local image for inspection. No remote push or deploy.
}
