// api/lead.js
// Vercel serverless function. Ontvangt een aanmelding uit de Noor-chat op de site
// en stuurt een mail naar MarketGrow met het e-mailadres van de bezoeker, het
// gesprek en het verzoek om contact op te nemen.
//
// Benodigde environment variables (in Vercel > Project > Settings > Environment Variables):
//   RESEND_API_KEY   verplicht. Gratis aan te maken op https://resend.com
//   MAIL_TO          optioneel. Standaard hello@marketgrow.ai
//   MAIL_FROM        optioneel. Standaard "MarketGrow Noor <onboarding@resend.dev>".
//                    Voor productie: een afzender op je eigen geverifieerde domein,
//                    bijv. "MarketGrow Noor <noor@marketgrow.ai>".

const MAIL_TO = process.env.MAIL_TO || 'hello@marketgrow.ai';
const MAIL_FROM = process.env.MAIL_FROM || 'MarketGrow Noor <onboarding@resend.dev>';

const clip = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY ontbreekt');
    return res.status(500).json({ error: 'Mailservice niet geconfigureerd' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const email = clip(body.email, 200).trim();
    const phone = clip(body.phone, 60).trim();
    const profession = clip(body.profession, 120).trim();
    const topics = Array.isArray(body.topics) ? body.topics.slice(0, 25).map(t => clip(t, 100)) : [];
    const transcript = clip(body.transcript, 8000);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Ongeldig e-mailadres' });
    }

    const topicBlock = topics.length ? topics.map(t => '- ' + t).join('\n') : '(geen specifieke onderwerpen aangegeven)';

    const textParts = [
      'Dit e-mailadres heeft een gesprek met Noor gehad op marketgrow.ai en wil graag dat je contact opneemt.',
      '',
      'E-mail: ' + email,
      phone ? 'Telefoon: ' + phone : null,
      profession ? 'Beroep: ' + profession : null,
      '',
      'Besproken onderwerpen:',
      topicBlock,
      '',
      'Gesprek:',
      transcript || '(geen transcript meegestuurd)',
    ].filter(l => l !== null);

    const htmlParts = [
      '<p style="margin:0 0 14px">Dit e-mailadres heeft een gesprek met <strong>Noor</strong> gehad op marketgrow.ai en wil graag dat je contact opneemt.</p>',
      '<p style="margin:0 0 4px"><strong>E-mail:</strong> ' + esc(email) + '</p>',
      phone ? '<p style="margin:0 0 4px"><strong>Telefoon:</strong> ' + esc(phone) + '</p>' : '',
      profession ? '<p style="margin:0 0 4px"><strong>Beroep:</strong> ' + esc(profession) + '</p>' : '',
      '<p style="margin:14px 0 4px"><strong>Besproken onderwerpen:</strong></p>',
      topics.length ? '<ul style="margin:0 0 14px;padding-left:18px">' + topics.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>'
                    : '<p style="margin:0 0 14px;color:#6B6F75">(geen specifieke onderwerpen aangegeven)</p>',
      '<p style="margin:14px 0 4px"><strong>Gesprek:</strong></p>',
      '<pre style="margin:0;white-space:pre-wrap;font-family:inherit;background:#F7F5F0;border:1px solid #E4DFD2;padding:12px;border-radius:6px">'
        + esc(transcript || '(geen transcript meegestuurd)') + '</pre>',
    ].filter(Boolean);

    const html = '<div style="font-family:Inter,Arial,sans-serif;font-size:14px;color:#1A1D21;line-height:1.5;max-width:640px">'
      + htmlParts.join('') + '</div>';

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [MAIL_TO],
        reply_to: email,
        subject: 'Nieuwe lead via Noor: ' + email,
        text: textParts.join('\n'),
        html,
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text().catch(() => '');
      console.error('Resend-fout', resp.status, detail);
      return res.status(502).json({ error: 'Versturen mislukt' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Lead-API fout:', err);
    return res.status(500).json({ error: 'Er ging iets mis' });
  }
}
