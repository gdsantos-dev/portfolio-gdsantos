"use strict";
(() => {
  const root = document.querySelector("[data-case-root]");
  if (!root) return;
  const lang = ["en", "es"].find(code => document.documentElement.lang.startsWith(code)) || "pt";
  const id = new URLSearchParams(location.search).get("id");
  const copy = {
    pt: { back:"Voltar aos projetos",home:"Portfólio",section:"Projeto",process:"Como funciona",engineering:"Decisões",validation:"Validação e limites",status:"Estado",role:"Participação",stack:"Tecnologias",explore:"Explorar processo",next:"Próximo projeto",repository:"Ver código no GitHub",missing:"Projeto não encontrado",missingText:"O endereço pode estar incorreto." },
    en: { back:"Back to projects",home:"Portfolio",section:"Project",process:"How it works",engineering:"Decisions",validation:"Validation and limits",status:"Status",role:"My role",stack:"Technologies",explore:"Explore the process",next:"Next project",repository:"View code on GitHub",missing:"Project not found",missingText:"The address might be incorrect." },
    es: { back:"Volver a proyectos",home:"Portafolio",section:"Proyecto",process:"Cómo funciona",engineering:"Decisiones",validation:"Validación y límites",status:"Estado",role:"Participación",stack:"Tecnologías",explore:"Explorar proceso",next:"Siguiente proyecto",repository:"Ver código en GitHub",missing:"Proyecto no encontrado",missingText:"Puede que la dirección sea incorrecta." }
  }[lang];
  const backLink = "/" + lang + "/#projetos";
  const chapterCopy = {"pt":{"name":"Capítulos do projeto","labels":["Contexto","Funcionamento","Decisões","Validação"],"collab":"Processo de desenvolvimento"},"en":{"name":"Project chapters","labels":["Context","Workflow","Decisions","Validation"],"collab":"Development process"},"es":{"name":"Capítulos del proyecto","labels":["Contexto","Funcionamiento","Decisiones","Validación"],"collab":"Proceso de desarrollo"}};
  function el(tag,className,text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function link(text,url,className) { const a=el("a",className,text); a.href=url;return a; }
  function segment(id,className) {const section=el("section",className+" case-reveal");section.id=id;return section;}
  function fail() {
    root.replaceChildren(el("h1","case-error",copy.missing),el("p","",copy.missingText),link(copy.back,backLink,"case-error__back"));
  }
  function render(project,other,idx) {
    const t=project.texts[lang],story=t.case;
    if (!story || !Array.isArray(story.steps) || !Array.isArray(story.decisions)) { fail(); return; }
    document.title=t.title+" | Guilherme Santos";
    root.dataset.theme=project.theme==="dashliq"?"dashliq":"scoutliq";
    document.querySelectorAll("[data-case-language]").forEach(node=>{
      node.href="/"+node.dataset.caseLanguage+"/projeto/?id="+encodeURIComponent(project.id);
    });
    const crumbs=el("nav","case-breadcrumb");
    crumbs.setAttribute("aria-label",copy.home);
    crumbs.append(link(copy.back,backLink),el("span","", "/"),el("span","",t.title));
    const hero=segment("case-intro","case-hero");
    const topline=el("div","case-hero__topline");
    topline.append(el("span","",copy.section),el("span","",project.year+" · "+t.phase));
    const title=el("h1","case-hero__title");
    const parts=t.title.match(/^(.*?)(LIQ)$/i);
    if (parts) title.append(document.createTextNode(parts[1]),el("em","",parts[2]));
    else title.textContent=t.title;
    hero.append(topline,title,el("p","case-hero__lead",story.lead),link(copy.explore,"#case-process","case-hero__action"));

    const chapters=el("nav","case-chapters");
    chapters.setAttribute("aria-label",chapterCopy[lang].name);
    const chapterIds=["case-overview","case-process","case-engineering","case-validation"];
    chapterIds.forEach((chapterId,i)=>{
      const anchor=link(chapterCopy[lang].labels[i],"#"+chapterId,"case-chapters__link");
      if(i===0)anchor.setAttribute("aria-current","location");
      chapters.append(anchor);
    });
    const overview=segment("case-overview","case-section case-overview");
    const aside=el("p","case-section__eyebrow",copy.section);
    const overviewMain=el("div","case-section__body");
    overviewMain.append(el("h2","case-overview__question",story.question),el("p","case-section__lead",story.context));
    const facts=el("dl","case-facts");
    [[copy.role,t.role],[copy.status,t.phase],[copy.stack,project.technologies.join(" / ")]].forEach(([label,value])=>{
      const row=el("div","");
      row.append(el("dt","",label),el("dd","",value));
      facts.append(row);
    });
    overviewMain.append(facts);
    overview.append(aside,overviewMain);

    const process=segment("case-process","case-chapter");
    const processHeading=el("div","case-chapter__heading");
    processHeading.append(el("p","case-section__eyebrow",copy.process),el("div",""));
    processHeading.lastChild.append(el("h2","",story.flowTitle),el("p","",story.flowDescription));
    const flow=el("ol","case-flow");
    story.steps.forEach((step,i)=>{
      const item=el("li","case-flow__item");
      const inner=el("div");
      inner.append(el("h3","",step.title),el("p","",step.description));
      item.append(inner);
      flow.append(item);
    });
    process.append(processHeading,flow);

    const engineering=segment("case-engineering","case-chapter");
    const engineeringHeading=el("div","case-chapter__heading");
    engineeringHeading.append(el("p","case-section__eyebrow",copy.engineering),el("div",""));
    engineeringHeading.lastChild.append(el("h2","",story.decisionsTitle),el("p","",story.decisionsDescription));
    const decisions=el("div","case-decisions");
    story.decisions.forEach((decision,i)=>{
      const item=el("article","case-decisions__item");
      item.append(el("h3","",decision.title),el("p","",decision.description));
      decisions.append(item);
    });
    engineering.append(engineeringHeading,decisions);

    const validation=segment("case-validation","case-section case-validation");
    const valBody=el("div","case-section__body");
    valBody.append(el("h2","",story.validationTitle),el("p","case-section__lead",story.validation));
    const extras=el("div","case-validation__extras");
    const availability=el("div","case-validation__availability");
    availability.append(el("h3","",story.availabilityTitle),el("p","",story.note));
    if(typeof project.repository==="string" && /^https:\/\/github\.com\/[a-z0-9-]+\/[a-z0-9-]+\/?$/i.test(project.repository)){
      const repoLink=link(copy.repository,project.repository,"case-validation__repository");
      repoLink.target="_blank";
      repoLink.rel="noopener noreferrer";
      availability.append(repoLink);
    }
    extras.append(availability);
    if(story.collaboration){
      const collaboration=el("aside","case-collaboration");
      collaboration.append(el("h3","",chapterCopy[lang].collab),el("p","",story.collaboration));
      extras.append(collaboration);
    }
    valBody.append(extras);
    validation.append(el("p","case-section__eyebrow",copy.validation),valBody);

    const finale=segment("case-next","case-next");
    const nextBody=el("div");
    nextBody.append(el("h2","",other.texts[lang].title));
    const nextLink=link(copy.next,"/"+lang+"/projeto/?id="+encodeURIComponent(other.id),"case-next__link");
    nextLink.setAttribute("aria-label",copy.next+": "+other.texts[lang].title);
    finale.append(nextBody,nextLink);
    root.replaceChildren(crumbs,hero,chapters,overview,process,engineering,validation,finale);
    const chapterAnchors=Array.from(chapters.querySelectorAll("a"));
    const setActive=index=>chapterAnchors.forEach((anchor,i)=>{
      if(index===i)anchor.setAttribute("aria-current","location");
      else anchor.removeAttribute("aria-current");
    });
    chapterAnchors.forEach((anchor,i)=>anchor.addEventListener("click",()=>setActive(i)));
    // Keep the chapter state aligned with the actual reading position.
    // Intersection callbacks may arrive out of order while crossing sections.
    if(typeof window.addEventListener==="function"){
      const sections=[overview,process,engineering,validation];
      let pending=false;
      const updateActive=()=>{
        pending=false;
        const offset=Math.max(chapters.getBoundingClientRect().bottom+50,(window.innerHeight||0)*.52);
        let active=0;
        sections.forEach((section,index)=>{
          if(section.getBoundingClientRect().top<=offset)active=index;
        });
        setActive(active);
      };
      const scheduleActive=()=>{
        if(pending)return;
        pending=true;
        window.requestAnimationFrame(updateActive);
      };
      window.addEventListener("scroll",scheduleActive,{passive:true});
      window.addEventListener("resize",scheduleActive,{passive:true});
      window.requestAnimationFrame(()=>{
        // A direct case URL contains dynamic sections that do not exist at
        // initial HTML parse time. Restore its anchor after rendering.
        const target=location.hash?.slice(1);
        if(chapterIds.includes(target)){
          sections[chapterIds.indexOf(target)].scrollIntoView({block:"start",behavior:"auto"});
        }
        updateActive();
      });
    }
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target);}});
    },{threshold:.04});
    root.querySelectorAll(".case-reveal").forEach(node=>observer.observe(node));
    requestAnimationFrame(()=>root.dataset.motion="ready");
  }
  if (!id || !/^[a-z0-9-]+$/.test(id)) { fail();return; }
  fetch("/data/projects.json",{cache:"no-cache"})
    .then(r=>{if(!r.ok)throw new Error("Missing JSON");return r.json();})
    .then(projects=>{
      if(!Array.isArray(projects)||projects.length<2)throw new Error("Missing projects");
      const index=projects.findIndex(p=>p.id===id&&p.texts?.[lang]?.case);
      if(index<0)throw new Error("Unknown project");
      const other=projects[(index+1)%projects.length];
      if(!other.texts?.[lang])throw new Error("Missing translation");
      render(projects[index],other,index);
    }).catch(fail);
})();
