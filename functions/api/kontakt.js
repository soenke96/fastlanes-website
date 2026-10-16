// Cloudflare Pages: Kontaktformular unter /api/kontakt (gleiche Logik wie im Worker, siehe src/kontakt.js).
// Secrets im Pages-Projekt unter Einstellungen → Variablen und Geheimnisse: TURNSTILE_SECRET_KEY, RESEND_API_KEY.
import { handleKontakt } from '../../src/kontakt.js';

const DEFAULTS = {
  MAIL_TO: 'kontakt@fastlanes.de',
  MAIL_FROM: 'FASTLANES Website <website@notify.fastlanes.de>',
};

export const onRequest = ({ request, env }) => handleKontakt(request, { ...DEFAULTS, ...env });
