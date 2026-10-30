import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = readFileSync(path.join(root, "public/section-tracker.js"), "utf8");
const ids = ["sobre", "interesses", "projetos", "contato"];

for (const lang of ["pt", "en", "es"]) {
  const html = readFileSync(path.join(root, "public", lang, "index.html"), "utf8");
  assert.ok(html.includes("/section-tracker.js?v=20261029-scroll1"), "No scroll URL sync on " + lang);
  for (const id of ids) assert.ok(html.includes('id="' + id + '"'), "Section missing: " + lang + "/" + id);
}
assert.ok(readFileSync(path.join(root, "public/index.html"), "utf8").includes("/section-tracker.js?v=20261029-scroll1"));

function simulate(initialPath = "/pt/", includeHero = true) {
  const events = {};
  const yPositions = { hero: 900, sobre: 920, interesses: 1600, projetos: 2350, contato: 3110 };
  const listeners = {};
  let count = 0;
  const document = {
    readyState: "complete",
    documentElement: { scrollHeight: 3800 },
    querySelector: selector => selector === ".hero" && includeHero ? {
      getBoundingClientRect: () => ({ bottom: yPositions.hero - window.scrollY })
    } : null,
    getElementById: id => ids.includes(id) ? {
      id,
      getBoundingClientRect: () => ({ top: yPositions[id] - window.scrollY })
    } : null
  };
  const location = { pathname: initialPath, search: "?src=check", hash: "" };
  const history = {
    state: { original: true },
    replaceState(state, unused, url) {
      assert.equal(state, this.state);
      assert.ok(url.startsWith(initialPath + "?src=check"));
      location.hash = url.includes("#") ? url.slice(url.indexOf("#")) : "";
      count++;
    },
    pushState() { throw new Error("Scroll tracking must never push history entries"); }
  };
  const window = {
    scrollY: 0,
    innerHeight: 800,
    requestAnimationFrame: callback => callback(),
    addEventListener: (type, callback) => { listeners[type] = callback; }
  };
  vm.runInNewContext(script, { document, location, history, window });
  const move = y => { window.scrollY = y; listeners.scroll?.(); return location.hash; };
  return { move, location, listeners, count: () => count };
}
const testHome = simulate();
assert.equal(testHome.move(0), "", "Hero should have a clean URL");
assert.equal(testHome.move(800), "#sobre");
assert.equal(testHome.move(1450), "#interesses");
assert.equal(testHome.move(2200), "#projetos");
assert.equal(testHome.move(3000), "#contato");
const calls = testHome.count();
assert.equal(testHome.move(3000), "#contato");
assert.equal(testHome.count(), calls, "No redundant history calls");
assert.equal(testHome.move(0), "", "Returning to hero should remove obsolete hash");
assert.equal(testHome.location.search, "?src=check", "Query string should be preserved");
const noHero = simulate("/pt/projeto/", false);
assert.equal(noHero.listeners.scroll, undefined, "Case page should keep its own chapter behavior");
console.log("Homepage URL tracker: hero and four scroll sections, clean history, locales and case isolation OK.");
