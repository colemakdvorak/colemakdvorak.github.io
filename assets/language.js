(() => {
  "use strict";

  const root = document.documentElement;
  const links = Array.from(document.querySelectorAll("a[data-language]"));
  const supported = links.map(link => link.dataset.language);
  const preferenceKey = "personal-site-language";

  for (const link of links) {
    link.addEventListener("click", event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      try {
        localStorage.setItem(preferenceKey, link.dataset.language);
      } catch (_) {
        // Carry an explicit choice in the URL when storage is unavailable,
        // including a choice that differs from the configured homepage default.
        const target = new URL(link.href);
        target.searchParams.set("lang", link.dataset.language);
        link.href = target.href;
      }
    });
  }

  // Only the root homepage is an entry point. Shared links to a particular
  // language's page or post always keep their explicit language.
  if (root.dataset.languageEntry !== "true") return;

  let preferred = root.dataset.defaultLanguage;
  const requested = new URL(window.location.href).searchParams.get("lang");
  if (supported.includes(requested)) {
    preferred = requested;
  } else {
    try {
      const saved = localStorage.getItem(preferenceKey);
      if (supported.includes(saved)) preferred = saved;
    } catch (_) {
      // Use the configured default if storage is disabled.
    }
  }

  if (!supported.includes(preferred) || preferred === root.lang) return;
  const target = new URL(links.find(link => link.dataset.language === preferred).href);
  target.search = window.location.search;
  target.hash = window.location.hash;
  window.location.replace(target.href);
})();
