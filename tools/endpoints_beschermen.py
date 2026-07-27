#!/usr/bin/env python3
"""
Zet de bescherming uit _bescherming.js op de drie publieke endpoints van
marketgrow.ai.

Per endpoint:
  chat.js     herkomstcontrole, 12 berichten per 5 minuten per IP, berichten
              afgekapt op 2000 tekens. De modelkeuze blijft ongemoeid.
  contact.js  herkomstcontrole, 5 inzendingen per 10 minuten per IP, velden
              afgekapt zodat een mail niet onbeperkt groot kan worden.
  lead.js     herkomstcontrole, 8 aanmeldingen per 10 minuten per IP.

Faalt hard zodra een ankerpunt niet gevonden wordt.
"""

import sys
from pathlib import Path


def vervang(tekst, oud, nieuw, waar):
    if tekst.count(oud) != 1:
        sys.exit("FOUT: anker '%s' komt %d keer voor in plaats van 1." % (waar, tekst.count(oud)))
    return tekst.replace(oud, nieuw, 1)


def patch_chat():
    pad = Path("api/chat.js")
    s = pad.read_text(encoding="utf-8")
    if "_bescherming" in s:
        print("  chat.js was al beschermd, overgeslagen")
        return

    s = vervang(
        s,
        "export default async function handler(req, res) {\n"
        "  // CORS headers\n"
        "  res.setHeader('Access-Control-Allow-Origin', '*');\n"
        "  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');\n"
        "  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');\n"
        "\n"
        "  if (req.method === 'OPTIONS') {\n"
        "    return res.status(200).end();\n"
        "  }\n",
        "export default async function handler(req, res) {\n"
        "  zetHerkomstHeaders(req, res);\n"
        "\n"
        "  if (req.method === 'OPTIONS') {\n"
        "    return res.status(200).end();\n"
        "  }\n"
        "\n"
        "  // Alleen vanaf onze eigen site. Dit endpoint kost geld per aanroep.\n"
        "  if (!herkomstOk(req)) {\n"
        "    return res.status(NIET_TOEGESTAAN.status).json(NIET_TOEGESTAAN.body);\n"
        "  }\n"
        "  if (teSnel(req, { max: 12, vensterMs: 5 * 60 * 1000 })) {\n"
        "    return res.status(TE_DRUK.status).json(TE_DRUK.body);\n"
        "  }\n",
        "chat handler-kop")

    s = vervang(
        s,
        "    // Beperk conversation-length tegen prompt-injection en kosten\n"
        "    const recentMessages = messages.slice(-20);\n",
        "    // Beperk conversation-length tegen prompt-injection en kosten. Naast het\n"
        "    // aantal berichten kappen we ook de lengte per bericht af: zonder die grens\n"
        "    // bepaalt de beller hoeveel tokens een enkel verzoek kost.\n"
        "    const recentMessages = messages.slice(-20).map((m) => ({\n"
        "      role: m && m.role === 'assistant' ? 'assistant' : 'user',\n"
        "      content: knip(typeof m?.content === 'string' ? m.content : '', 2000),\n"
        "    }));\n",
        "chat berichtenlimiet")


    s = "import { herkomstOk, zetHerkomstHeaders, teSnel, knip, TE_DRUK, NIET_TOEGESTAAN } from './_bescherming.js';\n" + s
    pad.write_text(s, encoding="utf-8")
    print("  chat.js beschermd")


def patch_contact():
    pad = Path("api/contact.js")
    s = pad.read_text(encoding="utf-8")
    if "_bescherming" in s:
        print("  contact.js was al beschermd, overgeslagen")
        return

    s = vervang(
        s,
        "export default async function handler(req, res) {\n"
        "  if (req.method !== 'POST') {\n"
        "    res.setHeader('Allow', 'POST');\n"
        "    return res.status(405).json({ error: 'Method not allowed' });\n"
        "  }\n",
        "export default async function handler(req, res) {\n"
        "  zetHerkomstHeaders(req, res);\n"
        "\n"
        "  if (req.method === 'OPTIONS') return res.status(200).end();\n"
        "  if (req.method !== 'POST') {\n"
        "    res.setHeader('Allow', 'POST');\n"
        "    return res.status(405).json({ error: 'Method not allowed' });\n"
        "  }\n"
        "\n"
        "  // Dit endpoint verstuurt mail via jouw Resend-account. Zonder rem kan iemand\n"
        "  // daarmee je eigen postvak volgooien.\n"
        "  if (!herkomstOk(req)) {\n"
        "    return res.status(NIET_TOEGESTAAN.status).json(NIET_TOEGESTAAN.body);\n"
        "  }\n"
        "  if (teSnel(req, { max: 5, vensterMs: 10 * 60 * 1000 })) {\n"
        "    return res.status(TE_DRUK.status).json(TE_DRUK.body);\n"
        "  }\n",
        "contact handler-kop")

    s = vervang(
        s,
        "    const naam = (body.naam || '').toString().trim();\n"
        "    const email = (body.email || '').toString().trim();\n"
        "    const bedrijf = (body.bedrijf || '').toString().trim();\n"
        "    const bericht = (body.bericht || '').toString().trim();\n",
        "    const naam = knip((body.naam || '').toString().trim(), 120);\n"
        "    const email = knip((body.email || '').toString().trim(), 200);\n"
        "    const bedrijf = knip((body.bedrijf || '').toString().trim(), 160);\n"
        "    const bericht = knip((body.bericht || '').toString().trim(), 5000);\n",
        "contact veldlengtes")

    s = "import { herkomstOk, zetHerkomstHeaders, teSnel, knip, TE_DRUK, NIET_TOEGESTAAN } from './_bescherming.js';\n" + s
    pad.write_text(s, encoding="utf-8")
    print("  contact.js beschermd, veldlengtes begrensd")


def patch_lead():
    pad = Path("api/lead.js")
    s = pad.read_text(encoding="utf-8")
    if "_bescherming" in s:
        print("  lead.js was al beschermd, overgeslagen")
        return

    s = vervang(
        s,
        "export default async function handler(req, res) {\n"
        "  res.setHeader('Access-Control-Allow-Origin', '*');\n"
        "  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');\n"
        "  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');\n"
        "\n"
        "  if (req.method === 'OPTIONS') return res.status(200).end();\n"
        "  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });\n",
        "export default async function handler(req, res) {\n"
        "  zetHerkomstHeaders(req, res);\n"
        "\n"
        "  if (req.method === 'OPTIONS') return res.status(200).end();\n"
        "  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });\n"
        "\n"
        "  // Ook dit endpoint verstuurt mail, dus dezelfde twee zeven als bij contact.\n"
        "  if (!herkomstOk(req)) {\n"
        "    return res.status(NIET_TOEGESTAAN.status).json(NIET_TOEGESTAAN.body);\n"
        "  }\n"
        "  if (teSnel(req, { max: 8, vensterMs: 10 * 60 * 1000 })) {\n"
        "    return res.status(TE_DRUK.status).json(TE_DRUK.body);\n"
        "  }\n",
        "lead handler-kop")

    s = "import { herkomstOk, zetHerkomstHeaders, teSnel, TE_DRUK, NIET_TOEGESTAAN } from './_bescherming.js';\n" + s
    pad.write_text(s, encoding="utf-8")
    print("  lead.js beschermd")


def main():
    if not Path("api/chat.js").exists():
        sys.exit("FOUT: draai dit vanuit de hoofdmap van marketgrow-landing.")
    patch_chat()
    patch_contact()
    patch_lead()


if __name__ == "__main__":
    main()
