# FASTLANES Website

Website von **fastlanes.de** (Videoproduktion Hannover). Ursprünglich in Webflow gebaut, im September 2026 1:1 als statische
Mehrseiten-Website übernommen. Der bestehende Look soll erhalten bleiben – **keine** Umstellung auf React/Tailwind/Komponenten.

## Aufbau
- Jede Seite ist eine eigene HTML-Datei: `index.html`, `kontakt/index.html`, `impressum/index.html`,
  `datenschutz/index.html`, `agb/index.html`, `social-first-ads/index.html`, `social-first-content/index.html`, `projekte/index.html`, `case-studies/{paulberger,casusquo,neukundengewinnung}/index.html`, `404.html`. Neue Seiten auch in `vite.config.js` (`pages`) eintragen.
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

## Logo-Wall, CTAs, Partner-Anfrage
- Team (`.team_grid`): ab 1200 px sechs Karten in einer Reihe; Kurzform „GF“ per Container-Abfrage, wenn die Karte schmaler als 240 px ist.
- Logo-Wall = eine Liste `.logo-list.logo-wall` in `index.html` (20 Logos; Desktop 5 Spalten wie im Original, Tablet 4, Handy 2). Anzahl durch 5, 4 und 2 teilbar halten
  oder Spaltenzahl in `custom.css` anpassen. Neue Logos als weiße PNGs nach `public/img/logos/` (Klasse `is-white`).
- Standard-CTA: „Kostenloses Social FIRST Konzept anfragen“ → `/kontakt`. Lange/kurze Fassung über `<span class="cta-long">` / `cta-short`.
- CTA-Kasten am Seitenende (`.container.is-rental-block`, Startseite + Leistungsseiten): Drohne/Kamera fliegen über die Webflow-Animation (data-w-id, scroll-gekoppelt);
  Position/Größe/Flugspur in `custom.css` (`cta-box_drone`, `cta-box_camera`) – so gewählt, dass sie Text und Button nie treffen.
