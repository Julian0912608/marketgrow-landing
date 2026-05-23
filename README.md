# MarketGrow Landing — productie

Twee HTML-bestanden, alle JS inline. Geen submappen voor de landing nodig.

## Wat zit erin

```
.
├── index.html         # V3 Noor — conversational landing (default)
├── klassiek.html      # V1 Aurora — klassieke scrollende fallback
├── api/
│   └── chat.js        # Vercel serverless functie (ongebruikt door landing, klaar voor later)
├── package.json
└── vercel.json
```

## Upload (vervangt alle vorige bestanden)

1. Open `https://github.com/Julian0912608/marketgrow-landing`
2. **Verwijder uit de repo** (als nog aanwezig): `v1/`, `v3/`, `v1.html`, `v2.html`, `v3.html`, `preview.html`, `deploy/`
3. **Overschrijf** `index.html` en `klassiek.html` met de versies uit deze bundel
4. `package.json` en `vercel.json` zijn ongewijzigd, maar zitten erbij voor de zekerheid
5. Commit en push, Vercel deployt binnen 1-2 minuten

## Wat is nieuw in deze versie

- **Noor** als naam in plaats van Marko (Nederlands, betekent "licht", duidelijker onderscheid t.o.v. de brand MarketGrow)
- **Embedded Cal.com** in beide pagina's. Niet meer een redirect naar een aparte tijd-selector, maar de hele agenda inline. Bezoekers boeken zonder de site te verlaten.
- **"Liever mailen dan bellen"** knop aan het einde van Noor's gesprek. Vraagt e-mail + telefoon, opent dan een vooraf-ingevulde mail naar `hello@marketgrow.ai` met de gespreks-context (welke onderwerpen besproken, welk beroep, etc).
- **Olive ribbon** boven de navbar in beide pagina's, met rouleerde claims (live in 7 dagen, geld terug, etc) voor meer dynamiek.
- **Profession hover-grid** vervangt de drukke marquee. Tien beroepen, hover laat zien hoe Noor zich specifiek aanpast aan dat vakgebied.
- **Floating chips bij de hero-chat in `klassiek.html` weg**, vervangen door een nette stat-strip onder de chat (24/7, jouw merk, 500 gesprekken, 1-link agenda).
- **Auto-scroll in Noor** netjes gefixt zodat antwoorden altijd in beeld blijven, met ruimte voor de sticky CTA.
- **Favicon** (Olive M op cream).

## Aanpassen later

- **Cal.com link**: zoek in `index.html` en `klassiek.html` naar `julian-goote-c4pgqu/gratis-intake` en `CAL_COM_URL`. Drie plekken in totaal.
- **Mail-adres voor lead form**: in `index.html` zoek naar `hello@marketgrow.ai` (staat in `LeadFormCard` en in de footer).
- **Olive ribbon tekst**: zoek `const messages = [` en pas de array aan. Komt twee keer voor (één in `index.html`, één in `klassiek.html`).
- **Hover-uitleg per beroep**: zoek `const items = [` binnen `ProfessionGrid` in `klassiek.html`.

## Productie-overweging

De pagina laadt Tailwind en Babel via CDN. Werkt prima maar geeft twee console-warnings. Voor later: precompileren met Tailwind CLI + Babel als de site veel verkeer krijgt.

## Anthropic API key

Blijft staan in je Vercel environment voor `api/chat.js`. Wordt niet door de landing aangeroepen (Noor is gescript), klaar voor later gebruik op échte klantsites.
