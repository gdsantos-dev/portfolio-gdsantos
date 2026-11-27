import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createRequire} from 'node:module';
const playwright=createRequire(import.meta.url)(process.env.LIQUIO_PLAYWRIGHT||'playwright');
const engine=process.env.LIQUIO_ENGINE||'chromium';
const browser=await playwright[engine].launch({executablePath:process.env.LIQUIO_BROWSER||undefined});
const root=new URL(process.env.PORTFOLIO_PREVIEW||'http://127.0.0.1:4327');
assert(['localhost','127.0.0.1','[::1]'].includes(root.hostname));
const out=resolve(process.env.LIQUIO_EVIDENCE||'.local-review');await mkdir(out,{recursive:true});
const report={browser:browser.version(),engine,layouts:[],themes:[],failures:[],performance:[]};
const read=p=>p.evaluate(async()=>(await import('/contact-guide.js')).inspect());
async function attachProbe(p){
  await p.evaluate(async()=>{window.guideProbe=(await import('/contact-guide.js')).inspect;});
}
async function ready(p){await attachProbe(p);await p.waitForFunction(()=>Boolean(window.guideProbe())&&document.querySelectorAll('#contato canvas').length===1);}
async function go(p,path,options=''){
  await p.goto(new URL(path+(options?'?'+options:'')+'#contato',root).href);
  await p.locator('#contato').scrollIntoViewIfNeeded();
}
async function contactCapture(p,path){
  const clip=await p.evaluate(()=>{
    const r=document.querySelector('#contato').getBoundingClientRect();
    return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:document.querySelector('.footer').getBoundingClientRect().top-r.y};
  });
  await p.screenshot({path,clip,fullPage:true});
}
async function layout(p){
  return p.evaluate(()=>{
    const contact=document.querySelector('#contato'),links=[...contact.querySelectorAll('a')];
    const rect=e=>{const {x,y,width,height}=e.getBoundingClientRect();return [x,y+scrollY,width,height];};
    return {bounds:[contact,contact.querySelector('.contact-intro'),...links,document.querySelector('.footer')].map(rect),
      hrefs:links.map(a=>a.href),focus:[...document.querySelectorAll('a,button,input,[tabindex]')].filter(e=>e.tabIndex>=0).map(e=>e.id||e.getAttribute('href')||e.tagName),
      overflow:document.documentElement.scrollWidth>innerWidth};
  });
}
const summary=v=>{const sorted=[...v].sort((a,b)=>a-b);return sorted[Math.floor(sorted.length/2)];};
try{
  const page=await browser.newPage({viewport:{width:1440,height:900},hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const width of [320,375,390,430,768,1280,1440]){
    await page.setViewportSize({width,height:width>800?900:844});
    for(const path of ['/','/pt/','/en/','/es/']){
      await go(page,path,'liquio=off');await page.evaluate(()=>document.fonts.ready);const before=await layout(page);
      assert.equal(await read(page),null);assert.equal(before.hrefs.length,3);
      if(path==='/pt/'&&[390,1440].includes(width))await contactCapture(page,join(out,'sem-'+width+'.png'));
      await go(page,path);await ready(page);const after=await layout(page);
      assert.equal(after.overflow,false);assert.deepEqual(after.hrefs,before.hrefs);assert.deepEqual(after.focus,before.focus);
      before.bounds.forEach((b,i)=>b.forEach((n,j)=>assert(Math.abs(n-after.bounds[i][j])<=1,'Geometria '+path+' '+width)));
      await page.waitForFunction(()=>{
        const canvas=document.querySelector('#contato canvas');if(!canvas)return false;const r=canvas.getBoundingClientRect();
        const overlap=e=>{const b=e.getBoundingClientRect();return r.x<b.right&&r.right>b.x&&r.y<b.bottom&&r.bottom>b.y;};
        return canvas.getAttribute('aria-hidden')==='true'&&canvas.closest('[inert]')&&
          ![...document.querySelectorAll('#contato .contact-intro,#contato a,.footer a')].some(overlap)&&
          [...document.querySelectorAll('#contato a')].every(a=>{const b=a.getBoundingClientRect();const y=b.y+b.height/2;
            return y<0||y>=innerHeight||a.contains(document.elementFromPoint(b.x+b.width/2,y));});
      },null,{timeout:8000});
      const state=await read(page);report.layouts.push({width,path,scale:state.geometry.scale,position:state.geometry.side?'lateral':'piso'});
      if((width===1440||width===390)&&path!=='/')await contactCapture(page,join(out,path.split('/')[1]+'-'+width+'.png'));
    }
  }
  await go(page,'/pt/','place=floor&demo=walk');await ready(page);
  await page.waitForFunction(()=>window.guideProbe()?.state.moving);
  const x=(await read(page)).state.x;await page.waitForTimeout(300);assert.notEqual((await read(page)).state.x,x);
  await contactCapture(page,join(out,'piso-caminhada.png'));
  await page.locator('#contato a').first().focus();assert(await page.locator('#contato a').first().evaluate(e=>e===document.activeElement));
  await go(page,'/pt/');await ready(page);await page.locator('#contato a').first().focus();
  await page.waitForFunction(()=>window.guideProbe()?.animation==='point-left');
  await page.waitForTimeout(160);await contactCapture(page,join(out,'indicacao.png'));
  for(const theme of ['original','natal','halloween','carnaval','sao-joao','ano-novo']){
    await go(page,'/pt/','theme='+theme+'&demo=seasonal');await ready(page);
    await page.waitForFunction(id=>window.guideProbe()?.theme===id,theme);
    await page.waitForTimeout(250);await page.locator('[data-contact-guide]').screenshot({path:join(out,theme+'.png')});
    report.themes.push(theme);
  }
  await page.evaluate(async()=>{const api=await import('/contact-guide.js');api.setEnabled(false);api.setEnabled(true);});await ready(page);
  assert.equal(await page.locator('#contato canvas').count(),1);
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>!document.querySelector('#contato canvas'));
  await page.emulateMedia({reducedMotion:'no-preference'});await ready(page);
  await page.setViewportSize({width:844,height:390});await ready(page);
  await page.evaluate(()=>document.querySelector('#contato').remove());await page.waitForFunction(()=>!window.guideProbe());
  for(const path of ['/pt/projeto/?id=scoutliq','/en/projeto/?id=scoutliq','/es/projeto/?id=scoutliq']){
    await page.goto(new URL(path,root).href);assert.equal(await page.locator('script[src*="contact-guide"],[data-contact-guide]').count(),0);
  }
  for(const failure of ['import','atlas','costume']){
    const p=await browser.newPage();await p.route(({pathname})=>failure==='import'?pathname.endsWith('/src/index.js'):
      failure==='atlas'?pathname.endsWith('/original.png'):pathname.endsWith('/casaco.svg'),route=>route.abort());
    const rejection=p.waitForEvent('requestfailed');
    await go(p,'/en/',failure==='costume'?'theme=natal':'');await rejection;
    if(failure==='costume'){await ready(p);assert.equal((await read(p)).theme,'original');}
    else await p.waitForFunction(()=>!document.querySelector('[data-contact-guide]'));
    assert.equal(await p.locator('#contato a').count(),3);
    report.failures.push(failure);await p.close();
  }
  const broken=await browser.newPage();
  await broken.route('**/assets/natal/manifest.js',r=>r.fulfill({contentType:'text/javascript',body:'export const natal={id:"natal",items:42};'}));
  const warned=broken.waitForEvent('console',{predicate:m=>m.type()==='warning'&&m.text().includes('prévia indisponível')});
  await go(broken,'/es/');await warned;
  assert.equal(await broken.locator('[data-contact-guide]').count(),0);assert.equal(await broken.locator('#contato a').count(),3);
  report.failures.push('manifesto');await broken.close();
  const during=await browser.newPage();let release,requested;
  const hit=new Promise(resolve=>requested=resolve),gate=new Promise(resolve=>release=resolve);
  await during.route('**/assets/original.png',async route=>{requested();await gate;await route.fulfill({status:404,body:''});});
  await during.goto(new URL('/pt/#contato',root).href,{waitUntil:'domcontentloaded'});await hit;
  await during.evaluate(async()=>(await import('/contact-guide.js')).setEnabled(false));release();
  assert.equal(await during.locator('[data-contact-guide]').count(),0);assert.equal(await during.locator('#contato a').count(),3);
  await during.close();report.failures.push('cancelamento durante montagem');
  assert.deepEqual(errors,[]);
  if(engine==='chromium'){
    for(let round=0;round<3;round++)for(const mode of [['baseline','original','natal'],['natal','baseline','original'],['original','natal','baseline']][round]){
      const ctx=await browser.newContext({viewport:{width:1280,height:900}});
      try{
        const p=await ctx.newPage(),cdp=await ctx.newCDPSession(p);await cdp.send('Performance.enable');
        await p.route(root.origin+'/pt/**',async route=>{
          if(route.request().resourceType()!=='document')return route.continue();
          const res=await route.fetch();let body=await res.text();
          if(mode==='baseline')body=body.replace(/<script type="module" src="\/contact-guide\.js"><\/script>/,'');
          return route.fulfill({response:res,body});
        });
        await p.addInitScript(()=>{window.measure={lcp:null,cls:0};new PerformanceObserver(l=>{for(const e of l.getEntries())window.measure.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
          new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.measure.cls+=e.value;}).observe({type:'layout-shift',buffered:true});});
        await p.goto(new URL('/pt/?theme='+mode,root).href);await p.waitForTimeout(900);
        const before=await p.evaluate(()=>performance.getEntriesByType('resource').map(r=>r.name));assert(!before.some(u=>u.includes('/liquio/2.')));
        const start=performance.now();await p.locator('#contato').scrollIntoViewIfNeeded();
        if(mode!=='baseline'){await attachProbe(p);await p.waitForFunction(id=>window.guideProbe()?.theme===id,mode);}
        const enterMs=performance.now()-start;await p.waitForTimeout(500);
        const metrics=await p.evaluate(async()=>{
          const frames=[];let prev=await new Promise(requestAnimationFrame);
          for(let i=0;i<30;i++){const time=await new Promise(requestAnimationFrame);frames.push(time-prev);prev=time;}
          const entries=[...performance.getEntriesByType('navigation'),...performance.getEntriesByType('resource')];
          return {...window.measure,requests:entries.length,bytes:entries.reduce((sum,e)=>sum+e.transferSize,0),frames,
            costumeRequests:entries.filter(e=>e.name.includes('/liquio/2.')&&e.name.endsWith('.svg')).length};
        });if(mode==='original')assert.equal(metrics.costumeRequests,0);
        await p.locator('#contato a').first().focus();
        await p.evaluate(()=>{window.inputProbe=new Promise(resolve=>document.addEventListener('keydown',e=>{
          requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(performance.now()-e.timeStamp)));
        },{once:true}));});
        await p.keyboard.press('Tab');metrics.keyToSecondFrameMs=await p.evaluate(()=>window.inputProbe);
        const counters=(await cdp.send('Performance.getMetrics')).metrics;
        for(const name of ['TaskDuration','JSHeapUsedSize'])metrics[name]=counters.find(v=>v.name===name)?.value;
        report.performance.push({round,mode,enterMs,...metrics});
      }finally{await ctx.close();}
    }
  }
  console.log(report.layouts.length+' combinações, seis aparências, rollback, falhas e medições locais OK.');
  for(const mode of ['baseline','original','natal']){const rows=report.performance.filter(r=>r.mode===mode);if(rows.length)console.log(mode,summary(rows.map(r=>r.bytes)),summary(rows.map(r=>r.enterMs)));}
}finally{await writeFile(join(out,'validacao.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
