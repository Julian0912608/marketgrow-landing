# MarketGrow.ai — website

Statische marketingsite plus één serverless functie voor het contactformulier.

## Pagina's
- `index.html` — home
- `platform.html`, `sectoren.html`, `bewijs.html`, `prijzen.html`, `contact.html`
- `sector-*.html` — de specialist per sector (juristen, accountants, mediators, bedrijfsadviseurs, fysio, hypotheek, architecten)

## Belangrijke bestanden
- `styles.css` · responsieve laag over de inline opmaak heen. Gegenereerd, niet met de hand bijwerken.
- `site.js` · navigatie, scroll-animaties, de Noor-chat, het contactformulier en de bouwblok-schakelaars.
- `api/contact.js` — serverless functie die het contactformulier via Resend verstuurt.
- `marketgrow-logo.png`, `dashboard-mockup.png`, `og-image.png` — afbeeldingen.

## Live zetten via GitHub + Vercel
1. Push de inhoud van deze map naar een nieuwe GitHub-repository.
2. Ga naar vercel.com → New Project → importeer de repo.
3. Framework preset: **Other** (het is een statische site). Geen build command nodig.
4. Voeg de environment variable toe: **RESEND_API_KEY** = je Resend API-sleutel.
5. Verifieer het domein **marketgrow.ai** in Resend, zodat mail vanaf hello@marketgrow.ai verstuurd mag worden. (Nog niet geverifieerd? Zet tijdelijk `from` in api/contact.js op `onboarding@resend.dev`.)
6. Deploy. De home staat op `/`, het formulier post naar `/api/contact`.

## Let op
- Fonts (Google Fonts) en de kennismakingsplanner (Cal.com) laden via CDN, dus een internetverbinding is vereist.
- De pagina's zijn gewone statische HTML. Er is geen build-stap en geen runtime nodig.

## Sitemap zichtbaar maken voor Google
De sitemap staat op `sitemap.xml` (na deploy: https://www.marketgrow.ai/sitemap.xml) en `robots.txt` verwijst er al naar, dus Google vindt 'm automatisch bij het crawlen.

Dien 'm daarnaast éénmalig handmatig in voor snellere indexering:
1. Ga naar Google Search Console (search.google.com/search-console) en voeg het domein marketgrow.ai toe (en verifieer het via DNS).
2. Open **Sitemaps** in het linkermenu.
3. Voer `sitemap.xml` in en klik op Verzenden.

De sitemap opnieuw genereren na nieuwe pagina's? Werk `sitemap.xml` bij met dezelfde structuur.
