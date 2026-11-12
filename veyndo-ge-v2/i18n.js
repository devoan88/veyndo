(function () {
  const STORAGE = "cyra.lang";

  function apply(lang) {
    const next = lang === "en" ? "en" : "ka";
    const root = document.documentElement;
    root.lang = next;
    root.setAttribute("data-lang", next);

    // Prefer CSS data-lang rules; keep hidden in sync for a11y/AT.
    document.querySelectorAll("[data-ka]").forEach((el) => {
      el.hidden = next !== "ka";
    });
    document.querySelectorAll("[data-en]").forEach((el) => {
      el.hidden = next !== "en";
    });

    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      const on = btn.getAttribute("data-lang-btn") === next;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.classList.toggle("is-active", on);
    });

    try {
      localStorage.setItem(STORAGE, next);
    } catch (_) {}

    try {
      const url = new URL(location.href);
      if (next === "ka") url.searchParams.delete("lang");
      else url.searchParams.set("lang", "en");
      history.replaceState(null, "", url);
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

    // Delegation so clicks work even if header is re-rendered later.
    document.addEventListener("click", (ev) => {
      const btn = ev.target && ev.target.closest && ev.target.closest("[data-lang-btn]");
      if (!btn) return;
      ev.preventDefault();
      apply(btn.getAttribute("data-lang-btn"));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.CyraI18n = { apply };
})();