- Website-Texte ohne Gedankenstriche (–) schreiben; der Inhaber ersetzt sie durch Punkt, Doppelpunkt oder „und“.
- Textquelle für „Unsere Leistungen“ + Unterseiten: Claude-Doc des Inhabers (Link in `../PROJEKT-LOG.md`).
- Social-First-Ads-Karte (Startseite): statt Foto eine leicht schräge 3D-Wand aus Ad-Beispielen (`.reel-wall`, 8 Spalten à 8 Kacheln, in schmalen Karten 6; Bilder `public/img/reels/` (Dateinamen ohne „ad“, sonst blenden Werbeblocker sie aus)). Spalten bewegen sich beim Scrollen abwechselnd hoch/runter (`custom.js` Abschnitt „Reel-Wall“, `SPEED`; `data-reel` = Richtung, `data-reel-base` = Versatz in Kachelhöhen). Jede Kachel = `.reel-tile` (Bild + Instagram-Ad-Oberfläche als SVG `public/img/reels/ui-1.svg` „Mehr dazu“, JYSK-Kacheln `.is-job` mit `ui-bewerben.svg` „Jetzt bewerben“). Verteilung per Sichtbarkeits-Simulation: in der Mitte nie doppelt (Werkzeug + Anleitung: `../tools/reel/`). Bei neuen Bildern neu verteilen.
- Social-First-Content-Karte (Startseite): `.content-stage` = links YouTube (quer), rechts Shorts/TikTok/Instagram (hochkant, aufgefächert), leicht 3D gedreht, wandern beim Scrollen (`custom.js` „Content-Bühne“). YouTube-Fenster zeigt den FASTLANES-Hero-Clip, verkleinert als `public/video/content/yt.*` (das 1280er-Original aus /assets ruckelt in der kleinen Kachel); Hochformate = stumme Loops aus kurzen Ausschnitten mehrerer Videos: `public/video/content/{shorts,tiktok,insta}.{webm,mp4,jpg}`. Performance: keine backdrop-filter, keine Schatten auf den 64 Ads-Kacheln, kein preserve-3d, Maße im Scroll-Skript zwischenspeichern, gebaut mit `../tools/content-loops.sh` (Ausschnitte/Zeiten dort ändern).
- Case Studies (seit 15.10.2026): Startseite `#projekte` = Sektion `.section_cases` mit drei `.case-item` (je Schild „Case Study 01–03“ in Türkis, damit der Übergang zu Fallbeispielen klar ist) ohne Kästen (Medien schweben frei, viel Abstand; Paulberger (Markengesicht/Strategie statt Lea als Person, Feedback Basel 16.10.), casusQuo, eigene Neukundengewinnung mit zwei Ad-Fenstern) + Button auf `/projekte` (dort die Video-Library, siehe unten). Unterseiten `/case-studies/…` (Bausteine `.case-row` Text/Visual im Wechsel, `.case-full`, `.case-timeline`, `.case-numbers`, `.case-gallery`, `.case-bigquote`, `.case-tags`, `.case-path`, `.case-funnel`, `.case-equation`, `.case-statement`). Textquelle: Claude-Doc „FASTLANES Case Studies (Texte)“ (Link in ../PROJEKT-LOG.md). Videos `public/video/cases/`: Vorschau-Loops `../tools/case-loops.sh`, casusQuo-Interview über Cloudflare Stream (Konto des Inhabers, customer-51abec7okz004emz; Player wird erst beim Klick eingebunden, `.case-player[data-stream]` in custom.js). Collage „Die Ads“: Standbilder, Video nur beim Hover (`data-hover-video`), Scroll-Bewegung (`--py`). Profilbilder `public/img/cases/`. Stumme Videos mit `data-inview` spielen nur im Sichtbereich (custom.js).
- Video-Library `/projekte` (seit 15.10.2026): wird aus `../tools/projekte-library.mjs` erzeugt (Liste LIBRARY: Titel, Format, Logo, Quelle; danach `node ../tools/projekte-library.mjs`). Nicht von Hand im HTML ändern. Kacheln im alten Projekte-Look; am Desktop 12er-Raster mit wechselnden Blöcken (groß w8 h2 links/rechts, klein w4, Kölln-Zeile (Spot + drei Hochformate), HDI breit am Ende), ab 1199 px 2 Spalten, ab 767 px 1 Spalte. Klick öffnet ein Player-Fenster (lädt erst dann). Quellen: Cloudflare Stream (Konto des Inhabers), YouTube (nocookie), Vimeo, bei Bedarf eigene Dateien in `public/video/projekte/` (Quelle `{ file, thumb }`, Dateien < 25 MB). Dorfkinder mit Kennzahlen-Karte (YouTube-Aufrufe, Stand 15.10.2026: 58 Mio. / 2,4 Mio.), Kölln-Kampagne als eigene Zeile (`.lib-group`, so vom Inhaber gewollt). Kundenstimme der Tellkampfschule über FASTLANES (`.is-voice`, türkis, Zitatzeichen) bewusst anders als Kunden-Testimonials mit Kundenlogo (Elephant Solar). Logos ohne Vorlage: Elephant Solar aus dem Abspann freigestellt (`public/img/projekte/`), HDI-Logo von Wikimedia Commons; Tellkampfschule ohne Logo.
- Agentur-Feld (`.section_partner`, nur Startseite) → `/kontakt?anfrage=partner`; die Kontaktseite tauscht dann per Skript Überschrift („Lass uns Partner werden“), Einleitung, Kartentitel, Ansprechpartner (Basel statt Sönke), die ersten zwei Vorteile, Button und das versteckte Feld `Anfrageart`. Partneranfragen gehen per Mail an `MAIL_TO_PARTNER` (basel@fastlanes.de), alle anderen an `MAIL_TO`.
- Ein Sprungziel `#kontakt` gibt es nicht – Kontakt-Links immer auf `/kontakt`.

