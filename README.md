# MarketGrow Landing

Publieke landing voor MarketGrow. Productized AI-implementatie voor service-mkb.

## Structuur

```
.
├── index.html       # de landing
├── vercel.json      # Vercel config
├── .gitignore
└── README.md
```

Statische HTML, geen build proces. React, Tailwind en fonts via CDN.

## Deploy

### 1. Push naar GitHub

```bash
git init
git add .
git commit -m "Initial landing"
git branch -M main
git remote add origin https://github.com/JOUW-USERNAME/marketgrow-landing.git
git push -u origin main
```

Of via GitHub web: nieuwe repo aanmaken, drag-and-drop alle bestanden.

### 2. Vercel deploy

1. Ga naar [vercel.com/new](https://vercel.com/new)
2. Import GitHub repo `marketgrow-landing`
3. Framework Preset: **Other**
4. Klik **Deploy**

Binnen 30 seconden krijg je een URL zoals `marketgrow-landing-abc123.vercel.app`. Dit is je publieke landing-URL.

### 3. Eigen domein (later)

Voor nu gebruik je gewoon de Vercel-URL. `marketgrow.ai` host nog een andere applicatie, dus daar kan deze landing later naartoe als je daar klaar voor bent.

## Wat nog te doen voor productie

- **Cal.com URL invullen**: zoek `href="#intake"` in `index.html` (komt ~5x voor) en vervang met je echte Cal.com URL
- **Contact-email**: footer noemt `hello@marketgrow.ai (binnenkort)`. Vervang als je een echt email-adres hebt
- **Echte testimonial**: huidige Iris-quote is mock. Vraag haar een echte zin als je die wilt gebruiken
- **Analytics**: eventueel Plausible of Google Analytics toevoegen

## Lokaal testen

```bash
# Met Python
python3 -m http.server 8000

# Of dubbel-klik index.html in Finder
```

## Hoe te delen

Stuur prospects de Vercel-URL persoonlijk via mail, LinkedIn of WhatsApp. Geen SEO-zorgen voor nu, dit is gewoon je verkoop-asset.
