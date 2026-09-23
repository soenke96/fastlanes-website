// Statische Mehrseiten-Website (ursprünglich Webflow). Jede Seite ist eine eigene HTML-Datei;
// Bilder, Schriften, CSS und Webflow-JS liegen unverändert in public/ und werden 1:1 ausgeliefert.
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const pages = ['index.html', '404.html', 'kontakt/index.html', 'rental/index.html',
  'impressum/index.html', 'datenschutz/index.html', 'agb/index.html'];

export default defineConfig({
  appType: 'mpa',
  server: { host: '::', port: 8080 },
  build: {
    rollupOptions: { input: Object.fromEntries(pages.map((p) => [p.replace(/\/?index\.html$|\.html$/, '') || 'index', resolve(import.meta.dirname, p)])) },
  },
});
