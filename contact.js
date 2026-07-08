// Serverless endpoint voor het contactformulier — POST /api/contact
// Werkt op Vercel (Node runtime). Vereist de env-var RESEND_API_KEY.
// Belangrijk: het afzenderdomein (marketgrow.ai) moet geverifieerd zijn in Resend,
// anders weigert Resend de mail. Gebruik anders tijdelijk 'onboarding@resend.dev' als from.

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body =
      req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
    const naam = (body.naam || '').toString().trim();
    const email = (body.email || '').toString().trim();
    const bedrijf = (body.bedrijf || '').toString().trim();
    const bericht = (body.bericht || '').toString().trim();

    if (!naam || !email || !bedrijf || !bericht) {
      return res.status(400).json({ error: 'Alle velden zijn verplicht.' });
    }
    if (!/.+@.+\..+/.test(email)) {
      return res.status(400).json({ error: 'Vul een geldig e-mailadres in.' });
    }

    const { error } = await resend.emails.send({
      from: 'MarketGrow.ai <hello@marketgrow.ai>',
      to: ['hello@marketgrow.ai'],
      replyTo: email,
      subject: `Nieuw contactbericht · ${naam}${bedrijf ? ' (' + bedrijf + ')' : ''}`,
      text: `Naam: ${naam}\nE-mail: ${email}\nBedrijf: ${bedrijf}\n\nBericht:\n${bericht}`,
      html:
        `<h2 style="font-family:Georgia,serif">Nieuw contactbericht</h2>` +
        `<p><strong>Naam:</strong> ${esc(naam)}<br>` +
        `<strong>E-mail:</strong> ${esc(email)}<br>` +
        `<strong>Bedrijf:</strong> ${esc(bedrijf)}</p>` +
        `<p><strong>Bericht:</strong><br>${esc(bericht).replace(/\n/g, '<br>')}</p>`,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(502).json({ error: 'Versturen mislukt. Probeer het later opnieuw.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact endpoint error:', err);
    return res.status(500).json({ error: 'Er ging iets mis bij het versturen.' });
  }
}
