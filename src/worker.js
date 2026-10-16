// Cloudflare Worker: liefert die statische Website aus (env.ASSETS) und nimmt das Kontaktformular entgegen.
// Das Formular selbst steckt in src/kontakt.js (gemeinsam mit Cloudflare Pages, siehe functions/).
import { handleKontakt } from './kontakt.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/kontakt') return handleKontakt(request, env);
    return env.ASSETS.fetch(request);
  },
};
