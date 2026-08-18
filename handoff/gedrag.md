# Gedrag dat JavaScript nodig heeft

Vijf onderdelen. Per onderdeel de bedoeling, de toestand die je bijhoudt en de randgevallen
die in het ontwerp zijn opgelost. Geen React nodig; gewone JS is genoeg.

---

## 1 · Chatpaneel op de homepage

**Bedoeling.** Een bezoeker stelt een vraag aan Noor en krijgt live antwoord, zodat hij
voelt wat er straks op zijn eigen site staat.

**Wat het doet.** Bericht van de bezoeker onderaan toevoegen, drie pulserende puntjes tonen
en `POST` naar het widget-eindpunt op `app.marketgrow.ai` met `{ tenant, persona: 'noor',
messages: [{ role, content }] }`. Antwoord eronder plakken en naar beneden scrollen. Geeft
het antwoord `intakeReady` terug, dan verschijnt onder het gesprek een blok met de
demo-knop.

**Randgevallen.** Mislukt het verzoek, toon dan een kort vast antwoord op basis van een
trefwoord in de vraag (kosten, snelheid, website) plus één regel uitleg in mono onder het
paneel dat dit een vast antwoord is. Nooit een lege bubbel of een technische foutmelding.

**Begroeting.** De eerste zin van Noor typt zichzelf letter voor letter (ongeveer 22 ms per
teken) met een knipperende cursor, en pas op het moment dat het paneel in beeld komt. Scrolt
iemand er in één keer voorbij, dan staat de zin er gewoon in één keer. Bij
`prefers-reduced-motion` altijd meteen volledig.

---

## 2 · Prijzenconfigurator

**Bedoeling.** De bezoeker zet bouwblokken aan en uit en ziet zijn eigen bedrag meteen.

**Wat het doet.** Per blok een aan/uit-toestand; de AI-Gespreksgids staat standaard aan. Bij
elke wijziging tel je de bedragen van de aangevinkte blokken op en werk je het donkere
paneel bij: de lijst met gekozen blokken, het totaal, en de besparing.

**Bedragen.** Gespreksgids €55 per maand of €550 per jaar, Content-Engine €65 / €650,
Document-Automatie €50 / €500.

**Randgeval.** Staat er niets aan, toon dan geen €0 maar de zin "Zet minstens één bouwblok
aan om je bedragen te zien."

---

## 3 · Maand- of jaarschakelaar

**Bedoeling.** De jaaroptie verkopen zonder de maandoptie te verstoppen.

**Wat het doet.** Eén toestand die alle bedragen tegelijk omzet. **Standaard op jaar.** Aan de
jaarkant hangt het label "2 maanden gratis" in limegroen; dat is het enige felle element in
de sectie.

**Per kaart in de jaarstand.** Groot het maandequivalent (jaarprijs ÷ 12, afgerond: €46, €54,
€42), eronder klein "jaarlijks · €550 per jaar" en daaronder "Je bespaart €110 per jaar".
In de maandstand staat er groot €55 en eronder "maandelijks opzegbaar".

**Niet doen.** Geen streep door de maandprijs. De maandknop moet even goed leesbaar zijn als
de jaarknop, alleen zonder label.

---

## 4 · App-carrousel op de platformpagina

**Bedoeling.** Vijf schermen van de app laten zien zonder dat de bezoeker iets hoeft te doen.

**Wat het doet.** Eén actieve index van 0 tot 4. Rechts staat het beeld, links de vijf titels
als knoppen, eronder pijltjes en vijf streepjes. Het actieve streepje is breder en limegroen.
Wisselt vanzelf elke 5,2 seconde en gaat rond; zodra de bezoeker zelf klikt stopt die timer
definitief.

**Belangrijk.** Zet de nieuwe index meteen bij de klik, niet na afloop van een overgang. In
het ontwerp gingen kliks eerst verloren doordat de wissel 180 ms werd uitgesteld: wie sneller
klikte, klikte tegen een verouderde toestand aan. De fade hoort van een animatie te komen die
op het nieuwe beeld start, niet van een uitgestelde toestandwissel.

---

## 5 · Gesprekkenteller op de homepage

**Bedoeling.** Eén echt cijfer dat laat zien dat Noor hier zelf draait.

**Wat het doet.** Bij het laden haal je het aantal op bij
`https://app.marketgrow.ai/api/public/gesprekken`. Het antwoord is
`{"gesprekken": 105}` of `{"gesprekken": null}`. Komt er een getal groter dan nul terug,
dan verschijnt het blok en telt het cijfer bij het in beeld komen in ongeveer 1,6 seconde
op naar die waarde (afnemende snelheid). Daarna staat het stil.

**Streng.** Bij `null`, bij een fout of bij een mislukte aanroep toon je het **hele blok
niet** — geen nul, geen terugvalgetal, geen timer die vanzelf ophoogt. Onder het getal
staat "sinds maart, op deze site."

## 6 · Uitklapbare vragen (FAQ)

**Bedoeling.** Zeven vragen zonder een muur tekst.

**Wat het doet.** Niets — het zijn gewone `<details>`/`<summary>`-elementen, dus de browser
doet het werk en het werkt ook zonder JavaScript. Wil je dat er maar één open staat, luister
dan op `toggle` en sluit de andere; dat is een keuze, geen eis.

**Let op.** Het plusteken is een `<span>`; als je hem in een min wil laten veranderen, doe
dat op `details[open]` in CSS, niet met JS.

---

## 7 · Mobiel menu

**Bedoeling.** Onder 720px past de balk niet meer op één rij.

**Wat het doet.** De knop `[data-menu-knop]` klapt `[data-menu]` open en dicht: zet
`hidden` op de nav en houd `aria-expanded` op de knop gelijk. Boven 720px is de knop met CSS
verborgen en moet de nav altijd zichtbaar zijn — verwijder daar dus `hidden` bij een
resize, anders blijft het menu weg op een breed scherm.

**Verder.** Sluiten bij een klik op een link en bij Escape. "Inloggen" verdwijnt onder 720px
uit de knoppenrij; zet die link in het uitklapmenu.

---

## Twee dingen die op elke pagina meelopen

**Schaduw onder de balk.** Zodra `window.scrollY > 10` krijgt de balk een zachte schaduw
(attribuut `data-diep`), eronder weer weg.

**Secties die opkomen.** Elke sectie start met `.komt-op` en krijgt `data-in` zodra de
bovenkant boven 88% van de schermhoogte komt. Belangrijk: wie halverwege de pagina binnenkomt
of snel naar beneden scrolt, moet alles direct zien — controleer dus ook secties die al
voorbij zijn, anders blijft er tekst onzichtbaar. Bij `prefers-reduced-motion` sla je dit
helemaal over.