## Befehle
- `npm install` · `npm run dev` (http://localhost:8080) · `npm run build` (→ `dist/`, danach legt `scripts/flatten-html.mjs` Unterseiten als `<seite>.html` ab)

## Wichtig
- Kontaktformular läuft über Cloudflare Worker + Turnstile + Resend (siehe unten).
- Cookie-Banner loggt Einwilligungen nach Supabase (`cookie_consent_log`). Beim Testen Cookie per JS setzen statt Buttons zu klicken.
- Tracking nur nach Einwilligung (seit 22.10.2026): `public/js/consent.js` im <head> jeder Seite lädt Dienste erst nach Auswahl im Banner (Cookie `fl_cookie_consent`). Statistik → Google Tag Manager + Contentsquare (Tag-ID 690420be7a475); Marketing → Google Tag Manager + Google Ads (AW-17770054938) + Meta Pixel. Google Consent Mode (Standard „denied“). Der Banner ruft nach jeder Auswahl `window.flApplyConsent(consent)` auf. Neue Tracking-Dienste nur dort einbauen, nie direkt ins HTML. Banner-Liste und Datenschutzerklärung (Abschnitt 6) mitpflegen.

## Hosting
- GitHub: https://github.com/soenke96/fastlanes-website (Branch `main`). Jeder Push auf `main` wird von Cloudflare automatisch gebaut und veröffentlicht.
- Cloudflare (Workers mit statischen Assets): `wrangler.jsonc` – liefert `dist/` aus, URLs ohne Schrägstrich (`/kontakt`), unbekannte Adressen → `404.html`.
- **Für fastlanes.de: Cloudflare Pages** (Entscheidung Inhaber 16.10.2026: Domain und DNS bleiben bei IONOS, Mails nicht anfassen). Pages kann `www.fastlanes.de` per CNAME bei IONOS verbinden, der Worker nicht (bräuchte Cloudflare-Nameserver).
  Pages-Projekt baut dasselbe Repo: Build `npm run build`, Ausgabe `dist`, Formular in `functions/api/kontakt.js`. `fastlanes.de` ohne www → Weiterleitung bei IONOS auf www.
  Damit Pages die Adressen ohne Schrägstrich ausliefert, verschiebt `scripts/flatten-html.mjs` nach dem Build `dist/<seite>/index.html` → `dist/<seite>.html` (der Worker kommt mit beidem klar). Lokal wie Pages testen: `npm run build && npx wrangler pages dev dist`.
- Weiterleitungen in `public/_redirects` (z. B. `/rental` → `/`).
- Lokal wie auf Cloudflare testen: `npm run build && npx wrangler dev`.

## Kontaktformular
- `kontakt/index.html` → Script am Seitenende fängt das Absenden ab (Capture-Phase, Webflow-Handler greift nicht) und sendet an `/api/kontakt`.
- `src/kontakt.js` prüft Pflichtfelder + Cloudflare Turnstile (unsichtbar) und verschickt die Mail über Resend an `MAIL_TO`. Eingebunden vom Worker (`src/worker.js`) und von Pages (`functions/api/kontakt.js`, mit Standardwerten für MAIL_TO/MAIL_FROM).
- Secrets im Cloudflare-Dashboard (Worker bzw. Pages-Projekt → Einstellungen → Variablen und Geheimnisse): `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`. Niemals ins Repo. Turnstile-Widget braucht alle Hostnamen (workers.dev, pages.dev, www.fastlanes.de, fastlanes.de).
- Turnstile-Sitekey steht im HTML (`data-sitekey` im `.cf-turnstile`-Div). `1x00000000000000000000BB` ist Cloudflares Test-Key.
- Lokal testen: `.dev.vars` (nicht im Repo) mit Test-Secret `1x0000000000000000000000000000000AA`, dann `npm run build && npx wrangler dev`.
- Kontaktseite (16.10.2026): Überschrift „Lass uns über deinen Content sprechen“. Druk hat kein Ü/Ä/Ö: Ü wird als `<span class="uml">u</span>` mit zwei CSS-Punkten gebaut (`.uml` in custom.css), daneben der echte Text in `.sr-only` für Screenreader. Pflichtfelder markiert (Name required, E-Mail oder Telefon wird vor dem Absenden geprüft), Datenschutz verlinkt, „Wir melden uns innerhalb von 24 Stunden bei dir.“, Vimeo-Player und Slider-Skripte dort entfernt.
- Übergang zum Footer: `.main-wrap` schneidet nur noch seitlich ab (`overflow-x: clip`, custom.css am Ende). Vorher kappte `overflow: hidden` die Lichtscheine der letzten Sektion → dunkle Kante über dem Footer (alter Webflow-Fehler).
