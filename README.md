# MarketGrow Landing — V3 Marko (live)

Vervang de bestanden in je GitHub repo (`Julian0912608/marketgrow-landing`) met de bestanden in deze map en push. Vercel deployt vanzelf.

## Structuur

```
.
├── index.html              # V3 Marko (de live landing, conversatie = pagina)
├── klassiek.html           # V1 Aurora (klassieke scrollende fallback, bereikbaar via "liever scrollen ↗")
├── v3/
│   ├── cards.jsx           # inline rich cards (modules, prijzen, proces, FAQ, intake)
│   └── app.jsx             # conversatie state machine + top-bar + sticky CTA
├── v1/
│   ├── chat.jsx            # Marko hero-chat component (gescript)
│   ├── sections.jsx        # Nav, Hero, Marquee, Probleem, Bouwblokken
│   └── app.jsx             # Hoe het werkt, Patroon, Pricing, FAQ, IntakeCTA, Footer
├── api/
│   └── chat.js             # (jouw bestaande Vercel serverless functie)
├── package.json
└── vercel.json
```

## Wat te doen

### 1. Push naar GitHub

Optie A — via GitHub web UI:
1. Open `https://github.com/Julian0912608/marketgrow-landing`
2. Klik op het bestaande `index.html`, kopieer de nieuwe inhoud erover en commit
3. Doe hetzelfde voor de nieuwe bestanden in de `v1/` en `v3/` mappen (gebruik "Add file → Create new file" en typ het pad zoals `v3/app.jsx`)
4. Vergeet `klassiek.html` niet

Optie B — via terminal:
```bash
cd /pad/naar/marketgrow-landing
# kopieer alle bestanden uit deze deploy/ map hierheen
git add .
git commit -m "Redesign: V3 conversational landing + klassieke V1 fallback"
git push
```

### 2. Vercel deployt automatisch

Binnen 1-2 minuten staat het live. Geen extra environment variables nodig — Marko in V3 is gescript (geen Claude API call), dus de Anthropic key wordt op de landing niet meer gebruikt.

> De `api/chat.js` blijft staan voor het geval je hem later wilt gebruiken (bijvoorbeeld om Marko op de échte klantsites met live Claude te koppelen). Hij wordt door de live landing niet aangeroepen.

## Wat is er veranderd

- **V3 Marko (`index.html`)**: de hele landing is één gesprek met Marko. Bezoekers klikken antwoord-chips, Marko reageert en toont modules / prijzen / proces / FAQ als inline rich cards. Aan het eind verschijnt een tijd-grid met links naar jouw Cal.com.
- **Klassieke fallback (`klassiek.html`)**: voor wie de chat niet wil. Volledige scrollende landing met Marko alleen in de hero-demo.
- **Beide pagina's linken naar elkaar**: V3 heeft een "liever scrollen ↗" link en een "Of klassiek scrollen" chip. Klassiek heeft een "of in gesprek met Marko" link in de nav.

## Aanpassen

- **Cal.com URL** zit op één plek: `v3/app.jsx` regel 4 (`CAL_COM_URL`) en `v1/chat.jsx` regel 4. Wijzig daar als jouw boekings-URL verandert.
- **Marko's verhaal in V3**: tekst per onderwerp staat in `v3/app.jsx` in de `TOPICS` object.
- **Beroepen lijst in V3**: `v3/app.jsx` in `PROFESSIONS` constant.

## Productie-overweging

De pagina laadt nu Tailwind en Babel via CDN. Werkt prima maar geeft twee console-warnings en is iets langzamer dan een gebouwde versie. Voor later: precompileer met `npx @tailwindcss/cli` + `npx babel` als de site veel verkeer krijgt.
