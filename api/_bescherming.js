// api/_bescherming.js
//
// Gedeelde bescherming voor de publieke endpoints van marketgrow.ai. Die endpoints
// staan open op internet en kosten geld zodra ze worden aangeroepen: /api/chat praat
// met Anthropic, /api/contact en /api/lead versturen mail. Zonder rem kan iedereen
// die de netwerkinspecteur van de site opent er een script op zetten.
//
// Twee zeven, in deze volgorde:
//
//   1. Herkomst. Een browser stuurt bij een fetch altijd een Origin mee. Komt die
//      niet van onze eigen site, dan doen we niets. Dit sluit de browserkant
//      volledig af en filtert daarnaast het gros van de losse scripts weg, want
//      die sturen geen Origin mee.
//
//   2. Snelheid per IP. Een eenvoudige teller in het geheugen van de draaiende
//      functie. Eerlijk over de beperking: serverless betekent dat er meerdere
//      instanties naast elkaar kunnen draaien, elk met een eigen teller. Dit is
//      dus een rem, geen slot. Wil je een echte grendel over alle instanties
//      heen, dan is een gedeelde teller nodig (Upstash Redis, waar je al een
//      account hebt voor QStash).
//
// Een bestandsnaam die met een liggend streepje begint wordt door Vercel niet als
// route gepubliceerd, dus dit bestand is zelf niet bereikbaar van buitenaf.

const TOEGESTANE_HOSTS = [
  'marketgrow.ai',
  'www.marketgrow.ai',
  'localhost:3000',
  'localhost:8000',
];

function hostVan(waarde) {
  if (!waarde) return '';
  try {
    return new URL(waarde).host.toLowerCase();
  } catch {
    return '';
  }
}

// Vercel-previews (naam-hash.vercel.app) mogen ook, zodat testen niet stukloopt.
function toegestaan(host) {
  if (!host) return false;
  if (TOEGESTANE_HOSTS.includes(host)) return true;
  return host.endsWith('.vercel.app');
}

export function herkomstOk(req) {
  const origin = hostVan(req.headers.origin);
  if (origin) return toegestaan(origin);
  // Geen Origin, dan proberen we de Referer. Ontbreken ze allebei, dan komt het
  // verzoek niet van een pagina en weigeren we het.
  return toegestaan(hostVan(req.headers.referer));
}

export function zetHerkomstHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin && toegestaan(hostVan(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const tellers = new Map();

export function teSnel(req, { max, vensterMs }) {
  const kop = req.headers['x-forwarded-for'] || '';
  const ip = String(kop).split(',')[0].trim() || 'onbekend';
  const nu = Date.now();
  const rij = (tellers.get(ip) || []).filter((t) => nu - t < vensterMs);
  rij.push(nu);
  tellers.set(ip, rij);

  // Voorkomen dat de kaart eindeloos groeit op een instantie die lang warm blijft.
  if (tellers.size > 5000) {
    for (const [sleutel, tijden] of tellers) {
      if (!tijden.length || nu - tijden[tijden.length - 1] > vensterMs) tellers.delete(sleutel);
    }
  }

  return rij.length > max;
}

export function knip(waarde, max) {
  return typeof waarde === 'string' ? waarde.slice(0, max) : '';
}

export const TE_DRUK = {
  status: 429,
  body: { error: 'Even rustig aan. Probeer het over een minuut opnieuw.' },
};

export const NIET_TOEGESTAAN = {
  status: 403,
  body: { error: 'Dit verzoek komt niet van marketgrow.ai.' },
};
