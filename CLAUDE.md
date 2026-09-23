# FASTLANES Website

Website von **fastlanes.de** (Videoproduktion Hannover). Ursprünglich in Webflow gebaut, im September 2026 1:1 als statische
Mehrseiten-Website übernommen. Der bestehende Look soll erhalten bleiben – **keine** Umstellung auf React/Tailwind/Komponenten.

## Aufbau
- Jede Seite ist eine eigene HTML-Datei: `index.html`, `kontakt/index.html`, `impressum/index.html`,
  `datenschutz/index.html`, `agb/index.html`, `404.html`. Neue Seiten auch in `vite.config.js` (`pages`) eintragen.
- `public/assets/` – Bilder, Videos, Schriften, Lottie, Webflow-CSS/JS (**nicht bearbeiten**, stammt aus Webflow).
- `public/css/custom.css` – **alle eigenen CSS-Änderungen hierhin** (wird nach dem Webflow-CSS geladen).
- Pfade immer root-absolut (`/assets/...`, `/kontakt`).
- Animationen laufen über Webflow Interactions (`data-w-id`-Attribute + `public/assets/js/webflow.*.js`). Elemente mit
  `data-w-id` und `style="opacity:0"` werden per JS eingeblendet – beim Kopieren von Blöcken die `data-w-id` entfernen oder
  `opacity:0` weglassen, sonst bleibt der neue Block unsichtbar.
- Navigation, Footer und Cookie-Banner sind auf jeder Seite als HTML dupliziert → Änderungen auf allen Seiten machen.

## Befehle
- `npm install` · `npm run dev` (http://localhost:8080) · `npm run build` (→ `dist/`)

## Wichtig
- Kontaktformular ist noch ein Webflow-Formular und funktioniert außerhalb von Webflow nicht → muss vor dem Domain-Umzug ersetzt werden.
- Cookie-Banner loggt Einwilligungen nach Supabase (`cookie_consent_log`). Beim Testen Cookie per JS setzen statt Buttons zu klicken.
- Tracking (Meta-Pixel, Google Ads, GTM) wird aktuell vor der Einwilligung geladen – bekannt, Entscheidung des Inhabers steht aus.
