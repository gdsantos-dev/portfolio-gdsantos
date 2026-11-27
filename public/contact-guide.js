// Host policy. Local review is enabled on loopback only.
const config={enabled:false,autonomy:true,seasonal:false,timeZone:'America/Sao_Paulo',periods:[]};
const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
const options=new URLSearchParams(location.search);
const entry='/assets/liquio/2.0.0-rc.1/src/index.js';
const section=document.querySelector('#contato'),intro=section?.querySelector('.contact-intro');
const links=section?.querySelector('.contact-links'),footer=document.querySelector('.footer');
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const themes=['original','natal','halloween','carnaval','sao-joao','ano-novo'];
let enabled=(config.enabled||local)&&options.get('liquio')!=='off',inView=false,failed=false;
let current=null, pending=null, observer=null, size=null, parentWatch=null, layoutFrame=0;
let lastCue=-Infinity,themeRevision=0,scope=null;

function geometry(){
  const rect=section.getBoundingClientRect(),copy=intro.getBoundingClientRect();
  const channels=links.getBoundingClientRect(),end=footer.getBoundingClientRect();
  const sideLeft=Math.ceil(copy.right-rect.left+16),sideWidth=Math.floor(rect.width-sideLeft-8);
  if(sideWidth>=112 && !(local&&options.get('place')==='floor')){
    return {left:sideLeft,top:Math.floor(copy.bottom-rect.top)-80,width:sideWidth,height:80,scale:1,side:true};
  }
  const bottom=Math.floor(end.top-rect.top)-6,gap=end.top-channels.bottom-12;
  const scale=gap>=80?1:gap>=60?.75:0;
  if(!scale||rect.width<112)return null;
  return {left:8,top:bottom-80*scale,width:Math.floor(rect.width-16),height:80*scale,scale,side:false};
}
function environment(g){
  const pad=32*g.scale;
  const resting=Math.round(g.width*.70),near=Math.round(g.width*.30);
  return {version:1,width:g.width,height:g.height,surfaces:[{id:'piso',x:0,y:g.height,width:g.width}],
    targets:[{id:'observacao',surface:'piso',x:Math.max(pad,near),actions:['approach','observe']},
      {id:'repouso',surface:'piso',x:Math.min(g.width-pad,resting),actions:['approach','rest']}],obstacles:[]};
}
function dispose(){
  themeRevision++;pending?.abort();pending=null;
  if(!current)return;
  const old=current;current=null;old.controller.abort();old.view?.destroy();old.brain?.destroy();old.stage.remove();
}
function eligible(){return enabled&&!failed&&inView&&!motion.matches&&!document.hidden&&section.isConnected;}
async function mount(g){
  const controller=new AbortController();pending=controller;
  let session;
  try{
    const api=await import(entry);
    if(controller.signal.aborted||!eligible())return;
    const stage=document.createElement('div');stage.setAttribute('aria-hidden','true');stage.inert=true;
    stage.dataset.contactGuide='';
    Object.assign(stage.style,{position:'absolute',pointerEvents:'none',overflow:'hidden',
      left:g.left+'px',top:g.top+'px',width:g.width+'px',height:g.height+'px'});
    section.append(stage);
    session={stage,controller,g,api,brain:null,view:null};current=session;
    const review=local?options.get('demo'):null;
    const animations=review==='seasonal'?api.officialThemes.filter(t=>t.animation).map(t=>t.animation):[];
    const brain=api.createBehavior({mode:'manual',seed:197,width:g.width,scale:g.scale,animations});
    session.brain=brain;
    brain.setPersonality({curiosity:.64,sociability:.42,energy:.36,patience:.92,attention:.78,playfulness:.25,independence:.65});
    const mobile=section.clientWidth<700;
    if(config.autonomy)brain.setAutonomy('custom',{interval:18000,
      allowed:mobile?['quiet','observe','rest']:['quiet','observe','rest','explore']});
    const view=await api.mountEnvironment({container:stage,brain,autonomy:true,scale:g.scale,signal:controller.signal,
      world:environment(g),initial:{surface:'piso',x:Math.round(g.width*.6)}});
    if(controller.signal.aborted){view.destroy();return;}
    session.view=view;
    const chosen=api.selectSeasonalTheme({enabled:config.seasonal,timeZone:config.timeZone,periods:config.periods,
      manual:local&&themes.includes(options.get('theme'))?options.get('theme'):undefined});
    await setTheme(chosen);
    if(controller.signal.aborted)return;
    session.ready=true;
    if(review){
      const seasonal=api.officialThemes.find(t=>t.id===chosen)?.animation?.id;
      const sequences={walk:[{target:'observacao'},{target:'repouso'}],sit:[{clip:'sit'},{clip:'seated'},{clip:'rise'}],
        wave:[{clip:'wave'}],point:[{clip:g.side?'point-left':'point-up'}],views:[{clip:'turnaround'}],
        seasonal:seasonal?[{clip:seasonal}]:[{clip:'wave'}]};
      if(Object.hasOwn(sequences,review)){brain.performSequence(sequences[review]);return;}
    }
    try{
      if(!sessionStorage.getItem('liquio-contact-greeting')){
        sessionStorage.setItem('liquio-contact-greeting','1');brain.performSequence([{clip:'curiosity'}]);
      }
    }catch{/* Storage is optional. */}
  }catch(error){
    if(!controller.signal.aborted){failed=true;dispose();console.warn('Liquio: prévia indisponível.');}
  }finally{if(pending===controller)pending=null;}
}
export async function setTheme(id){
  if(!themes.includes(id))throw RangeError('Aparência desconhecida');
  const session=current,revision=++themeRevision;
  if(!session?.view)return false;
  try{await session.view.appearance.setTheme(id);return current===session&&revision===themeRevision;}
  catch{if(current!==session||revision!==themeRevision)return false;
    try{await session.view.appearance.reset();}catch{failed=true;dispose();}
    return false;}
}
function update(){
  if(!section?.isConnected){shutdown();return;}
  if(!enabled||failed||motion.matches){dispose();return;}
  if(!eligible()){
    if(pending)dispose();
    else if(current?.view&&!current.paused){current.view.pause();current.paused=true;}
    return;
  }
  if(current?.paused){current.paused=false;current.view.resume();}
  const g=geometry();
  if(!g){dispose();return;}
  if(current&&Object.keys(g).some(key=>g[key]!==current.g[key]))dispose();
  if(!current&&!pending)void mount(g);
}
function invalidate(){if(!layoutFrame)layoutFrame=requestAnimationFrame(()=>{layoutFrame=0;update();});}
function cue(event){
  if(!current?.view||!eligible()||!event.target.closest('a.contact-channel')||performance.now()-lastCue<14000)return;
  lastCue=performance.now();
  current.brain.performSequence([{clip:current.g.side?'point-left':'point-up'}]);
}
function shutdown(){
  scope?.abort();scope=null;observer?.disconnect();size?.disconnect();parentWatch?.disconnect();
  cancelAnimationFrame(layoutFrame);layoutFrame=0;inView=false;dispose();
}
function start(){
  if(scope||!enabled||!intro||!links||!footer||!section.isConnected)return;
  scope=new AbortController();const opts={signal:scope.signal};
  observer=new IntersectionObserver(([row])=>{inView=row.isIntersecting;update();});observer.observe(section);
  size=new ResizeObserver(invalidate);for(const el of [section,intro,links,footer])size.observe(el);
  parentWatch=new MutationObserver(()=>{if(!section.isConnected)shutdown();else if(current&&!current.stage.isConnected){failed=true;dispose();}});
  parentWatch.observe(section.parentNode,{childList:true});parentWatch.observe(section,{childList:true});
  motion.addEventListener('change',update,opts);document.addEventListener('visibilitychange',update,opts);
  links.addEventListener('focusin',cue,opts);links.addEventListener('pointerover',cue,opts);
  window.addEventListener('pagehide',event=>{shutdown();if(event.persisted)window.addEventListener('pageshow',start,{once:true});},{...opts,once:true});
}
export function setEnabled(value){
  enabled=Boolean(value)&&(config.enabled||local);failed=false;
  if(enabled)start();else shutdown();
}
export function inspect(){
  const s=current;
  return s?.ready?{geometry:{...s.g},state:s.view.state(),animation:s.view.diagnostics().animation,theme:s.view.appearance.getAppearance().theme}:null;
}
if(enabled)start();
