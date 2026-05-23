// V3 Marko — the conversation IS the landing.
const { useState, useEffect, useRef, useCallback } = React;

const CAL_COM_URL = 'https://cal.com/julian-goote-c4pgqu/gratis-intake';
window.CAL_COM_URL = CAL_COM_URL;

// === conversation content ===
const PROFESSIONS = [
  { key: 'jurist', label: 'Jurist', context: 'arbeidsrecht- en familierecht-praktijken', insight: 'bezoekers vaak in een acute, emotionele situatie' },
  { key: 'accountant', label: 'Accountant', context: 'mkb-accountantskantoren', insight: 'bezoekers zoeken vaak naar fiscale duidelijkheid bij een verandering' },
  { key: 'mediator', label: 'Mediator', context: 'mediation-praktijken', insight: 'beide partijen moeten zich gehoord voelen, ook in een chat' },
  { key: 'adviseur', label: 'Hypotheek- of financieel adviseur', context: 'adviseurs', insight: 'urgentie is hoog, vergelijking is constant' },
  { key: 'coach', label: 'Coach of therapeut', context: 'praktijken', insight: 'mensen aarzelen, vertrouwen is alles' },
  { key: 'anders', label: 'Iets anders', context: 'dienstverleners', insight: 'jij begeleidt klanten naar een beslissing, en de eerste indruk telt' },
];

const TOPICS = {
  modules: {
    label: 'Wat krijg ik precies?',
    chipLabel: 'Welke modules zijn er?',
    text: ({first}) => first
      ? "Er zijn vier bouwblokken. Marko zelf is er één van. Je begint met wat je nu nodig hebt en schakelt later modules bij vanuit je dashboard."
      : "Hier nog eens de modules op een rij, voor de zekerheid.",
    Card: () => <ModulesCard />,
  },
  process: {
    label: 'Hoe werkt het?',
    chipLabel: 'Hoe werkt het in 7 dagen?',
    text: ({first}) => first
      ? "Korte versie: intake op maandag, live op dinsdag erop. We werken niet met offertes die weken duren of onderhandelingen over scope. Wel met AI-agents intern die ons werk versnellen."
      : "Het 7-dagen proces, voor de duidelijkheid:",
    Card: () => <ProcessCard />,
  },
  pricing: {
    label: 'Wat kost het?',
    chipLabel: 'Wat kost het?',
    text: ({first}) => first
      ? "Drie veelgekozen pakketten. Maar elk bouwblok kan los, en je switcht later vanuit je dashboard. Geen verborgen kosten. Tokens tot 500 gesprekken per maand zit erin."
      : "De drie pakketten:",
    Card: () => <PricingCard />,
  },
  patroon: {
    label: 'Wat maakt jullie anders?',
    chipLabel: 'Wat maakt jullie anders?',
    text: ({first}) => first
      ? "Eerlijk antwoord: na elke go-live houden we een retrospectief. Wat werkte, wat moest worden bijgesteld. Die patronen loggen we per sector. Klant 6 in jouw vak profiteert van wat we leerden bij klant 1 tot 5."
      : "Het patroon, samengevat:",
    Card: () => <PatroonCard />,
  },
  faq: {
    label: 'Heb je ergens twijfels over?',
    chipLabel: 'Wat als ik tegen problemen aanloop?',
    text: ({first}) => first
      ? "Goed dat je doorvraagt. Hier zijn de vragen die het vaakst komen. Klik om antwoord."
      : "Nog meer vragen die we vaak krijgen:",
    Card: () => <FaqCard items={[
      { q: 'Moet ik mijn website verhuizen?', a: 'Nee. Je houdt je site en hostingpartij. Wij voegen via één regel script of een DNS-koppeling een laag toe. Werkt op WordPress, Webflow, Squarespace, custom HTML.' },
      { q: 'Wat als de AI iets verkeerd zegt?', a: 'Voor go-live voert onze Quality-Check-Agent 25+ testgesprekken om hallucinaties op te sporen. Bij twijfelgevallen schakelt de AI altijd door naar een gratis intake met jou, in plaats van zelf juridische of medische antwoorden te geven.' },
      { q: 'Wie betaalt de Claude API-kosten?', a: 'Wij. Tot 500 gesprekken per maand zit in je vaste maandfee. Daarboven €0,10 per gesprek, met alert bij 80%. Geen API-account, geen keys.' },
      { q: 'Wat gebeurt er als ik opzeg?', a: 'Je krijgt een export van alle data. Je kunt het systeem zelf overnemen tegen kostprijs (€750), of wij doen een nette takedown binnen 4 weken. Niets wordt geblokkeerd.' },
    ]} />,
  },
  intake: {
    label: 'Plan een intake',
    chipLabel: 'Plan een intake →',
    text: () => "Mooi. Geen pitch, geen druk. Hieronder vind je tijden van deze week. Twintig minuten, online via Google Meet. Aan het einde weet je of MarketGrow past en wat het zou kosten voor jouw bedrijf.",
    Card: () => <IntakeCard />,
    final: true,
  },
};

