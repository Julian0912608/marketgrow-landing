// Een echte browser aansturen, zonder iets te installeren.
//
// Chrome staat al op de Mac. Hij kan zichzelf openstellen op een debugpoort, en Node 22+ heeft
// een ingebouwde WebSocket. Meer is er niet nodig om een pagina te meten: geen playwright, geen
// puppeteer, geen download.
import { spawn } from "node:child_process";
import { setTimeout as wacht } from "node:timers/promises";

const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const POORT = Number(process.env.CDP_POORT || 9333);

export async function startChrome(profielMap) {
  const p = spawn(CHROME, [
    "--headless=new",
    `--remote-debugging-port=${POORT}`,
    `--user-data-dir=${profielMap}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--window-size=1280,1600",
    "about:blank",
  ], { stdio: ["ignore", "pipe", "pipe"], detached: false });

  // De uitvoer van Chrome NIET weggooien. Start hij niet, dan is dit het enige dat vertelt
  // waarom; zonder deze regels blijft er alleen "hij kwam niet op de poort" over.
  const gemompel = [];
  p.stdout.on("data", (d) => gemompel.push(String(d)));
  p.stderr.on("data", (d) => gemompel.push(String(d)));
  p.on("exit", (code) => gemompel.push(`chrome stopte met code ${code}`));

  // Wachten tot hij luistert. Niet op goed geluk een paar seconden slapen: dan is de meting
  // wisselvallig en ga je een fout zoeken die er niet is.
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${POORT}/json/version`);
      if (r.ok) return p;
    } catch {}
    await wacht(250);
  }
  throw new Error(
    "Chrome kwam niet op de debugpoort. Wat hij zei:\n" +
      gemompel.join("").split("\n").filter((r) => r && !r.includes("CVDisplayLink")).slice(0, 8).join("\n")
  );
}

export async function nieuwTabblad() {
  const r = await fetch(`http://127.0.0.1:${POORT}/json/new?about:blank`, { method: "PUT" });
  const doel = await r.json();
  return doel.webSocketDebuggerUrl;
}

// Een heel dun laagje over het protocol: stuur een opdracht, wacht op het antwoord met
// hetzelfde nummer. Meldingen zonder nummer gaan naar de luisteraars.
export function verbind(url) {
  const ws = new WebSocket(url);
  let nr = 0;
  const wachtend = new Map();
  const luisteraars = [];
  const klaar = new Promise((res, rej) => { ws.onopen = () => res(); ws.onerror = (e) => rej(e); });
  ws.onmessage = (m) => {
    const b = JSON.parse(m.data);
    if (b.id && wachtend.has(b.id)) {
      const { res, rej } = wachtend.get(b.id);
      wachtend.delete(b.id);
      b.error ? rej(new Error(b.error.message)) : res(b.result);
    } else if (b.method) {
      for (const l of luisteraars) l(b);
    }
  };
  return {
    klaar,
    stuur(method, params = {}) {
      const id = ++nr;
      return new Promise((res, rej) => {
        wachtend.set(id, { res, rej });
        ws.send(JSON.stringify({ id, method, params }));
        setTimeout(() => { if (wachtend.has(id)) { wachtend.delete(id); rej(new Error("time-out op " + method)); } }, 30000);
      });
    },
    luister(fn) { luisteraars.push(fn); },
    // Een open WebSocket houdt Node in leven. Wie vergeet te sluiten ziet een script dat klaar
    // is en toch nooit stopt.
    sluit() { try { ws.close(); } catch {} },
  };
}

// Javascript in de pagina draaien en het antwoord terugkrijgen.
export async function draai(c, uitdrukking) {
  const r = await c.stuur("Runtime.evaluate", { expression: uitdrukking, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " " + (r.exceptionDetails.exception?.description ?? ""));
  return r.result.value;
}
