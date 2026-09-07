#!/usr/bin/env node
// De site op alle gangbare telefoon- en tabletbreedtes doormeten, voordat hij naar main gaat.
//
//   node tools/telefoon-meten.mjs                      alle pagina's, alle breedtes, lokaal
//   node tools/telefoon-meten.mjs index.html,prijzen.html 320,390
//   BASIS=https://www.marketgrow.ai node tools/telefoon-meten.mjs      dezelfde meting op de live site
//
// WAAROM DIT BESTAAT. Op 2 september 2026 zag de site er op een breed scherm goed uit en op een
// telefoon van 320px niet: de bovenbalk brak in twee regels, de vergelijkingstabel verborg zijn
// derde kolom achter een zijwaartse scroll, en de sectorpagina's liepen 4px over. Geen van die
// fouten zie je op je eigen scherm, en er is geen CI in deze repo. Dit script meet wat het oog
// niet ziet, per pagina en per breedte:
//
//   OVERLOOP     de pagina is breder dan het scherm (zijwaarts schuiven op een telefoon)
//   BUITEN       een element steekt buiten het scherm, ook binnen een scrollvak: dat was de
//                tabel met min-width 560px, waarvan je op een telefoon de derde kolom nooit zag
//   BALK-SCHEEF  de bovenbalk staat niet op een regel (merk, knop en menu niet op een hoogte)
//   PLAT         tekst die breder is dan zijn vak (een woord dat niet past)
//
// Het script stopt met een fout als er iets mis is, EN als het te weinig heeft gemeten: een
// meting die nul pagina's vindt is geen groene meting maar een kapotte.
//
// DE BREEDTE WORDT VERGELEKEN MET DE GEVRAAGDE BREEDTE, NIET MET window.innerWidth. Bij de
// eerste sabotageproef liep een sectorpagina 4px over en zei het script "schoon": in de
// telefoonstand rekt Chrome de layout-viewport op tot de inhoud past, dus innerWidth was zelf
// al 324. Een meting die de lat verschuift met wat hij meet, vindt nooit iets.
import { createServer } from "node:http";
import { readFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { setTimeout as wacht } from "node:timers/promises";
import { startChrome, nieuwTabblad, verbind, draai } from "./browser.mjs";

const WORTEL = new URL("..", import.meta.url).pathname;
const PAGINAS = process.argv[2] ? process.argv[2].split(",") : [
  "index.html", "nachtscan.html", "platform.html", "bewijs.html", "sectoren.html", "sectoren/juristen.html",
  "sectoren/accountants.html", "prijzen.html", "veiligheid.html", "kennis.html",
  "kennis/ai-act-artikel-50.html", "contact.html", "privacy.html", "voorwaarden.html",
];
// 320 is de iPhone SE en elke telefoon met vergrote weergave; dat is de maat waarop het misgaat.
const BREEDTES = process.argv[3] ? process.argv[3].split(",").map(Number) : [320, 360, 375, 390, 412, 430, 600, 768, 820, 1024, 1180, 1280];

// EEN EIGEN SERVERTJE, zodat het een commando is. Met python -m http.server erbij vergeet je
// hem te stoppen, of hij staat op een andere poort dan het script verwacht.
const SOORTEN = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".xml": "text/xml", ".txt": "text/plain" };
function serveer() {
  return new Promise((res) => {
    const s = createServer(async (req, antwoord) => {
      const pad = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[\/\\])+/, "");
      const bestand = join(WORTEL, pad === "/" ? "index.html" : pad);
      try {
        const inhoud = await readFile(bestand);
        antwoord.writeHead(200, { "content-type": SOORTEN[extname(bestand)] || "application/octet-stream" });
        antwoord.end(inhoud);
      } catch {
        antwoord.writeHead(404); antwoord.end("niet gevonden");
      }
    });
    s.listen(0, "127.0.0.1", () => res(s));
  });
}