const TOPIC_ORDER = ['modules', 'process', 'pricing', 'patroon', 'faq', 'intake'];

// === sub-components ===
const Brand = ({ light }) => (
  <a href="#" className="flex items-center gap-2.5">
    <div className="w-7 h-7 bg-olive text-paper flex items-center justify-center rounded-full">
      <span className="serif text-[16px] leading-none">M</span>
    </div>
    <div className="flex items-baseline gap-0.5">
      <span className="serif text-[22px] leading-none">MarketGrow</span>
      <span className="serif text-[22px] text-olive leading-none">.ai</span>
    </div>
  </a>
);

const ProgressRail = ({ seen }) => (
  <div className="rail" aria-label={`Voortgang: ${seen.size} van ${TOPIC_ORDER.length} onderwerpen`}>
    {TOPIC_ORDER.map(k => (
      <div key={k} className={`rail-dot ${seen.has(k) ? 'done' : ''}`} title={TOPICS[k].label}></div>
    ))}
  </div>
);

const TopBar = ({ seen }) => (
  <div className="topbar">
    <div className="max-w-[1100px] mx-auto px-6 py-4 flex items-center justify-between gap-6">
      <Brand />
      <div className="hidden md:flex flex-col items-center gap-1.5">
        <div className="tag text-soft">in gesprek met marko</div>
        <ProgressRail seen={seen} />
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline-flex chip" style={{padding: '5px 11px', fontSize: 11}}>
          <span className="relative inline-block w-1.5 h-1.5">
            <span className="absolute inset-0 bg-lime rounded-full pulse-ring-w"></span>
            <span className="relative inline-block w-1.5 h-1.5 bg-lime rounded-full"></span>
          </span>
          Marko online
        </span>
        <a href="klassiek.html" className="text-[12px] mono text-mute hover:text-ink underline-offset-2 hover:underline">
          liever scrollen ↗
        </a>
      </div>
    </div>
  </div>
);

const TypingBubble = () => (
  <div className="flex items-end gap-3 fade-up">
    <div className="mark"><span>M</span></div>
    <div className="bubble bubble-tight flex gap-1.5 items-center" style={{padding: '14px 18px'}}>
      <span className="typing-dot w-2 h-2 rounded-full bg-soft"></span>
      <span className="typing-dot w-2 h-2 rounded-full bg-soft"></span>
      <span className="typing-dot w-2 h-2 rounded-full bg-soft"></span>
    </div>
  </div>
);

