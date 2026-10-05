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
  // I PDF inclusi nel sito mantengono percorsi relativi anche su GitHub Pages.
  const validRulesUrl = (value) => {
    const webUrl = validUrl(value);
    if (webUrl) return webUrl;
    if (typeof value !== "string") return "";
    const localPath = value.trim();
    return /^\.\/[a-z0-9][a-z0-9_-]*\.pdf$/i.test(localPath) ? localPath : "";
  };
  const formUrl = validUrl(config.googleFormUrl);
  const sheetUrl = validUrl(config.googleSheetUrl);
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
  const sportRules = {
    calcetto: config.regolamentoCalcettoUrl,
    basket: config.regolamentoBasketUrl,
    pallavolo: config.regolamentoPallavoloUrl
  };
  Object.entries(sportRules).forEach(([sport, configuredUrl]) => {
    const url = validRulesUrl(configuredUrl);
    const details = document.querySelector(`#regolamento-${sport}`);
    const sportLink = document.querySelector(`[data-sport-rules="${sport}"]`);
    if (url) {
      externalLink(sportLink, url);
      sportLink.setAttribute("aria-label", `Regolamento ${sport}: apre il documento in una nuova scheda`);
      const documentLink = document.querySelector(`[data-rule-document="${sport}"]`);
      externalLink(documentLink, url);
      documentLink.hidden = false;
      document.querySelector(`[data-rules-summary="${sport}"]`).textContent = "Disponibile";
      document.querySelector(`[data-rules-status="${sport}"]`).textContent = `Consulta il regolamento di ${sport} per requisiti delle squadre e modalità di gioco.`;
    } else {
      sportLink.addEventListener("click", () => { details.open = true; });
    }
  });
  // Un link condiviso con l'ancora apre direttamente la disciplina richiesta.
  const openRulesFromHash = () => {
    const match = /^#regolamento-(calcetto|basket|pallavolo)$/.exec(window.location.hash);
    if (match) document.querySelector(`#regolamento-${match[1]}`).open = true;
  };
  window.addEventListener("hashchange", openRulesFromHash);
  openRulesFromHash();
  if (sheetUrl) {
    document.querySelector("#teams-placeholder").hidden = true;
    document.querySelector("#teams-connected").hidden = false;
    externalLink(document.querySelector("#teams-link"), sheetUrl);
  }
})();
