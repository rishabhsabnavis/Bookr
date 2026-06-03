// Soundcheck — main app shell: stepped wizard, state, persistence, responsive, tweaks.
const { useState, useEffect } = React;

const STEPS = [
  { key: 'identity', label: 'Identity', sub: 'Name, bio, EPK', title: 'Who are you?', desc: 'The basics the agent leads every call with.', Comp: () => window.StepIdentity },
  { key: 'sound', label: 'Your sound', sub: 'Genres, tempo, mixes', title: 'Your sound', desc: 'What you play and at what tempo — this shapes how the agent describes you on every call.', Comp: () => window.StepSound },
  { key: 'targets', label: 'Targets', sub: 'Cities & venues', title: 'Where should we call?', desc: 'Pick the markets and the kinds of rooms worth pitching to.', Comp: () => window.StepTargets },
  { key: 'logistics', label: 'Logistics', sub: 'Dates & rate', title: 'Dates & rate', desc: 'When you can play and what you charge — the agent negotiates inside these.', Comp: () => window.StepLogistics },
];

const DEFAULT_DATA = {
  name: 'DJ Aanya', bio: 'Bollywood-house selector turning weddings into warehouse parties.', epk: 'DJ-Aanya-EPK-2026.pdf',
  genres: ['Afrobeats', 'Amapiano', 'House'], bpmLo: 110, bpmHi: 128,
  mixes: [{ platform: 'SoundCloud', url: 'soundcloud.com/aanya/coachella-gobi' }, { platform: 'Mixcloud', url: 'mixcloud.com/aanya/boiler-room' }],
  cities: ['Brooklyn', 'Los Angeles'], venues: ['Nightclub', 'Bar / Lounge'],
  dates: ['5-5', '5-6'], rate: 1200, pastGigs: '',
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#FC814A",
  "dark": false,
  "density": "comfortable",
  "radius": 14
}/*EDITMODE-END*/;

function useViewport() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return w;
}

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
}

