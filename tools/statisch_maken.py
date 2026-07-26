#!/usr/bin/env python3
"""
Zet de MarketGrow-landingspagina om van een client-side gerenderde
ontwerp-runtime naar gewone statische HTML, en injecteert de klassen
waarmee styles.css de opmaak op telefoon en tablet kan bijsturen.

Deterministisch: dezelfde invoer geeft altijd dezelfde uitvoer.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

RUNTIME_PAGES = [
    "index.html", "platform.html", "sectoren.html", "bewijs.html",
    "prijzen.html", "contact.html",
    "sector-accountants.html", "sector-architecten.html",
    "sector-bedrijfsadviseurs.html", "sector-fysio.html",
    "sector-hypotheek.html", "sector-juristen.html",
    "sector-mediators.html",
]

# ---------------------------------------------------------------- tag-scanner

def iter_tags(html):
    """Levert (start, eind) van elke start-tag op, aanhalingstekens gerespecteerd."""
    i = 0
    n = len(html)
    while i < n:
        lt = html.find("<", i)
        if lt == -1:
            return
        if html.startswith("<!--", lt):
            end = html.find("-->", lt)
            i = (end + 3) if end != -1 else n
            continue
        j = lt + 1
        if j < n and html[j] in "/!?":
            gt = html.find(">", j)
            i = (gt + 1) if gt != -1 else n
            continue
        quote = None
        while j < n:
            c = html[j]
            if quote:
                if c == quote:
                    quote = None
            elif c in "\"'":
                quote = c
            elif c == ">":
                break
            j += 1
        if j >= n:
            return
        yield lt, j + 1
        i = j + 1


def get_attr(tag, name):
    m = re.search(r'\s' + re.escape(name) + r'="([^"]*)"', tag)
    return m.group(1) if m else None


def parse_style(value):
    out = []
    for part in value.split(";"):
        part = part.strip()
        if not part or ":" not in part:
            continue
        prop, _, val = part.partition(":")
        out.append((prop.strip(), val.strip()))
    return out


def px(value):
    m = re.fullmatch(r"(\d+(?:\.\d+)?)px", value.strip())
    return float(m.group(1)) if m else None


# ------------------------------------------------------- responsieve regels

GRID_VARIANT = {
    "minmax(0,7fr) minmax(0,5fr)": "pair",
    "minmax(0,5fr) minmax(0,7fr)": "pair",
    "minmax(0,6fr) minmax(0,5fr)": "pair",
    "1fr 1fr": "pair",
    "repeat(3,1fr)": "cards",
    "repeat(4,1fr)": "cards",
    "repeat(5,1fr)": "cards",
    "minmax(0,5fr) minmax(0,2fr) minmax(0,2fr) minmax(0,3fr)": "foot",
}


def font_mobile(size):
    """Lineair verkleinen, zodat de rangorde tussen koppen behouden blijft."""
    return max(22, round(21 + (size - 30) * 0.27))


def font_tablet(size):
    return max(24, round(size * 0.78))


def pad_component(value, horizontal):
    """Schaalt een enkele padding- of margewaarde naar telefoonformaat."""
    v = px(value)
    if v is None:
        return value
    if horizontal:
        if v >= 32:
            return "20px"
        if v >= 24:
            return "18px"
        return value
    if v >= 96:
        return "56px"
    if v >= 72:
        return "48px"
    if v >= 56:
        return "40px"
    if v >= 40:
        return "32px"
    return value


def pad_mobile(value):
    parts = value.split()
    if len(parts) == 1:
        return pad_component(parts[0], False)
    if len(parts) == 2:
        return pad_component(parts[0], False) + " " + pad_component(parts[1], True)
    if len(parts) == 3:
        return " ".join([pad_component(parts[0], False),
                         pad_component(parts[1], True),
                         pad_component(parts[2], False)])
    if len(parts) == 4:
        return " ".join([pad_component(parts[0], False),
                         pad_component(parts[1], True),
                         pad_component(parts[2], False),
                         pad_component(parts[3], True)])
    return value


def gap_mobile(value):
    v = px(value)
    if v is None:
        return None
    if v >= 48:
        return "28px"
    if v >= 32:
        return "22px"
    if v >= 28:
        return "18px"
    return None


# --------------------------------------------------------------- registers

class Registry:
    def __init__(self):
        self.fonts = set()
        self.pads = {}       # originele waarde -> klassenaam
        self.gaps = {}
        self.hovers = {}     # hover-declaratie -> klassenaam

    def font(self, size):
        self.fonts.add(size)
        return "mg-fs-%d" % size

    def pad(self, value):
        mob = pad_mobile(value)
        if mob == value:
            return None
        if value not in self.pads:
            self.pads[value] = "mg-pd-%d" % (len(self.pads) + 1)
        return self.pads[value]

    def gap(self, value):
        if gap_mobile(value) is None:
            return None
        if value not in self.gaps:
            self.gaps[value] = "mg-gp-%d" % (len(self.gaps) + 1)
        return self.gaps[value]

    def hover(self, decl):
        decl = decl.strip().rstrip(";")
        if decl not in self.hovers:
            self.hovers[decl] = "mg-hv-%d" % (len(self.hovers) + 1)
        return self.hovers[decl]


REG = Registry()


def classes_for(style_value):
    """Bepaalt welke responsieve klassen bij deze inline stijl horen."""
    found = []
    decls = parse_style(style_value)
    props = dict(decls)

    if props.get("max-width") == "1240px":
        found.append("mg-wrap")

    gtc = props.get("grid-template-columns")
    if gtc:
        variant = GRID_VARIANT.get(gtc.strip())
        found.append("mg-grid")
        if variant:
            found.append("mg-grid--" + variant)

    fs = props.get("font-size")
    if fs:
        v = px(fs)
        if v is not None and v >= 30:
            found.append(REG.font(int(v)))

    pad = props.get("padding")
    if pad:
        cls = REG.pad(pad)
        if cls:
            found.append(cls)

    gap = props.get("gap")
    if gap:
        cls = REG.gap(gap)
        if cls:
            found.append(cls)

    h = px(props.get("height", "")) if props.get("height") else None
    if h is not None and h >= 300 and props.get("position") != "absolute":
        found.append("mg-h-auto")

    if props.get("position") == "absolute" and "blur" in props.get("filter", ""):
        found.append("mg-deco")

    return found


def transform_tags(html):
    """Injecteert klassen en zet style-hover om naar echte CSS-klassen."""
    out = []
    last = 0
    for start, end in iter_tags(html):
        tag = html[start:end]
        style = get_attr(tag, "style")
        hover = get_attr(tag, "style-hover")
        if style is None and hover is None:
            continue
        add = classes_for(style) if style else []
        if hover is not None:
            add.append(REG.hover(hover))
            tag = re.sub(r'\sstyle-hover="[^"]*"', "", tag, count=1)
        if not add:
            out.append(html[last:start])
            out.append(tag)
            last = end
            continue
        existing = get_attr(tag, "class")
        if existing is not None:
            merged = existing.strip() + " " + " ".join(add)
            tag = re.sub(r'\sclass="[^"]*"', ' class="%s"' % merged, tag, count=1)
        else:
            m = re.match(r"<([a-zA-Z][\w-]*)", tag)
            name = m.group(0)
            tag = name + ' class="%s"' % " ".join(add) + tag[len(name):]
        out.append(html[last:start])
        out.append(tag)
        last = end
    out.append(html[last:])
    return "".join(out)


# ------------------------------------------------------------ hoofdbewerking

HEAD_EXTRA = (
    '<link rel="stylesheet" href="styles.css">\n'
    '<script defer src="site.js"></script>\n'
)


def strip_runtime(html):
    """Haalt de ontwerp-runtime eruit en tilt <helmet> naar <head>."""
    m = re.search(r"<helmet>(.*?)</helmet>", html, re.S)
    helmet = m.group(1).strip() if m else ""
    if m:
        html = html[:m.start()] + html[m.end():]

    html = re.sub(r'\s*<script src="\./support\.js"></script>', "", html)
    html = re.sub(r'<template id="__bundler_thumbnail">.*?</template>', "", html, flags=re.S)
    html = re.sub(r"</?x-dc[^>]*>", "", html)
    html = re.sub(r'<script type="text/x-dc"[^>]*>.*?</script>', "", html, flags=re.S)

    head_block = helmet + "\n" + HEAD_EXTRA
    html = html.replace("</head>", head_block + "</head>", 1)
    html = html.replace("<html>", '<html lang="nl">', 1)
    return re.sub(r"\n{3,}", "\n\n", html)


NAV_RE = re.compile(
    r'(<nav data-screen-label="Navigatie".*?</nav>)', re.S)


def nav_markup(current):
    """Bouwt de navigatie met een uitklapmenu voor telefoon."""
    links = [
        ("platform.html", "Het platform"),
        ("sectoren.html", "Sectoren"),
        ("bewijs.html", "Het bewijs"),
        ("prijzen.html", "Prijzen"),
        ("contact.html", "Contact"),
    ]
    items = "\n".join(
        '          <a href="%s" class="mg-nav-link%s" style="color:#6A6D70">%s</a>'
        % (href, " mg-nav-link--actief" if href == current else "", label)
        for href, label in links
    )
    cta = (
        '<a href="#founding" data-cal-namespace="kennismaking" '
        'data-cal-link="julian-goote-c4pgqu/intake-marketgrow.ai" '
        'data-cal-config="{&quot;layout&quot;:&quot;month_view&quot;}" '
        'class="mg-nav-cta mg-hv-nav" '
        'style="background:#3F4A2E;color:#F6F4EE;font-size:13px;padding:10px 18px;'
        'display:inline-flex;align-items:center;gap:8px;cursor:pointer">'
        'Plan een kennismaking <span class="mg-arrow">&rarr;</span></a>'
    )
    return (
        '<nav data-screen-label="Navigatie" class="mg-nav" style="position:sticky;top:0;z-index:40;'
        'background:rgba(246,244,238,0.85);backdrop-filter:blur(10px);border-bottom:1px solid #E1DCCF">\n'
        '    <div class="mg-nav-balk" style="max-width:1240px;margin:0 auto;padding:16px 32px;'
        'display:flex;align-items:center;justify-content:space-between;gap:24px">\n'
        '      <a href="index.html" style="display:flex;align-items:center;gap:10px;color:#0E1112">\n'
        '        <img src="marketgrow-logo.png" alt="MarketGrow.ai logo" width="30" height="30" '
        'style="width:30px;height:30px;display:block;border-radius:6px">\n'
        '        <span style="display:flex;align-items:baseline;gap:1px">\n'
        '          <span style="font-family:\'Instrument Serif\',Georgia,serif;font-size:22px">MarketGrow</span>\n'
        '          <span style="font-family:\'Instrument Serif\',Georgia,serif;font-size:22px;color:#3F4A2E">.ai</span>\n'
        '        </span>\n'
        '      </a>\n'
        '      <button type="button" class="mg-nav-knop" aria-label="Menu" aria-expanded="false" '
        'aria-controls="mg-menu">\n'
        '        <span class="mg-nav-streep"></span>\n'
        '        <span class="mg-nav-streep"></span>\n'
        '        <span class="mg-nav-streep"></span>\n'
        '      </button>\n'
        '      <div id="mg-menu" class="mg-nav-menu" style="display:flex;align-items:center;gap:30px;font-size:13.5px">\n'
        + items + "\n"
        '          ' + cta + "\n"
        '      </div>\n'
        '    </div>\n'
        '  </nav>'
    )


def build_css():
    lines = []
    a = lines.append
    a("/* styles.css \u00b7 responsieve laag over de inline opmaak heen.")
    a("   Gegenereerd door tools/statisch_maken.py \u00b7 niet met de hand bijwerken. */")
    a("")
    a("html, body { max-width: 100%; }")
    a("img, svg, video { max-width: 100%; height: auto; }")
    a("")
    a("/* Uitklapknop van de navigatie. Op de desktop onzichtbaar. */")
    a(".mg-nav-knop { display: none; background: none; border: 1px solid #E1DCCF;")
    a("  width: 42px; height: 42px; padding: 0; cursor: pointer;")
    a("  flex-direction: column; align-items: center; justify-content: center; gap: 4px; }")
    a(".mg-nav-streep { display: block; width: 18px; height: 1.5px; background: #0E1112;")
    a("  transition: transform 0.2s ease, opacity 0.2s ease; }")
    a("")
    a("/* Hover-effecten die eerder door de ontwerp-runtime werden gezet. */")
    for decl, cls in REG.hovers.items():
        a(".%s:hover { %s }" % (cls, decl if decl.endswith(";") else decl + ";"))
    a(".mg-hv-nav:hover { background:#324023; color:#F6F4EE; }")
    a("")
    a("/* Tablet */")
    a("@media (max-width: 1024px) {")
    a("  .mg-wrap { padding-left: 24px !important; padding-right: 24px !important; }")
    a("  .mg-grid--cards { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }")
    for size in sorted(REG.fonts, reverse=True):
        if size >= 40:
            a("  .mg-fs-%d { font-size: %dpx !important; }" % (size, font_tablet(size)))
    a("}")
    a("")
    a("/* Telefoon */")
    a("@media (max-width: 760px) {")
    a("  body { overflow-x: hidden; }")
    a("  .mg-nav-knop { display: inline-flex; }")
    a("  .mg-wrap { padding-left: 20px !important; padding-right: 20px !important; }")
    a("  .mg-grid--pair, .mg-grid--cards { grid-template-columns: minmax(0, 1fr) !important; }")
    a("  .mg-grid--foot { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }")
    a("  .mg-h-auto { height: auto !important; min-height: 420px; }")
    a("  .mg-deco { max-width: 100vw !important; }")
    a("  input, textarea, select { font-size: 16px !important; }")
    a("  .mg-nav .mg-nav-balk { padding-top: 12px !important; padding-bottom: 12px !important; }")
    a("  .mg-nav .mg-nav-menu { position: absolute; top: 100%; left: 0; right: 0;")
    a("    background: #F6F4EE; border-bottom: 1px solid #E1DCCF;")
    a("    flex-direction: column; align-items: stretch !important;")
    a("    gap: 0 !important; padding: 4px 20px 20px; display: none !important; }")
    a("  .mg-nav[data-open=\"true\"] .mg-nav-menu { display: flex !important; }")
    a("  .mg-nav .mg-nav-link { padding: 15px 0; border-bottom: 1px solid #E1DCCF; font-size: 16px; }")
    a("  .mg-nav .mg-nav-link--actief { color: #0E1112 !important; }")
    a("  .mg-nav .mg-nav-cta { justify-content: center; margin-top: 18px;")
    a("    padding: 15px 18px !important; font-size: 15px !important; }")
    a("  .mg-nav[data-open=\"true\"] .mg-nav-streep:nth-child(1) { transform: translateY(5.5px) rotate(45deg); }")
    a("  .mg-nav[data-open=\"true\"] .mg-nav-streep:nth-child(2) { opacity: 0; }")
    a("  .mg-nav[data-open=\"true\"] .mg-nav-streep:nth-child(3) { transform: translateY(-5.5px) rotate(-45deg); }")
    for size in sorted(REG.fonts, reverse=True):
        a("  .mg-fs-%d { font-size: %dpx !important; }" % (size, font_mobile(size)))
    for value, cls in REG.pads.items():
        a("  .%s { padding: %s !important; }" % (cls, pad_mobile(value)))
    for value, cls in REG.gaps.items():
        a("  .%s { gap: %s !important; }" % (cls, gap_mobile(value)))
    a("}")
    a("")
    a("@media (max-width: 460px) {")
    a("  .mg-grid--foot { grid-template-columns: minmax(0, 1fr) !important; }")
    a("}")
    a("")
    return "\n".join(lines) + "\n"


def main():
    report = []
    for name in RUNTIME_PAGES:
        path = ROOT / name
        html = path.read_text(encoding="utf-8")
        html = strip_runtime(html)
        html = NAV_RE.sub(lambda m: nav_markup(name), html, count=1)
        html = transform_tags(html)
        path.write_text(html, encoding="utf-8")
        report.append((name, len(html)))

    (ROOT / "styles.css").write_text(build_css(), encoding="utf-8")

    # Huisstijl: geen em- of en-streepjes. Bereiken krijgen een gewoon
    # koppelteken, verder is de middot het scheidingsteken.
    opgeruimd = 0
    for pad in sorted(ROOT.glob("*.html")) + sorted((ROOT / "api").glob("*.js")):
        tekst = pad.read_text(encoding="utf-8")
        nieuw = re.sub(r"(?<=\d)\u2013(?=\d)", "-", tekst)
        nieuw = nieuw.replace("\u2014", "\u00b7").replace("\u2013", "\u00b7")
        if nieuw != tekst:
            pad.write_text(nieuw, encoding="utf-8")
            opgeruimd += 1
    print("Huisstijl: streepjes opgeruimd in %d bestanden" % opgeruimd)

    print("Omgezet:")
    for name, size in report:
        print("  %-34s %6d tekens" % (name, size))
    print("Klassen: %d lettergroottes, %d paddings, %d gaps, %d hovers"
          % (len(REG.fonts), len(REG.pads), len(REG.gaps), len(REG.hovers)))


if __name__ == "__main__":
    main()
