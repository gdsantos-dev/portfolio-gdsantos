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
  assert.ok(!project.repository || /^https:\/\//.test(project.repository), "Unsafe repository URL");
  for (const lang of Object.keys(locales)) {
    const data = project.texts?.[lang];
    assert.ok(data?.title && data?.description && data?.role && data?.phase, "Incomplete list translation: " + project.id + "/" + lang);
    const c = data.case;
    assert.ok(c, "Missing case content: " + project.id + "/" + lang);
    for (const field of ["lead","question","context","flowTitle","flowDescription","decisionsTitle","decisionsDescription","validationTitle","validation","note"]) {
      assert.ok(typeof c[field] === "string" && c[field].trim(), "Missing " + field + ": " + project.id + "/" + lang);
    }
    assert.equal(c.steps.length, 4, "Expected four process stages");
    assert.equal(c.decisions.length, 3, "Expected three engineering decisions");
    for (const row of [...c.steps,...c.decisions]) assert.ok(row.title && row.description);
  }
}

for (const [lang, locale] of Object.entries(locales)) {
  const home = read("public/" + lang + "/index.html");
  const detail = read("public/" + lang + "/projeto/index.html");
  assert.ok(home.includes('lang="' + locale + '"'));
  assert.ok(detail.includes('lang="' + locale + '"'));
  assert.ok(home.includes('id="projetos"'), "No projects section on " + lang);
  assert.ok(home.includes('data-projects-reel'));
  assert.ok(home.includes('/projects-cinema.js') && home.includes('/projects-cinema.css'));
  assert.ok(home.includes('href="#projeto-scoutliq"') && home.includes('href="#projeto-dashliq"'));
  assert.ok(detail.includes('data-case-root') && detail.includes('/project-case.js') && detail.includes('/project-case.css'));
  assert.ok(detail.includes('data-case-language="' + lang + '"'));
}
assert.ok(read("public/projects-cinema.js").includes('"/projeto/?id="'), "Project detail link missing");
assert.ok(read("public/project-case.js").includes("encodeURIComponent(project.id)"));
assert.ok(read("public/project-case.css").includes("prefers-reduced-motion"));
assert.ok(read("public/projects-cinema.css").includes("prefers-reduced-motion"));
assert.ok(existsSync(path.join(root,"public/pt/index.html")));

console.log("Portfolio projects: 2 cases, PT/EN/ES, assets and navigation OK.");
