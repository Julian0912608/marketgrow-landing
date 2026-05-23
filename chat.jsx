// Marko chat demo (scripted, no API). Used in V1 Aurora.
const { useState, useEffect, useRef } = React;

const CAL_COM_URL = 'https://cal.com/julian-goote-c4pgqu/gratis-intake';
window.CAL_COM_URL = CAL_COM_URL;

const Icon = ({ name, className = 'w-4 h-4' }) => {
  const p = {
    'arrow-right': <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    'arrow-up-right': <><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></>,
    'check': <polyline points="20 6 9 17 4 12"/>,
    'plus': <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    'send': <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    'sparkle': <><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></>,
    'zap': <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
    'shield': <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    'clock': <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    'doc': <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    'pen': <><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></>,
    'msg': <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>,
  };
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {p[name] || <circle cx="12" cy="12" r="10"/>}
    </svg>
  );
};

// Scripted conversation that mimics the real Marko intake flow.
const SCRIPT = [
  { role: 'user', content: 'Ik ben jurist, gespecialiseerd in arbeidsrecht.' },
  { role: 'assistant', content: 'Mooi. Werk je vooral met particulieren of zakelijke klanten?', delay: 1100 },
  { role: 'user', content: 'Mix. Zo\u2019n 70% MKB werkgevers, 30% werknemers met een conflict.' },
  { role: 'assistant', content: 'Helder. En waar lopen mensen meestal vast voordat ze jou bellen? Vaak iets met een ontslagprocedure, transitievergoeding, of iets anders?', delay: 1400 },
  { role: 'user', content: 'Vooral ontslag op staande voet en vaststellingsovereenkomsten.' },
  { role: 'assistant', content: 'Top. Voor dat soort zaken is timing cruciaal. Veel mensen wachten te lang en verspelen rechten. Wil je dat ik je vertel hoe we daar een eerste filter voor inbouwen op je website? Dan plan ik direct een korte intake.', delay: 1600, intake: true },
];

const ChatDemo = ({ tone = 'light' }) => {
  const dark = tone === 'dark';
  const [msgs, setMsgs] = useState([
    { role: 'assistant', content: 'Hoi, ik ben Marko, de AI-gids van MarketGrow. Wat doe je voor werk?' },
  ]);
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [showCal, setShowCal] = useState(false);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, typing, showCal]);

  // Auto-advance through the script: every ~3.8s push next pair.
  useEffect(() => {
    if (step >= SCRIPT.length) return;
    const next = SCRIPT[step];
    let t1, t2;
    if (next.role === 'user') {
      // Type out the user message char by char.
      t1 = setTimeout(() => {
        let i = 0;
        const full = next.content;
        const tick = () => {
          i += Math.max(1, Math.round(full.length / 22));
          setDraft(full.slice(0, Math.min(i, full.length)));
          if (i < full.length) {
            t2 = setTimeout(tick, 50);
          } else {
            setTimeout(() => {
              setMsgs(m => [...m, { role: 'user', content: full }]);
              setDraft('');
              setStep(s => s + 1);
            }, 380);
          }
        };
        tick();
      }, 700);
    } else {
      // assistant: typing indicator, then reveal.
      t1 = setTimeout(() => setTyping(true), 250);
      t2 = setTimeout(() => {
        setTyping(false);
        setMsgs(m => [...m, { role: 'assistant', content: next.content }]);
        if (next.intake) setTimeout(() => setShowCal(true), 600);
        setStep(s => s + 1);
      }, next.delay || 1200);
    }
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [step]);

  const reset = () => {
    setMsgs([{ role: 'assistant', content: 'Hoi, ik ben Marko, de AI-gids van MarketGrow. Wat doe je voor werk?' }]);
    setStep(0); setTyping(false); setShowCal(false); setDraft('');
  };

  const surface = dark ? 'bg-[#0E1112] text-[#F6F4EE]' : 'bg-paper text-ink';
  const header = dark ? 'border-b border-white/10 bg-[#1A1E20]' : 'border-b border-line bg-paper-2';
  const bubbleA = dark ? 'bg-white/[0.06] text-[#F6F4EE]' : 'bg-paper-2 text-ink';
  const bubbleU = dark ? 'bg-lime text-ink' : 'bg-ink text-paper';
  const inputBg = dark ? 'bg-white/[0.06] border-white/10 text-[#F6F4EE] placeholder-white/40' : 'bg-paper-2 border-line text-ink placeholder-stone-400';

  return (
    <div className={`${surface} w-full max-w-[460px] flex flex-col h-[560px] glow-lime relative`}>
      {/* header */}
      <div className={`${header} px-5 py-3.5 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-olive text-paper flex items-center justify-center text-xs font-medium serif text-base">M</div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-lime rounded-full border-2 border-paper-2"></div>
          </div>
          <div>
            <div className="text-sm font-medium leading-tight">Marko</div>
            <div className="text-[11px] mute mono leading-tight">ai gids · jouw site</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="tag" style={{color: dark ? '#C8FF4D' : '#3F4A2E'}}>● LIVE</span>
          <button onClick={reset} className={`tag opacity-60 hover:opacity-100`}>RESTART</button>
        </div>
      </div>

      {/* body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3.5">
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''} float-up`}>
            {m.role === 'assistant' && (
              <div className="w-6 h-6 bg-olive text-paper flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 serif">M</div>
            )}
            <div className={`max-w-[82%] px-3.5 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap ${m.role === 'assistant' ? bubbleA : bubbleU}`}>
              {m.content}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-2.5 float-up">
            <div className="w-6 h-6 bg-olive text-paper flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 serif">M</div>
            <div className={`${bubbleA} px-4 py-3 flex gap-1 items-center`}>
              <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{background: dark ? '#9aa' : '#6A6D70'}}></span>
              <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{background: dark ? '#9aa' : '#6A6D70'}}></span>
              <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{background: dark ? '#9aa' : '#6A6D70'}}></span>
            </div>
          </div>
        )}
        {showCal && (
          <div className="float-up bg-ink text-paper p-4 ml-8 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full" style={{background: 'radial-gradient(circle, rgba(200,255,77,0.4), transparent 70%)'}}></div>
            <div className="tag lime mb-2">→ INTAKE READY</div>
            <div className="text-sm mb-1">Plan een gesprek van 20 minuten.</div>
            <div className="text-xs mute mb-3">Gratis, vrijblijvend, geen pitch.</div>
            <a href="#intake" className="block bg-lime text-ink text-sm font-medium py-2.5 text-center hover:brightness-95 transition">
              Kies een tijd →
            </a>
          </div>
        )}
      </div>

      {/* input */}
      <div className={`${dark ? 'border-t border-white/10' : 'border-t border-line'} p-3 flex gap-2`}>
        <div className={`flex-1 ${inputBg} border px-3 py-2 text-[13px] flex items-center`}>
          <span>{draft || (step >= SCRIPT.length ? '' : '')}</span>
          {(draft || step < SCRIPT.length) && <span className="cursor ml-0.5 w-[7px] h-[14px] inline-block" style={{background: dark ? '#C8FF4D' : '#0E1112'}}></span>}
          {!draft && step >= SCRIPT.length && <span className="mute text-[13px]">Marko is klaar. Druk RESTART.</span>}
        </div>
        <button className={`${dark ? 'bg-lime text-ink' : 'bg-ink text-paper'} px-4 hover:brightness-95 flex items-center`}>
          <Icon name="send" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

Object.assign(window, { Icon, ChatDemo });
