# MarketGrow Landing

Publieke landing voor MarketGrow met live Claude AI-chat.

## Structuur

```
.
├── index.html       # de landing (statische HTML met React via CDN)
├── api/
│   └── chat.js     # Vercel serverless function → Claude API
├── package.json    # Anthropic SDK dependency
├── vercel.json     # Vercel config
├── .gitignore
└── README.md
```

## Deploy

### 1. Push naar GitHub

```bash
git init
git add .
git commit -m "Initial landing with Claude API"
git branch -M main
git remote add origin https://github.com/JOUW-USERNAME/marketgrow-landing.git
git push -u origin main
```

### 2. Vercel deploy

1. Ga naar [vercel.com/new](https://vercel.com/new)
2. Import GitHub repo `marketgrow-landing`
3. Framework Preset: **Other**
4. **BELANGRIJK:** voordat je op Deploy klikt, klik "Environment Variables" open en voeg toe:
   - Name: `ANTHROPIC_API_KEY`
   - Value: jouw Anthropic API key (begint met `sk-ant-`)
   - Environments: alle drie aanvinken (Production, Preview, Development)
5. Klik **Deploy**

Binnen 1-2 minuten staat de landing live (Vercel moet nu npm install draaien voor de Anthropic SDK, vandaar iets langer dan voorheen).

### 3. Cal.com URL aanpassen

In `index.html` staat op twee plaatsen `https://cal.com/julian-goote-c4pgqu/gratis-intake`. Vervang door je echte Cal.com URL. Zoek bovenaan het script:

```js
const CAL_COM_URL = 'https://cal.com/julian-goote-c4pgqu/gratis-intake';
```

En de href's in de hero/intake-knoppen.

## Hoe de chat werkt

1. Frontend (`index.html`) heeft een `ChatDemo` component die berichten POSTt naar `/api/chat`
2. `/api/chat.js` draait server-side op Vercel, bevat de Claude API key (veilig, niet in browser)
3. System prompt staat bovenin `chat.js` — Marko gedraagt zich daarnaar
4. Wanneer Marko de marker `[INTAKE_READY]` in zijn antwoord opneemt, toont de frontend automatisch de Cal.com-knop

## Anthropic API key krijgen

1. Ga naar [console.anthropic.com](https://console.anthropic.com)
2. Settings → API Keys → Create Key
3. Kopieer de key (begint met `sk-ant-`)
4. Zet hem in Vercel als environment variable

## Kosten in de gaten houden

Elk chat-gesprek kost gemiddeld €0,05-0,15 aan Claude API tokens. In Anthropic console kun je een hard monthly limit instellen (Settings → Limits). Aanrader: zet voor de eerste weken €50/maand als plafond.

## Wat aanpassen voor productie

- **Cal.com URL** vervangen (zie hierboven)
- **System prompt verfijnen**: bewerk `api/chat.js` als je merkt dat Marko bepaalde dingen anders moet zeggen
- **Rate limiting**: nu kan iedereen onbeperkt chatten. Voor productie zou je IP-based rate limiting willen toevoegen (Vercel KV of Upstash)
- **Analytics**: Plausible of Google Analytics

## Lokaal testen (optioneel)

De chat werkt alleen na Vercel-deploy (vanwege server-side API). Voor lokale frontend-tests:

```bash
python3 -m http.server 8000
```

De chat-fetches naar `/api/chat` zullen lokaal falen, maar je kunt de rest van de landing wel zien.
