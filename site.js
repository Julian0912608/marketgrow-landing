// site.js · MarketGrow.ai
//
// Al het gedrag van de site in een bestand. Geen framework, geen bouwstap, geen scripts
// van een CDN: de pagina's zijn platte HTML en dit hangt zich vast aan de data-attributen
// die daarin staan.
//
// Elk onderdeel begint met te kijken of zijn haken op deze pagina bestaan en doet anders
// niets. Zo kan dit bestand op elke pagina staan zonder dat er iets misgaat.

(function () {
  "use strict";

  var RUSTIG = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, wortel) { return (wortel || document).querySelector(sel); };
  var $$ = function (sel, wortel) { return Array.prototype.slice.call((wortel || document).querySelectorAll(sel)); };

  var euro = function (bedrag) {
    return "\u20AC" + bedrag.toLocaleString("nl-NL");
  };

  // Eenmalig uitvoeren zodra een element in beeld komt. Valt terug op meteen uitvoeren als
  // de browser geen IntersectionObserver heeft, want later is beter dan nooit.
  function bijInBeeld(el, fn, marge) {
    if (!el) return;
    if (!("IntersectionObserver" in window)) { fn(); return; }
    var waarnemer = new IntersectionObserver(function (regels) {
      regels.forEach(function (regel) {
        if (!regel.isIntersecting) return;
        waarnemer.disconnect();
        fn();
      });
    }, { rootMargin: marge || "0px 0px -12% 0px" });
    waarnemer.observe(el);
  }

  // 1 · Balk: schaduw bij scrollen, en het menu onder 720px.
  function balk() {
    var balkEl = $("header.balk") || $("header");
    var knop = $("[data-menu-knop]");
    var menu = $("[data-menu]");

    if (balkEl) {
      var diep = function () {
        if (window.scrollY > 10) balkEl.setAttribute("data-diep", "");
        else balkEl.removeAttribute("data-diep");
      };
      diep();
      window.addEventListener("scroll", diep, { passive: true });
    }

    if (!knop || !menu) return;

    var open = false;
    var breed = function () { return window.innerWidth > 720; };

    var zet = function (nieuw) {
      open = nieuw;
      knop.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) menu.removeAttribute("hidden");
      else menu.setAttribute("hidden", "");
    };

    // Boven 720px is de knop met CSS verborgen en hoort de nav altijd zichtbaar te zijn.
    // Zonder deze regel blijft het menu weg zodra iemand zijn venster breder maakt terwijl
    // het dicht stond, en dan is de hele navigatie onbereikbaar.
    var herzie = function () {
      if (breed()) { menu.removeAttribute("hidden"); knop.setAttribute("aria-expanded", "false"); open = false; }
      else if (!open) menu.setAttribute("hidden", "");
    };

    herzie();
    knop.addEventListener("click", function () { zet(!open); });
    window.addEventListener("resize", herzie);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && open && !breed()) zet(false); });
    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () { if (!breed()) zet(false); });
    });
  }

  // 2 · Secties die opkomen.
  function opkomen() {
    var secties = $$(".komt-op");
    if (secties.length === 0) return;

    // Bij prefers-reduced-motion alles meteen tonen: de klasse blijft staan maar krijgt
    // het kenmerk dat hem zichtbaar maakt.
    if (RUSTIG || !("IntersectionObserver" in window)) {
      secties.forEach(function (s) { s.setAttribute("data-in", ""); });
      return;
    }

    var waarnemer = new IntersectionObserver(function (regels) {
      regels.forEach(function (regel) {
        if (!regel.isIntersecting) return;
        regel.target.setAttribute("data-in", "");
        waarnemer.unobserve(regel.target);
      });
    }, { rootMargin: "0px 0px -12% 0px" });

    secties.forEach(function (s) {
      // Wie halverwege binnenkomt of snel naar beneden scrolt, moet alles direct zien.
      // Zonder deze controle blijven secties die al voorbij zijn onzichtbaar.
      if (s.getBoundingClientRect().top < window.innerHeight * 0.88) s.setAttribute("data-in", "");
      else waarnemer.observe(s);
    });
  }

  // 3 · Chatpaneel.
  var CHAT_EINDPUNT = "https://app.marketgrow.ai/api/widget/chat";
  var CHAT_TENANT = "demo";

  function chat() {
    var paneel = $("[data-chat]");
    if (!paneel) return;

    var lijst = $("[data-chat-lijst]", paneel);
    var form = $("[data-chat-form]", paneel);
    var invoer = form ? $("input", form) : null;
    var melding = $("[data-chat-melding]", paneel);
    if (!lijst || !form || !invoer) return;

    var geschiedenis = [];
    var bezig = false;

    var WELKOM =
      "Hoi, ik ben Noor. Vertel in je eigen woorden wat je doet en waar je klanten meestal " +
      "mee komen, dan laat ik zien wat er op jouw site zou gebeuren.";

    function bubbel(rol, tekst) {
      var rij = document.createElement("div");
      rij.style.display = "flex";
      rij.style.gap = "10px";
      rij.style.alignItems = "flex-start";
      rij.style.justifyContent = rol === "bezoeker" ? "flex-end" : "flex-start";

      if (rol === "bot") {
        var initiaal = document.createElement("div");
        initiaal.textContent = "N";
        initiaal.setAttribute("aria-hidden", "true");
        initiaal.style.cssText =
          "width:28px;height:28px;flex:0 0 28px;background:var(--olijf);color:var(--cream);" +
          "display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:14px";
        rij.appendChild(initiaal);
      }

      var blok = document.createElement("div");
      blok.textContent = tekst;
      blok.style.cssText =
        "max-width:76%;padding:12px 15px;font-size:15px;line-height:1.55;" +
        (rol === "bezoeker"
          ? "background:var(--olijf);color:var(--cream)"
          : "background:var(--zand);color:var(--inkt);border:1px solid var(--lijn)");
      rij.appendChild(blok);
      lijst.appendChild(rij);
      lijst.scrollTop = lijst.scrollHeight;
      return blok;
    }

    function puntjes() {
      var rij = bubbel("bot", "");
      rij.textContent = "";
      rij.setAttribute("data-puntjes", "");
      rij.innerHTML = '<span class="punt"></span><span class="punt"></span><span class="punt"></span>';
      return rij.parentNode;
    }

    // De begroeting typt zichzelf, maar pas als het paneel in beeld komt. Wie er in een
    // keer voorbij scrolt krijgt hem gewoon in een keer, en dat geldt ook bij
    // prefers-reduced-motion.
    var begroetingGedaan = false;
    function begroet() {
      if (begroetingGedaan) return;
      begroetingGedaan = true;
      geschiedenis.push({ role: "assistant", content: WELKOM });
      if (RUSTIG) { bubbel("bot", WELKOM); return; }
      var blok = bubbel("bot", "");
      blok.setAttribute("data-typt", "");
      var i = 0;
      var tik = function () {
        i += 1;
        blok.textContent = WELKOM.slice(0, i);
        lijst.scrollTop = lijst.scrollHeight;
        if (i < WELKOM.length) window.setTimeout(tik, 22);
        else blok.removeAttribute("data-typt");
      };
      tik();
    }
    bijInBeeld(paneel, begroet);

    // Vaste antwoorden voor als het eindpunt niet antwoordt. Nooit een lege bubbel en
    // nooit een technische foutmelding: die zeggen de bezoeker niets en ze maken een
    // demo die juist vertrouwen moet wekken kapot.
    function terugval(vraag) {
      var v = (vraag || "").toLowerCase();
      if (/kost|prijs|tarief|euro|bedrag/.test(v)) {
        return "Je begint met de AI-Gespreksgids voor \u20AC75 per maand, inclusief de app en zonder opstartkosten. Kies je meteen een jaar, dan betaal je tien maanden.";
      }
      if (/snel|live|wanneer|hoelang|duur/.test(v)) {
        return "Zelf starten kan meteen: aanmelden, aanleveren, en een half uur later staat het live. Liever samen, dan zijn we binnen zeven werkdagen klaar.";
      }
      if (/site|website|wordpress|installeer|technisch/.test(v)) {
        return "Je site blijft zoals hij is. Er komt een regel code bij, of je installeert de WordPress-plugin, en daarna staat je AI-collega erop.";
      }
      return "Daar denk ik graag met je over mee. Plan een demo van 30 minuten, dan zetten we je eigen site ernaast en laat ik zien wat er met jouw vragen gebeurt.";
    }

    function zegVast(tekst, vraag) {
      bubbel("bot", tekst);
      if (!melding) return;
      melding.textContent = "Dit is een vast antwoord: de verbinding met Noor lukte even niet.";
      melding.style.display = "block";
      void vraag;
    }

    function stuur(vraag) {
      if (bezig || !vraag) return;
      bezig = true;
      if (melding) melding.style.display = "none";
      bubbel("bezoeker", vraag);
      geschiedenis.push({ role: "user", content: vraag });
      var wacht = puntjes();

      var klaar = function () {
        if (wacht && wacht.parentNode) wacht.parentNode.removeChild(wacht);
        bezig = false;
      };

      window
        .fetch(CHAT_EINDPUNT, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ tenant: CHAT_TENANT, persona: "noor", messages: geschiedenis }),
        })
        .then(function (r) {
          if (!r.ok) throw new Error("status " + r.status);
          return r.json();
        })
        .then(function (d) {
          klaar();
          var tekst = (d && (d.antwoord || d.reply || d.message)) || "";
          if (!tekst) { zegVast(terugval(vraag), vraag); return; }
          bubbel("bot", tekst);
          geschiedenis.push({ role: "assistant", content: tekst });
          if (d && d.intakeReady) intakeBlok();
        })
        .catch(function () {
          klaar();
          zegVast(terugval(vraag), vraag);
        });
    }

    function intakeBlok() {
      if ($("[data-chat-intake]", lijst)) return;
      var blok = document.createElement("div");
      blok.setAttribute("data-chat-intake", "");
      blok.style.cssText =
        "border:1px solid var(--olijf);background:var(--zand);padding:16px;display:flex;" +
        "flex-direction:column;gap:10px;margin-top:4px";
      blok.innerHTML =
        '<span style="font-size:14px;line-height:1.5">Zo te horen kan Noor je verder helpen in een gesprek.</span>' +
        '<a class="knop" style="background:var(--olijf);color:var(--cream);justify-content:center;padding:12px 18px;font-size:15px" ' +
        'data-cal-namespace="kennismaking" data-cal-link="julian-goote-c4pgqu/intake-marketgrow.ai" role="button" tabindex="0">Plan een demo \u00b7 30 min</a>';
      lijst.appendChild(blok);
      lijst.scrollTop = lijst.scrollHeight;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var vraag = invoer.value.trim();
      if (!vraag) return;
      invoer.value = "";
      begroet();
      stuur(vraag);
    });

    $$(".chip", paneel).forEach(function (chip) {
      chip.addEventListener("click", function () {
        begroet();
        stuur(chip.textContent.trim());
      });
    });
  }

  // 4 · Prijzenconfigurator en de schakelaar maand of jaar.
  function prijzen() {
    var blokken = $$("[data-blok]");
    if (blokken.length === 0) return;

    var termijnKnoppen = $$("[data-termijn]");
    var samenvatting = $("[data-samenvatting]");
    var totaalEl = $("[data-totaal]");
    var totaalBij = $("[data-totaal-bij]");
    var totaalBesparing = $("[data-totaal-besparing]");
    var nudgeKop = $("[data-nudge-kop]");

    var termijn = "jaar";
    var aan = {};
    blokken.forEach(function (b) {
      aan[b.getAttribute("data-blok")] = b.getAttribute("aria-pressed") === "true";
    });

    var maandVan = function (b) { return parseInt(b.getAttribute("data-maand"), 10) || 0; };
    var jaarVan = function (b) { return parseInt(b.getAttribute("data-jaar"), 10) || 0; };
    // De naam van het blok staat als eerste regel in de kaart. Er is geen eigen
    // data-attribuut voor, dus we lezen de eerste span met het serif-lettertype. Lukt dat
    // niet, dan valt hij terug op een nette naam uit een lijstje: nooit de sleutel zelf,
    // want "gespreksgids" in kleine letters in het overzicht leest als een fout.
    var NETTE_NAAM = {
      gespreksgids: "AI-Gespreksgids",
      content: "Content-Engine",
      document: "Document-Automatie",
    };
    var naamVan = function (b) {
      var kop = $$("span", b).filter(function (s) {
        return (s.getAttribute("style") || "").indexOf("var(--serif)") !== -1;
      })[0];
      var uit = kop ? kop.textContent.trim() : "";
      return uit || NETTE_NAAM[b.getAttribute("data-blok")] || b.getAttribute("data-blok");
    };

    function tekenKaart(b) {
      var actief = aan[b.getAttribute("data-blok")];
      b.setAttribute("aria-pressed", actief ? "true" : "false");
      b.style.borderColor = actief ? "var(--olijf)" : "var(--lijn)";
      b.style.background = actief ? "#fff" : "var(--cream)";

      var prijs = $("[data-prijs]", b);
      var bij = $("[data-prijs-bij]", b);
      var besp = $("[data-prijs-besparing]", b);
      var maand = maandVan(b);
      var jaar = jaarVan(b);

      if (prijs) {
        prijs.textContent = termijn === "jaar"
          ? euro(Math.round(jaar / 12)) + " per maand"
          : euro(maand) + " per maand";
      }
      if (bij) {
        bij.textContent = termijn === "jaar"
          ? "jaarlijks \u00b7 " + euro(jaar) + " per jaar"
          : "maandelijks opzegbaar";
      }
      if (besp) {
        var scheelt = maand * 12 - jaar;
        besp.textContent = termijn === "jaar" && scheelt > 0 ? "Je bespaart " + euro(scheelt) + " per jaar" : "";
        besp.style.display = termijn === "jaar" && scheelt > 0 ? "" : "none";
      }
    }

    function teken() {
      blokken.forEach(tekenKaart);

      termijnKnoppen.forEach(function (k) {
        var actief = k.getAttribute("data-termijn") === termijn;
        if (actief) k.setAttribute("aria-current", "true");
        else k.removeAttribute("aria-current");
        k.style.background = actief ? "var(--olijf)" : "transparent";
        k.style.color = actief ? "var(--cream)" : "var(--grijs)";
      });

      var gekozen = blokken.filter(function (b) { return aan[b.getAttribute("data-blok")]; });
      var maandTotaal = gekozen.reduce(function (a, b) { return a + maandVan(b); }, 0);
      var jaarTotaal = gekozen.reduce(function (a, b) { return a + jaarVan(b); }, 0);
      var scheelt = maandTotaal * 12 - jaarTotaal;

      if (samenvatting) {
        samenvatting.innerHTML = "";
        if (gekozen.length === 0) {
          var leeg = document.createElement("p");
          leeg.className = "bij";
          leeg.style.color = "rgba(246,244,238,.75)";
          leeg.textContent = "Zet minstens \u00e9\u00e9n bouwblok aan om je bedragen te zien.";
          samenvatting.appendChild(leeg);
        } else {
          gekozen.forEach(function (b) {
            var rij = document.createElement("div");
            rij.style.cssText = "display:flex;justify-content:space-between;gap:12px;font-size:14px";
            var naam = document.createElement("span");
            naam.textContent = naamVan(b);
            var bedrag = document.createElement("span");
            bedrag.style.color = "rgba(246,244,238,.75)";
            bedrag.textContent = termijn === "jaar" ? euro(jaarVan(b)) + " /jr" : euro(maandVan(b)) + " /mnd";
            rij.appendChild(naam);
            rij.appendChild(bedrag);
            samenvatting.appendChild(rij);
          });
        }
      }

      // Geen bedrag van nul tonen: dat leest als gratis in plaats van als niets gekozen.
      if (totaalEl) {
        totaalEl.textContent = gekozen.length === 0
          ? "\u2014"
          : termijn === "jaar"
            ? euro(Math.round(jaarTotaal / 12))
            : euro(maandTotaal);
        if (gekozen.length === 0) totaalEl.textContent = "";
      }
      if (totaalBij) {
        totaalBij.textContent = gekozen.length === 0
          ? ""
          : termijn === "jaar"
            ? "Jaarlijks gefactureerd \u00b7 " + euro(jaarTotaal) + " per jaar"
            : "Maandelijks gefactureerd \u00b7 opzegbaar per maand";
      }
      if (totaalBesparing) {
        var toon = gekozen.length > 0 && termijn === "jaar" && scheelt > 0;
        totaalBesparing.textContent = toon ? "Je bespaart " + euro(scheelt) + " per jaar" : "";
        totaalBesparing.style.display = toon ? "" : "none";
      }
      if (nudgeKop) {
        nudgeKop.textContent = scheelt > 0
          ? "Op deze opzet scheelt een jaar " + euro(scheelt) + "."
          : "Bij een jaar vooruit betaal je tien maanden.";
      }
    }

    blokken.forEach(function (b) {
      b.addEventListener("click", function () {
        var sleutel = b.getAttribute("data-blok");
        aan[sleutel] = !aan[sleutel];
        teken();
      });
    });

    termijnKnoppen.forEach(function (k) {
      k.addEventListener("click", function () {
        termijn = k.getAttribute("data-termijn") === "maand" ? "maand" : "jaar";
        teken();
      });
    });

    teken();
  }

  // 5 · App-carrousel.
  function carrousel() {
    var beelden = $$("[data-slide]");
    if (beelden.length === 0) return;

    var knoppen = $$("[data-slide-knop]");
    var stippen = $$("[data-slide-stip]");
    var vorige = $("[data-slide-vorige]");
    var volgende = $("[data-slide-volgende]");
    var nu = 0;
    var klok = null;

    function toon(i) {
      // Meteen zetten en niet na een overgang: kliks die tijdens een uitgestelde wissel
      // binnenkomen gingen anders verloren.
      nu = (i + beelden.length) % beelden.length;
      beelden.forEach(function (b, n) {
        if (n === nu) { b.removeAttribute("hidden"); if (!RUSTIG) { b.style.animation = "none"; void b.offsetWidth; b.style.animation = ""; } }
        else b.setAttribute("hidden", "");
      });
      knoppen.forEach(function (k, n) {
        if (n === nu) k.setAttribute("aria-current", "true");
        else k.removeAttribute("aria-current");
      });
      stippen.forEach(function (s, n) {
        s.style.width = n === nu ? "26px" : "7px";
        s.style.background = n === nu ? "var(--lime)" : "rgba(246,244,238,.35)";
      });
    }

    function stop() {
      if (klok) { window.clearInterval(klok); klok = null; }
    }

    function handmatig(i) {
      stop();
      toon(i);
    }

    knoppen.forEach(function (k, n) { k.addEventListener("click", function () { handmatig(n); }); });
    stippen.forEach(function (s, n) { s.addEventListener("click", function () { handmatig(n); }); });
    if (vorige) vorige.addEventListener("click", function () { handmatig(nu - 1); });
    if (volgende) volgende.addEventListener("click", function () { handmatig(nu + 1); });

    toon(0);
    if (!RUSTIG) {
      bijInBeeld(beelden[0].parentNode, function () {
        klok = window.setInterval(function () { toon(nu + 1); }, 5200);
      });
    }
  }

  // 6 · Gesprekkenteller.
  var TELLER_EINDPUNT = "https://app.marketgrow.ai/api/public/gesprekken";

  function teller() {
    var blok = $("[data-teller]");
    if (!blok) return;
    var getal = $("[data-teller-getal]", blok);
    if (!getal) return;

    window
      .fetch(TELLER_EINDPUNT, { headers: { accept: "application/json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        var doel = d && typeof d.gesprekken === "number" ? d.gesprekken : 0;
        // Streng: geen getal betekent geen blok. Geen nul, geen terugvalgetal.
        if (!(doel > 0)) return;
        blok.removeAttribute("hidden");
        if (RUSTIG) { getal.textContent = doel.toLocaleString("nl-NL"); return; }
        bijInBeeld(blok, function () {
          var duur = 1600;
          var start = 0;
          var stap = function (nu) {
            if (!start) start = nu;
            var p = Math.min(1, (nu - start) / duur);
            var soepel = 1 - Math.pow(1 - p, 3);
            getal.textContent = Math.round(doel * soepel).toLocaleString("nl-NL");
            if (p < 1) window.requestAnimationFrame(stap);
          };
          window.requestAnimationFrame(stap);
        });
      })
      .catch(function () { /* stil: het blok blijft weg */ });
  }

  // 7 · Uitklapbare vragen: er mag er een open staan tegelijk.
  function vragen() {
    var alles = $$("details");
    if (alles.length < 2) return;
    alles.forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (!d.open) return;
        // Alleen de vragen in hetzelfde blok sluiten. Zo blijft dit werken als er ergens
        // anders op de pagina ook een uitklapper staat.
        alles.forEach(function (a) {
          if (a !== d && a.parentNode === d.parentNode) a.open = false;
        });
      });
    });
  }

  function start() {
    balk();
    opkomen();
    chat();
    prijzen();
    carrousel();
    teller();
    vragen();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
