"use strict";

(() => {
  // Homepage-only navigation. Project case chapters manage their own hashes.
  const hero = document.querySelector(".hero");
  const ids = ["sobre", "interesses", "projetos", "contato"];
  const sections = ids.map(id => document.getElementById(id));
  if (!hero || sections.some(section => !section)) return;

  // Track the part of the page being read, rather than the last menu click.
  const visibleSection = () => {
    const readingLine = Math.max(90, Math.min(window.innerHeight * 0.32, 260));
    if (hero.getBoundingClientRect().bottom > readingLine) return "";

    let current = "";
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= readingLine) current = section.id;
    }

    // The final section may be shorter than the viewport.
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 3) {
      current = "contato";
    }
    return current;
  };

  let pending = false;
  const sync = () => {
    pending = false;
    const id = visibleSection();
    const hash = id ? "#" + id : "";
    if (location.hash === hash) return;

    // replaceState keeps the address bar and shareable links in sync without
    // adding one browser-history entry for every section passed on scroll.
    history.replaceState(history.state, "", location.pathname + location.search + hash);
  };
  const schedule = () => {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(sync);
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("pageshow", schedule);
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
})();
