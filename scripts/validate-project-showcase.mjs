import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = name => readFileSync(path.join(root, name), "utf8");
const projects = JSON.parse(read("public/data/projects.json"));
const locales = { pt:"pt-BR", en:"en-US", es:"es" };
const ids = new Set();

assert.ok(Array.isArray(projects) && projects.length >= 2, "Expected multiple projects");

for (const project of projects) {
  assert.match(project.id, /^[a-z0-9-]+$/);
  assert.ok(!ids.has(project.id), "Duplicate project id: " + project.id);
  ids.add(project.id);
  assert.ok(project.year && project.theme && Array.isArray(project.technologies));
  for (const lang of Object.keys(locales)) {
    assert.ok(project.texts?.[lang]?.homeSummary?.trim(), "Missing compact home summary");
  }
  assert.ok(!project.repository || /^https:\/\//.test(project.repository), "Unsafe repository URL");
  for (const lang of Object.keys(locales)) {
    const data = project.texts?.[lang];
    assert.ok(data?.title && data?.description && data?.role && data?.phase, "Incomplete list translation: " + project.id + "/" + lang);
    const c = data.case;
    assert.ok(c, "Missing case content: " + project.id + "/" + lang);
    for (const field of ["lead","question","context","flowTitle","flowDescription","decisionsTitle","decisionsDescription","validationTitle","validation","note"]) {
      assert.ok(typeof c[field] === "string" && c[field].trim(), "Missing " + field + ": " + project.id + "/" + lang);
    }
    assert.ok(typeof c.collaboration === "string" && c.collaboration.trim(), "Missing human-AI process notes: " + project.id + "/" + lang);
    assert.equal(c.steps.length, 4, "Expected four process stages");
    assert.equal(c.decisions.length, 3, "Expected three engineering decisions");
    assert.ok(c.availabilityTitle, "Availability label missing");
    for (const row of [...c.steps,...c.decisions]) assert.ok(row.title && row.description);
  }
}

for (const [lang, locale] of Object.entries(locales)) {
  const home = read("public/" + lang + "/index.html");
  const detail = read("public/" + lang + "/projeto/index.html");
  assert.ok(home.includes('lang="' + locale + '"'));
  assert.ok(detail.includes('lang="' + locale + '"'));
  assert.ok(home.includes('id="projetos"'), "No projects section on " + lang);
  const contactCopy = home.match(/<section id="contato"[\\s\\S]*?<div class="contact-intro">[\\s\\S]*?<\\/div>/)?.[0] || "";
  assert.ok(contactCopy, "Missing contact copy: " + lang);
  assert.ok(!/Procuro um estágio em desenvolvimento de software|I am looking for a software development internship|Busco prácticas en desarrollo de software/i.test(contactCopy), "Unwanted internship sentence in contact: " + lang);

  assert.ok(home.includes('data-projects-reel'));
  assert.ok(home.includes('/data/curriculos/guilherme-dos-santos-curriculo-' + lang + '.pdf'), "CV must match selected language: " + lang);
  assert.ok(home.includes('Guilherme-dos-Santos-CV-' + lang.toUpperCase() + '.pdf'), "Localized download name missing: " + lang);
  assert.ok(home.includes('/style.css?v=20261029-gallery3'), "Portfolio CSS must have a versioned URL: " + lang);
  assert.ok(home.includes('/projects-cinema.css?v=20261029-home4'), "Gallery CSS must have a versioned URL: " + lang);
  assert.ok(home.includes('/projects-cinema.js?v=20261029-home4'), "Gallery JS must have the same release version: " + lang);
  assert.ok(detail.includes('/style.css?v=20261029-gallery3') && detail.includes('/project-case.css?v=20261029-case7'), "Project case CSS must be versioned: " + lang);
  assert.ok(home.includes('/projects-cinema.js') && home.includes('/projects-cinema.css'));
  assert.ok(!home.includes("projects-cinema__index"), "Old project counter navigation still present");
  assert.ok(detail.includes('data-case-root') && detail.includes('/project-case.js') && detail.includes('/project-case.css'));
  assert.ok(detail.includes('data-case-language="' + lang + '"'));
}
const profile = JSON.parse(read("public/data/profile.json"));
assert.ok(profile.resume.endsWith('-pt.pdf') && profile.resume_en.endsWith('-en.pdf') && profile.resume_es.endsWith('-es.pdf'), "Profile must route to three localized PDFs");
assert.ok(read("public/main.js").includes("e.resume_es"), "ES CV not supported in main.js");
const homeJs = read("public/projects-cinema.js");
assert.ok(homeJs.includes('"/projeto/?id="'), "Project detail link missing");
assert.ok(homeJs.includes("project-feature__case-link"), "Project CTA missing");
assert.ok(!homeJs.includes("addGallery") && !homeJs.includes("project-preview"), "Home cannot show galleries or large placeholders");
assert.ok(!read("public/projects-cinema.css").includes("project-gallery__empty"), "Unused oversized panel CSS remains");
for (const project of projects) assert.ok(Array.isArray(project.images), "Project media slot must remain available");
assert.ok(read("public/project-case.js").includes("encodeURIComponent(project.id)"));
assert.ok(read("public/project-case.js").includes("case-chapters"), "Case chapter navigation missing");
assert.ok(read("public/project-case.js").includes("story.collaboration"), "Process transparency missing");
assert.ok(read("public/project-case.css").includes("scroll-margin-top"), "Anchor offset missing");
assert.ok(read("public/project-case.css").includes("--case-accent:var(--accent)"), "Crimson accent should be shared");
assert.ok(!/#(?:68aaff|a5b7cb|e9f3ff|101a26)/i.test(read("public/project-case.css")), "Blue theme still present");
assert.ok(read("public/project-case.js").includes("link(copy.next,"), "Next project CTA missing");
const scout = projects.find(p=>p.id==="scoutliq");
assert.equal(scout?.repository,"https://github.com/gdsantos-dev/ScoutLIQ","ScoutLIQ must link to its public repository");
for (const lang of Object.keys(locales)) {
  assert.ok(!/código permanece privado|source code remains private|código sigue privado/i.test(scout.texts[lang].details),"Outdated private-code claim: "+lang);
  assert.ok(/github|público|public/i.test(scout.texts[lang].case.note),"Public source availability missing: "+lang);
}
assert.ok(read("public/project-case.js").includes("case-validation__repository"),"Public code link not rendered");

assert.ok(read("public/project-case.js").includes("location.hash?.slice(1)"), "Dynamic chapter deep-link restoration missing");
assert.ok(read("public/project-case.js").includes("getBoundingClientRect().bottom"), "Chapter navigation must track reading position");
const cssCase = read("public/project-case.css");
assert.ok(cssCase.includes(".case-section,.case-chapter__heading{display:block}"), "Case chapter titles must start at the left edge");
assert.ok(cssCase.includes(".case-section__eyebrow"), "Chapter eyebrow styling missing");
assert.ok(!cssCase.includes("grid-template-columns:minmax(115px,.3fr)"), "Old offset heading grid remains");
const dashCase = projects.find(p=>p.id==="dashliq");
assert.ok(dashCase, "DashLIQ case must exist");
const betTerms = /apost|freebet|surebet|cashout|(?:\bodd\b)|caixa operacional|investid[oa]s?|operacional|(?:\bbetting\b)|apuestas?|(?:\boperations\b)/i;
for (const lang of Object.keys(locales)) {
  assert.ok(!betTerms.test(JSON.stringify(dashCase.texts[lang])), "DashLIQ copy should focus on personal finance: " + lang);
  assert.ok(dashCase.texts[lang].case.flowTitle, "Missing financial workflow title: " + lang);
}

assert.ok(!read("public/project-case.js").includes("Ver estudo de caso"), "Old CTA remains");
assert.ok(read("public/project-case.css").includes("prefers-reduced-motion"));
const portfolioCss = read("public/style.css");
assert.ok(portfolioCss.includes(".education div:last-child{border-bottom:0}"), "Final education row must not have a redundant divider");
assert.ok(/@container\(max-width:680px\)\{[\s\S]*?\.education div\{border-bottom:0/.test(portfolioCss), "Mobile education divider cleanup missing");
assert.ok(/\.interest-row,\.interest-row:last-child\{[^}]*border-top:0/.test(portfolioCss), "Mobile interest separators must use spacing");
assert.ok(/\.contact-channel,\.contact-channel:first-child,\.contact-channel:last-child\{[^}]*border-bottom:0/.test(portfolioCss), "Mobile contact lines must use spacing");
const caseCss = read("public/project-case.css");
assert.ok(caseCss.includes(".case-facts"), "Facts layout missing");
assert.ok(!caseCss.includes("border-right:1px solid var(--line)"), "Old decorative vertical rules remain");
assert.ok(read("public/projects-cinema.css").includes("prefers-reduced-motion"));
assert.ok(existsSync(path.join(root,"public/pt/index.html")));
assert.ok(read("server.mjs").includes("isData || isHtml || isCode"), "CSS and JS should revalidate on subsequent visits");

console.log("Portfolio: compact project index in PT/EN/ES and case routes OK.");
