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

  // Fill contact tel / WhatsApp links when present
  document.querySelectorAll("[data-phone-link]").forEach((el) => {
    if (!window.SITE) return;
    el.setAttribute("href", "tel:" + SITE.phoneTel);
    el.textContent = SITE.phone;
  });
  document.querySelectorAll("[data-wa-link]").forEach((el) => {
    if (!window.SITE) return;
    el.setAttribute("href", "https://wa.me/" + SITE.whatsappWa);
    el.textContent = SITE.whatsapp;
  });

  // Mobile nav
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Theme
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
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      setTheme(next || (matchMedia("(prefers-color-scheme: dark)").matches ? "light" : "dark"));
    });
  }

  // Pronunciation: show only if assets/audio/cyra.mp3 exists
  const sayBtn = document.querySelector("[data-say-cyra]");
  if (sayBtn) {
    const audioUrl = new URL("assets/audio/cyra.mp3", document.baseURI || location.href).href;
    fetch(audioUrl, { method: "HEAD" })
      .then((r) => {
        if (!r.ok) return;
        sayBtn.hidden = false;
        let audio;
        sayBtn.addEventListener("click", () => {
          if (!audio) audio = new Audio(audioUrl);
          audio.currentTime = 0;
          audio.play().catch(() => {});
        });
      })
      .catch(() => {
        sayBtn.hidden = true;
      });
  }

  // Contact form: honeypot + validation; placeholder submit (no external endpoint yet)
  const form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const box = form.querySelector("[data-form-status]");
      const hp = form.querySelector('input[name="company_website"]');
      if (hp && hp.value) return;

      const name = String(form.name?.value || "").trim();
      const reply = String(form.reply?.value || "").trim();
      const message = String(form.message?.value || "").trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reply);
      const phoneOk = /^[+0-9\s()-]{7,}$/.test(reply) && /\d{7,}/.test(reply.replace(/\D/g, ""));

      const isEn = document.documentElement.lang === "en";
      if (!name || name.length < 2) {
        if (box) {
          box.hidden = false;
          box.textContent = isEn ? "Please enter your name." : "გთხოვთ შეიყვანოთ სახელი.";
        }
        return;
      }
      if (!emailOk && !phoneOk) {
        if (box) {
          box.hidden = false;
          box.textContent = isEn
            ? "Enter a valid email or phone number."
            : "შეიყვანეთ სწორი ელფოსტა ან ტელეფონი.";
        }
        return;
      }
      if (!message || message.length < 5) {
        if (box) {
          box.hidden = false;
          box.textContent = isEn ? "Please write a short message." : "გთხოვთ დაწეროთ მოკლე შეტყობინება.";
        }
        return;
      }

      if (box) {
        box.hidden = false;
        box.textContent = isEn
          ? "Thanks — form is a placeholder until email delivery is connected."
          : "მადლობა — ფორმა პლაცეჰოლდერია, სანამ ელფოსტის მიწოდება არ ჩაირთვება.";
      }
      form.reset();
    });
  }
})();
