/* Freie Bibelgemeinde Delmenhorst – kleine Helfer, ohne externe Abhängigkeiten.
   Die Seite funktioniert vollständig auch ohne JavaScript. */
(function () {
  "use strict";

  var STORAGE_KEY = "fbg-maps-consent";

  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* ignorieren */ }
  }
  function storageRemove(key) {
    try { window.localStorage.removeItem(key); } catch (e) { /* ignorieren */ }
  }

  /* 1) Google Maps erst nach Einwilligung laden (Zwei-Klick-Lösung, DSGVO) */
  function loadMap(container) {
    var src = container.getAttribute("data-map-src");
    if (!src) return;
    var iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = container.getAttribute("data-map-title") || "Karte";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    iframe.setAttribute("allowfullscreen", "");
    container.innerHTML = "";
    container.appendChild(iframe);
  }

  var maps = document.querySelectorAll("[data-map-src]");
  for (var i = 0; i < maps.length; i++) {
    (function (container) {
      if (storageGet(STORAGE_KEY) === "1") {
        loadMap(container);
        return;
      }
      var button = container.querySelector("[data-map-load]");
      var remember = container.querySelector("[data-map-remember]");
      if (remember && remember.parentNode) remember.parentNode.hidden = false;
      if (button) {
        button.hidden = false;
        button.addEventListener("click", function () {
          if (remember && remember.checked) storageSet(STORAGE_KEY, "1");
          loadMap(container);
        });
      }
    })(maps[i]);
  }

  /* Einwilligung widerrufen (Datenschutzseite) */
  var revoke = document.querySelector("[data-map-revoke]");
  if (revoke) {
    var status = document.querySelector("[data-map-status]");
    var render = function () {
      if (status) {
        status.textContent = storageGet(STORAGE_KEY) === "1"
          ? "Aktuell: Google Maps wird auf diesem Gerät automatisch geladen."
          : "Aktuell: Google Maps wird nicht automatisch geladen.";
      }
    };
    revoke.hidden = false;
    render();
    revoke.addEventListener("click", function () {
      storageRemove(STORAGE_KEY);
      render();
    });
  }

  /* 2) E-Mail-Adresse erst im Browser zusammensetzen (Schutz vor Spam-Bots) */
  var mails = document.querySelectorAll("[data-mail-user]");
  for (var j = 0; j < mails.length; j++) {
    var el = mails[j];
    var addr = el.getAttribute("data-mail-user") + "@" + el.getAttribute("data-mail-domain");
    var text = el.querySelector("[data-mail-text]");
    if (el.tagName === "A") el.href = "mailto:" + addr;
    if (text) text.textContent = addr;
  }

  /* 3) Jahr im Copyright automatisch aktuell halten */
  var years = document.querySelectorAll("[data-year]");
  for (var k = 0; k < years.length; k++) {
    years[k].textContent = String(new Date().getFullYear());
  }
})();
