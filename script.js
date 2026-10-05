(() => {
  "use strict";
  document.documentElement.classList.add("js");
  const config = window.TORNEO_CONFIG || {};
  // I collegamenti esterni accettano soltanto URL web assoluti.
  const validUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      const url = new URL(value.trim());
      return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch { return ""; }
  };
  const formUrl = validUrl(config.googleFormUrl);
  const sheetUrl = validUrl(config.googleSheetUrl);
  const rulesUrl = validUrl(config.regolamentoUrl);
  const isOpen = config.iscrizioniAperte === true && Boolean(formUrl);
  const externalLink = (element, url) => {
    element.href = url;
    element.target = "_blank";
    element.rel = "noopener noreferrer";
  };

  const toggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".navigation");
  const closeMenu = () => {
    navigation.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    navigation.classList.toggle("is-open", open);
  });
  navigation.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
      toggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".header")) closeMenu();
  });

  const dialog = document.querySelector("#registration-dialog");
  document.querySelectorAll("[data-registration]").forEach(link => {
    if (isOpen) {
      externalLink(link, formUrl);
      link.setAttribute("aria-label", "Iscrivi la tua squadra: apre il modulo in una nuova scheda");
    } else {
      link.setAttribute("aria-haspopup", "dialog");
      link.addEventListener("click", (event) => {
        if (typeof dialog.showModal === "function") {
          event.preventDefault();
          dialog.showModal();
        }
      });
    }
  });
  dialog.querySelectorAll("button").forEach(button => button.addEventListener("click", () => dialog.close()));
  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  document.querySelectorAll("[data-registration-status]").forEach(element => {
    element.textContent = isOpen ? "Iscrizioni aperte" : "Informazioni sulle iscrizioni in arrivo";
  });
  if (typeof config.scadenzaIscrizioni === "string" && config.scadenzaIscrizioni.trim()) {
    document.querySelector("#deadline").textContent = `Chiusura iscrizioni: ${config.scadenzaIscrizioni.trim()}`;
  }
  if (rulesUrl) {
    const link = document.querySelector("#rules-link");
    externalLink(link, rulesUrl);
    link.hidden = false;
    document.querySelector("#rules-status").textContent = "Il regolamento è disponibile. Consultalo prima di iscriverti.";
    document.querySelector("#regolamento > p:not(.eyebrow):not(.text-status)").textContent = "Consulta requisiti delle squadre, modalità di gioco e indicazioni per ogni sport nel regolamento completo.";
  }
  if (sheetUrl) {
    document.querySelector("#teams-placeholder").hidden = true;
    document.querySelector("#teams-connected").hidden = false;
    externalLink(document.querySelector("#teams-link"), sheetUrl);
  }
})();
