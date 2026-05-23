// V1 Aurora — second sections (Hoe, Patroon, Pricing, FAQ, CTA, Footer) + App

const HoeHetWerkt = () => {
  const steps = [
    { d: 'Dag 1', t: 'Intake (30 minuten)', s: 'We bespreken je bedrijf, doelgroep en welke bouwblokken passen. Geen pitch, geen druk. Aan het einde weet je of MarketGrow past en wat het kost.' },
    { d: 'Dag 2-3', t: 'Onboarding en kennisbank', s: 'Je vult een vragenlijst in. Onze AI-agents lezen je site en bouwen een eerste versie van persona, system prompt en knowledge base. Jij reviewt.' },
    { d: 'Dag 4-5', t: 'Brand-config en implementatie', s: 'Je gespreksgids krijgt jouw kleuren, fonts, toon. We koppelen agenda en (optioneel) WhatsApp. Eén regel script op je website, klaar.' },
    { d: 'Dag 6', t: 'Quality-check, 25 testgesprekken', s: 'Onze Quality-Check-Agent voert 25+ testgesprekken om hallucinaties, off-topic-antwoorden en conversie-lekkages te vinden. Wij fixen wat eruit komt.' },
    { d: 'Dag 7', t: 'Live en jij hebt de regie', s: 'Je gespreksgids staat live, leads komen binnen, en jij ziet alles in je dashboard. Wij blijven onderhouden, jij doet je vak.' },
  ];
  return (
    <section id="hoe" className="py-28 relative noise">
      <div className="max-w-[1320px] mx-auto px-8">
        <div className="grid lg:grid-cols-12 gap-10 mb-14">
          <div className="lg:col-span-6">
            <div className="tag mute mb-4">/ 03 · Hoe het werkt</div>
            <h2 className="display text-[64px]">
              Van eerste gesprek tot live: <em className="italic olive">7 werkdagen.</em>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 flex items-end">
            <p className="text-[16px] mute leading-relaxed">
              Geen offertes die weken duren, geen onderhandelingen over scope. Helder proces, vaste prijzen, en AI-agents intern die ons werk versnellen.
            </p>
          </div>
        </div>

        <div className="space-y-px bg-line">
          {steps.map((step, i) => (
            <div key={i} className="bg-paper p-7 grid lg:grid-cols-12 gap-6 items-baseline hover:bg-paper-2 transition-colors group">
              <div className="lg:col-span-2 mono text-[11px] tag mute">{step.d}</div>
              <div className="lg:col-span-1 serif text-[44px] olive leading-none group-hover:scale-110 transition-transform" style={{transformOrigin: 'left'}}>
                {String(i+1).padStart(2, '0')}
              </div>
              <div className="lg:col-span-5">
                <h3 className="serif text-[24px] leading-tight">{step.t}</h3>
              </div>
              <div className="lg:col-span-4">
                <p className="mute text-[14.5px] leading-relaxed">{step.s}</p>
              </div>
            </div>
          ))}
        </div>

        {/* counter strip */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line">
          {[
            { v: '7', l: 'werkdagen', s: 'tot live' },
            { v: '€0', l: 'verborgen kosten', s: 'tokens, hosting, monitoring, alles inbegrepen' },
            { v: '24/7', l: 'online', s: 'Marko slaapt nooit' },
            { v: '30d', l: 'geld terug', s: 'eerste maand onderhoud restitueerbaar' },
          ].map((c, i) => (
            <div key={i} className="bg-paper p-7">
              <div className="serif text-[58px] leading-none ink mb-2 ticker-num">{c.v}</div>
              <div className="text-[14px] font-medium">{c.l}</div>
              <div className="text-[12.5px] mute mt-1">{c.s}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Patroon = () => (
  <section className="py-28 bg-paper-2 relative noise overflow-hidden">
    <div className="absolute top-1/2 -translate-y-1/2 -right-40 w-[500px] h-[500px] rounded-full opacity-50 pointer-events-none" style={{background: 'radial-gradient(circle, var(--halo), transparent 65%)', filter: 'blur(80px)'}}></div>
    <div className="relative max-w-[1320px] mx-auto px-8">
      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <div className="tag mute mb-4">/ 04 · Wat ons uniek maakt</div>
          <h2 className="display text-[58px] mb-8">
            Een platform dat <em className="italic olive">leert</em>, niet alleen werkt.
          </h2>
          <p className="text-[16px] mute leading-relaxed mb-5">
            Na elke go-live houden we een retrospectief. Wat werkte direct? Wat moest worden bijgesteld? Welke vragen kwamen we niet voorzien tegen? Die leerpunten loggen we in onze sector-bibliotheek.
          </p>
          <p className="text-[16px] mute leading-relaxed">
            Na 5 juristen weten we niet alleen wat werkt, we weten <em className="serif italic text-[18px] ink">waarom</em>. Klant 6 in dezelfde sector profiteert direct van die kennis. Geen concurrent kan dat in een paar maanden inhalen.
          </p>
        </div>

        <div className="lg:col-span-7 space-y-5">
          {/* hero quote card */}
          <div className="bg-ink text-paper p-9 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full opacity-30" style={{background: 'radial-gradient(circle, var(--lime), transparent 65%)'}}></div>
            <div className="tag lime mb-4">PATROON · JURISTEN-SECTOR</div>
            <div className="serif text-[34px] leading-snug mb-5">
              "Bij <span className="lime">urgentie-signaal</span> (deadline, brief ontvangen) converteert <em className="italic">78%</em> van bezoekers naar intake-afspraak."
            </div>
            <div className="mono text-[11px] text-paper/50">5 retrospectieven · 87 gesprekken geanalyseerd</div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-line border border-line">
            {[
              { v: '23', l: 'Top-vragen gedocumenteerd', s: 'Per sector, met conversiepercentages' },
              { v: '7', l: 'Trigger-formuleringen getest', s: 'A/B-getoetst over klanten' },
              { v: '42', l: 'Content-onderwerpen', s: 'Met bewezen zoekvolume per sector' },
              { v: '4', l: 'Document-templates', s: 'Sectorconventies gevangen' },
            ].map((g, i) => (
              <div key={i} className="bg-paper p-6">
                <div className="serif text-[56px] olive leading-none ticker-num mb-2">{g.v}</div>
                <div className="text-[14px] font-medium">{g.l}</div>
                <div className="text-[12.5px] mute mt-1">{g.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Pricing = () => {
  const plans = [
    { n: 'Instap', sub: 'Voor wie wil beginnen met één feature.', setup: 1950, maand: 110, hi: false,
      f: ['Klant-dashboard standaard', 'AI-Gespreksgids', '500 gesprekken per maand', 'Cal.com koppeling', 'E-mail support'] },
    { n: 'Groei', sub: 'Onze meest gekozen combinatie.', setup: 3200, maand: 205, hi: true,
      f: ['Alles uit Instap', 'Content-Engine', '8 publicaties per maand', 'WordPress / Webflow koppeling', 'Maandrapportage'] },
    { n: 'Compleet', sub: 'De volledige ontzorging.', setup: 5150, maand: 260, hi: false,
      f: ['Alles uit Groei', 'WhatsApp Notificaties', 'Document Automation', 'Twee-weg WhatsApp-chat', 'Prioriteit-support'] },
  ];
  return (
    <section id="prijzen" className="py-28 relative noise">
      <div className="max-w-[1320px] mx-auto px-8">
        <div className="grid lg:grid-cols-12 gap-10 mb-14 items-end">
          <div className="lg:col-span-7">
            <div className="tag mute mb-4">/ 05 · Transparante prijzen</div>
            <h2 className="display text-[64px]">
              Stel je pakket samen. <em className="italic olive">Geen verrassingen.</em>
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="mute leading-relaxed text-[15.5px]">
              Drie voorbeeld-pakketten. Maar je kunt elk bouwblok los aanzetten, en later switchen vanuit je dashboard.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-px bg-line border border-line">
          {plans.map((p, i) => (
            <div key={i} className={`p-9 relative ${p.hi ? 'bg-ink text-paper' : 'bg-paper'}`}>
              {p.hi && (
                <div className="absolute -top-3 left-9 bg-lime text-ink px-3 py-1 tag">★ Meest gekozen</div>
              )}
              <div className={`tag mb-1 ${p.hi ? 'lime' : 'mute'}`}>{p.n.toUpperCase()}</div>
              <p className={`text-[14px] mb-6 ${p.hi ? 'text-paper/70' : 'mute'}`}>{p.sub}</p>
              <div className="mb-6">
                <div className="serif text-[54px] leading-none ticker-num">€{p.setup}</div>
                <div className={`text-[13px] ${p.hi ? 'text-paper/60' : 'mute'}`}>setup, eenmalig</div>
                <div className="serif text-[30px] leading-none mt-4 ticker-num">€{p.maand}<span className={`text-[13px] ml-1 ${p.hi ? 'text-paper/60' : 'mute'}`}>/mnd</span></div>
              </div>
              <div className={`h-px mb-6 ${p.hi ? 'bg-white/15' : 'bg-line'}`}></div>
              <ul className="space-y-3 mb-8">
                {p.f.map(f => (
                  <li key={f} className="flex items-start gap-3 text-[14px]">
                    <Icon name="check" className={`w-3.5 h-3.5 mt-1 flex-shrink-0 ${p.hi ? 'lime' : 'olive'}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#intake" className={`block text-center py-3 text-[14px] font-medium transition ${p.hi ? 'bg-lime text-ink hover:brightness-95' : 'bg-ink text-paper hover:brightness-110'}`}>
                Plan een intake →
              </a>
            </div>
          ))}
        </div>

        <div className="mt-12 grid lg:grid-cols-3 gap-8">
          {[
            { i: 'shield', t: 'Eerste maand geld terug', s: 'Setup blijft, eerste maand onderhoud restitueerbaar bij niet-tevredenheid.' },
            { i: 'clock', t: 'Minimumtermijn 1 maand per feature', s: 'Schakel zelf in en uit. Geen jaarcontracten op losse bouwblokken.' },
            { i: 'sparkle', t: 'Tokens transparant doorbelast', s: 'Tot 500 gesprekken per maand inclusief. Daarboven €0,10 per gesprek, met alert bij 80%.' },
          ].map((g, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-9 h-9 bg-paper-2 border border-line flex items-center justify-center flex-shrink-0">
                <Icon name={g.i} className="w-4 h-4 olive" />
              </div>
              <div>
                <div className="text-[14px] font-medium mb-1">{g.t}</div>
                <div className="text-[13.5px] mute">{g.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Faq = () => {
  const items = [
    { q: 'Moet ik mijn website verhuizen?', a: 'Nee. Je houdt je bestaande website en hostingpartij. Wij voegen via één regel script of een DNS-koppeling een laag toe. Werkt op WordPress, Webflow, Squarespace, custom HTML, alles.' },
    { q: 'Wat als de AI iets verkeerd zegt?', a: 'Voor go-live voert onze Quality-Check-Agent 25+ testgesprekken om hallucinaties en off-topic-antwoorden te vinden. Daarna monitoren we elk klant-systeem doorlopend. Bij twijfelgevallen schakelt de AI altijd door naar een gratis intake met jou, in plaats van zelf juridische of medische antwoorden te geven.' },
    { q: 'Wie betaalt de Claude API-kosten?', a: 'Wij. Tot 500 gesprekken per maand zit in je vaste maandfee. Daarboven betaal je €0,10 per gesprek, met een alert bij 80%. Je hoeft zelf geen API-account aan te maken, geen keys te beheren, geen onverwachte rekeningen te krijgen.' },
    { q: 'Wat gebeurt er als ik opzeg?', a: 'Je krijgt een export van alle data (gesprekken, content, leads). Je kunt het systeem zelf overnemen tegen kostprijs (€750 eenmalig), of wij doen een nette takedown binnen 4 weken. Niets wordt geblokkeerd.' },
    { q: 'Hoe verschilt MarketGrow van een marketingbureau?', a: 'Een bureau bouwt en doet. Wij bouwen, automatiseren en blijven onderhouden, voor een fractie van de kosten. We zijn ook geen bouwer-van-websites, alleen van de AI-laag erop. Daardoor zijn we sneller en specialistischer.' },
    { q: 'Werkt dit echt voor mijn type bedrijf?', a: 'MarketGrow werkt het beste voor dienstverleners die via intake-gesprekken hun klanten binnenhalen. Twijfel je? Plan een intake, dan kijken we samen of het past.' },
  ];
  return (
    <section id="faq" className="py-28 relative">
      <div className="max-w-[920px] mx-auto px-8">
        <div className="mb-12">
          <div className="tag mute mb-4">/ 06 · Veelgestelde vragen</div>
          <h2 className="display text-[58px]">Vragen die <em className="italic olive">vaak</em> terugkomen.</h2>
        </div>
        <div>
          {items.map((item, i) => (
            <details key={i} className="accordion border-b border-line py-1" open={i === 0}>
              <summary className="flex items-start justify-between gap-6 py-5">
                <h3 className="serif text-[24px] leading-snug">{item.q}</h3>
                <div className="acc-plus mt-1 mute text-[20px]">+</div>
              </summary>
              <div className="pb-6 pr-10 mute leading-relaxed text-[15px] float-up">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

const IntakeCTA = () => (
  <section id="intake" className="py-32 bg-ink text-paper relative overflow-hidden noise">
    <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-40 pointer-events-none" style={{background: 'radial-gradient(circle, rgba(200,255,77,0.55), transparent 65%)', filter: 'blur(80px)'}}></div>
    <div className="absolute inset-0 grid-bg opacity-[0.07]"></div>
    <div className="relative max-w-[1100px] mx-auto px-8 text-center">
      <div className="tag lime mb-6">/ Klaar om te beginnen</div>
      <h2 className="display text-[88px] leading-[0.95] mb-8">
        Een gesprek van <em className="italic lime">20 minuten.</em><br />
        Geen druk, geen pitch.
      </h2>
      <p className="text-[17px] text-paper/70 max-w-2xl mx-auto leading-relaxed mb-10">
        Vertel wat je doet en waar je tegenaan loopt. Wij vertellen eerlijk of MarketGrow past, wat het zou kosten voor jouw bedrijf, en wanneer het live zou kunnen.
      </p>
      <a href={window.CAL_COM_URL || '#'} target="_blank" rel="noopener" className="group inline-flex items-center gap-3 bg-lime text-ink px-9 py-5 text-[16px] font-medium hover:brightness-95 transition">
        Kies een tijd in mijn agenda <span className="hover-arrow">→</span>
      </a>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[13px] text-paper/60">
        <span className="inline-flex items-center gap-2"><span className="w-1.5 h-1.5 bg-lime rounded-full"></span> Gratis en vrijblijvend</span>
        <span className="inline-flex items-center gap-2"><span className="w-1.5 h-1.5 bg-lime rounded-full"></span> Online via Google Meet</span>
        <span className="inline-flex items-center gap-2"><span className="w-1.5 h-1.5 bg-lime rounded-full"></span> Reactie binnen 1 werkdag</span>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-paper border-t border-line py-14 relative noise">
    <div className="max-w-[1320px] mx-auto px-8">
      <div className="grid lg:grid-cols-12 gap-8 mb-10">
        <div className="lg:col-span-5">
          <div className="flex items-baseline gap-0.5 mb-3">
            <span className="serif text-[28px]">MarketGrow</span>
            <span className="serif text-[28px] olive">.ai</span>
          </div>
          <p className="mute max-w-sm leading-relaxed text-[14.5px]">
            AI dat werkt voor dienstverleners. Productized en onderhouden vanuit Nederland.
          </p>
        </div>
        <div className="lg:col-span-2">
          <div className="tag mute mb-4">Platform</div>
          <ul className="space-y-2 text-[14px]">
            <li><a href="#bouwblokken" className="hover:olive">Bouwblokken</a></li>
            <li><a href="#hoe" className="hover:olive">Hoe het werkt</a></li>
            <li><a href="#prijzen" className="hover:olive">Prijzen</a></li>
            <li><a href="#faq" className="hover:olive">FAQ</a></li>
          </ul>
        </div>
        <div className="lg:col-span-2">
          <div className="tag mute mb-4">Voor</div>
          <ul className="space-y-2 text-[14px] mute">
            <li>Juristen</li><li>Accountants</li><li>Mediators</li><li>Hypotheekadviseurs</li><li>Coaches</li>
          </ul>
        </div>
        <div className="lg:col-span-3">
          <div className="tag mute mb-4">Contact</div>
          <ul className="space-y-2 text-[14px]">
            <li className="mute">hello@marketgrow.ai (binnenkort)</li>
            <li className="mute">Breda, Nederland</li>
            <li><a href="#intake" className="olive inline-flex items-center gap-1.5 group">Plan een intake <span className="hover-arrow">→</span></a></li>
          </ul>
        </div>
      </div>
      <div className="pt-6 border-t border-line flex flex-col lg:flex-row justify-between gap-3 text-[12px] mute">
        <div>© 2026 MarketGrow.ai · KvK in oprichting · Onder JG Holding BV</div>
        <div className="flex gap-6">
          <a href="#" className="hover:ink">Algemene voorwaarden</a>
          <a href="#" className="hover:ink">Privacy</a>
          <a href="#" className="hover:ink">Verwerkers</a>
        </div>
      </div>
    </div>
  </footer>
);

const App = () => (
  <div className="min-h-screen" data-screen-label="V1 Aurora">
    <Nav />
    <Hero />
    <Marquee />
    <Probleem />
    <Bouwblokken />
    <HoeHetWerkt />
    <Patroon />
    <Pricing />
    <Faq />
    <IntakeCTA />
    <Footer />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
