import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {access,mkdir,mkdtemp,readFile,readdir,rename,rm} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const version='2.0.0-rc.1';
const digest='aac927f15a7be02b5c71ceed4da133289906086b5cd733562fe73571f031f338';
if(!process.argv[2])throw Error('Informe o caminho do pacote privado .tgz.');
const archive=resolve(process.argv[2]),bytes=await readFile(archive);
assert.equal(createHash('sha256').update(bytes).digest('hex'),digest,'SHA-256 diferente da distribuição registrada');
const dest=fileURLToPath(new URL('../public/assets/liquio/'+version,import.meta.url));
await mkdir(dirname(dest),{recursive:true});
const tmp=await mkdtemp(join(dirname(dest),'.preview-'));
try{
  const result=spawnSync('tar',['-xzf','-','-C',tmp,'--strip-components','1','package/src','package/assets'],{windowsHide:true,input:bytes});
  if(result.status!==0)throw Error('Falha ao extrair os arquivos da distribuição');
  let installed=true;
  try{await access(dest);}catch(err){if(err.code!=='ENOENT')throw err;installed=false;}
  if(installed){
    const walk=async root=>(await readdir(root,{recursive:true,withFileTypes:true})).filter(x=>x.isFile())
      .map(x=>join(x.parentPath,x.name).slice(root.length+1)).sort();
    const paths=await walk(tmp);assert.deepEqual(await walk(dest),paths);
    for(const path of paths)assert((await readFile(join(dest,path))).equals(await readFile(join(tmp,path))),path);
  }else await rename(tmp,dest);
  console.log('Liquio '+version+' · distribuição conferida.');
}finally{await rm(tmp,{force:true,recursive:true});}
