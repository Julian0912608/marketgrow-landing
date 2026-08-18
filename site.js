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

  // Hele euro's zonder komma, halve met twee cijfers. Zo staat 62,50 er als 62,50 en
  // 750 als 750, wat precies is wat er in de opmaak staat.
  var euro = function (bedrag) {
    var heel = Math.abs(bedrag % 1) < 0.005;
    return "\u20AC" + bedrag.toLocaleString("nl-NL", {
      minimumFractionDigits: heel ? 0 : 2,
      maximumFractionDigits: heel ? 0 : 2,
    });
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

  // 1 · Balk: schaduw bij scrollen, en het menu onder 900px.
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
    var breed = function () { return window.innerWidth > 900; };

    var zet = function (nieuw) {
      open = nieuw;
      knop.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) menu.removeAttribute("hidden");
      else menu.setAttribute("hidden", "");
    };

    // Boven 900px is de knop met CSS verborgen en hoort de nav altijd zichtbaar te zijn.
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
  // Het echte eindpunt van het platform. In de ontwerpbeschrijving stond een andere
  // route, maar die bestaat niet: het platform luistert op /api/chat.
  var CHAT_EINDPUNT = "https://app.marketgrow.ai/api/chat";
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
    var gesprekId = null;
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
      // Krap houden: de stipjes horen in een klein bolletje te staan en niet in een
      // brede lege bak, anders lijkt er een leeg antwoord binnengekomen.
      rij.style.maxWidth = "none";
      rij.style.display = "inline-flex";
      rij.style.alignItems = "center";
      rij.style.padding = "13px 14px";
      rij.setAttribute("aria-label", "Noor is aan het typen");
      rij.setAttribute("role", "status");
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

      // De route wil het gesprek vanaf een bezoekersbericht zien; onze begroeting staat
      // vooraan en zou het gesprek met een assistentregel laten beginnen.
      var berichten = geschiedenis.slice();
      while (berichten.length && berichten[0].role !== "user") berichten.shift();
      if (!berichten.length) { klaar(); return; }

      window
        .fetch(CHAT_EINDPUNT, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            tenant: CHAT_TENANT,
            messages: berichten,
            // HET GESPREK-ID MOET MEE, en dat is meer dan netjes zijn. Zonder dit veld
            // begint het platform bij elk bericht een NIEUW gesprek: de AI-collega raakt
            // de draad kwijt en de gesprekkenteller op deze pagina telt elk los bericht
            // als een gesprek.
            conversationId: gesprekId,
            bron: "landing",
            bronDetail: String(document.title || "").slice(0, 160),
          }),
        })
        .then(function (r) {
          if (!r.ok) throw new Error("status " + r.status);
          return r.json();
        })
        .then(function (d) {
          klaar();
          var tekst = d && d.reply ? String(d.reply).trim() : "";
          if (!tekst) { zegVast(terugval(vraag), vraag); return; }
          if (d.conversationId) gesprekId = d.conversationId;
          bubbel("bot", tekst);
          geschiedenis.push({ role: "assistant", content: tekst });
          // Het platform beslist zelf wanneer een intake aan de orde is, en geeft de
          // boekingslink erbij als die er is.
          if (d.intake === true) intakeBlok(d.calLink);
        })
        .catch(function () {
          klaar();
          zegVast(terugval(vraag), vraag);
        });
    }

    function intakeBlok(calLink) {
      if ($("[data-chat-intake]", lijst)) return;
      var link = calLink || "julian-goote-c4pgqu/intake-marketgrow.ai";
      var blok = document.createElement("div");
      blok.setAttribute("data-chat-intake", "");
      blok.style.cssText =
        "border:1px solid var(--olijf);background:var(--zand);padding:16px;display:flex;" +
        "flex-direction:column;gap:10px;margin-top:4px";
      blok.innerHTML =
        '<span style="font-size:14px;line-height:1.5">Zo te horen kan Noor je verder helpen in een gesprek.</span>' +
        '<a class="knop" style="background:var(--olijf);color:var(--cream);justify-content:center;padding:12px 18px;font-size:15px" ' +
        'data-cal-namespace="kennismaking" data-cal-link="' + link + '" role="button" tabindex="0">Plan een demo \u00b7 30 min</a>';
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
    var jaarlabel = $("[data-jaarlabel]");
    var jaarbalk = $("[data-jaarbalk]");
    var nudge = $("[data-nudge]");
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

      // Het vinkje zat wel in de opmaak maar werd nergens omgezet: het vakje bleef staan
      // zoals het stond, dus aanklikken leek niets te doen.
      var vink = $("[data-vink]", b);
      if (vink) {
        // Het teken zelf zetten en niet alleen de kleur. In de opmaak staat het vinkje
        // alleen in de kaart die van zichzelf aan staat; de andere vakjes zijn leeg. Wie
        // die aanzette kreeg een gekleurd vlak zonder vinkje erin.
        vink.textContent = actief ? "\u2713" : "";
        vink.style.background = actief ? "var(--olijf)" : "transparent";
        vink.style.borderColor = actief ? "var(--olijf)" : "var(--lijn-sterk)";
        vink.style.color = "var(--cream)";
      }

      var prijs = $("[data-prijs]", b);
      var bij = $("[data-prijs-bij]", b);
      var besp = $("[data-prijs-besparing]", b);
      var maand = maandVan(b);
      var jaar = jaarVan(b);

      if (prijs) {
        prijs.textContent = termijn === "jaar"
          ? euro(Math.round((jaar / 12) * 100) / 100) + " per maand"
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

    // Het totaal telt naar zijn nieuwe waarde in plaats van te springen. Kort gehouden:
    // driehonderd milliseconde, want dit is een bedrag en geen animatie om naar te kijken.
    var vorigBedrag = null;
    function telNaar(el, doel) {
      if (doel === null) { el.textContent = ""; vorigBedrag = null; return; }
      if (RUSTIG || vorigBedrag === null) { el.textContent = euro(doel); vorigBedrag = doel; return; }
      var van = vorigBedrag;
      vorigBedrag = doel;
      if (van === doel) { el.textContent = euro(doel); return; }
      var start = null;
      var duur = 300;
      var stap = function (nu) {
        if (!start) start = nu;
        var p = Math.min(1, (nu - start) / duur);
        var soepel = 1 - Math.pow(1 - p, 3);
        var waarde = van + (doel - van) * soepel;
        el.textContent = euro(Math.round(waarde * 100) / 100);
        if (p < 1) window.requestAnimationFrame(stap);
        else el.textContent = euro(doel);
      };
      window.requestAnimationFrame(stap);
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

      // Wat bij welke stand hoort. Het kortingslabel en de balk met de twee gratis maanden
      // gaan over een jaar vooruit; het zetje naar de jaarstand hoort juist alleen in de
      // maandstand. Ze stonden alle drie altijd aan.
      // Het label hoort bij de jaarstand. De balk met de twee gratis maanden en het zetje
      // horen juist bij de MAANDstand: die laten zien wat je zou schelen als je overstapt.
      if (jaarlabel) jaarlabel.style.display = termijn === "jaar" ? "" : "none";
      if (jaarbalk) jaarbalk.style.display = termijn === "maand" ? "" : "none";
      if (nudge) nudge.style.display = termijn === "maand" ? "" : "none";

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
        var doelBedrag = gekozen.length === 0
          ? null
          : termijn === "jaar"
            ? Math.round((jaarTotaal / 12) * 100) / 100
            : maandTotaal;
        telNaar(totaalEl, doelBedrag);
      }
      if (totaalBij) {
        totaalBij.textContent = gekozen.length === 0
          ? ""
          : termijn === "jaar"
            ? "Jaarlijks gefactureerd \u00b7 " + euro(jaarTotaal) + " per jaar"
            : "Maandelijks opzegbaar \u00b7 geen jaarcontract";
      }
      if (totaalBesparing) {
        var toon = gekozen.length > 0 && termijn === "jaar" && scheelt > 0;
        totaalBesparing.textContent = toon ? "Je bespaart " + euro(scheelt) + " per jaar" : "";
        totaalBesparing.style.display = toon ? "" : "none";
      }
      // De knop "Start met deze opzet" neemt de keuze mee naar de aanmelding, zodat
      // niemand daar opnieuw zit te vinken. Het platform leest ze uit de URL; kent het ze
      // niet, dan blijft het gewoon het normale aanmeldscherm.
      var startKnop = $("[data-start]");
      if (startKnop) {
        var keuze = gekozen.map(function (b) { return b.getAttribute("data-blok"); });
        var basis = "https://app.marketgrow.ai/aanmelden";
        startKnop.setAttribute(
          "href",
          keuze.length === 0 ? basis : basis + "?blokken=" + keuze.join(",") + "&termijn=" + termijn
        );
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
    var teller = $("[data-slide-teller]");
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
      // De teller in de opmaak stond vast op 01 / 05 en liep niet mee.
      if (teller) {
        var tel = function (x) { return x < 10 ? "0" + x : String(x); };
        teller.textContent = tel(nu + 1) + " / " + tel(beelden.length);
      }
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
          var duur = 1000;
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

  // 8 · Rubrieken in de kennisbank.
  function rubrieken() {
    var knoppen = $$("[data-rubriek]");
    var kaarten = $$("[data-artikel]");
    if (knoppen.length === 0 || kaarten.length === 0) return;

    // De melding voor een lege rubriek staat er niet in de opmaak; we maken hem een keer
    // aan en verbergen hem daarna. Een lege omlijning laat de bezoeker denken dat er iets
    // stuk is.
    var houder = kaarten[0].parentNode;
    var leeg = document.createElement("p");
    leeg.className = "bij";
    leeg.setAttribute("data-rubriek-leeg", "");
    leeg.textContent = "Nog geen stukken in deze rubriek.";
    leeg.style.display = "none";
    leeg.style.gridColumn = "1 / -1";
    houder.appendChild(leeg);

    function kies(rubriek) {
      var zichtbaar = 0;
      kaarten.forEach(function (k) {
        var past = rubriek === "alles" || k.getAttribute("data-artikel") === rubriek;
        k.style.display = past ? "" : "none";
        if (past) zichtbaar += 1;
      });
      leeg.style.display = zichtbaar === 0 ? "" : "none";
      knoppen.forEach(function (b) {
        var actief = b.getAttribute("data-rubriek") === rubriek;
        if (actief) b.setAttribute("aria-current", "true");
        else b.removeAttribute("aria-current");
        b.style.background = actief ? "var(--olijf)" : "transparent";
        b.style.color = actief ? "var(--cream)" : "var(--grijs)";
      });
    }

    knoppen.forEach(function (b) {
      b.addEventListener("click", function () { kies(b.getAttribute("data-rubriek")); });
    });
    kies("alles");
  }

  // 9 · De afsprakenknoppen van Cal.com.
  //
  // WAAROM DIT HIER STAAT. De knoppen dragen data-cal-link, maar zonder het insluitscript
  // van Cal.com doen ze niets: je klikt en er gebeurt niets. Op de oude site stond dat
  // script op elke pagina in de kop; in de handoff is het niet meegekomen.
  //
  // Het laadt pas als er ook echt een knop op de pagina staat, en pas als iemand hem voor
  // het eerst nadert. Dat scheelt een extern script bij het openen van elke pagina, en
  // deze pagina's moeten juist licht blijven.
  function afspraken() {
    var knoppen = $$("[data-cal-link]");
    if (knoppen.length === 0) return;

    var geladen = false;
    function laad() {
      if (geladen) return;
      geladen = true;
      (function (C, A, L) {
        var p = function (a, ar) { a.q.push(ar); };
        var d = C.document;
        C.Cal = C.Cal || function () {
          var cal = C.Cal; var ar = arguments;
          if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; }
          if (ar[0] === L) {
            var api = function () { p(api, arguments); };
            var namespace = ar[1];
            api.q = api.q || [];
            if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]); }
            else p(cal, ar);
            return;
          }
          p(cal, ar);
        };
      })(window, "https://app.cal.com/embed/embed.js", "init");

      window.Cal("init", "kennismaking", { origin: "https://cal.com" });
      window.Cal.ns["kennismaking"]("ui", {
        theme: "light",
        cssVarsPerTheme: { light: { "cal-brand": "#3F4A2E" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    }

    // Bij het naderen laden, zodat de eerste klik meteen werkt.
    knoppen.forEach(function (k) {
      k.addEventListener("mouseenter", laad, { once: true });
      k.addEventListener("focus", laad, { once: true });
      k.addEventListener("touchstart", laad, { once: true, passive: true });
      k.addEventListener("click", laad);
    });
    // En anders zodra de eerste knop in beeld komt.
    bijInBeeld(knoppen[0], laad, "200px");
  }

  // 10 · Leesvoortgang bij een artikel.
  function leesbalk() {
    var artikel = $("article");
    if (!artikel) return;

    var balk = document.createElement("div");
    balk.className = "leesbalk";
    balk.setAttribute("aria-hidden", "true");
    document.body.appendChild(balk);

    var bezig = false;
    function meet() {
      var vak = artikel.getBoundingClientRect();
      var hoogte = vak.height - window.innerHeight;
      // Past het artikel op een scherm, dan valt er niets te volgen.
      if (hoogte <= 0) { balk.style.width = "0"; return; }
      var gedaan = Math.min(1, Math.max(0, -vak.top / hoogte));
      balk.style.width = (gedaan * 100).toFixed(1) + "%";
    }

    window.addEventListener("scroll", function () {
      if (bezig) return;
      bezig = true;
      window.requestAnimationFrame(function () { meet(); bezig = false; });
    }, { passive: true });
    window.addEventListener("resize", meet);
    meet();
  }

  // 11 · Het vak in de kicker wisselt.
  //
  // De opmaak heeft een haak [data-vak] met "juristen en advocaten" erin. In het ontwerp
  // wisselt dat woord door de vakken heen, zodat een bezoeker binnen een paar seconden
  // ziet dat zijn eigen beroep erbij staat. Dat stond niet in gedrag.md beschreven.
  var VAKKEN = [
    "juristen en advocaten",
    "accountants en belastingadviseurs",
    "mediators",
    "bedrijfsadviseurs en coaches",
    "hypotheek- en pensioenadvies",
    "fysiotherapie en mentale zorg",
    "architecten en interieurontwerpers",
    "coaches",
    "financieel planners",
  ];

  function vakwissel() {
    var el = $("[data-vak]");
    if (!el) return;

    // Begint bij het vak dat in de opmaak staat, zodat de eerste aanblik niet verspringt.
    var start = 0;
    var nu = (el.textContent || "").trim().toLowerCase();
    for (var i = 0; i < VAKKEN.length; i += 1) {
      if (VAKKEN[i] === nu) { start = i; break; }
    }

    // Bij prefers-reduced-motion blijft het staan zoals het staat. Tekst die vanzelf
    // verandert is voor sommige mensen onleesbaar, en dit is geen versiering maar inhoud.
    if (RUSTIG) return;

    el.style.transition = "opacity .22s ease";
    el.style.display = "inline-block";

    var wijzer = start;
    var klok = null;

    function volgende() {
      wijzer = (wijzer + 1) % VAKKEN.length;
      el.style.opacity = "0";
      window.setTimeout(function () {
        el.textContent = VAKKEN[wijzer];
        el.style.opacity = "1";
      }, 220);
    }

    // Alleen laten lopen zolang de kop in beeld is. Een tekst die onder de vouw staat te
    // wisselen kost stroom en levert niets op.
    if ("IntersectionObserver" in window) {
      var waarnemer = new IntersectionObserver(function (regels) {
        regels.forEach(function (regel) {
          if (regel.isIntersecting && !klok) klok = window.setInterval(volgende, 1500);
          else if (!regel.isIntersecting && klok) { window.clearInterval(klok); klok = null; }
        });
      });
      waarnemer.observe(el);
    } else {
      klok = window.setInterval(volgende, 1500);
    }
  }

  // 12 · Het filmpje in het regie-blok.
  //
  // In de opmaak staan vier stappen met [data-film-stap] en een invoerveld met
  // [data-film-invoer]. Ze stonden alle vier meteen in beeld, dus het was een plaatje in
  // plaats van een gebeurtenis. Nu komen ze na elkaar op: melding, samenvatting, jouw
  // opdracht, bevestiging. Precies het verhaal van het blok ernaast.
  function film() {
    var doos = $("[data-film]");
    if (!doos) return;
    var stappen = $$("[data-film-stap]", doos);
    if (stappen.length === 0) return;
    var invoer = $("[data-film-invoer]");

    // Bij prefers-reduced-motion staat alles er gewoon, en dan is het een schermafdruk.
    if (RUSTIG) return;

    // De stappen blijven staan en lichten om de beurt op, in plaats van dat ze verschijnen
    // uit het niets. Zo is het scherm nooit half leeg en zie je meteen waar het naartoe
    // gaat: het gesprek staat er, alleen nog niet gebeurd.
    function verberg() {
      stappen.forEach(function (s) {
        s.style.opacity = ".22";
        s.style.transform = "none";
        s.style.transition = "opacity .34s ease";
      });
      if (invoer) invoer.textContent = "";
    }

    function toon(i) {
      var s = stappen[i];
      if (!s) return;
      s.style.opacity = "1";
    }

    // De opdracht wordt getypt voordat hij als bericht verschijnt: dat maakt zichtbaar
    // dat JIJ hem geeft en de AI-collega hem uitvoert.
    function typ(tekst) {
      if (!invoer) return;
      var i = 0;
      var tik = function () {
        i += 1;
        invoer.textContent = tekst.slice(0, i);
        if (i < tekst.length) window.setTimeout(tik, 34);
        else window.setTimeout(function () { invoer.textContent = ""; }, 1600);
      };
      tik();
    }

    var klokken = [];
    function speel() {
      klokken.forEach(window.clearTimeout);
      klokken = [];
      verberg();
      klokken.push(window.setTimeout(function () { toon(0); }, 700));
      klokken.push(window.setTimeout(function () { toon(1); }, 1900));
      // Vanaf 3,1 seconde wordt de opdracht letter voor letter getypt; op 5,1 staat hij
      // als bericht en op 6,3 komt de bevestiging.
      klokken.push(window.setTimeout(function () {
        var opdracht = (stappen[2] && stappen[2].textContent.trim()) || "";
        typ(opdracht);
      }, 3100));
      klokken.push(window.setTimeout(function () { toon(2); }, 5100));
      klokken.push(window.setTimeout(function () { toon(3); }, 6300));
      // Even laten staan, dan opnieuw. Wie er later naar kijkt ziet het ook.
      klokken.push(window.setTimeout(speel, 10800));
    }

    verberg();
    bijInBeeld(doos, speel, "0px 0px -20% 0px");
  }

  function start() {
    balk();
    opkomen();
    chat();
    prijzen();
    carrousel();
    teller();
    vragen();
    rubrieken();
    afspraken();
    leesbalk();
    vakwissel();
    film();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
