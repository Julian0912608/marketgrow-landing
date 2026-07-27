#!/usr/bin/env python3
"""
Haalt de Tailwind-CDN van voorwaarden.html en koppelt in plaats daarvan het
handgeschreven voorwaarden.css. De klassenamen in de HTML blijven ongewijzigd.
"""

import sys
from pathlib import Path

DOEL = Path("voorwaarden.html")

OUD = """  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { theme: { extend: { colors: {
      paper: '#FBF9F4', paper2: '#F2EEE3', ink: '#1A1B1A', mute: '#6F6E68',
      soft: '#A09E94', line: '#E6E1D2', lime: '#C8FF4D', olive: '#3F4A2E',
    } } } };
  </script>"""

NIEUW = """  <link rel="stylesheet" href="voorwaarden.css">"""


def main():
    if not DOEL.exists():
        sys.exit("FOUT: draai dit vanuit de hoofdmap van marketgrow-landing.")
    s = DOEL.read_text(encoding="utf-8")
    if "voorwaarden.css" in s:
        print("  voorwaarden.html was al omgezet")
        return
    if s.count(OUD) != 1:
        sys.exit("FOUT: het Tailwind-blok staat er niet zoals verwacht. Niets gewijzigd.")
    DOEL.write_text(s.replace(OUD, NIEUW, 1), encoding="utf-8")
    print("  voorwaarden.html: Tailwind-CDN vervangen door voorwaarden.css")


if __name__ == "__main__":
    main()