// === main app ===
const App = () => {
  const [turns, setTurns] = useState([]);
  const [chips, setChips] = useState([]);
  const [typing, setTyping] = useState(false);
  const [seen, setSeen] = useState(new Set());
  const [profession, setProfession] = useState(null);
  const [started, setStarted] = useState(false);
  const scrollAnchor = useRef(null);

  // initial Marko message
  useEffect(() => {
    setTurns([{
      role: 'marko',
      hero: true,
      text: 'Hoi, ik ben Marko, de AI-gids van MarketGrow. Geen tour of pitch hier, gewoon een gesprek. Vertel even, wat doe je voor werk?',
    }]);
    setChips(PROFESSIONS.map(p => ({ label: p.label, action: () => pickProfession(p) })));
  }, []);

  useEffect(() => {
    if (scrollAnchor.current) scrollAnchor.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns, typing, chips]);

  const sayMarko = (text, Card, nextChips, opts = {}) => {
    setChips([]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setTurns(t => [...t, { role: 'marko', text, Card, ...opts }]);
      if (nextChips) setChips(nextChips);
    }, opts.delay || 1100);
  };

  const sayUser = (text) => {
    setTurns(t => [...t, { role: 'user', text }]);
    setChips([]);
  };

  const pickProfession = (p) => {
    setProfession(p);
    setStarted(true);
    sayUser(p.label);
    const msg = `Mooi. Bij ${p.context} zijn ${p.insight}. Daar werkt MarketGrow goed. Korte versie: ik leef op je site, antwoord 24/7, kwalificeer mensen en zet alleen de juiste in je agenda. Geen migratie, geen tools die je zelf beheert. Wat wil je eerst weten?`;
    sayMarko(msg, null, makeTopicChips([]));
  };

  const makeTopicChips = (seenSet) => {
    const seenArr = Array.from(seenSet);
    const remaining = TOPIC_ORDER.filter(k => !seenSet.has || !seenArr.includes(k));
    // Pick up to 4 chips, intake always last/primary, prioritise process+modules+pricing first
    const ordered = ['modules', 'process', 'pricing', 'patroon', 'faq', 'intake'].filter(k => remaining.includes(k));
    const picks = ordered.slice(0, 3).concat('intake').filter((k, i, a) => a.indexOf(k) === i);
    return picks.map(k => {
      const t = TOPICS[k];
      const style = k === 'intake' ? 'lime' : (seenSet.size >= 2 && k !== 'intake' ? '' : 'primary');
      return { label: t.chipLabel, primary: k === 'intake', secondary: k !== 'intake', action: () => gotoTopic(k) };
    });
  };

  const gotoTopic = (key) => {
    const t = TOPICS[key];
    sayUser(t.label);
    const wasSeen = seen.has(key);
    const newSeen = new Set([...seen, key]);
    setSeen(newSeen);
    sayMarko(t.text({ first: !wasSeen }), t.Card, t.final ? makeEndChips() : makeTopicChips(newSeen), { delay: 1300 });
  };

  const makeEndChips = () => ([
    { label: 'Stuur me ipv. een mail met info', secondary: true, action: () => { sayUser('Stuur me een mail.'); sayMarko('Helder. Hieronder vind je nog even alle relevante info gebundeld. Of mail Julian direct op hello@marketgrow.ai. Tot snel.', null, []); } },
    { label: 'Ik heb nog een vraag', secondary: true, action: () => gotoTopic('faq') },
  ]);

  // Marko's first hero turn renders differently
  const renderTurn = (turn, i) => {
    if (turn.role === 'user') {
      return (
        <div key={i} className="flex flex-col items-end fade-up">
          <div className="bubble-user serif text-[18px] leading-snug">{turn.text}</div>
        </div>
      );
    }
    if (turn.hero) {
      return (
        <div key={i} className="fade-up">
          <div className="flex items-center gap-4 mb-7">
            <div className="mark mark-lg"><span>M</span></div>
            <div>
              <div className="tag text-mute mb-1">marko · ai-gids</div>
              <div className="flex items-center gap-2 text-[13px] text-mute">
                <span className="relative inline-block w-1.5 h-1.5">
                  <span className="absolute inset-0 bg-lime rounded-full pulse-ring-w"></span>
                  <span className="relative inline-block w-1.5 h-1.5 bg-lime rounded-full"></span>
                </span>
                online · spreekt Nederlands · is een demo van wat MarketGrow op jouw site doet
              </div>
            </div>
          </div>
          <h1 className="display text-[clamp(36px,6vw,68px)] leading-[1.02] mb-6" style={{textWrap: 'pretty'}}>
            Hoi, ik ben <em className="italic text-olive">Marko.</em><br/>
            Geen tour of pitch hier, gewoon een gesprek.
          </h1>
          <p className="serif text-[24px] text-mute leading-snug mb-8 max-w-[640px]" style={{textWrap: 'pretty'}}>
            Vertel even, wat doe je voor werk? Dan stem ik mijn verhaal daarop af.
          </p>
        </div>
      );
    }
    // Regular Marko message
    return (
      <div key={i} className="flex items-start gap-3 fade-up">
        <div className="mark mt-1"><span>M</span></div>
        <div className="flex-1 space-y-4 min-w-0">
          <div className="bubble">
            <p className="text-[16px] leading-relaxed" style={{textWrap: 'pretty'}}>{turn.text}</p>
          </div>
          {turn.Card && <turn.Card />}
        </div>
      </div>
    );
  };

  return (
    <div className="stage">
      <TopBar seen={seen} />
      <main className="relative z-10 max-w-[760px] mx-auto px-6 pt-8 pb-24">
        <div className="space-y-6">
          {turns.map((t, i) => renderTurn(t, i))}
          {typing && <TypingBubble />}
        </div>

        {/* chip row */}
        {chips.length > 0 && !typing && (
          <div className="mt-7 fade-up">
            <div className="text-[12.5px] text-soft mb-2.5 ml-1 tag">/ kies een antwoord</div>
            <div className="chip-row">
              {chips.map((c, i) => (
                <button key={i} onClick={c.action} className={`chip ${c.primary ? 'chip-lime' : (c.secondary ? '' : 'chip-primary')}`}>
                  {c.label}
                  <span className="chip-arrow text-[14px] opacity-70">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={scrollAnchor} className="h-1"></div>

        {/* sticky bottom shelf: always-available intake CTA + restart */}
        <div className="sticky-cta mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <div className="flex items-center gap-3">
              <div className="mark" style={{width: 28, height: 28, fontSize: 16}}><span>M</span></div>
              <div>
                <div className="text-[13px] font-medium leading-tight">Liever direct boeken?</div>
                <div className="text-[12px] text-mute leading-tight">20 minuten, online, vrijblijvend</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href={CAL_COM_URL} target="_blank" rel="noopener" className="chip chip-lime">
                Plan intake <span className="chip-arrow">→</span>
              </a>
              <a href="klassiek.html" className="chip" style={{padding: '8px 12px', fontSize: 12.5}}>
                Of klassiek scrollen
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* tiny footer */}
      <footer className="relative z-10 max-w-[1100px] mx-auto px-6 pb-8 pt-2">
        <div className="flex flex-wrap justify-between items-center gap-3 text-[11.5px] mono text-soft">
          <div>© 2026 marketgrow.ai · Breda</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-ink">voorwaarden</a>
            <a href="#" className="hover:text-ink">privacy</a>
            <a href="mailto:hello@marketgrow.ai" className="hover:text-ink">hello@marketgrow.ai</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
