// Cloudflare Worker: liefert die statische Website aus (env.ASSETS) und nimmt das Kontaktformular entgegen.
//
// Benötigte Secrets (im Cloudflare-Dashboard unter Settings → Variables and Secrets, NICHT im Code):
//   TURNSTILE_SECRET_KEY – geheimer Schlüssel des Turnstile-Widgets (Spam-Schutz)
//   RESEND_API_KEY       – API-Key von resend.com (E-Mail-Versand)
// Normale Variablen (wrangler.jsonc → vars): MAIL_TO, MAIL_FROM

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/kontakt') return handleKontakt(request, env);
    return env.ASSETS.fetch(request);
  },
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

const clean = (v, max = 256) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);

async function handleKontakt(request, env) {
  if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
  if (!env.TURNSTILE_SECRET_KEY || !env.RESEND_API_KEY) {
    console.error('Kontaktformular: TURNSTILE_SECRET_KEY oder RESEND_API_KEY fehlt');
    return json({ ok: false, error: 'config' }, 500);
  }

  let form;
  try { form = await request.formData(); } catch { return json({ ok: false, error: 'form' }, 400); }

  const name = clean(form.get('Name'));
  const email = clean(form.get('email'));
  const telefon = clean(form.get('Telefon'));
  const datenschutz = form.get('checkbox');
  const token = form.get('cf-turnstile-response');

  // Pflicht: Name, Datenschutz-Häkchen und mindestens eine Kontaktmöglichkeit
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || !datenschutz || (!emailOk && !telefon)) return json({ ok: false, error: 'invalid' }, 400);

  // Spam-Schutz prüfen
  const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({
      secret: env.TURNSTILE_SECRET_KEY,
      response: String(token ?? ''),
      remoteip: request.headers.get('CF-Connecting-IP') ?? '',
    }),
  }).then((r) => r.json()).catch(() => ({ success: false }));
  if (!verify.success) return json({ ok: false, error: 'turnstile' }, 403);

  const text = [
    'Neue Anfrage über das Kontaktformular auf fastlanes.de (Kostenfreies Video-Strategiegespräch)',
    '',
    `Name:    ${name}`,
    `E-Mail:  ${email || '–'}`,
    `Telefon: ${telefon || '–'}`,
    '',
    `Datenschutzhinweise zur Kenntnis genommen: ja`,
    `Gesendet: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}`,
  ].join('\n');

  const mail = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: [env.MAIL_TO],
      reply_to: emailOk ? email : undefined,
      subject: `Neue Anfrage: ${name}`,
      text,
    }),
  });
  if (!mail.ok) {
    console.error('Resend-Fehler', mail.status, await mail.text());
    return json({ ok: false, error: 'mail' }, 502);
  }
  return json({ ok: true });
}
