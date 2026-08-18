# Handoff MarketGrow.ai

Statische opmaak voor de repo. Geen sjabloontaal, geen bouwstap, geen scripts van een CDN.

## Wat hier staat

    handoff/
      styles.css              alle stijlen, met de kleuren en maten als variabelen bovenaan
      partials/header.html    de bovenbalk, identiek op elke pagina
      partials/footer.html    het slotblok en de voettekst, identiek op elke pagina
      gedrag.md               wat JavaScript moet doen, per onderdeel
      paginas.md              titel, description, canonical en OG-tags per pagina
      beeld/                  de afbeeldingen, met exact de namen die in de HTML staan
      fonts/                  hier horen de zes woff2-bestanden (zie LEESMIJ.txt daarin)
      paginas/                de vijftien pagina's als platte HTML
        index.html            homepage
        platform.html         het platform, met de app-carrousel
        prijzen.html          configurator, schakelaar en FAQ
        veiligheid.html       vier pijlers, securitypartij en kennisbank
        kennisbank.html       nog leeg, met de opzet per artikelkaart erin beschreven
        sectoren.html         overzicht van de negen vakken
        contact.html          demo plannen, zelf starten of mailen
        sectoren/*.html       negen sectorpagina's, elk een eigen URL

## Wat je met de pagina's kunt doen

De bestanden in `paginas/` zijn platte HTML: geen sjabloontaal, geen `{{ }}`, wat er staat is
wat de browser krijgt. Kop en voet staan in elke pagina uitgeschreven én los in `partials/`,
zodat je kunt zien wat identiek hoort te zijn. Plaats ze op de URL's uit `paginas.md`
(`index.html` op `/`, `platform.html` op `/platform`, enzovoort).

De haken voor JavaScript zitten als `data-`attributen in de opmaak: `data-chat`,
`data-blok`, `data-termijn`, `data-slide`, `data-teller`. In `gedrag.md` staat per
onderdeel wat het moet doen. Verwacht wordt één `/site.js`; die verwijzing staat onderaan
elke pagina.

## Volgorde die ik zou aanhouden

1. `styles.css` en de twee partials plaatsen, letters in `/fonts` zetten.
2. De homepage bouwen; die bevat het chatpaneel, de bewijsstrook, het regieblok en de
   doorklikkaarten.
3. Platform, prijzen, veiligheid en kennisbank.
4. De sectorenpagina plus negen sectorpagina's. Die zijn onderling identiek van opbouw en
   verschillen alleen in tekst; het is het groeikanaal, dus elk met een eigen URL en een
   eigen description.

## Wat nog ontbreekt

- De dertien schermbeelden uit het echte product. Tot die er zijn: het lege kader (`.leeg`)
  laten staan en de regel "echte interface, geanonimiseerde gegevens" niet terugzetten.
- Het echte gesprekscijfer voor de teller.
- De zes woff2-bestanden. Die kan ik niet meeleveren; het zijn licentiebestanden die je bij
  de bron ophaalt. De `@font-face`-regels staan al klaar bovenin `styles.css` en verwijzen
  naar `/fonts/<naam>.woff2`, dus plaatsen is genoeg.

## Mobiel

Onder 720px verschijnt de menuknop en klapt de nav open en dicht; boven 720px is de knop met
CSS verborgen. Het gedrag staat in `gedrag.md` §7, de opmaak onderaan `styles.css`.
