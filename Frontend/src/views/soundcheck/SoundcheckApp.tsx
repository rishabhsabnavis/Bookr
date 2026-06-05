import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { callsClient } from '../../lib/callsClient';
import { Brand } from '../../components/Brand';
import { LiveDot } from '../../components/primitives/LiveDot';
import { Mono } from '../../components/primitives/Mono';
import { StepIdentity } from './StepIdentity';
import { StepSound } from './StepSound';
import { StepTargets } from './StepTargets';
import { StepLogistics } from './StepLogistics';
import { LaunchScreen } from './LaunchScreen';
import { useVW } from '../../hooks/useVW';
import { DEFAULT_DATA } from '../../types/soundcheck';
import type { SoundcheckData } from '../../types/soundcheck';

const STEPS = [
  { key: 'identity',  label: 'Identity',  sub: 'Name, bio, EPK',       title: 'Who are you?',          desc: 'The basics the agent leads every call with.' },
  { key: 'sound',     label: 'Your sound', sub: 'Genres, tempo, mixes', title: 'Your sound',            desc: 'What you play and at what tempo — this shapes how the agent describes you on every call.' },
  { key: 'targets',   label: 'Targets',    sub: 'Cities & venues',      title: 'Where should we call?', desc: 'Pick the markets and the kinds of rooms worth pitching to.' },
  { key: 'logistics', label: 'Logistics',  sub: 'Dates & rate',         title: 'Dates & rate',          desc: 'When you can play and what you charge — the agent negotiates inside these.' },
];

function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function save(key: string, v: unknown) { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }

function isDone(i: number, data: SoundcheckData) {
  if (i === 0) return !!data.name && !!data.bio;
  if (i === 1) return data.genres.length > 0;
  if (i === 2) return data.cities.length > 0 && data.venues.length > 0;
  if (i === 3) return data.dates.length > 0;
  return false;
}

