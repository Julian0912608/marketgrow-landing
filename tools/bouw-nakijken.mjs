// De bouw van elke pagina nakijken: openen en sluiten in evenwicht.
//
// WAAROM DIT ER IS. Op 7 september 2026 ging bij een herschrijving de </main> van platform.html
// mee met een blok dat eruit werd gehaald, en kreeg bewijs.html er juist twee. Twaalf breedtes
// meten zag daar niets van: een browser repareert zo'n fout stil, en de pagina ziet er goed uit
// tot je hem in een leesmodus of een crawler opent.
//
// Dit telt alleen wat te tellen valt. Geen volledige parser, want die zou zelf onderhouden
// moeten worden; dit vangt de fout die hier echt is gemaakt.
//
//   node tools/bouw-nakijken.mjs

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const WORTEL = new URL("..", import.meta.url).pathname;

function paginas(map = WORTEL, uit = []) {
  for (const naam of readdirSync(map)) {
    if (naam.startsWith(".") || naam === "node_modules" || naam === "tools" || naam === "beeld" || naam === "fonts") continue;
    const pad = join(map, naam);
    if (statSync(pad).isDirectory()) paginas(pad, uit);
    else if (naam.endsWith(".html")) uit.push(pad);
  }
  return uit;
}

const PAREN = [
  ["<main", "</main>", 1],
  ["<section", "</section>", null],
  ["<figure", "</figure>", null],
  ["<footer", "</footer>", 1],
  ["<header", "</header>", 1],
];

let fout = 0;
let gekeken = 0;
for (const pad of paginas()) {
  const bron = readFileSync(pad, "utf8");
  const kort = pad.replace(WORTEL, "");
  gekeken++;
  for (const [open, dicht, verwacht] of PAREN) {
    const o = (bron.match(new RegExp(open + "[\\s>]", "g")) || []).length;
    const d = (bron.match(new RegExp(dicht, "g")) || []).length;
    if (o !== d) {
      console.log(`${kort}: ${o}x ${open}> en ${d}x ${dicht}`);
      fout++;
    } else if (verwacht !== null && o !== verwacht) {
      console.log(`${kort}: ${o}x ${open}>, er hoort er ${verwacht} te staan`);
      fout++;
    }
  }
}

// ONDERGRENS. Vindt dit gereedschap geen pagina's, dan meldt het nul fouten en bewaakt het
// niets. Er zijn er meer dan twintig.
if (gekeken < 15) {
  console.log(`Er zijn maar ${gekeken} pagina\u0027s gevonden. Dat is te weinig; deze controle kijkt naar niets.`);
  process.exit(1);
}

console.log(fout === 0 ? `\n${gekeken} pagina\u0027s, bouw in evenwicht.` : `\n${fout} keer uit evenwicht.`);
process.exit(fout === 0 ? 0 : 1);
