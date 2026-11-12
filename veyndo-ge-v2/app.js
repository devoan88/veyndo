(function () {
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const brandKa = document.querySelectorAll("[data-brand-ka]");
  const brandEn = document.querySelectorAll("[data-brand-en]");
  if (window.SITE) {
    brandKa.forEach((el) => {
      el.textContent = SITE.brandKa;
    });
    brandEn.forEach((el) => {
      el.textContent = SITE.brandEn;
    });
  }

  // Mobile nav
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Theme: respect system + optional toggle
  const themeBtn = document.querySelector("[data-theme-toggle]");
  const root = document.documentElement;
  function setTheme(mode) {
    root.dataset.theme = mode;
    try {
      localStorage.setItem("cyra.theme", mode);
    } catch (_) {}
  }
  try {
    const saved = localStorage.getItem("cyra.theme");
    if (saved === "dark" || saved === "light") setTheme(saved);
  } catch (_) {}
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = (root.dataset.theme || "dark") === "dark" ? "light" : "dark";
      setTheme(next || (matchMedia("(prefers-color-scheme: dark)").matches ? "light" : "dark"));
    });
  }

  // Contact form honeypot + client message
  const form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", (e) => {
      const hp = form.querySelector('input[name="company_website"]');
      if (hp && hp.value) {
        e.preventDefault();
        return;
      }
      const email = (window.SITE && SITE.email) || "";
      if (!email || email.includes("TODO")) {
        e.preventDefault();
        const box = form.querySelector("[data-form-status]");
        if (box) {
          box.hidden = false;
          box.textContent =
            document.documentElement.lang === "en"
              ? "Form placeholder: add a real inbox in config.js, then wire Netlify Forms or your mail API."
              : "ფორმის პლაცეჰოლდერი: დაამატეთ რეალური ელფოსტა config.js-ში, შემდეგ Netlify Forms ან API.";
        }
      }
    });
  }
})();
