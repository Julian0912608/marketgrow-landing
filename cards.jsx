// V3 Marko — inline rich cards used within the conversation

const Icon = ({ name, className = 'w-4 h-4' }) => {
  const p = {
    'arrow-right': <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    'check': <polyline points="20 6 9 17 4 12"/>,
    'send': <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    'msg': <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>,
    'pen': <><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></>,
    'wa': <><circle cx="12" cy="12" r="9"/><path d="M8 12c0 2.2 1.8 4 4 4s4-1.8 4-4"/></>,
    'doc': <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    'sparkle': <><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></>,
    'shield': <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    'clock': <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    'cal': <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  };
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {p[name] || <circle cx="12" cy="12" r="10"/>}
    </svg>
  );
};

const ModulesCard = () => {
  const blocks = [
    { i: 'msg', n: 'AI-Gespreksgids', setup: '€1.950', maand: '€75', d: 'Chat op je site die bezoekers kwalificeert en in je agenda zet. 24/7, met jouw merk.' },
    { i: 'pen', n: 'Content-Engine', setup: '€1.250', maand: '€95', d: 'Blogs en posts in jouw stem, jij accepteert of wijzigt. SEO en GEO geoptimaliseerd.' },
    { i: 'wa', n: 'WhatsApp Notificaties', setup: '€1.000', maand: '€25', d: 'Realtime push bij nieuwe leads. Twee-weg chat vanuit WhatsApp.' },
    { i: 'doc', n: 'Document Automation', setup: '€950', maand: '€30', d: 'Intake-verslagen en offertes automatisch gevuld uit het gesprek.' },
  ];
  return (
    <div className="card p-7 fade-up">
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <div className="tag text-mute mb-1">/ vier bouwblokken</div>
          <h3 className="display text-[28px]">Modulair, los inschakelbaar.</h3>
        </div>
        <div className="text-right">
          <div className="tag text-mute">één dashboard</div>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-px bg-line border border-line">
        {blocks.map(b => (
          <div key={b.n} className="bg-white p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 bg-olive text-paper flex items-center justify-center rounded-full">
                <Icon name={b.i} className="w-4 h-4" />
              </div>
              <div className="text-right">
                <div className="tag text-soft" style={{fontSize: 10}}>SETUP</div>
                <div className="serif text-[17px] leading-none">{b.setup}</div>
                <div className="tag text-soft mt-1" style={{fontSize: 10}}>P/MND</div>
                <div className="serif text-[14px] leading-none text-olive">{b.maand}</div>
              </div>
            </div>
            <div className="serif text-[22px] leading-tight mt-1">{b.n}</div>
            <div className="text-[13.5px] text-mute leading-snug">{b.d}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-[12.5px] text-mute flex items-center gap-2">
        <Icon name="check" className="w-3.5 h-3.5 text-olive" />
        Klant-dashboard staat standaard aan. €35/mnd voor hosting, monitoring en support.
      </div>
    </div>
  );
};

const PricingCard = () => {
  const plans = [
    { n: 'Instap', setup: 1950, maand: 110, hi: false, d: 'Eén feature, één doel.', f: ['AI-Gespreksgids', '500 gesprekken/mnd', 'Cal.com koppeling'] },
    { n: 'Groei', setup: 3200, maand: 205, hi: true, d: 'Meest gekozen.', f: ['Alles uit Instap', 'Content-Engine', '8 publicaties/mnd'] },
    { n: 'Compleet', setup: 5150, maand: 260, hi: false, d: 'Volledige ontzorging.', f: ['Alles uit Groei', 'WhatsApp Notificaties', 'Document Automation'] },
  ];
  return (
    <div className="fade-up">
      <div className="grid sm:grid-cols-3 gap-px bg-line border border-line card">
        {plans.map(p => (
          <div key={p.n} className={`p-5 relative ${p.hi ? 'bg-ink text-paper' : 'bg-white'}`}>
            {p.hi && <div className="absolute -top-2.5 left-5 bg-lime text-ink tag px-2 py-0.5" style={{fontSize: 9.5}}>★ MEEST GEKOZEN</div>}
            <div className={`tag mb-1 ${p.hi ? 'text-lime' : 'text-mute'}`}>{p.n.toUpperCase()}</div>
            <div className={`text-[12.5px] mb-4 ${p.hi ? 'text-paper/70' : 'text-mute'}`}>{p.d}</div>
            <div className="mb-4">
              <div className="serif text-[34px] leading-none">€{p.setup}</div>
              <div className={`text-[11.5px] ${p.hi ? 'text-paper/60' : 'text-mute'}`}>setup, eenmalig</div>
              <div className="serif text-[20px] leading-none mt-2">€{p.maand}<span className={`text-[11.5px] ml-1 ${p.hi ? 'text-paper/60' : 'text-mute'}`}>/mnd</span></div>
            </div>
            <ul className="space-y-1.5">
              {p.f.map(f => (
                <li key={f} className="flex items-start gap-2 text-[12.5px]">
                  <Icon name="check" className={`w-3 h-3 mt-1 flex-shrink-0 ${p.hi ? 'text-lime' : 'text-olive'}`} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-3 text-[12.5px] text-mute flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="inline-flex items-center gap-1.5"><Icon name="shield" className="w-3.5 h-3.5 text-olive" /> 30 dagen geld terug</span>
        <span className="inline-flex items-center gap-1.5"><Icon name="clock" className="w-3.5 h-3.5 text-olive" /> 1 maand minimum, geen jaarcontract</span>
        <span className="inline-flex items-center gap-1.5"><Icon name="sparkle" className="w-3.5 h-3.5 text-olive" /> Tokens transparant doorbelast</span>
      </div>
    </div>
  );
};

const ProcessCard = () => {
  const steps = [
    { d: 'Dag 1', t: 'Intake (30 min)', s: 'We bespreken bedrijf, doelgroep, passende modules.' },
    { d: 'Dag 2-3', t: 'Onboarding', s: 'AI-agents lezen je site, bouwen kennisbank, jij reviewt.' },
    { d: 'Dag 4-5', t: 'Brand & koppeling', s: 'Jouw kleuren en toon. Agenda en (optioneel) WhatsApp.' },
    { d: 'Dag 6', t: 'Quality-check', s: '25+ testgesprekken om hallucinaties op te sporen.' },
    { d: 'Dag 7', t: 'Live', s: 'Een regel script op je site. Leads stromen binnen.' },
  ];
  return (
    <div className="card p-6 fade-up">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="tag text-mute mb-1">/ zeven werkdagen</div>
          <h3 className="display text-[28px]">Intake op maandag, live op dinsdag erop.</h3>
        </div>
      </div>
      <div className="border-l-2 border-olive ml-1 space-y-3">
        {steps.map((s, i) => (
          <div key={i} className="flex items-baseline gap-4 pl-5 relative">
            <span className="absolute -left-[6.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-olive border-2 border-paper"></span>
            <span className="tag text-soft w-16 flex-shrink-0">{s.d}</span>
            <span className="serif text-[18px] flex-1">{s.t}</span>
            <span className="text-[13px] text-mute hidden sm:block flex-1">{s.s}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-px bg-line border border-line">
        {[
          { v: '7', l: 'werkdagen' },
          { v: '€0', l: 'verborgen kosten' },
          { v: '24/7', l: 'online' },
          { v: '30d', l: 'geld terug' },
        ].map(c => (
          <div key={c.l} className="bg-white p-3 text-center">
            <div className="serif text-[28px] leading-none">{c.v}</div>
            <div className="text-[11px] text-mute mt-1">{c.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PatroonCard = () => (
  <div className="card-ink card p-7 fade-up relative">
    <div className="relative">
      <div className="tag text-lime mb-3">/ wat ons uniek maakt</div>
      <h3 className="display text-[28px] mb-4">Een platform dat <em className="italic text-lime">leert</em>, niet alleen werkt.</h3>
      <p className="text-[14.5px] text-paper/75 leading-relaxed mb-5">
        Na elke go-live houden we een retrospectief. Wat werkte, wat moest worden bijgesteld? Die leerpunten loggen we per sector. Klant 6 in jouw vak profiteert direct van wat we leerden bij klant 1 tot 5.
      </p>
      <div className="border border-white/15 p-4 bg-white/[0.04]">
        <div className="tag text-lime mb-2" style={{fontSize: 10}}>PATROON · JURISTEN</div>
        <div className="serif text-[19px] leading-snug">
          Bij <span className="text-lime">urgentie-signaal</span> converteert <em className="italic">78%</em> van bezoekers naar intake-afspraak.
        </div>
        <div className="mono text-[10.5px] text-paper/40 mt-2">5 retrospectieven · 87 gesprekken</div>
      </div>
    </div>
  </div>
);

const IntakeCard = () => (
  <div className="card-ink card p-8 fade-up relative">
    <div className="relative">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-lime flex items-center justify-center text-ink">
          <Icon name="cal" className="w-5 h-5" />
        </div>
        <div>
          <div className="tag text-lime">/ ready when you are</div>
          <div className="serif text-[18px]">Plan een gesprek van 20 minuten</div>
        </div>
      </div>
      <p className="text-[14.5px] text-paper/75 leading-relaxed mb-6 max-w-md">
        Geen pitch, geen druk. Vertel wat je doet en wat haperend werkt. Wij vertellen eerlijk of MarketGrow past en wat het kost.
      </p>
      <div className="grid sm:grid-cols-3 gap-2 mb-5">
        {[
          ['Di 28 mei', '14:00'],
          ['Wo 29 mei', '10:30'],
          ['Wo 29 mei', '15:00'],
          ['Do 30 mei', '09:00'],
          ['Vr 31 mei', '11:30'],
          ['Vr 31 mei', '14:30'],
        ].map(([d, t], i) => (
          <a key={i} href={window.CAL_COM_URL || '#'} target="_blank" rel="noopener" className="bg-white/[0.06] hover:bg-lime hover:text-ink border border-white/15 p-3 text-center transition group">
            <div className="tag text-paper/60 group-hover:text-ink/70" style={{fontSize: 10}}>{d}</div>
            <div className="serif text-[20px] mt-0.5">{t}</div>
          </a>
        ))}
      </div>
      <a href={window.CAL_COM_URL || '#'} target="_blank" rel="noopener" className="group inline-flex items-center gap-2 text-lime text-[13.5px] hover:underline">
        Zie alle beschikbare tijden in mijn agenda <span className="hover-arrow">→</span>
      </a>
    </div>
  </div>
);

const FaqCard = ({ items }) => (
  <div className="card fade-up">
    {items.map((q, i) => (
      <details key={i} className="border-b border-line last:border-0" open={i === 0}>
        <summary className="flex items-start justify-between gap-4 p-5 cursor-pointer hover:bg-paper2/40">
          <h4 className="serif text-[17px] leading-snug">{q.q}</h4>
          <span className="text-soft text-[18px] mt-0.5">+</span>
        </summary>
        <div className="px-5 pb-5 text-[13.5px] text-mute leading-relaxed">{q.a}</div>
      </details>
    ))}
  </div>
);

Object.assign(window, { Icon, ModulesCard, PricingCard, ProcessCard, PatroonCard, IntakeCard, FaqCard });
