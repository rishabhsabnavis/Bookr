import { useState, useEffect } from 'react';
import { EqBars } from '../../components/primitives/EqBars';
import { LiveDot } from '../../components/primitives/LiveDot';
import { Mono } from '../../components/primitives/Mono';
import type { SoundcheckData } from '../../types/soundcheck';

type CallStatus = 'queued' | 'dialing' | 'connected' | 'voicemail' | 'hold';

interface Props {
  data: SoundcheckData;
  onBack: () => void;
}

const SEED_VENUES = [
  { name: 'Elsewhere',     city: 'Brooklyn' },
  { name: 'Good Room',     city: 'Brooklyn' },
  { name: 'House of Yes',  city: 'Brooklyn' },
  { name: 'Nowadays',      city: 'Brooklyn' },
  { name: 'Public Records',city: 'Brooklyn' },
  { name: 'Mansions',      city: 'Los Angeles' },
];

const FLOW: Record<CallStatus, CallStatus> = {
  queued: 'dialing', dialing: 'connected', connected: 'voicemail', voicemail: 'queued', hold: 'queued',
};

const STATUS_STYLE: Record<CallStatus, { c: string; bg: string; label: string }> = {
  queued:    { c: 'var(--muted)',   bg: 'var(--inset)',       label: 'QUEUED' },
  dialing:   { c: 'var(--accent)',  bg: 'var(--accent-soft)', label: 'DIALING' },
  connected: { c: '#3FBF7F',        bg: 'rgba(63,191,127,0.14)', label: 'ON CALL' },
  hold:      { c: 'var(--accent)',  bg: 'var(--accent-soft)', label: 'HOLD · NEEDS YOU' },
  voicemail: { c: 'var(--muted)',   bg: 'var(--inset)',       label: 'VOICEMAIL' },
};

export function LaunchScreen({ data, onBack }: Props) {
  const cities = data.cities.length ? data.cities : ['Brooklyn'];
  const target = 18 + data.venues.length * 4 + data.cities.length * 3;

  const [matched, setMatched] = useState(0);
  const [statuses, setStatuses] = useState<CallStatus[]>(SEED_VENUES.map(() => 'queued'));

  useEffect(() => {
    const iv = setInterval(() => setMatched((m) => m < target ? Math.min(target, m + Math.ceil(target / 22)) : m), 60);
    return () => clearInterval(iv);
  }, [target]);

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      setStatuses((prev) => {
        const next = [...prev];
        const idx = i % next.length;
        next[idx] = FLOW[next[idx]];
        i++;
        return next;
      });
    }, 900);
    return () => clearInterval(iv);
  }, []);

  const inFlight = statuses.filter((s) => s === 'dialing' || s === 'connected').length;
  const holds    = statuses.filter((s) => s === 'hold').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', color: 'var(--ink)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6vh 24px 60px' }}>
      <div style={{ width: '100%', maxWidth: 720 }}>

        {/* hero */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 84, height: 84, borderRadius: 24, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 26, animation: 'bookrPulse 2s ease-out infinite' }}>
            <EqBars bars={5} color="var(--on-accent)" h={34} w={4} gap={4} />
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <LiveDot /><Mono style={{ color: 'var(--accent)', fontWeight: 600 }}>CAMPAIGN LIVE</Mono>
          </div>
          <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em' }}>
            The agent is calling for you
          </h1>
          <p style={{ margin: '12px 0 0', fontSize: 16, color: 'var(--muted)', maxWidth: 460, lineHeight: 1.55 }}>
            {data.name || 'Your profile'} is live. Bookr is dialing venues across {cities.slice(0, 3).join(', ')} and will ping you the moment a room puts a date on hold.
          </p>
        </div>

        {/* stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, margin: '34px 0 24px' }}>
          {[
            { n: matched,  l: 'VENUES MATCHED' },
            { n: inFlight, l: 'CALLS IN FLIGHT' },
            { n: holds,    l: 'HOLDS FOR YOU', accent: holds > 0 },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: '18px 20px', textAlign: 'center' }}>
              <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 30, fontWeight: 700, color: s.accent ? 'var(--accent)' : 'var(--ink)' }}>{s.n}</div>
              <Mono style={{ color: 'var(--muted)', marginTop: 4, display: 'block' }}>{s.l}</Mono>
            </div>
          ))}
        </div>

        {/* live queue */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Mono style={{ color: 'var(--muted)', letterSpacing: '0.12em' }}>LIVE CALL QUEUE</Mono>
            <EqBars bars={6} color="var(--accent)" h={16} w={2.5} gap={2.5} />
          </div>
          {SEED_VENUES.map((v, i) => {
            const s = STATUS_STYLE[statuses[i]];
            const active = statuses[i] === 'dialing' || statuses[i] === 'connected';
            return (
              <div key={i} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: i < SEED_VENUES.length - 1 ? '1px solid var(--line2)' : 'none' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--inset)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 34px' }}>
                  {active
                    ? <EqBars bars={3} color="var(--accent)" h={14} w={2} gap={2} seed={i} />
                    : <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>{v.name[0]}</span>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{v.name}</div>
                  <Mono style={{ color: 'var(--muted)' }}>{v.city.toUpperCase()}</Mono>
                </div>
                <span style={{ padding: '5px 11px', borderRadius: 999, background: s.bg, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {active && <LiveDot color={s.c} size={6} />}
                  <Mono style={{ color: s.c, fontWeight: 600 }}>{s.label}</Mono>
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 26 }}>
          <button onClick={onBack} style={{ padding: '12px 22px', borderRadius: 14, border: '1px solid var(--line)', background: 'transparent', color: 'var(--ink2)', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            ← Edit profile
          </button>
        </div>
      </div>
    </div>
  );
}
