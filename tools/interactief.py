#!/usr/bin/env python3
"""
Vervangt de laatste sjabloonconstructies van de ontwerp-runtime door gewone
HTML met haakjes waar site.js op aangrijpt: de Noor-chat op index.html, het
contactformulier op contact.html en de bouwblok-schakelaars op platform.html.

Faalt hard zodra een ankerpunt niet gevonden wordt, zodat een gewijzigde
pagina nooit stilzwijgend half omgezet achterblijft.
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CAL = "https://cal.com/julian-goote-c4pgqu/intake-marketgrow.ai"


def vervang(html, patroon, nieuw, waar, aantal=1):
    resultaat, n = re.subn(patroon, lambda m: nieuw, html, count=aantal, flags=re.S)
    if n != aantal:
        sys.exit("FOUT: anker niet gevonden (%s). Pagina is al gewijzigd?" % waar)
    return resultaat


# ------------------------------------------------------------------- index

def patch_index(html):
    html = vervang(
        html,
        r'animation:mgFadeUp 0\.5s ease-out both">\{\{ claim \}\}',
        'animation:mgFadeUp 0.5s ease-out both" id="mg-claim">Live binnen een week',
        "olijfbalk-claim")

    html = vervang(
        html,
        r'<sc-if value="\{\{ liveMode \}\}"[^>]*>\s*<div style="font-family:\'JetBrains Mono\',monospace;font-size:10\.5px;color:#3F4A2E;line-height:1\.4">Live AI \u00b7 denkt met je mee</div>\s*</sc-if>\s*'
        r'<sc-if value="\{\{ demoMode \}\}"[^>]*>\s*<div style="font-family:\'JetBrains Mono\',monospace;font-size:10\.5px;color:#6A6D70;line-height:1\.4">Online \u00b7 stel gerust je eigen vraag</div>\s*</sc-if>',
        '<div id="mg-status-live" style="font-family:\'JetBrains Mono\',monospace;font-size:10.5px;color:#3F4A2E;line-height:1.4;display:none">Live AI \u00b7 denkt met je mee</div>\n'
        '                  <div id="mg-status-demo" style="font-family:\'JetBrains Mono\',monospace;font-size:10.5px;color:#6A6D70;line-height:1.4">Online \u00b7 stel gerust je eigen vraag</div>',
        "chat-status")

    html = vervang(
        html,
        r'<button class="mg-hv-2" onClick="\{\{ resetChat \}\}"',
        '<button class="mg-hv-2" type="button" id="mg-reset"',
        "opnieuw-knop")

    # Chatvenster: berichtenlijst, intake-kaart en typ-indicator.
    chat_body = (
        '<div id="mg-chat-body" style="flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:14px">\n'
        '              <div id="mg-msgs" style="display:flex;flex-direction:column;gap:14px"></div>\n'
        '              <div id="mg-intake" style="margin-left:34px;background:#3F4A2E;color:#F6F4EE;padding:16px 18px;flex-direction:column;gap:12px;animation:mgFadeUp 0.4s ease-out both;display:none">\n'
        '                <div style="font-family:\'JetBrains Mono\',monospace;text-transform:uppercase;letter-spacing:0.14em;font-size:10px;font-weight:500;color:#C8E06A">\u2192 Klaar voor een kennismaking</div>\n'
        '                <a class="mg-hv-3" href="' + CAL + '" target="_blank" rel="noopener" data-cal-namespace="kennismaking" data-cal-link="julian-goote-c4pgqu/intake-marketgrow.ai" data-cal-config="{&quot;layout&quot;:&quot;month_view&quot;}" style="background:#F6F4EE;color:#0E1112;text-align:center;padding:11px 16px;font-size:14px;font-weight:500;display:block;cursor:pointer">Plan een kennismaking \u2192</a>\n'
        '              </div>\n'
        '              <div id="mg-typing" style="gap:10px;display:none">\n'
        '                <div style="width:24px;height:24px;background:#3F4A2E;color:#F6F4EE;display:flex;align-items:center;justify-content:center;font-family:\'Instrument Serif\',Georgia,serif;font-size:12px;flex-shrink:0;margin-top:2px">N</div>\n'
        '                <div style="background:#EFEBE1;padding:12px 16px;display:flex;gap:5px;align-items:center">\n'
        '                  <span style="width:6px;height:6px;border-radius:50%;background:#6A6D70;animation:mgTyping 1.4s infinite"></span>\n'
        '                  <span style="width:6px;height:6px;border-radius:50%;background:#6A6D70;animation:mgTyping 1.4s infinite;animation-delay:0.18s"></span>\n'
        '                  <span style="width:6px;height:6px;border-radius:50%;background:#6A6D70;animation:mgTyping 1.4s infinite;animation-delay:0.36s"></span>\n'
        '                </div>\n'
        '              </div>\n'
        '            </div>'
    )
    html = vervang(
        html,
        r'<div ref="\{\{ chatBodyRef \}\}".*?</sc-if>\s*</div>',
        chat_body,
        "chatvenster")

    chips = (
        '<div id="mg-chips" style="border-top:1px solid #E1DCCF;padding:12px 16px 4px;display:flex;flex-wrap:wrap;gap:8px">\n'
        '              <button class="mg-hv-4 mg-chip" type="button" data-target="doet" style="background:#FFFFFF;border:1px solid #E1DCCF;color:#0E1112;padding:9px 14px;font-size:13px;font-weight:500;font-family:\'Inter Tight\',system-ui,sans-serif;cursor:pointer;transition:border-color 0.15s">Wat doet MarketGrow?</button>\n'
        '              <button class="mg-hv-4 mg-chip" type="button" data-target="team" style="background:#FFFFFF;border:1px solid #E1DCCF;color:#0E1112;padding:9px 14px;font-size:13px;font-weight:500;font-family:\'Inter Tight\',system-ui,sans-serif;cursor:pointer;transition:border-color 0.15s">Stel het team voor</button>\n'
        '              <button class="mg-hv-4 mg-chip" type="button" data-target="kost" style="background:#FFFFFF;border:1px solid #E1DCCF;color:#0E1112;padding:9px 14px;font-size:13px;font-weight:500;font-family:\'Inter Tight\',system-ui,sans-serif;cursor:pointer;transition:border-color 0.15s">Wat kost het?</button>\n'
        '            </div>'
    )
    html = vervang(
        html,
        r'<div style="border-top:1px solid #E1DCCF;padding:12px 16px 4px;display:flex;flex-wrap:wrap;gap:8px">\s*<sc-for list="\{\{ chips \}\}".*?</sc-for>\s*</div>',
        chips,
        "keuzeknoppen")

    invoer = (
        '<div style="padding:10px 16px 14px;display:flex;gap:8px;align-items:stretch">\n'
        '              <div id="mg-live-row" style="flex:1;gap:8px;align-items:stretch;display:none">\n'
        '                <input id="mg-live-input" type="text" placeholder="Typ je vraag aan Noor\u2026" style="flex:1;background:#EFEBE1;border:1px solid #E1DCCF;padding:10px 14px;font-size:16px;font-family:\'Inter Tight\',system-ui,sans-serif;color:#0E1112;outline:none">\n'
        '                <button id="mg-send" type="button" style="background:#3F4A2E;color:#F6F4EE;border:none;padding:0 16px;display:flex;align-items:center;font-size:14px;cursor:pointer">\u2192</button>\n'
        '              </div>\n'
        '              <div id="mg-demo-row" style="flex:1;gap:8px;align-items:stretch;display:flex">\n'
        '                <div class="mg-start-live" title="Klik om Noor zelf een vraag te stellen" style="flex:1;background:#EFEBE1;border:1px solid #E1DCCF;padding:10px 14px;font-size:13.5px;display:flex;align-items:center;min-height:20px;cursor:text">\n'
        '                  <span id="mg-draft"></span>\n'
        '                  <span id="mg-caret" style="width:7px;height:14px;background:#0E1112;margin-left:2px;flex-shrink:0;animation:mgBlink 1s steps(2) infinite;display:none"></span>\n'
        '                  <span id="mg-hint" style="color:#6A6D70">Typ hier je eigen vraag aan Noor\u2026</span>\n'
        '                </div>\n'
        '                <div class="mg-start-live" style="background:#3F4A2E;color:#F6F4EE;padding:0 16px;display:flex;align-items:center;font-size:14px;cursor:pointer">\u2192</div>\n'
        '              </div>\n'
        '            </div>'
    )
    html = vervang(
        html,
        r'<div style="padding:10px 16px 14px;display:flex;gap:8px;align-items:stretch">\s*'
        r'<sc-if value="\{\{ liveMode \}\}".*?font-size:14px;cursor:pointer">\u2192</div>\s*</sc-if>\s*</div>',
        invoer,
        "invoerbalk")

    html = html.replace('href="{{ calUrl }}"', 'href="%s" rel="noopener"' % CAL)
    return html


# ----------------------------------------------------------------- contact

def patch_contact(html):
    html = vervang(html, r'<sc-if value="\{\{ notSent \}\}"[^>]*>',
                   '<div id="mg-form">', "formulier-open")
    html = vervang(html, r'<sc-if value="\{\{ sent \}\}"[^>]*>',
                   '<div id="mg-bedankt" style="display:none">', "bedankt-open")
    html = html.replace("</sc-if>", "</div>")

    for veld in ("naam", "email", "bedrijf", "bericht"):
        html = html.replace(
            'value="{{ %s }}" onChange="{{ on%s }}"' % (veld, veld.capitalize()),
            'id="mg-%s" name="%s"' % (veld, veld))
    html = html.replace('rows="5" value="{{ bericht }}" onChange="{{ onBericht }}"',
                        'rows="5" id="mg-bericht" name="bericht"')

    html = vervang(
        html,
        r'<sc-if value="\{\{ hasError \}\}"[^>]*>\s*<div style="([^"]*)">\{\{ error \}\}</div>\s*</div>',
        lambda_safe := '<div id="mg-fout" style="font-size:14px;color:#8A2A2A;background:#F6ECEC;border:1px solid #E4C9C9;padding:12px 14px;display:none"></div>',
        "foutmelding")

    html = vervang(html, r'onClick="\{\{ onSubmit \}\}"',
                   'type="button" id="mg-verstuur"', "verstuurknop")
    html = html.replace("{{ submitLabel }}", "Verstuur bericht")
    html = html.replace("Bedankt{{ naamSuffix }}", '<span id="mg-bedankt-naam">Bedankt</span>')
    html = html.replace("{{ emailEcho }}", '<span id="mg-bedankt-mail">je e-mailadres</span>')
    html = vervang(html, r'onClick="\{\{ onReset \}\}"',
                   'type="button" id="mg-nieuw"', "opnieuwknop")
    return html


# ---------------------------------------------------------------- platform

def patch_platform(html):
    rijen = []
    blokken = [
        ("gespreksgids", "AI-Gespreksgids"),
        ("content", "Content-Engine"),
        ("whatsapp", "WhatsApp-afstandsbediening"),
        ("document", "Document-Automatie"),
    ]
    for sleutel, naam in blokken:
        rijen.append(
            '              <div class="mg-pd-14 mg-hv-8 mg-blok" data-sleutel="%s" style="background:#F6F4EE;padding:22px 26px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;user-select:none">\n'
            '                <span class="mg-blok-naam" style="font-family:\'Instrument Serif\',Georgia,serif;font-size:26px;color:#A09E94;transition:color 0.35s">%s</span>\n'
            '                <span class="mg-blok-baan" style="width:46px;height:26px;border-radius:13px;background:#C7C3B6;transition:background 0.35s;position:relative;flex-shrink:0;display:block">\n'
            '                  <span class="mg-blok-knop" style="position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%%;background:#FFFFFF;transition:transform 0.35s cubic-bezier(0.22,1,0.36,1);transform:translateX(0px);box-shadow:0 1px 3px rgba(14,17,18,0.25);display:block"></span>\n'
            '                </span>\n'
            '              </div>' % (sleutel, naam))
    html = vervang(
        html,
        r'<sc-for list="\{\{ rows \}\}".*?</sc-for>',
        "\n".join(rijen).lstrip(),
        "bouwblok-schakelaars")
    return html


def main():
    for naam, functie in (("index.html", patch_index),
                          ("contact.html", patch_contact),
                          ("platform.html", patch_platform)):
        pad = ROOT / naam
        html = pad.read_text(encoding="utf-8")
        html = functie(html)
        rest = re.findall(r"\{\{[^}]*\}\}|<sc-[a-z]+", html)
        if rest:
            sys.exit("FOUT: %s heeft nog sjabloonresten: %s" % (naam, rest[:5]))
        pad.write_text(html, encoding="utf-8")
        print("  %-16s omgezet naar gewone HTML" % naam)


if __name__ == "__main__":
    main()
