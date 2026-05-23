# MarketGrow.ai — Landing

Publieke landing voor MarketGrow.ai. Productized AI-implementatie voor service-mkb.

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

### 2. Vercel deploy

1. [vercel.com/new](https://vercel.com/new)
2. Import GitHub repo `marketgrow-landing`
3. Framework Preset: **Other**
4. Deploy

### 3. Domain koppelen

In Vercel project → Settings → Domains:
1. Voeg `marketgrow.ai` en `www.marketgrow.ai` toe
2. Stel DNS-records in bij je domein-registrar:
   - **A-record** voor root: `@` → `76.76.21.21`
   - **CNAME** voor www: `www` → `cname.vercel-dns.com`
3. SSL-certificaat wordt automatisch door Vercel aangemaakt

## Wat nog updaten voor productie

- `href="#intake"` knoppen vervangen door echte Cal.com URL
- Echte testimonial van Iris (Juristenrij) in plaats van mock-quote
- Eventueel Plausible/Google Analytics toevoegen

## Lokaal testen

```bash
# Met Python
python3 -m http.server 8000

# Met Node
npx serve

# Of gewoon: dubbel-klik index.html in Finder
```
