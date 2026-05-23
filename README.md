# MarketGrow Landing — V3 Marko (live)

**Belangrijk:** dit is een fix-bundel waarin alle JavaScript inline in de HTML staat. Geen submappen meer voor de landing. Vorige upload faalde omdat de subfolders `v3/` en `v1/` niet meekwamen — die kun je nu negeren en verwijderen uit je repo.

## Structuur

```
.
├── index.html         # V3 Marko (de live landing) — alles ingebouwd
├── klassiek.html      # V1 Aurora (klassieke fallback) — alles ingebouwd
├── api/
│   └── chat.js        # jouw bestaande Vercel serverless functie
├── package.json
└── vercel.json
```

## Upload

1. Open `https://github.com/Julian0912608/marketgrow-landing`
2. Verwijder uit de repo (als ze er staan): `v1/`, `v3/`, `v1.html`, `v2.html`, `v3.html`, `preview.html`
3. Upload of overschrijf de vier bestanden uit deze bundel (`index.html`, `klassiek.html`, `package.json`, `vercel.json`) en zorg dat `api/chat.js` ook geüpdate is
4. Commit
5. Vercel deployt vanzelf binnen 1-2 minuten

> Tip: bij GitHub web UI uploads, sleep elk HTML-bestand individueel naar het bestandsoverzicht en commit ze. Submappen zoals `api/` moeten via "Add file → Create new file" en dan het pad typen (bv. `api/chat.js`).

## Wat veranderde

- **Inline scripts**: `index.html` (V3) en `klassiek.html` (V1) bevatten nu alle JSX direct in `<script type="text/babel">` blokken. Geen externe bestanden meer nodig. Voorkomt 404's bij upload.
- **Geen functionaliteit verloren**: Marko, kaarten, sticky CTA, Cal.com koppeling, alles werkt zoals in de preview.

## Aanpassen later

- **Cal.com URL** staat in `index.html` als `const CAL_COM_URL = 'https://cal.com/julian-goote-c4pgqu/gratis-intake';` Zoek dat in beide HTML-bestanden.
- **Marko's tekst per onderwerp**: zoek in `index.html` naar `const TOPICS = {` en bewerk de teksten.
- **Beroepenlijst in V3**: zoek `const PROFESSIONS =` in `index.html`.

## Anthropic API key

Blijft staan in je Vercel environment voor `api/chat.js`. De live landing roept hem niet aan (Marko op de landing is een gescripte tour, geen live Claude-call), dus geen kosten. Klaar voor later gebruik op echte klantsites.
