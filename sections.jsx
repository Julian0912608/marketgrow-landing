// V1 Aurora — all sections (Nav, Hero, Marquee, Probleem, Bouwblokken, Hoe, Patroon, Pricing, FAQ, CTA, Footer)

const Nav = () => (
  <nav className="sticky top-0 z-40 backdrop-blur" style={{background: 'rgba(246,244,238,0.82)', borderBottom: '1px solid var(--line)'}}>
    <div className="max-w-[1320px] mx-auto px-8 py-4 flex items-center justify-between">
      <a href="#top" className="flex items-baseline gap-0.5">
        <span className="serif text-[22px]">MarketGrow</span>
        <span className="serif text-[22px] olive">.ai</span>
      </a>
      <div className="hidden md:flex items-center gap-9 text-[13.5px]">
        <a href="#hoe" className="mute hover:ink transition">Hoe het werkt</a>
        <a href="#bouwblokken" className="mute hover:ink transition">Bouwblokken</a>
        <a href="#prijzen" className="mute hover:ink transition">Prijzen</a>
        <a href="#faq" className="mute hover:ink transition">Veelgestelde vragen</a>
      </div>
      <div className="flex items-center gap-3">
        <a href="index.html" className="hidden md:inline-flex items-center gap-1.5 mono text-[12px] mute hover:ink transition">
          <span className="w-1.5 h-1.5 bg-olive rounded-full"></span> of in gesprek met Marko
        </a>
        <a href={window.CAL_COM_URL || '#intake'} target="_blank" rel="noopener" className="group bg-ink text-paper text-[13px] px-4 py-2.5 inline-flex items-center gap-2 hover:brightness-110 transition">
          Plan intake <span className="hover-arrow">→</span>
        </a>
      </div>
    </div>
  </nav>
);

