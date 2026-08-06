/* site.js · MarketGrow.ai
 * Vervangt de ontwerp-runtime (support.js) door gewone JavaScript.
 * Alles is optioneel: valt dit bestand weg, dan blijft de pagina leesbaar.
 */
(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ------------------------------------------------------ navigatie */

  function navigatie() {
    var nav = $(".mg-nav");
    var knop = $(".mg-nav-knop", nav || document);
    if (!nav || !knop) return;
    var zetOpen = function (open) {
      nav.setAttribute("data-open", open ? "true" : "false");
      knop.setAttribute("aria-expanded", open ? "true" : "false");
    };
    zetOpen(false);
    knop.addEventListener("click", function () {
      zetOpen(nav.getAttribute("data-open") !== "true");
    });
    $$(".mg-nav-menu a", nav).forEach(function (a) {
      a.addEventListener("click", function () { zetOpen(false); });
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) zetOpen(false);
    });
  }

  /* ------------------------------------- verschijnen bij scrollen */

  function reveals() {
    var els = $$("[data-reveal], [data-stagger]");
    if (!els.length) return;

    var toon = function (el, gespreid) {
      if (el.hasAttribute("data-stagger")) {
        Array.prototype.slice.call(el.children).forEach(function (kind, i) {
          setTimeout(function () {
            kind.style.opacity = "1";
            kind.style.transform = "none";
          }, gespreid ? i * 90 : 0);
        });
      } else {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }
    };

    // Elementen staan in de HTML op opacity 1. Pas hier zetten we ze uit,
    // zodat de inhoud zichtbaar blijft als dit script nooit draait.
    els.forEach(function (el) {
      var zichtbaar = el.getBoundingClientRect().top < window.innerHeight * 0.9;
      if (el.hasAttribute("data-stagger")) {
        Array.prototype.slice.call(el.children).forEach(function (kind) {
          kind.style.transition = "opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)";
          if (!zichtbaar) { kind.style.opacity = "0"; kind.style.transform = "translateY(28px)"; }
        });
      } else if (!zichtbaar) {
        el.style.opacity = "0";
        el.style.transform = "translateY(32px)";
        el.style.transition = "opacity 0.75s ease, transform 0.75s cubic-bezier(0.22,1,0.36,1)";
      }
    });

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          toon(e.target, true);
          io.unobserve(e.target);
        });
      }, { threshold: 0.12 });
      els.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
        io.observe(el);
      });
    }

    // Vangnet: ook als de waarnemer nooit afgaat blijft niets onzichtbaar.
    setTimeout(function () { els.forEach(function (el) { toon(el, false); }); }, 1400);
  }

  /* ------------------------------------------------ roterende balk */

  function olijfbalk() {
    var el = document.getElementById("mg-claim");
    if (!el) return;
    var claims = [
      "Live binnen een week",
      "Op je bestaande website",
      "Jij houdt de regie",
      "De eerste tien \u00b7 een oprichterstarief dat blijft"
    ];
    var i = 0;
    setInterval(function () {
      i = (i + 1) % claims.length;
      el.textContent = claims[i];
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "mgFadeUp 0.5s ease-out both";
    }, 4200);
  }

  /* ----------------------------------------------------- Noor-chat */

  // Noor draait niet meer op een eigen functie in deze repo maar op het platform, net
  // als bij elke klant. Daardoor komen gesprekken, leads en boekingen in het dashboard
  // terecht, en geldt elke verbetering aan de persona ook hier.
  //
  // Aan de opmaak van het paneel verandert dit niets. Dit bestand praat alleen met een
  // ander adres en kan twee antwoorden meer aan: de uitnodiging voor een kennismaking
  // en het contactformulier.
  var PLATFORM = "https://app.marketgrow.ai";
  var TENANT = "demo";

  // Het lopende gesprek. Staat op moduleniveau omdat de boekingsmelding hem ook nodig
  // heeft, en die hangt aan de Cal-knoppen die buiten het chatpaneel staan.
  var gesprekId = null;
  var boekingGemeld = false;
  var boekingLuisterAan = false;
  // Wordt door chat() gevuld als het paneel op deze pagina staat. Op een sectorpagina
  // blijft hij leeg en verloopt een boeking stil.
  var bevestigInChat = null;

  // Naam en e-mail uit een Cal.com-boeking halen. De vorm verschilt per versie van
  // Cal.com, dus we kijken op meerdere plekken: de deelnemerslijst en het
  // antwoordenobject, waarvan een veld een losse waarde of een object met .value kan
  // zijn. Vinden we niets, dan melden we de boeking zonder naam. Dat is beter dan de
  // melding laten vallen.
  function leesBoekingContact(data) {
    try {
      var b = (data && data.booking) || data || {};
      var att = (b.attendees && b.attendees[0]) || (data && data.attendees && data.attendees[0]) || {};
      var resp = b.responses || (data && data.responses) || {};
      var waarde = function (x) { return x && typeof x === "object" ? (x.value || "") : (x || ""); };
      return {
        naam: String(att.name || waarde(resp.name) || waarde(resp.fullName) || "").trim(),
        email: String(att.email || waarde(resp.email) || "").trim()
      };
    } catch (e) {
      return { naam: "", email: "" };
    }
  }

  // Een geboekte kennismaking terugmelden aan het platform, zodat hij als afspraak en
  // als lead in het dashboard verschijnt. Dit is het hele punt van de vorige stap: zolang
  // Cal.com in een nieuw tabblad opende vuurde deze gebeurtenis in een pagina waar wij
  // niet bij kunnen, en was een geboekte intake onmeetbaar.
  //
  // Werkt vanaf elke pagina. Staat er geen chatpaneel, dan gaat de melding mee zonder
  // gespreksnummer; die kolom is niet verplicht.
  function meldBoeking(data) {
    if (boekingGemeld) return;
    boekingGemeld = true;
    var contact = leesBoekingContact(data);
    var terugval = "Je kennismaking staat vast. Je ontvangt een bevestiging per e-mail.";
    fetch(PLATFORM + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant: TENANT,
        action: "booked",
        conversationId: gesprekId,
        start: (data && data.date) || null,
        naam: contact.naam,
        email: contact.email
      })
    }).then(function (r) {
      return r.json().then(function (j) { return j; });
    }).then(function (j) {
      if (bevestigInChat) bevestigInChat((j && j.reply) || terugval);
    }).catch(function () {
      if (bevestigInChat) bevestigInChat(terugval);
    });
  }

  // Cal.com meldt een geslaagde boeking op de naamruimte die in de kop van elke pagina
  // wordt aangemaakt. Daar haken we een keer op aan, ook op pagina's zonder chat.
  function boekingsmelding() {
    if (boekingLuisterAan) return;
    try {
      var ns = window.Cal && window.Cal.ns && window.Cal.ns.kennismaking;
      if (typeof ns !== "function") return;
      ns("on", {
        action: "bookingSuccessful",
        callback: function (e) { meldBoeking((e && e.detail && e.detail.data) || {}); }
      });
      boekingLuisterAan = true;
    } catch (err) {
      // Geen Cal op deze pagina, of een andere versie. Dan gewoon geen melding.
    }
  }


  var chatData = {
    welcome: "Hoi, ik ben Noor. Ik ben het gezicht van MarketGrow, zoals Iris dat is voor een juristenkantoor. Vraag mij gerust iets.",
    start: [
      { label: "Wat doet MarketGrow?", target: "doet" },
      { label: "Stel het team voor", target: "team" },
      { label: "Wat kost het?", target: "kost" }
    ],
    answers: {
      doet: {
        text: "Ik vang je websitevragen op, dag en nacht, en boek alleen de juiste intakes in je agenda. Achter mij schrijven collega's je blogs en zetten ze je offertes klaar. Jij stuurt ons aan vanaf je telefoon.",
        next: [
          { label: "Stel het team voor", target: "team" },
          { label: "Wat kost het?", target: "kost" }
        ]
      },
      team: {
        text: "Met plezier. Iris is het gezicht aan de balie, zoals ik dat hier ben. Een content-collega zorgt dat je gevonden wordt. Een offerte-collega zet je documenten klaar. En jij bent de manager. Scroll naar beneden, dan stel ik ze voor.",
        next: [
          { label: "Wat doe jij precies?", target: "doet" },
          { label: "Wat kost het?", target: "kost" }
        ]
      },
      kost: {
        text: "Je begint klein, met \u00e9\u00e9n collega, tegen een vast en transparant tarief. De eerste tien kantoren krijgen een oprichterstarief dat blijft. Zal ik een kennismaking voor je inplannen?",
        next: [
          { label: "Ja, plan een kennismaking", target: "plan" },
          { label: "Stel eerst het team voor", target: "team" }
        ]
      },
      plan: {
        text: "Top. Klik op 'Plan een kennismaking' onderaan, of mail ons op hello@marketgrow.ai. Dan laten we je Iris in actie zien.",
        next: [
          { label: "Wat doet MarketGrow?", target: "doet" },
          { label: "Stel het team voor", target: "team" }
        ]
      }
    }
  };

  function chat() {
    var venster = document.getElementById("mg-chat-body");
    if (!venster) return;

    var lijst = document.getElementById("mg-msgs");
    var typen = document.getElementById("mg-typing");
    var intake = document.getElementById("mg-intake");
    var chips = document.getElementById("mg-chips");
    var demoRij = document.getElementById("mg-demo-row");
    var liveRij = document.getElementById("mg-live-row");
    var invoer = document.getElementById("mg-live-input");
    var concept = document.getElementById("mg-draft");
    var caret = document.getElementById("mg-caret");
    var hint = document.getElementById("mg-hint");
    var statusLive = document.getElementById("mg-status-live");
    var statusDemo = document.getElementById("mg-status-demo");

    var script = ["doet", "team", "kost", "plan"];
    var auto = true;
    var stapIdx = 0;
    var bezig = false;
    var live = false;
    var timers = [];
    var typeTimer = null;
    var geschiedenis = [];
    var liveGestart = false;

    function wacht(ms, fn) { var t = setTimeout(fn, ms); timers.push(t); return t; }
    function scrol() { venster.scrollTop = venster.scrollHeight; }

    function bubbel(tekst, vanNoor) {
      var rij = document.createElement("div");
      rij.style.cssText = vanNoor
        ? "display:flex;gap:10px;animation:mgFadeUp 0.4s ease-out both"
        : "display:flex;justify-content:flex-end;animation:mgFadeUp 0.4s ease-out both";
      if (vanNoor) {
        var avatar = document.createElement("div");
        avatar.style.cssText = "width:24px;height:24px;background:#3F4A2E;color:#F6F4EE;display:flex;align-items:center;justify-content:center;font-family:'Instrument Serif',Georgia,serif;font-size:12px;flex-shrink:0;margin-top:2px";
        avatar.textContent = "N";
        rij.appendChild(avatar);
      }
      var ballon = document.createElement("div");
      ballon.style.cssText = vanNoor
        ? "max-width:82%;background:#EFEBE1;color:#0E1112;padding:10px 14px;font-size:14px;line-height:1.55"
        : "max-width:82%;background:#0E1112;color:#F6F4EE;padding:10px 14px;font-size:14px;line-height:1.55";
      ballon.textContent = tekst;
      rij.appendChild(ballon);
      lijst.appendChild(rij);
      geschiedenis.push({ role: vanNoor ? "assistant" : "user", content: tekst });
      scrol();
    }

    function zetTypen(aan) {
      bezig = aan;
      typen.style.display = aan ? "flex" : "none";
      if (aan) scrol();
    }

    function toonChips(lijstje) {
      chips.innerHTML = "";
      lijstje.forEach(function (c) {
        var knop = document.createElement("button");
        knop.type = "button";
        knop.className = "mg-hv-4 mg-chip";
        knop.setAttribute("data-target", c.target);
        knop.style.cssText = "background:#FFFFFF;border:1px solid #E1DCCF;color:#0E1112;padding:9px 14px;font-size:13px;font-weight:500;font-family:'Inter Tight',system-ui,sans-serif;cursor:pointer;transition:border-color 0.15s";
        knop.textContent = c.label;
        chips.appendChild(knop);
      });
    }

    function stopAuto() {
      auto = false;
      timers.forEach(clearTimeout);
      timers = [];
      if (typeTimer) clearInterval(typeTimer);
      concept.textContent = "";
      caret.style.display = "none";
      hint.style.display = "";
    }

    function zetLive(aan) {
      live = aan;
      liveRij.style.display = aan ? "flex" : "none";
      demoRij.style.display = aan ? "none" : "flex";
      statusLive.style.display = aan ? "" : "none";
      statusDemo.style.display = aan ? "none" : "";
    }

    function demoAntwoord(chip) {
      if (bezig) return;
      var antwoord = chatData.answers[chip.target];
      bubbel(chip.label, false);
      toonChips([]);
      zetTypen(true);
      wacht(1100, function () {
        zetTypen(false);
        bubbel(antwoord.text, true);
        toonChips(antwoord.next);
      });
    }

    function autoStap() {
      if (!auto) return;
      var doelwit = script[stapIdx];
      if (!doelwit) return;
      var chip = null;
      $$(".mg-chip", chips).forEach(function (k) {
        if (k.getAttribute("data-target") === doelwit) {
          chip = { label: k.textContent, target: doelwit };
        }
      });
      if (!chip) return;
      hint.style.display = "none";
      caret.style.display = "block";
      var i = 0;
      concept.textContent = "";
      typeTimer = setInterval(function () {
        if (!auto) { clearInterval(typeTimer); return; }
        i += 1;
        concept.textContent = chip.label.slice(0, i);
        if (i >= chip.label.length) {
          clearInterval(typeTimer);
          wacht(420, function () {
            if (!auto) return;
            concept.textContent = "";
            caret.style.display = "none";
            hint.style.display = "";
            stapIdx += 1;
            demoAntwoord(chip);
            wacht(3900, autoStap);
          });
        }
      }, 55);
    }

    function duwNoor(tekst, intakeKlaar) {
      zetTypen(false);
      bubbel(tekst, true);
      toonChips(chatData.start);
      if (intakeKlaar) {
        intake.style.display = "flex";
        scrol();
      }
    }

    var leadBlok = null;

    function toonMelding(el, tekst) {
      el.textContent = tekst;
      el.style.display = tekst ? "block" : "none";
    }

    // Het contactformulier in de chat. Het platform beslist wanneer het verschijnt en
    // levert de velden mee; wij tekenen ze in de opmaak van deze pagina. Dit bestond
    // hier nog niet: de oude Noor kon alleen naar de agenda verwijzen.
    function toonLeadFormulier(velden) {
      if (leadBlok) return;
      var lijstVelden = Array.isArray(velden) && velden.length ? velden : [
        { key: "naam", label: "Naam", type: "text" },
        { key: "email", label: "E-mail", type: "email" },
        { key: "telefoon", label: "Telefoon", type: "tel" }
      ];

      leadBlok = document.createElement("div");
      leadBlok.style.cssText = "margin-left:34px;background:#3F4A2E;color:#F6F4EE;padding:16px 18px;display:flex;flex-direction:column;gap:10px;animation:mgFadeUp 0.4s ease-out both";

      var kop = document.createElement("div");
      kop.style.cssText = "font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:0.14em;font-size:10px;font-weight:500;color:#C8E06A";
      kop.textContent = "\u2192 Laat je gegevens achter";
      leadBlok.appendChild(kop);

      var invoeren = {};
      lijstVelden.forEach(function (v) {
        var inp = document.createElement("input");
        inp.type = v.type || "text";
        inp.placeholder = v.label || v.key;
        inp.style.cssText = "background:#F6F4EE;border:none;color:#0E1112;padding:10px 12px;font-size:16px;font-family:'Inter Tight',system-ui,sans-serif;outline:none";
        invoeren[v.key] = inp;
        leadBlok.appendChild(inp);
      });

      var melding = document.createElement("div");
      melding.style.cssText = "font-size:12.5px;line-height:1.5;color:#C8E06A;display:none";
      leadBlok.appendChild(melding);

      var knop = document.createElement("button");
      knop.type = "button";
      knop.textContent = "Versturen";
      knop.style.cssText = "background:#C8E06A;color:#0E1112;border:none;text-align:center;padding:11px 16px;font-size:14px;font-weight:500;font-family:'Inter Tight',system-ui,sans-serif;cursor:pointer";
      knop.addEventListener("click", function () { verstuurLead(lijstVelden, invoeren, melding, knop); });
      leadBlok.appendChild(knop);

      venster.insertBefore(leadBlok, typen);
      scrol();
    }

    function verstuurLead(velden, invoeren, melding, knop) {
      var lead = {};
      velden.forEach(function (v) {
        var w = (invoeren[v.key].value || "").trim();
        if (w) lead[v.key] = w;
      });

      // Dezelfde eis als de server: een naam, plus een e-mailadres of een telefoonnummer.
      // Hier ook controleren scheelt de bezoeker een rondje wachten op een foutmelding
      // die je meteen kunt zien aankomen.
      if (!lead.naam) { toonMelding(melding, "Vul je naam in."); return; }
      if (!lead.email && !lead.telefoon) { toonMelding(melding, "Vul je e-mail of je telefoonnummer in."); return; }

      toonMelding(melding, "");
      knop.disabled = true;
      knop.textContent = "Versturen...";

      fetch(PLATFORM + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant: TENANT, action: "lead", conversationId: gesprekId, lead: lead })
      }).then(function (r) {
        return r.json().then(function (j) { return { ok: r.ok, d: j }; });
      }).then(function (res) {
        if (!res.ok) {
          knop.disabled = false;
          knop.textContent = "Versturen";
          toonMelding(melding, (res.d && res.d.error) || "Versturen lukte niet. Probeer het nog een keer.");
          return;
        }
        leadBlok.remove();
        leadBlok = null;
        duwNoor((res.d && res.d.reply) || "Bedankt, je gegevens zijn doorgegeven. We nemen snel contact met je op.");
      }).catch(function () {
        knop.disabled = false;
        knop.textContent = "Versturen";
        toonMelding(melding, "Versturen lukte niet. Mail ons gerust op hello@marketgrow.ai.");
      });
    }

    function vraagNoor() {
      var berichten = geschiedenis.slice();
      while (berichten.length && berichten[0].role !== "user") berichten.shift();
      if (!berichten.length) { zetTypen(false); return; }
      fetch(PLATFORM + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant: TENANT,
          messages: berichten,
          conversationId: gesprekId,
          bron: "landing",
          bronDetail: String(document.title || "").slice(0, 160)
        })
      }).then(function (r) {
        if (!r.ok) throw new Error("status " + r.status);
        return r.json();
      }).then(function (data) {
        if (!data || !data.reply) throw new Error("leeg antwoord");
        if (data.conversationId) gesprekId = data.conversationId;
        var tekst = String(data.reply).trim();
        // Het platform beslist zelf of de agenda of het formulier verschijnt, in een
        // aparte smalle aanroep. Dat verving de markering in de tekst, die vier
        // proefruns lang vier verschillende uitkomsten gaf.
        if (data.lead === true) {
          duwNoor(tekst);
          toonLeadFormulier(data.leadVelden);
          return;
        }
        duwNoor(tekst, data.intake === true);
      }).catch(function () {
        duwNoor("Sorry, ik kan even niet antwoorden. Mail ons op hello@marketgrow.ai of plan een kennismaking, dan help ik je verder.");
      });
    }

    function stuur(tekst) {
      if (bezig || !tekst) return;
      stopAuto();
      // De demo hierboven is theater: die antwoorden komen uit dit bestand en niet van
      // Noor. Ze mogen dus niet als gespreksgeschiedenis mee naar het platform, want
      // dan staat er straks in het dashboard dat Noor iets gezegd heeft wat ze nooit
      // heeft gezegd. Vanaf de eerste echte vraag beginnen we met een schone lei.
      if (!liveGestart) { liveGestart = true; geschiedenis = []; }
      zetLive(true);
      bubbel(tekst, false);
      toonChips([]);
      zetTypen(true);
      vraagNoor();
    }

    // De sticker eraf halen, de demo stilzetten en de echte invoerregel tonen.
    //
    // WAAROM DIT AAN DE MUIS HANGT EN NIET AAN EEN KLIK. Het paneel typt zichzelf, en
    // beweging leest als afspelen en niet als invoer. Een bezoeker kijkt ernaar zoals hij
    // naar een filmpje kijkt en probeert niet mee te doen. Door de beweging te stoppen op
    // het moment dat hij er met de muis naartoe gaat, verandert het venster van "ik speel
    // af" naar "ik wacht op jou", precies wanneer hij kijkt.
    //
    // Bewust GEEN focus op de invoer bij het naderen. Focus stelen bij hover kaapt het
    // toetsenbord van iemand die alleen langs scrolt. Dat gebeurt pas bij een echte klik.
    var onthuld = false;
    function onthul(metFocus) {
      var sticker = document.getElementById("mg-sticker");
      var band = document.getElementById("mg-sticker-band");
      if (band && !onthuld) {
        // Weg langs de schuine as, dus diagonaal de hoek uit. Als een wikkel die eraf
        // getrokken wordt in plaats van een venster dat verdwijnt.
        band.style.transform = "rotate(45deg) translate(0, -130px)";
        band.style.opacity = "0";
        setTimeout(function () { if (sticker && sticker.parentNode) sticker.parentNode.removeChild(sticker); }, 700);
      }
      if (onthuld) {
        if (metFocus && invoer) invoer.focus();
        return;
      }
      onthuld = true;
      stopAuto();
      zetLive(true);
      if (metFocus && invoer) invoer.focus();
    }

    // Naderen met de muis is genoeg. Een telefoon kent geen hover, dus daar doet de tik
    // op de invoerregel of op een chip hetzelfde werk; die twee lopen ook door onthul.
    var paneel = document.getElementById("mg-paneel");
    if (paneel) {
      paneel.addEventListener("mouseenter", function () { onthul(false); });
    }

    // De boekingsmelding buiten dit paneel mag de bevestiging hier tonen.
    bevestigInChat = function (tekst) {
      intake.style.display = "none";
      if (leadBlok) { leadBlok.remove(); leadBlok = null; }
      duwNoor(tekst);
    };

    // Startsituatie
    bubbel(chatData.welcome, true);
    toonChips(chatData.start);
    zetLive(false);

    chips.addEventListener("click", function (e) {
      var knop = e.target.closest(".mg-chip");
      if (!knop) return;
      onthul(false);
      stuur(knop.textContent.trim());
    });

    $$(".mg-start-live").forEach(function (el) {
      el.addEventListener("click", function () { onthul(true); });
    });

    if (invoer) {
      invoer.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return;
        e.preventDefault();
        var t = invoer.value.trim();
        invoer.value = "";
        stuur(t);
      });
    }
    var stuurKnop = document.getElementById("mg-send");
    if (stuurKnop) {
      stuurKnop.addEventListener("click", function () {
        var t = invoer.value.trim();
        invoer.value = "";
        stuur(t);
      });
    }

    var opnieuw = document.getElementById("mg-reset");
    if (opnieuw) {
      opnieuw.addEventListener("click", function () {
        stopAuto();
        lijst.innerHTML = "";
        geschiedenis = [];
        // Opnieuw beginnen betekent ook een nieuw gesprek op het platform, anders
        // hangen de nieuwe berichten onder de vorige vraag in het dashboard.
        liveGestart = false;
        gesprekId = null;
        boekingGemeld = false;
        if (leadBlok) { leadBlok.remove(); leadBlok = null; }
        intake.style.display = "none";
        zetTypen(false);
        zetLive(false);
        bubbel(chatData.welcome, true);
        toonChips(chatData.start);
        stapIdx = 0;
        auto = true;
        wacht(1400, autoStap);
      });
    }

    wacht(1800, autoStap);
  }

  /* ------------------------------------------------ contactformulier */

  function formulier() {
    var knop = document.getElementById("mg-verstuur");
    if (!knop) return;
    var velden = {
      naam: document.getElementById("mg-naam"),
      email: document.getElementById("mg-email"),
      bedrijf: document.getElementById("mg-bedrijf"),
      bericht: document.getElementById("mg-bericht")
    };
    var fout = document.getElementById("mg-fout");
    var blok = document.getElementById("mg-form");
    var bedankt = document.getElementById("mg-bedankt");

    function toonFout(tekst) {
      fout.textContent = tekst;
      fout.style.display = tekst ? "block" : "none";
    }

    knop.addEventListener("click", function () {
      var data = {};
      var leeg = false;
      Object.keys(velden).forEach(function (k) {
        data[k] = (velden[k].value || "").trim();
        if (!data[k]) leeg = true;
      });
      if (leeg) { toonFout("Vul alle velden in \u00b7 ze zijn allemaal verplicht."); return; }
      if (!/.+@.+\..+/.test(data.email)) { toonFout("Vul een geldig e-mailadres in."); return; }
      toonFout("");
      knop.disabled = true;
      knop.textContent = "Versturen\u2026";

      var klaar = function () {
        var naam = document.getElementById("mg-bedankt-naam");
        var mail = document.getElementById("mg-bedankt-mail");
        if (naam) naam.textContent = "Bedankt " + data.naam.split(/\s+/)[0];
        if (mail) mail.textContent = data.email;
        blok.style.display = "none";
        bedankt.style.display = "";
      };

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (r.ok) { klaar(); return null; }
        return r.json().catch(function () { return null; });
      }).then(function (d) {
        if (!blok.style.display) {
          toonFout(d && d.error
            ? d.error
            : "Versturen mislukt. Probeer het opnieuw of mail ons direct op hello@marketgrow.ai.");
          knop.disabled = false;
          knop.innerHTML = 'Verstuur bericht <span class="mg-arrow">\u2192</span>';
        }
      }).catch(function () {
        klaar();
      });
    });

    var nieuw = document.getElementById("mg-nieuw");
    if (nieuw) {
      nieuw.addEventListener("click", function () {
        Object.keys(velden).forEach(function (k) { velden[k].value = ""; });
        toonFout("");
        knop.disabled = false;
        knop.innerHTML = 'Verstuur bericht <span class="mg-arrow">\u2192</span>';
        bedankt.style.display = "none";
        blok.style.display = "";
      });
    }
  }

  /* -------------------------------------------- bouwblok-schakelaars */

  function bouwblokken() {
    var rijen = $$(".mg-blok");
    if (!rijen.length) return;
    var reeks = [
      { gespreksgids: true, content: false, whatsapp: false, document: false },
      { gespreksgids: true, content: true, whatsapp: false, document: false },
      { gespreksgids: true, content: true, whatsapp: true, document: false },
      { gespreksgids: true, content: true, whatsapp: true, document: true },
      { gespreksgids: true, content: false, whatsapp: true, document: false }
    ];
    var stand = { gespreksgids: true, content: false, whatsapp: false, document: false };
    var stap = 0;
    var auto = true;

    function teken() {
      rijen.forEach(function (rij) {
        var aan = !!stand[rij.getAttribute("data-sleutel")];
        $(".mg-blok-naam", rij).style.color = aan ? "#0E1112" : "#A09E94";
        $(".mg-blok-baan", rij).style.background = aan ? "#C8E06A" : "#C7C3B6";
        $(".mg-blok-knop", rij).style.transform = aan ? "translateX(20px)" : "translateX(0px)";
      });
    }

    rijen.forEach(function (rij) {
      rij.addEventListener("click", function () {
        auto = false;
        var sleutel = rij.getAttribute("data-sleutel");
        stand[sleutel] = !stand[sleutel];
        teken();
      });
    });

    setInterval(function () {
      if (!auto) return;
      stap = (stap + 1) % reeks.length;
      stand = { gespreksgids: reeks[stap].gespreksgids, content: reeks[stap].content,
                whatsapp: reeks[stap].whatsapp, document: reeks[stap].document };
      teken();
    }, 1900);

    teken();
  }

  /* --------------------------------------------------------- starten */

  function start() {
    navigatie();
    reveals();
    olijfbalk();
    chat();
    formulier();
    bouwblokken();
    // Buiten chat(), want de Cal-knoppen staan ook op pagina's zonder chatpaneel.
    boekingsmelding();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
