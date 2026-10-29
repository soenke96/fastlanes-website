// Kontaktformular (/api/kontakt): prüft Pflichtfelder und Turnstile, verschickt die Mail über Resend.
// Wird vom Worker (src/worker.js) und von Cloudflare Pages (functions/api/kontakt.js) gleichermaßen genutzt.
//
// Benötigte Secrets (im Cloudflare-Dashboard, NICHT im Code): TURNSTILE_SECRET_KEY, RESEND_API_KEY
// Optionales Secret: MAKE_WEBHOOK_URL (Make-Szenario, legt Anfragen im CRM Close an)
// Normale Variablen: MAIL_TO, MAIL_TO_PARTNER (Partneranfragen von /kontakt?anfrage=partner), MAIL_CC (Kopie, kommagetrennt), MAIL_FROM (Worker: wrangler.jsonc → vars; Pages: Standardwerte in functions/api/kontakt.js)

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

const clean = (v, max = 256) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);

export async function handleKontakt(request, env) {
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
  const anfrageart = clean(form.get('Anfrageart')) || 'Kontaktanfrage';
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
    'Neue Anfrage über das Kontaktformular auf fastlanes.de',
    '',
    `Anfrage: ${anfrageart}`,
    '',
    `Name:    ${name}`,
    `E-Mail:  ${email || '–'}`,
    `Telefon: ${telefon || '–'}`,
    '',
    `Datenschutzhinweise zur Kenntnis genommen: ja`,
    `Gesendet: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}`,
  ].join('\n');

  const partner = anfrageart.startsWith('Partner');
  const to = partner ? (env.MAIL_TO_PARTNER || env.MAIL_TO) : env.MAIL_TO;
  const cc = String(env.MAIL_CC || '').split(',').map((a) => a.trim()).filter((a) => a && a !== to);

  // Make-Webhook (→ CRM Close). Nur aktiv, wenn das Secret MAKE_WEBHOOK_URL gesetzt ist.
  // Ein Fehler hier blockiert die Anfrage nicht, die Mail geht trotzdem raus.
  const [vorname, ...rest] = name.split(/\s+/);
  const webhook = env.MAKE_WEBHOOK_URL
    ? fetch(env.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          vorname,
          nachname: rest.join(' '),
          email: emailOk ? email : '',
          telefon,
          anfrageart,
          partneranfrage: partner,
          quelle: 'Website-Kontaktformular',
          seite: request.headers.get('Referer') || '',
          gesendet_am: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(8000),
      })
        .then((r) => { if (!r.ok) console.error('Make-Webhook-Fehler', r.status); })
        .catch((e) => console.error('Make-Webhook nicht erreichbar', String(e)))
    : Promise.resolve();

  const [mail] = await Promise.all([
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.MAIL_FROM,
        to: [to],
        cc: cc.length ? cc : undefined,
        reply_to: emailOk ? email : undefined,
        subject: `${partner ? 'Partneranfrage' : 'Neue Anfrage'}: ${name}`,
        text,
      }),
    }),
    webhook,
  ]);
  if (!mail.ok) {
    console.error('Resend-Fehler', mail.status, await mail.text());
    return json({ ok: false, error: 'mail' }, 502);
  }
  return json({ ok: true });
}
