# FASTLANES Website

Website von **fastlanes.de** (Videoproduktion Hannover). Ursprünglich in Webflow gebaut, im September 2026 1:1 als statische
Mehrseiten-Website übernommen. Der bestehende Look soll erhalten bleiben – **keine** Umstellung auf React/Tailwind/Komponenten.

## Aufbau
- Jede Seite ist eine eigene HTML-Datei: `index.html`, `kontakt/index.html`, `impressum/index.html`,
  `datenschutz/index.html`, `agb/index.html`, `social-first-ads/index.html`, `social-first-content/index.html`, `404.html`. Neue Seiten auch in `vite.config.js` (`pages`) eintragen.
- `public/assets/` – Bilder, Videos, Schriften, Lottie, Webflow-CSS/JS (**nicht bearbeiten**, stammt aus Webflow).
- `public/css/custom.css` – **alle eigenen CSS-Änderungen hierhin** (wird nach dem Webflow-CSS geladen).
- Pfade immer root-absolut (`/assets/...`, `/kontakt`).
- Animationen laufen über Webflow Interactions (`data-w-id`-Attribute + `public/assets/js/webflow.*.js`). Elemente mit
  `data-w-id` und `style="opacity:0"` werden per JS eingeblendet – beim Kopieren von Blöcken die `data-w-id` entfernen oder
  `opacity:0` weglassen, sonst bleibt der neue Block unsichtbar.
- Navigation, Footer und Cookie-Banner sind auf jeder Seite als HTML dupliziert → Änderungen auf allen Seiten machen.
- **Schrift Druk (Überschriften) ist eine Testversion ohne Umlaute (ä, ö, ü, ß).** Überschriften mit Umlauten in Druk vermeiden
  (Webflow-Workaround war z. B. „GeschaEft“) oder Manrope verwenden. Rechtstexte nutzen deshalb Manrope.
- Rechtstexte-Design: `custom.css` Abschnitt „Rechtstexte“ (`.section_legal`, `.legal-subtitle`, `.legal-text`).

## Leistungen / Angebote
- Zwei öffentliche Produkte: **Social First Ads** (Meta Ads, done for you) und **Social First Content** (organischer Content, Drehtage, Coaching).
  Startseite `#services` = zwei Produktkarten (`.offer-card`), Details auf den Unterseiten.
- **Keine Preise, Laufzeiten oder Paket-Details auf der Website.** **Social Recruiting** wird nicht öffentlich beworben (nur Cross-Sell).
- Die Leistungs-Unterseiten tragen `data-wf-page` der Startseite (`663a5549d8739cd52985a06a`), damit Webflow-Animationen der
  wiederverwendeten Bausteine (Zeitstrahl `.section_cards`, Überschriften mit `data-w-id`) greifen. Neue Bausteine ohne Webflow-ID
  bekommen `data-reveal` (Einblenden über `public/js/custom.js`).

## Befehle
- `npm install` · `npm run dev` (http://localhost:8080) · `npm run build` (→ `dist/`)

## Wichtig
- Kontaktformular ist noch ein Webflow-Formular und funktioniert außerhalb von Webflow nicht → muss vor dem Domain-Umzug ersetzt werden.
- Cookie-Banner loggt Einwilligungen nach Supabase (`cookie_consent_log`). Beim Testen Cookie per JS setzen statt Buttons zu klicken.
- Tracking (Meta-Pixel, Google Ads, GTM) wird aktuell vor der Einwilligung geladen – bekannt, Entscheidung des Inhabers steht aus.

## Hosting
- GitHub: https://github.com/soenke96/fastlanes-website (Branch `main`). Jeder Push auf `main` wird von Cloudflare automatisch gebaut und veröffentlicht.
- Cloudflare (Workers mit statischen Assets): `wrangler.jsonc` – liefert `dist/` aus, URLs ohne Schrägstrich (`/kontakt`), unbekannte Adressen → `404.html`.
- Weiterleitungen in `public/_redirects` (z. B. `/rental` → `/`).
- Lokal wie auf Cloudflare testen: `npm run build && npx wrangler dev`.

## Kontaktformular
- `kontakt/index.html` → Script am Seitenende fängt das Absenden ab (Capture-Phase, Webflow-Handler greift nicht) und sendet an `/api/kontakt`.
- `src/worker.js` prüft Pflichtfelder + Cloudflare Turnstile (unsichtbar) und verschickt die Mail über Resend an `MAIL_TO`.
- Secrets im Cloudflare-Dashboard (Worker → Settings → Variables and Secrets): `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`. Niemals ins Repo.
- Turnstile-Sitekey steht im HTML (`data-sitekey` im `.cf-turnstile`-Div). `1x00000000000000000000BB` ist Cloudflares Test-Key.
- Lokal testen: `.dev.vars` (nicht im Repo) mit Test-Secret `1x0000000000000000000000000000000AA`, dann `npm run build && npx wrangler dev`.