const METING = (w) => `(() => {
  const w = ${w};
  const sw = document.documentElement.scrollWidth;
  const buiten = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    // Wat met opzet buiten beeld staat (een dichtgeklapt menu, iets met display none erboven)
    // telt niet mee; alleen wat een bezoeker hoort te zien en niet kan zien.
    if (!el.getClientRects().length) continue;
    if (r.right > w + 1 || r.left < -1) {
      const naam = el.tagName.toLowerCase() + (typeof el.className === "string" && el.className ? "." + el.className.trim().split(/\\s+/).join(".") : "");
      buiten.push(naam + " [" + Math.round(r.left) + ".." + Math.round(r.right) + "]");
    }
    if (buiten.length > 8) break;
  }
  const balk = document.querySelector(".balk__binnen");
  let balkinfo = null;
  if (balk) {
    const kinderen = [...balk.children].filter((k) => getComputedStyle(k).display !== "none" && k.getBoundingClientRect().height > 0);
    const middens = kinderen.map((k) => { const r = k.getBoundingClientRect(); return Math.round(r.top + r.height / 2); });
    balkinfo = { hoogte: Math.round(balk.getBoundingClientRect().height), uitgelijnd: Math.max(...middens) - Math.min(...middens) <= 2 };
  }
  const platgedrukt = [];
  for (const el of document.querySelectorAll("h1,h2,h3,p,a,button,li,span,td,th,label,dt,dd")) {
    if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow === "visible" && el.clientWidth > 0) {
      const naam = el.tagName.toLowerCase() + (typeof el.className === "string" && el.className ? "." + el.className.trim().split(/\\s+/)[0] : "");
      platgedrukt.push(naam + " " + el.scrollWidth + ">" + el.clientWidth + " \\"" + (el.textContent || "").trim().slice(0, 40) + "\\"");
      if (platgedrukt.length > 5) break;
    }
  }
  return { sw, overloop: sw > w, buiten, balkinfo, platgedrukt };
})()`;

const server = process.env.BASIS ? null : await serveer();
const BASIS = process.env.BASIS || `http://127.0.0.1:${server.address().port}`;
const PROFIEL = join(WORTEL, ".chrome-meting");
await rm(PROFIEL, { recursive: true, force: true }); await mkdir(PROFIEL, { recursive: true });

let metingen = 0;
let fouten = 0;
const proc = await startChrome(PROFIEL);
try {
  const c = verbind(await nieuwTabblad()); await c.klaar;
  await c.stuur("Page.enable"); await c.stuur("Runtime.enable");
  for (const pagina of PAGINAS) {
    if (!process.env.BASIS && !existsSync(join(WORTEL, pagina))) { console.log(`${pagina}: bestaat niet`); fouten++; continue; }
    for (const b of BREEDTES) {
      const mobiel = b < 1024;
      await c.stuur("Emulation.setDeviceMetricsOverride", { width: b, height: 800, deviceScaleFactor: 2, mobile: mobiel });
      const laden = new Promise((res) => c.luister((m) => { if (m.method === "Page.loadEventFired") res(); }));
      await c.stuur("Page.navigate", { url: `${BASIS}/${pagina}` });
      await Promise.race([laden, wacht(8000)]);
      await draai(c, "document.fonts.ready.then(() => true)");
      await wacht(200);
      const m = await draai(c, METING(b));
      metingen++;
      const vlag = (m.overloop ? "OVERLOOP " : "") + (m.buiten.length ? "BUITEN " : "") + (m.balkinfo && !m.balkinfo.uitgelijnd ? "BALK-SCHEEF " : "") + (m.platgedrukt.length ? "PLAT " : "");
      if (vlag) fouten++;
      console.log(`${pagina.padEnd(32)} ${String(b).padStart(4)}  breedte=${m.sw} balk=${m.balkinfo?.hoogte ?? "-"} ${vlag}`);
      if (m.buiten.length) console.log("    buiten beeld:", m.buiten.slice(0, 4).join(" | "));
      if (m.platgedrukt.length) console.log("    plat:", m.platgedrukt.slice(0, 3).join(" | "));
    }
  }
  c.sluit();
} finally {
  proc.kill();
  server?.close();
  await wacht(500);
  await rm(PROFIEL, { recursive: true, force: true });
}

// Een meting die niets heeft gemeten is geen groene meting.
const verwacht = PAGINAS.length * BREEDTES.length;
if (metingen < verwacht || metingen === 0) {
  console.error(`\nNIET alles gemeten: ${metingen} van ${verwacht}.`);
  process.exit(1);
}
if (fouten) {
  console.error(`\n${fouten} van ${metingen} metingen mis. Kijk hierboven bij OVERLOOP, BUITEN, BALK-SCHEEF of PLAT.`);
  process.exit(1);
}
console.log(`\n${metingen} metingen schoon.`);
process.exit(0);