export function SoundcheckApp() {
  const navigate = useNavigate();
  const vw = useVW();
  const mobile = vw < 900;

  const [step, setStep]         = useState(() => load('bookr.step', 0));
  const [data, setData]         = useState<SoundcheckData>(() => ({ ...DEFAULT_DATA, ...load('bookr.data', {}) }));
  const [visited, setVisited]   = useState<number[]>(() => load('bookr.visited', [0]));
  const [launched, setLaunched] = useState(() => load('bookr.launched', false));
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const set = (k: keyof SoundcheckData, v: unknown) => {
    setData((d) => { const next = { ...d, [k]: v }; save('bookr.data', next); return next; });
  };

  const go = (i: number) => {
    setStep(i); save('bookr.step', i);
    setVisited((prev) => { const next = prev.includes(i) ? prev : [...prev, i]; save('bookr.visited', next); return next; });
  };

  const next = async () => {
    if (step < STEPS.length - 1) { go(step + 1); return; }
    setLaunching(true);
    setLaunchError(null);
    try {
      const djId = await callsClient.createDJ(data);
      localStorage.setItem('bookr.dj_id', djId);
      await callsClient.startCampaign(djId, data.cities[0] ?? '', data.venues[0] ?? 'nightclub');
      setLaunched(true);
      save('bookr.launched', true);
    } catch {
      setLaunchError('Launch failed — check your connection and try again.');
    } finally {
      setLaunching(false);
    }
  };
  const back = () => { if (step > 0) go(step - 1); };

  if (launched) {
    return (
      <div data-theme="light">
        <LaunchScreen data={data} onBack={() => { setLaunched(false); save('bookr.launched', false); }} />
      </div>
    );
  }

  const meta = STEPS[step];
  const StepComp = [StepIdentity, StepSound, StepTargets, StepLogistics][step];

  const Sidebar = (
    <div style={{ width: 304, flex: '0 0 304px', padding: '32px 28px', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--line)', background: 'var(--surface)', height: '100%' }}>
      <Brand />
      <Mono style={{ color: 'var(--muted)', marginTop: 38, marginBottom: 16, fontSize: 10.5, letterSpacing: '0.14em', display: 'block' }}>
        SET UP YOUR PROFILE
      </Mono>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {STEPS.map((s, i) => {
          const active = i === step;
          const done = isDone(i, data) && i !== step;
          const reachable = visited.includes(i);
          return (
            <button key={s.key} onClick={() => reachable && go(i)} style={{ display: 'flex', gap: 13, padding: 12, borderRadius: 11, textAlign: 'left', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', cursor: reachable ? 'pointer' : 'default', background: active ? 'var(--inset)' : 'transparent', border: `1px solid ${active ? 'var(--line)' : 'transparent'}`, opacity: reachable ? 1 : 0.55 }}>
              <span style={{ flex: '0 0 26px', width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 11, fontWeight: 600, background: done ? 'var(--accent)' : 'transparent', color: done ? 'var(--on-accent)' : active ? 'var(--accent)' : 'var(--faint)', border: done ? 'none' : `1.5px solid ${active ? 'var(--accent)' : 'var(--line)'}` }}>
                {done ? '✓' : String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: active || done ? 'var(--ink)' : 'var(--muted)' }}>{s.label}</span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{s.sub}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 'auto', padding: 15, borderRadius: 12, background: 'var(--inset)', border: '1px solid var(--line2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LiveDot /><Mono style={{ color: 'var(--ink2)', fontWeight: 600 }}>AGENT STANDING BY</Mono>
        </div>
        <div style={{ fontSize: 12.5, lineHeight: 1.5, color: 'var(--muted)', marginTop: 8 }}>
          Bookr uses your sound to pitch the right venues — the better the detail, the sharper the call.
        </div>
      </div>
    </div>
  );

  const TopBar = (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Brand />
        <Mono style={{ color: 'var(--muted)' }}>{String(step + 1).padStart(2, '0')} / 0{STEPS.length}</Mono>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14, overflowX: 'auto' }}>
        {STEPS.map((s, i) => (
          <button key={s.key} onClick={() => visited.includes(i) && go(i)} style={{ flex: '0 0 auto', padding: '7px 13px', borderRadius: 999, fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: i === step ? 'var(--accent)' : 'transparent', color: i === step ? 'var(--on-accent)' : 'var(--muted)', border: `1px solid ${i === step ? 'var(--accent)' : 'var(--line)'}` }}>
            {String(i + 1).padStart(2, '0')} {s.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div data-theme="light" style={{ height: '100vh', display: 'flex', flexDirection: mobile ? 'column' : 'row', background: 'var(--bg)', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', color: 'var(--ink)', overflow: 'hidden' }}>
      {mobile ? TopBar : Sidebar}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* step header */}
        <div style={{ padding: mobile ? '22px 22px 0' : '32px 48px 0' }}>
          {!mobile && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <Mono style={{ color: 'var(--muted)', letterSpacing: '0.12em' }}>STEP {String(step + 1).padStart(2, '0')} / 0{STEPS.length}</Mono>
              <div style={{ display: 'flex', gap: 6 }}>
                {STEPS.map((_, i) => (
                  <span key={i} style={{ width: i === step ? 30 : 18, height: 5, borderRadius: 5, background: i <= step ? 'var(--accent)' : 'var(--line)', transition: 'all .2s' }} />
                ))}
              </div>
            </div>
          )}
          <h1 style={{ margin: 0, fontSize: mobile ? 26 : 34, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--ink)' }}>{meta.title}</h1>
          <p style={{ margin: '10px 0 0', fontSize: mobile ? 14.5 : 15.5, color: 'var(--muted)', maxWidth: 540, lineHeight: 1.55 }}>{meta.desc}</p>
        </div>

        {/* scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: mobile ? '24px 22px' : '30px 48px' }}>
          <StepComp data={data} set={set} />
        </div>

        {/* footer */}
        <div style={{ padding: mobile ? '16px 22px' : '20px 48px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', gap: 12 }}>
          <button onClick={back} disabled={step === 0} style={{ padding: '12px 20px', borderRadius: 14, border: '1px solid var(--line)', background: 'transparent', color: step === 0 ? 'var(--faint)' : 'var(--ink2)', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: 14, fontWeight: 600, cursor: step === 0 ? 'default' : 'pointer', opacity: step === 0 ? 0.5 : 1 }}>
            Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {!mobile && (
              <span style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 7 }}>
                <LiveDot color="#3FBF7F" size={6} />Autosaved
              </span>
            )}
            {launchError && (
              <span style={{ fontSize: 13, color: '#c0392b' }}>{launchError}</span>
            )}
            <button onClick={next} disabled={launching} style={{ padding: '12px 26px', borderRadius: 14, border: 'none', background: launching ? 'var(--faint)' : 'var(--accent)', color: 'var(--on-accent)', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: 14, fontWeight: 700, cursor: launching ? 'default' : 'pointer', whiteSpace: 'nowrap', opacity: launching ? 0.7 : 1 }}>
              {launching ? 'Launching…' : step === STEPS.length - 1 ? 'Launch campaign →' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>

      {/* back to dashboard link */}
      <button onClick={() => navigate('/')} style={{ position: 'fixed', top: 18, right: 22, border: 'none', background: 'transparent', color: 'var(--muted)', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer', zIndex: 10 }}>
        Dashboard →
      </button>
    </div>
  );
}
