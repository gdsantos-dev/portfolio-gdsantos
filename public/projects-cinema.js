"use strict";
(() => {
  const root = document.querySelector("[data-projects-reel]");
  if (!root) return;

  const language = document.documentElement.lang.startsWith("en")
    ? "en"
    : document.documentElement.lang.startsWith("es") ? "es" : "pt";
  const copy = {
    pt: { focus: "Foco", role: "Participação", details: "Sobre o desenvolvimento", fallback: "Não foi possível carregar os projetos." },
    en: { focus: "Focus", role: "My role", details: "Development details", fallback: "Projects could not be loaded." },
    es: { focus: "Enfoque", role: "Mi papel", details: "Detalles del desarrollo", fallback: "No se pudieron cargar los proyectos." }
  }[language];

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }

  function addFact(list, label, value) {
    const row = element("div");
    row.append(element("dt", "", label), element("dd", "", value));
    list.append(row);
  }

  function makeFilm(project, index, count) {
    const content = project.texts?.[language] || project.texts?.pt;
    if (!content || !/^[a-z0-9-]+$/.test(project.id)) return null;

    const film = element("article", "project-feature");
    film.dataset.theme = project.theme === "dashliq" ? "dashliq" : "scoutliq";
    film.id = "projeto-" + project.id;
    film.setAttribute("aria-labelledby", "project-" + project.id + "-title");

    const poster = element("div", "project-feature__poster");
    poster.setAttribute("aria-hidden", "true");
    const topline = element("div", "project-feature__topline");
    topline.append(element("span", "", content.category), element("span", "", project.year));
    const art = element("div", "project-feature__art");
    const wordmark = element("span", "project-feature__wordmark");
    const pieces = content.title.match(/^(.*?)(LIQ)$/i);
    if (pieces) {
      wordmark.append(document.createTextNode(pieces[1]), element("em", "", pieces[2]));
    } else {
      wordmark.textContent = content.title;
    }
    art.append(wordmark, element("span", "project-feature__art-index", String(index + 1).padStart(2, "0")));
    const bottomline = element("div", "project-feature__bottomline");
    bottomline.append(element("span", "", content.scene), element("span", "", content.phase));
    poster.append(topline, art, bottomline);

    const body = element("div", "project-feature__content");
    const position = String(index + 1).padStart(2, "0");
    const current = element("p", "project-feature__count");
    current.append(document.createTextNode(position + " "), element("span", "", "/ " + String(count).padStart(2, "0")));
    const heading = element("h3", "", content.title);
    heading.id = "project-" + project.id + "-title";
    const description = element("p", "project-feature__description", content.description);
    const facts = element("dl", "project-feature__facts");
    addFact(facts, copy.focus, content.focus);
    addFact(facts, copy.role, content.role);

    const details = element("details", "project-feature__details");
    details.append(element("summary", "", copy.details), element("p", "", content.details));
    const cta = element("a", "project-feature__case-link", {pt:"Explorar projeto",en:"Explore project",es:"Explorar proyecto"}[language]);
    cta.href = "/" + language + "/projeto/?id=" + encodeURIComponent(project.id);
    cta.setAttribute("aria-label", ({pt:"Explorar o projeto ",en:"Explore project ",es:"Explorar el proyecto "}[language]) + content.title);
    const glyph = element("span", "project-feature__case-arrow", "↗");
    glyph.setAttribute("aria-hidden", "true");
    cta.append(glyph);
    body.append(current, heading, description, facts, details, cta);
    film.append(poster, body);
    return film;
  }

  fetch("/data/projects.json", { cache: "no-cache" })
    .then(response => {
      if (!response.ok) throw new Error("Projects response failed");
      return response.json();
    })
    .then(projects => {
      if (!Array.isArray(projects)) throw new Error("Invalid projects data");
      const valid = projects.filter(project => project?.texts?.[language] && project?.id);
      if (!valid.length) return;
      root.replaceChildren(...valid.map((project, index) => makeFilm(project, index, valid.length)).filter(Boolean));

      if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const section = root.closest(".projects-cinema");
      if (!section) return;
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.08 });
      root.querySelectorAll(".project-feature").forEach(film => observer.observe(film));
      requestAnimationFrame(() => section.dataset.motion = "ready");
    })
    .catch(() => root.replaceChildren(element("p", "projects-cinema__fallback", copy.fallback)));
})();
