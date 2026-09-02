# MarketGrow.ai · website

Statische marketingsite op www.marketgrow.ai. Gewone HTML, geen bouwstap, geen serverless
functies. Alles wat een server nodig heeft (de chat, de teller, de nachtscan, aanmelden)
loopt via app.marketgrow.ai, de dashboardapp in de monorepo.

## Pagina's

| | |
|---|---|
| `index.html` | home, met de nachtscan direct onder de hero |
| `nachtscan.html` | de gratis scan: alleen een adres, het vakgebied leest de app zelf af |
| `platform.html`, `prijzen.html`, `veiligheid.html`, `contact.html` | |
| `sectoren.html` en `sectoren/*.html` | negen sectorpagina's |
| `kennis.html` en `kennis/*.html` | artikelen |
| `privacy.html`, `voorwaarden.html` | juridisch · voorwaarden heeft een eigen `voorwaarden.css` |

## Belangrijke bestanden

- `styles.css` · alle opmaak die een breekpunt nodig heeft. Wordt met de hand bijgehouden;
  elke regel die iets herstelt heeft een commentaar met waarom.
- `site.js` · menu, scroll-animaties, de Noor-chat (`app.marketgrow.ai/api/chat`), de
  gesprekkenteller (`api/public/gesprekken`; blijft verborgen zonder getal), de film op de
  home, en de Cal.com-knoppen.
- `fonts/` · zes woff2-bestanden, lokaal. Geen Google Fonts.
- `beeld/` · schermafbeeldingen van dashboard en app, png plus webp.
- `vercel.json` · cleanUrls, de omleidingen van de oude `sector-*.html`-adressen, en de
  cachekoppen voor fonts en beeld.
- `tools/` · eenmalige omzetscripts uit de tijd dat de site uit een ontwerp-runtime kwam.
  Ze draaien niet meer mee en verwijzen naar bestanden die er niet meer zijn.

## Contact

Er is geen contactformulier. `contact.html` heeft een mailadres en de Cal.com-planner.

## Live zetten

Vercel deployt `main` automatisch naar www.marketgrow.ai. Bouwen gebeurt op `dev`;
`git push origin dev:main` zet het live. Er is geen CI in deze repo, dus kijk voor het
pushen zelf naar de pagina's, ook op een telefoon (320px is de smalste maat die telt).

## Sitemap

`sitemap.xml` staat in de root en `robots.txt` wijst ernaar. Nieuwe pagina? Zet hem er
met de hand bij, in dezelfde vorm.