function App() {
  const [t0, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const t = bookrTokens(t0.dark ? 'dark' : 'light', { accent: t0.accent });
  t.r = t0.radius; t.dense = t0.density === 'compact';

  const vw = useViewport();
  const mobile = vw < 900;

  const [step, setStep] = useState(() => load('bookr.step', 0));
  const [data, setData] = useState(() => ({ ...DEFAULT_DATA, ...load('bookr.data', {}) }));
  const [visited, setVisited] = useState(() => load('bookr.visited', [0, 1, 2, 3]));
  const [launched, setLaunched] = useState(() => load('bookr.launched', false));

  useEffect(() => { localStorage.setItem('bookr.step', JSON.stringify(step)); }, [step]);
  useEffect(() => { localStorage.setItem('bookr.data', JSON.stringify(data)); }, [data]);
  useEffect(() => { localStorage.setItem('bookr.visited', JSON.stringify(visited)); }, [visited]);
  useEffect(() => { localStorage.setItem('bookr.launched', JSON.stringify(launched)); }, [launched]);

  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));
  const go = (i) => { setStep(i); setVisited((v) => v.includes(i) ? v : [...v, i]); };
  const next = () => { if (step < STEPS.length - 1) go(step + 1); else setLaunched(true); };
  const back = () => { if (step > 0) setStep(step - 1); };

  // completion heuristic per step
  const done = (i) => {
    const d = data;
    if (i === 0) return !!d.name && !!d.bio;
    if (i === 1) return d.genres.length > 0;
    if (i === 2) return d.cities.length > 0 && d.venues.length > 0;
    if (i === 3) return d.dates.length > 0;
    return false;
  };

  const meta = STEPS[step];
  const StepComp = meta.Comp();

  const Sidebar = (
    <div style={{ width: 304, flex: '0 0 304px', padding: '32px 28px', display: 'flex', flexDirection: 'column', borderRight: `1px solid ${t.line}`, background: t.surface, height: '100%' }}>
      <Brand t={t} />
      <Mono style={{ color: t.muted, marginTop: 38, marginBottom: 16, fontSize: 10.5, letterSpacing: '0.14em' }}>SET UP YOUR PROFILE</Mono>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {STEPS.map((s, i) => {
          const active = i === step, isDone = done(i) && i !== step, reachable = visited.includes(i);
          return (
            <button key={s.key} onClick={() => reachable && go(i)} style={{
              display: 'flex', gap: 13, padding: '12px', borderRadius: Math.max(9, t.r - 3), textAlign: 'left', fontFamily: t.font, cursor: reachable ? 'pointer' : 'default',
              background: active ? (t.dark ? t.surface2 : t.inset) : 'transparent', border: `1px solid ${active ? t.line : 'transparent'}`, opacity: reachable ? 1 : 0.55,
            }}>
              <span style={{
                flex: '0 0 26px', width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: t.mono, fontSize: 11, fontWeight: 600,
                background: isDone ? t.accent : 'transparent', color: isDone ? t.onAccent : active ? t.accent : t.faint,
                border: isDone ? 'none' : `1.5px solid ${active ? t.accent : t.line}`,
              }}>{isDone ? '✓' : String(i + 1).padStart(2, '0')}</span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: active || isDone ? t.ink : t.muted }}>{s.label}</span>
                <span style={{ display: 'block', fontSize: 12, color: t.muted, marginTop: 2 }}>{s.sub}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 'auto', padding: '15px', borderRadius: Math.max(10, t.r - 2), background: t.dark ? t.surface2 : t.inset, border: `1px solid ${t.line2}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LiveDot color={t.accent} /><Mono style={{ color: t.ink2, fontWeight: 600 }}>AGENT STANDING BY</Mono>
        </div>
        <div style={{ fontSize: 12.5, lineHeight: 1.5, color: t.muted, marginTop: 8 }}>
          Bookr uses your sound to pitch the right venues — the better the detail, the sharper the call.
        </div>
      </div>
    </div>
  );

  const TopBar = (
    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${t.line}`, background: t.surface }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Brand t={t} />
        <Mono style={{ color: t.muted }}>{String(step + 1).padStart(2, '0')} / 0{STEPS.length}</Mono>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14, overflowX: 'auto' }}>
        {STEPS.map((s, i) => (
          <button key={s.key} onClick={() => visited.includes(i) && go(i)} style={{
            flex: '0 0 auto', padding: '7px 13px', borderRadius: 999, fontFamily: t.font, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: i === step ? t.accent : 'transparent', color: i === step ? t.onAccent : t.muted, border: `1px solid ${i === step ? t.accent : t.line}`,
          }}>{String(i + 1).padStart(2, '0')} {s.label}</button>
        ))}
      </div>
    </div>
  );

  const tweaks = (
    <TweaksPanel>
      <TweakSection label="Brand" />
      <TweakColor label="Accent" value={t0.accent} options={['#FC814A', '#E0609B', '#2FB6A8', '#6C6CE0']} onChange={(v) => setTweak('accent', v)} />
      <TweakToggle label="Dark mode" value={t0.dark} onChange={(v) => setTweak('dark', v)} />
      <TweakSection label="Layout" />
      <TweakRadio label="Density" value={t0.density} options={['comfortable', 'compact']} onChange={(v) => setTweak('density', v)} />
      <TweakSlider label="Corner radius" value={t0.radius} min={4} max={22} step={1} unit="px" onChange={(v) => setTweak('radius', v)} />
    </TweaksPanel>
  );

  if (launched) {
    return (<div style={{ minHeight: '100vh', background: t.bg }}><LaunchScreen t={t} data={data} onBack={() => setLaunched(false)} />{tweaks}</div>);
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: mobile ? 'column' : 'row', background: t.bg, fontFamily: t.font, color: t.ink, overflow: 'hidden' }}>
      {mobile ? TopBar : Sidebar}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* header */}
        <div style={{ padding: mobile ? '22px 22px 0' : '32px 48px 0' }}>
          {!mobile && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <Mono style={{ color: t.muted, letterSpacing: '0.12em' }}>STEP {String(step + 1).padStart(2, '0')} / 0{STEPS.length}</Mono>
              <div style={{ display: 'flex', gap: 6 }}>
                {STEPS.map((_, i) => <span key={i} style={{ width: i === step ? 30 : 18, height: 5, borderRadius: 5, background: i <= step ? t.accent : t.line, transition: 'all .2s' }} />)}
              </div>
            </div>
          )}
          <h1 style={{ margin: 0, fontSize: mobile ? 26 : 34, fontWeight: 700, letterSpacing: '-0.025em' }}>{meta.title}</h1>
          <p style={{ margin: '10px 0 0', fontSize: mobile ? 14.5 : 15.5, color: t.muted, maxWidth: 540, lineHeight: 1.55 }}>{meta.desc}</p>
        </div>

        {/* body (scrolls) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: mobile ? '24px 22px' : '30px 48px' }}>
          <StepComp t={t} data={data} set={set} />
        </div>

        {/* footer */}
        <div style={{ padding: mobile ? '16px 22px' : '20px 48px', borderTop: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: t.surface, gap: 12 }}>
          <button onClick={back} disabled={step === 0} style={{ padding: '12px 20px', borderRadius: t.r, border: `1px solid ${t.line}`, background: 'transparent', color: step === 0 ? t.faint : t.ink2, fontFamily: t.font, fontSize: 14, fontWeight: 600, cursor: step === 0 ? 'default' : 'pointer', opacity: step === 0 ? 0.5 : 1 }}>Back</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {!mobile && <span style={{ fontSize: 13, color: t.muted, display: 'flex', alignItems: 'center', gap: 7 }}><LiveDot color="#3FBF7F" size={6} />Autosaved</span>}
            <button onClick={next} style={{ padding: '12px 26px', borderRadius: t.r, border: 'none', background: t.accent, color: t.onAccent, fontFamily: t.font, fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {step === STEPS.length - 1 ? 'Launch campaign →' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
      {tweaks}
    </div>
  );
}

function Brand({ t }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EqBars bars={3} color={t.onAccent} h={13} w={2.5} gap={2.5} />
      </div>
      <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', color: t.ink }}>Bookr</span>
    </div>
  );
}

window.BookrApp = App;
