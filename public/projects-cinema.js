"use strict";
(() => {
  const root = document.querySelector("[data-projects-reel]");
  if (!root) return;

  const language = document.documentElement.lang.startsWith("en") ? "en"
    : document.documentElement.lang.startsWith("es") ? "es" : "pt";
  const labels = {
    pt: { gallery:"Galeria de imagens do projeto", action:"Conhecer o projeto", awaiting:"Capturas reais em preparação", fallback:"Não foi possível carregar os projetos.", sample:"Imagens registradas em testes do desenvolvimento." },
    en: { gallery:"Project image gallery", action:"Explore the project", awaiting:"Real screenshots coming soon", fallback:"Projects could not be loaded.", sample:"Screenshots captured during development tests." },
    es: { gallery:"Galería de imágenes del proyecto", action:"Conocer el proyecto", awaiting:"Próximamente, capturas reales", fallback:"No se pudieron cargar los proyectos.", sample:"Capturas obtenidas durante pruebas de desarrollo." }
  }[language];

  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const hasValidPath = (source, id) => typeof source === "string" &&
    new RegExp("^/assets/projects/" + id + "/[a-z0-9-]+\\.(?:png|jpg|webp)$").test(source);

  function addGallery(article, project, title) {
    const files = (Array.isArray(project.images) ? project.images : [])
      .filter(item => item && hasValidPath(item.src, project.id));
    if (!files.length) {
      const empty = make("div", "project-gallery__empty");
      empty.append(make("p", "project-gallery__empty-name", title),
        make("p", "project-gallery__empty-message", labels.awaiting));
      article.append(empty);
      return;
    }
    const gallery = make("div", "project-gallery");
    const rail = make("div", "project-gallery__rail");
    rail.tabIndex = 0;
    rail.setAttribute("role", "region");
    rail.setAttribute("aria-label", labels.gallery + ": " + title);

    files.forEach((file, index) => {
      const slide = make("figure", "project-gallery__slide");
      slide.classList.toggle("project-gallery__slide--mobile", file.type === "mobile");
      const frame = make("div", "project-gallery__frame");
      const img = make("img", "project-gallery__image");
      img.src = file.src;
      img.alt = file.alt?.[language] || file.alt?.pt || title;
      img.loading = index === 0 ? "eager" : "lazy";
      img.decoding = "async";
      img.draggable = false;
      frame.append(img);
      slide.append(frame, make("figcaption", "project-gallery__caption", file.caption?.[language] || file.caption?.pt || ""));
      rail.append(slide);
    });
    gallery.append(rail, make("p", "project-gallery__source", labels.sample));
    article.append(gallery);

    rail.addEventListener("keydown", event => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const slides = [...rail.querySelectorAll(".project-gallery__slide")];
      const next = slides.reduce((best, el, index) => {
        const dist = Math.abs(el.offsetLeft - rail.scrollLeft);
        return dist < best.distance ? { index, distance:dist } : best;
      }, {index:0,distance:Infinity}).index + (event.key === "ArrowRight" ? 1 : -1);
      slides[Math.max(0, Math.min(next, slides.length - 1))]?.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        block:"nearest",inline:"start"
      });
    });
    // Native swipe and trackpad scrolling remain in control. Mouse drag is an enhancement.
    let drag = null;
    rail.addEventListener("pointerdown", event => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      drag = {x:event.clientX,left:rail.scrollLeft};
      rail.classList.add("is-dragging");
    });
    rail.addEventListener("pointermove", event => {
      if (!drag) return;
      rail.scrollLeft = drag.left - (event.clientX - drag.x);
    });
    const stop = () => { drag = null;rail.classList.remove("is-dragging"); };
    rail.addEventListener("pointerup", stop);
    rail.addEventListener("pointerleave", stop);
    rail.addEventListener("pointercancel", stop);
  }

  function makeProject(project) {
    const content = project.texts?.[language] || project.texts?.pt;
    if (!content || !/^[a-z0-9-]+$/.test(project.id)) return null;
    const article = make("article", "project-feature");
    article.id = "projeto-" + project.id;
    article.dataset.theme = project.theme === "dashliq" ? "dashliq" : "scoutliq";
    article.setAttribute("aria-labelledby", "project-" + project.id + "-title");

    const header = make("div", "project-feature__header");
    const name = make("div", "project-feature__identity");
    name.append(make("p", "project-feature__category", content.category));
    const h = make("h3", "project-feature__title", content.title);
    h.id = "project-" + project.id + "-title";
    name.append(h);
    const intro = make("div", "project-feature__intro");
    intro.append(make("p", "project-feature__description", content.description));
    const link = make("a", "project-feature__case-link", labels.action);
    link.href = "/" + language + "/projeto/?id=" + encodeURIComponent(project.id);
    intro.append(link);
    header.append(name, intro);
    article.append(header);
    addGallery(article, project, content.title);
    return article;
  }

  fetch("/data/projects.json", {cache:"no-cache"})
    .then(response => {
      if (!response.ok) throw new Error("Project data unavailable");
      return response.json();
    })
    .then(projects => {
      if (!Array.isArray(projects)) throw new Error("Invalid project data");
      const items = projects.map(makeProject).filter(Boolean);
      if (!items.length) throw new Error("No projects");
      root.replaceChildren(...items);
    })
    .catch(() => root.replaceChildren(make("p", "projects-cinema__fallback", labels.fallback)));
})();
