// Statische Mehrseiten-Website (ursprünglich Webflow). Jede Seite ist eine eigene HTML-Datei;
// Bilder, Schriften, CSS und Webflow-JS liegen unverändert in public/ und werden 1:1 ausgeliefert.
import { defineConfig } from 'vite';
import fs from 'node:fs';
import { resolve } from 'node:path';

const root = import.meta.dirname;
const pages = ['index.html', '404.html', 'kontakt/index.html', 'rental/index.html',
  'impressum/index.html', 'datenschutz/index.html', 'agb/index.html'];

// Saubere URLs wie bei Webflow: /kontakt -> kontakt/index.html, unbekannte Seiten -> 404.html
function cleanUrls() {
  const rewrite = (req, _res, next) => {
    const [pathname, query = ''] = req.url.split('?');
    const clean = pathname.replace(/\/$/, '');
    if (!clean || pathname.includes('.') || pathname.startsWith('/@') || pathname.startsWith('/node_modules')) return next();
    const dir = resolve(root, '.' + decodeURIComponent(clean), 'index.html');
    req.url = (fs.existsSync(dir) ? clean + '/index.html' : '/404.html') + (query && '?' + query);
    next();
  };
  return {
    name: 'clean-urls',
    configureServer: (server) => { server.middlewares.use(rewrite); },
    configurePreviewServer: (server) => { server.middlewares.use(rewrite); },
  };
}

export default defineConfig({
  appType: 'mpa',
  plugins: [cleanUrls()],
  server: { host: '::', port: 8080 },
  build: {
    rollupOptions: { input: Object.fromEntries(pages.map((p) => [p.replace(/\/?index\.html$|\.html$/, '') || 'index', resolve(root, p)])) },
  },
});
