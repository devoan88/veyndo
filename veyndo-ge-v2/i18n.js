(function () {
  const STORAGE = "konturi.lang";

  function apply(lang) {
    const root = document.documentElement;
    root.lang = lang === "en" ? "en" : "ka";
    root.dataset.lang = lang;
    document.querySelectorAll("[data-ka], [data-en]").forEach((el) => {
      const show =
        (lang === "ka" && el.hasAttribute("data-ka")) ||
        (lang === "en" && el.hasAttribute("data-en"));
      el.hidden = !show;
    });
    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang-btn") === lang ? "true" : "false");
    });
    try {
      localStorage.setItem(STORAGE, lang);
    } catch (_) {}
  }

  function init() {
    let lang = "ka";
    try {
      const q = new URLSearchParams(location.search).get("lang");
      if (q === "en" || q === "ka") lang = q;
      else {
        const saved = localStorage.getItem(STORAGE);
        if (saved === "en" || saved === "ka") lang = saved;
      }
    } catch (_) {}
    apply(lang);
    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      btn.addEventListener("click", () => apply(btn.getAttribute("data-lang-btn")));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
