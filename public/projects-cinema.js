"use strict";
(() => {
  const root = document.querySelector("[data-projects-reel]");
  if (!root) return;
  const lang = document.documentElement.lang.startsWith("en") ? "en"
    : document.documentElement.lang.startsWith("es") ? "es" : "pt";
  const copy = {
    pt:{action:"Conhecer o projeto",error:"Não foi possível carregar os projetos."},
    en:{action:"Explore project",error:"Projects could not be loaded."},
    es:{action:"Conocer el proyecto",error:"No se pudieron cargar los proyectos."}
  }[lang];
  function el(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  }
  function render(project) {
    const content = project.texts?.[lang];
    if (!content || !/^[a-z0-9-]+$/.test(project.id)) return null;
    const article = el("article", "project-feature");
    article.id = "projeto-" + project.id;
    article.setAttribute("aria-labelledby", project.id + "-title");
    const identity = el("div", "project-feature__identity");
    identity.append(el("p", "project-feature__category", content.category));
    const title = el("h3", "project-feature__title", content.title);
    title.id = project.id + "-title";
    identity.append(title);
    const intro = el("div", "project-feature__intro");
    intro.append(el("p", "project-feature__description", content.homeSummary || content.description));
    const link = el("a", "project-feature__case-link", copy.action);
    link.href = "/" + lang + "/projeto/?id=" + encodeURIComponent(project.id);
    intro.append(link);
    article.append(identity, intro);
    return article;
  }
  fetch("/data/projects.json", {cache:"no-cache"})
    .then(response => {
      if (!response.ok) throw new Error("Projects unavailable");
      return response.json();
    })
    .then(projects => {
      if (!Array.isArray(projects)) throw new Error("Invalid project data");
      const articles = projects.map(render).filter(Boolean);
      if (!articles.length) throw new Error("No projects");
      root.replaceChildren(...articles);
    })
    .catch(() => root.replaceChildren(el("p", "projects-cinema__fallback", copy.error)));
})();