const LiveTicker = () => {
  const [n, setN] = useState(214);
  useEffect(() => {
    const id = setInterval(() => setN(v => v + (Math.random() < 0.6 ? 1 : 0)), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="chip">
      <span className="relative flex w-2 h-2">
        <span className="absolute inset-0 bg-lime rounded-full pulse-ring"></span>
        <span className="relative w-2 h-2 bg-lime rounded-full"></span>
      </span>
      <span className="mute">gesprekken live op pilot-sites,</span>
      <span className="ink ticker-num font-medium">{n.toLocaleString('nl-NL')}</span>
      <span className="mute">vandaag</span>
    </div>
  );
};

const Hero = () => (
  <section id="top" className="relative overflow-hidden">
    <div className="aurora"></div>
    <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none"></div>
    <div className="relative max-w-[1320px] mx-auto px-8 pt-16 pb-24">
      <div className="grid lg:grid-cols-12 gap-10 items-center">
        {/* left text */}
        <div className="lg:col-span-5 float-up">
          <LiveTicker />
          <h1 className="display text-[80px] leading-[0.92] mt-7 mb-7" style={{letterSpacing: '-0.03em'}}>
            <span className="block">Zet je website</span>
            <span className="block">aan het <em className="italic olive">werk.</em></span>
            <span className="block mute">Niet andersom.</span>
          </h1>
          <p className="text-[17px] leading-relaxed text-ink/80 max-w-md mb-8">
            MarketGrow plaatst Marko, een AI-gespreksgids, op je bestaande site. Marko kwalificeert bezoekers 24/7 en zet alleen de juiste mensen in je agenda. Geen migratie, geen losse tools.
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <a href="#intake" className="group bg-ink text-paper text-[14px] px-6 py-3.5 inline-flex items-center gap-2.5 hover:brightness-110 transition">
              Plan een intake van 20 minuten <span className="hover-arrow">→</span>
            </a>
            <a href="#hoe" className="text-[14px] mute hover:ink inline-flex items-center gap-1.5 px-3 py-3.5">
              Zie hoe het werkt
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] mute">
            <span className="inline-flex items-center gap-1.5"><Icon name="check" className="w-3.5 h-3.5 olive" /> Live in 7 werkdagen</span>
            <span className="inline-flex items-center gap-1.5"><Icon name="check" className="w-3.5 h-3.5 olive" /> Geen verborgen kosten</span>
            <span className="inline-flex items-center gap-1.5"><Icon name="check" className="w-3.5 h-3.5 olive" /> Eerste maand niet goed, geld terug</span>
          </div>
        </div>

        {/* chat front and center */}
        <div className="lg:col-span-7 flex justify-center relative float-up" style={{animationDelay: '0.15s'}}>
          {/* floating annotations */}
          <div className="hidden lg:block absolute -left-2 top-14 chip" style={{transform: 'rotate(-3deg)'}}>
            <span className="lime">▲</span> 24/7 online
          </div>
          <div className="hidden lg:block absolute right-2 top-32 chip" style={{transform: 'rotate(2deg)'}}>
            <span className="olive">●</span> jouw merk, jouw toon
          </div>
          <div className="hidden lg:block absolute -left-6 bottom-16 chip" style={{transform: 'rotate(-2deg)'}}>
            <span className="olive">↳</span> agenda gekoppeld
          </div>
          <div className="hidden lg:block absolute right-0 bottom-8 chip" style={{transform: 'rotate(3deg)'}}>
            500 gesprekken/mnd
          </div>
          <ChatDemo tone="light" />
        </div>
      </div>
    </div>
  </section>
);

const Marquee = () => {
  const items = ['Juristen', 'Advocaten', 'Mediators', 'Accountants', 'Hypotheekadviseurs', 'Fysiotherapeuten', 'Coaches', 'Financieel planners', 'Architecten', 'Bedrijfsadviseurs'];
  return (
    <div className="border-y border-line py-7 bg-paper-2 relative noise">
      <div className="max-w-[1320px] mx-auto px-8 mb-4 flex items-center justify-between text-[12px]">
        <span className="tag mute">Gebouwd voor service-mkb</span>
        <span className="tag mute">v1.0 · 2026</span>
      </div>
      <div className="marquee">
        <div className="marquee-track">
          {[...items, ...items].map((s, i) => (
            <span key={i} className="serif text-[42px] whitespace-nowrap inline-flex items-center gap-12 mute">
              <em>{s}</em>
              <span className="text-[18px]" style={{color: 'var(--lime-2)'}}>✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const Probleem = () => (
  <section className="py-28 relative noise">
    <div className="max-w-[1320px] mx-auto px-8">
      <div className="grid lg:grid-cols-12 gap-10 mb-14">
        <div className="lg:col-span-5">
          <div className="tag mute mb-4">/ 01 · Het probleem</div>
          <h2 className="display text-[56px]">
            Verkeer dat <em className="italic olive">verdampt</em> tussen klik en klant.
          </h2>
        </div>
        <div className="lg:col-span-6 lg:col-start-7 flex items-end">
          <p className="text-[17px] mute leading-relaxed">
            Je hebt al een website. Je hebt al klanten. Maar er gaat te veel verloren tussen "iemand bezoekt mijn site" en "ik heb een waardevolle nieuwe klant".
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-px bg-line border border-line">
        {[
          { nr: '01', t: 'Bezoekers gaan weg zonder dat je het merkt.', s: 'Je site krijgt verkeer, maar de meeste mensen klikken weg zonder contact op te nemen. Hun vraag was niet helder. Het was buiten kantoortijd. Of jij was er even niet.' },
          { nr: '02', t: 'AI-ambities lopen vast op uitvoering.', s: 'Je leest dat anderen iets met AI doen. Je voelt achterstand. Maar de stap van "ik wil AI" naar "ik heb het draaien" is voor een dienstverlener zonder tech-team bijna onneembaar.' },
          { nr: '03', t: 'Bureaus te duur, losse tools te veel werk.', s: '€5K per maand voor een bureau is geen optie. ChatGPT zelf installeren, knowledge bases beheren, integraties bouwen, dat is ander werk dan waar je voor opgeleid bent.' },
        ].map(p => (
          <div key={p.nr} className="bg-paper p-9">
            <div className="serif text-[56px] olive mb-5 leading-none">{p.nr}</div>
            <h3 className="serif text-[26px] mb-3 leading-snug">{p.t}</h3>
            <p className="mute leading-relaxed text-[15px]">{p.s}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Bouwblokken = () => {
  const blocks = [
    { i: 'msg', n: 'AI-Gespreksgids', setup: '€1.950', maand: '€75', om: 'Chat op je website die 24/7 bezoekers helpt, hun situatie kwalificeert en gekwalificeerde leads in je agenda zet. Met jouw merk, jouw toon, jouw expertise.', f: ['500 gesprekken per maand', 'Cal.com / Google Agenda', 'Klant-specifieke knowledge base'] },
    { i: 'pen', n: 'Content-Engine', setup: '€1.250', maand: '€95', om: 'Blogs, social posts en nieuwsbrieven, automatisch geschreven in jouw stem op basis van jouw expertise. Jij accepteert, past aan of weigert. Publicatie automatisch.', f: ['Tot 8 publicaties per maand', 'WordPress, Webflow, Zapier', 'SEO en GEO geoptimaliseerd'] },
    { i: 'send', n: 'WhatsApp Notificaties', setup: '€1.000', maand: '€25', om: 'Directe WhatsApp-melding bij elke nieuwe lead met afspraak. Beantwoord vanuit WhatsApp of laat de AI documenten sturen ter voorbereiding.', f: ['Realtime push', 'Twee-weg communicatie', 'AI-gestuurde document-templates'] },
    { i: 'doc', n: 'Document Automation', setup: '€950', maand: '€30', om: 'Intake-verslagen, offertes en concept-contracten, automatisch gevuld met informatie uit het gesprek. Bespaart 30 tot 60 minuten administratie per nieuwe klant.', f: ['Word en PDF templates', 'Variabelen uit AI-gesprek', 'Mail-bezorging klaar'] },
  ];
  return (
    <section id="bouwblokken" className="py-28 bg-ink text-paper relative overflow-hidden noise">
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-30" style={{background: 'radial-gradient(circle, rgba(200,255,77,0.5), transparent 65%)', filter: 'blur(80px)'}}></div>
      <div className="relative max-w-[1320px] mx-auto px-8">
        <div className="grid lg:grid-cols-12 gap-10 mb-14">
          <div className="lg:col-span-6">
            <div className="tag lime mb-4">/ 02 · Wat je krijgt</div>
            <h2 className="display text-[68px]">
              Vier bouwblokken. <em className="italic lime">Eén</em> controlekamer.
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 flex items-end">
            <p className="text-[16px] text-paper/70 leading-relaxed">
              Schakel zelf in en uit vanuit je dashboard. Combineer naar wens. Wij zorgen dat alles werkt, jij oogst de waarde.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-px bg-white/10 border border-white/10">
          {blocks.map((b, i) => (
            <div key={i} className="bg-ink p-9 group cursor-default relative">
              <div className="absolute top-0 right-0 mono text-[10px] text-paper/30 p-3">0{i+1} / 04</div>
              <div className="flex items-start gap-5 mb-6">
                <div className="w-12 h-12 bg-lime text-ink flex items-center justify-center flex-shrink-0">
                  <Icon name={b.i} className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="serif text-[34px] leading-tight mb-1">{b.n}</h3>
                </div>
                <div className="text-right">
                  <div className="mono text-[10px] text-paper/40">SETUP</div>
                  <div className="serif text-[22px]">{b.setup}</div>
                  <div className="mono text-[10px] text-paper/40 mt-1.5">PER MAAND</div>
                  <div className="serif text-[18px] lime">{b.maand}</div>
                </div>
              </div>
              <p className="text-paper/70 leading-relaxed text-[15px] mb-5">{b.om}</p>
              <ul className="space-y-2 border-t border-white/10 pt-4">
                {b.f.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-[13.5px]">
                    <Icon name="check" className="w-3.5 h-3.5 lime flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 p-7 border border-white/10 bg-white/[0.03] flex flex-col lg:flex-row items-start lg:items-center gap-6 justify-between">
          <div>
            <div className="tag lime mb-2">/ Standaard bij elk pakket</div>
            <h3 className="serif text-[26px] leading-tight">Klant-dashboard met feature-toggles</h3>
            <p className="text-paper/60 text-[14px] mt-2 max-w-xl leading-relaxed">Schakel zelf bouwblokken in en uit, beheer je kennisbank, review content, en zie precies wat MarketGrow voor je doet. €35 per maand voor hosting, monitoring en support.</p>
          </div>
          <a href="#intake" className="group bg-lime text-ink px-6 py-3.5 text-[14px] font-medium inline-flex items-center gap-2 hover:brightness-95 transition flex-shrink-0">
            Plan een intake <span className="hover-arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  );
};

Object.assign(window, { Nav, Hero, Marquee, Probleem, Bouwblokken });
