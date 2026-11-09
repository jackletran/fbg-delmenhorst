# Freie Bibelgemeinde Delmenhorst – Website

Statische Website (HTML/CSS/JS, kein Build-Schritt), gehostet auf **Netlify**.
Live: https://www.fbg-delmenhorst.de – jeder Push auf `main` geht nach ca. 1 Minute live.

## Wichtige Regeln

- **Texte nicht umformulieren** – nur Rechtschreibfehler korrigieren. Neue Texte (z. B. FAQ) nur nach Absprache.
- **Termine ändern** → an drei Stellen gleich halten:
  1. `index.html` – Abschnitt `#termine` (sichtbare Karten)
  2. `index.html` – JSON-LD `openingHoursSpecification` + FAQ
  3. `llms.txt`
  Danach den Download-Plan neu erzeugen: `node tools/veranstaltungsplan.mjs`
  (Screenshot von `#termine` → `assets/img/veranstaltungsplan.png`; braucht Node ≥ 22 + Chrome).
- **Keine wöchentlichen Termine als schema.org `Event`** eintragen – Google verlangt ein festes `startDate`
  und meldet sonst Fehler. Wiederkehrendes gehört in `openingHoursSpecification`.
  Einzelne Termine mit Datum (Weihnachten, Ostern …) dürfen als `Event` mit `startDate` rein.
- **Namen & Telefonnummern nicht in Suchergebnisse:** Kopf-/Fußzeile und Kontaktdaten tragen
  `data-nosnippet`; keine Namen/Nummern in `<meta name="description">`, JSON-LD oder `llms.txt`.
  Impressum und Datenschutz sind `noindex` und nicht in der `sitemap.xml`.
- **Nicht löschen:** `google05bf03412b9ecc76.html` und `google6c602981c056aa2b.html`
  (Bestätigung der Google Search Console, je ein Inhaber-Konto).

## Aufbau

| Datei/Ordner | Zweck |
|---|---|
| `index.html`, `unserglaube.html`, `kontakt.html` | Seiten (Netlify liefert sie auch ohne `.html` aus) |
| `impressum.html`, `datenschutz.html`, `404.html` | Rechtliches, Fehlerseite |
| `assets/css/site.css`, `assets/js/site.js` | Gestaltung; JS für Karten-Einwilligung, E-Mail-Schutz, Jahreszahl |
| `assets/fonts/` | Lato lokal (DSGVO: kein Google Fonts) |
| `assets/img/` | Bilder (WebP + JPEG), Icons (`icons.svg`, Font Awesome Free), Favicons, Plan |
| `_headers` | Sicherheits-Header (CSP, HSTS …) und Caching |
| `_redirects` | 301-Weiterleitungen alter Adressen, Sperre für `/tools/` und `README.md` |
| `sitemap.xml`, `robots.txt`, `llms.txt` | Suchmaschinen und KI-Suchen |
| `tools/veranstaltungsplan.mjs` | erzeugt den Veranstaltungsplan aus der Website |

## Datenschutz-Technik

- Keine Cookies, kein Tracking → kein Cookie-Banner nötig.
- Google Maps lädt erst nach Klick (Zwei-Klick-Lösung, Merken per `localStorage`, Widerruf auf der Datenschutzseite).
  Bei neuen externen Diensten: `_headers` (CSP) **und** `datenschutz.html` anpassen.
- E-Mail-Adresse wird per JavaScript zusammengesetzt (Spam-Schutz).

## Rückgängig machen

Stand vor der großen Überarbeitung: Git-Tag `vor-optimierung-2026-11-08`.

## Offene Punkte

- Impressum vervollständigen (Vorstand, Vereinsregister, Verantwortlicher nach § 18 MStV) – TODO-Kommentar in `impressum.html`.
- Google-Maps-API-Schlüssel in der Google Cloud Console auf `www.fbg-delmenhorst.de/*` beschränken.
- Bing Webmaster Tools einrichten (Import aus der Search Console).
- Seite „Dein erster Besuch“, eigene Fotos, besondere Termine mit Datum, weitere FAQ (Barrierefreiheit, Übersetzung, Spenden).
- Gleiche Daten in Apple Business Connect, Bing Places, Verzeichnissen; mehr Google-Bewertungen; eigene E-Mail-Domain.
- Search Console: Validierung „Feld startDate fehlt“ läuft seit 09.11.2026 (Ursache bereits behoben).
