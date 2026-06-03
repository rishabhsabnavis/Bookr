import { useState, useEffect, useRef } from 'react';
import { PanelHead } from '../components/PanelHead';
import { Turn } from '../components/TranscriptThread';
import { GhostBtn } from '../components/buttons';
import { EqBars } from '../components/primitives/EqBars';
import { LiveDot } from '../components/primitives/LiveDot';
import { Mono } from '../components/primitives/Mono';
import { useVW } from '../hooks/useVW';
import { LIVE_CALL } from '../lib/mockData';

const TURNS = LIVE_CALL.transcript;

const PIPELINE = [
  { name: 'Deepgram',      role: 'STT',       activeWhen: 'listening' },
  { name: 'Claude Sonnet', role: 'REASONING',  activeWhen: 'always' },
  { name: 'ElevenLabs',    role: 'TTS',        activeWhen: 'speaking' },
] as const;

export function WatchLive() {
  const vw = useVW();
  const mobile = vw < 900;

  const [shown, setShown] = useState(1);
  const [typed, setTyped] = useState(0);
  const [done, setDone] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const cur = TURNS[shown - 1];
  const speaking = cur && cur.who === 'agent' && typed < cur.text.length;

  // typewriter
  useEffect(() => {
    if (!cur) return;
    if (typed < cur.text.length) {
      const id = setTimeout(
        () => setTyped((n) => n + Math.max(1, Math.round(cur.text.length / 60))),
        cur.who === 'agent' ? 22 : 16,
      );
      return () => clearTimeout(id);
    }
    if (shown < TURNS.length) {
      const id = setTimeout(() => { setShown((s) => s + 1); setTyped(0); }, cur.who === 'agent' ? 700 : 520);
      return () => clearTimeout(id);
    } else {
      const id = setTimeout(() => setDone(true), 600);
      return () => clearTimeout(id);
    }
  }, [typed, shown, cur]);

  // auto-scroll
  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [typed, shown]);

  const restart = () => { setShown(1); setTyped(0); setDone(false); };
  const elapsed = 8 + shown * 14 + Math.round(typed / 6);
  const elapsedFmt = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;

  const visible = TURNS.slice(0, shown).map((turn, i) =>
    i === shown - 1 ? { ...turn, text: turn.text.slice(0, typed) } : turn
  );

  const state = done ? 'HOLD PLACED'
    : speaking ? 'AGENT SPEAKING'
    : cur?.who === 'buyer' ? 'BUYER SPEAKING'
    : 'LISTENING';

  const isPipelineActive = (when: typeof PIPELINE[number]['activeWhen']) => {
    if (done) return false;
    if (when === 'always') return true;
    if (when === 'speaking') return !!speaking;
    if (when === 'listening') return !speaking;
    return false;
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--ink)' }}>
          Watch live
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 14.5, color: 'var(--muted)' }}>
          Listen in as the agent works a call. You can take over at any time.
        </p>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: mobile ? '1fr' : '1fr 300px',
        gap: 16, flex: 1, minHeight: 0,
      }}>

        {/* ── Transcript column ─────────────────────────────────────── */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 14,
          display: 'flex', flexDirection: 'column',
          minHeight: mobile ? 380 : 0,
          boxShadow: '0 8px 22px -16px rgba(36,28,42,0.22)',
          order: mobile ? 2 : 1,
        }}>
          <PanelHead
            title="LIVE TRANSCRIPT"
            live
            right={
              <Mono style={{ color: speaking ? 'var(--accent)' : 'var(--muted)', fontWeight: 600 }}>
                {state}
              </Mono>
            }
          />
          <div
            ref={scroller}
            style={{
              flex: 1, overflowY: 'auto',
              padding: '20px 22px',
              display: 'flex', flexDirection: 'column', gap: 14,
            }}
          >
            {visible.map((turn, i) => (
              <Turn
                key={i}
                turn={turn}
                venue={LIVE_CALL.venue}
                typing={i === shown - 1 && typed < TURNS[i].text.length}
              />
            ))}

            {done && (
              <div style={{
                marginTop: 6, padding: '14px 16px', borderRadius: 14,
                border: '1px solid var(--accent-line)',
                background: 'var(--accent-soft)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  flex: '0 0 34px', width: 34, height: 34, borderRadius: 10,
                  background: 'var(--accent)', color: 'var(--on-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
                    Hold placed — May 28 · $1,400
                  </div>
                  <Mono style={{ color: 'var(--muted)' }}>SENT TO YOUR APPROVAL QUEUE</Mono>
                </div>
                <GhostBtn sm onClick={restart}>Replay</GhostBtn>
              </div>
            )}
          </div>
        </div>

        {/* ── Right column ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, order: mobile ? 1 : 2 }}>

          {/* call card */}
          <div style={{
            background: '#564256',
            borderRadius: 14, padding: '22px 20px',
            color: '#fff',
            boxShadow: '0 8px 22px -16px rgba(36,28,42,0.22)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <LiveDot />
              <Mono style={{ color: 'var(--accent)', fontWeight: 600 }}>
                {done ? 'CALL ENDED' : 'ON CALL'}
              </Mono>
              <Mono style={{ color: 'rgba(255,255,255,0.6)', marginLeft: 'auto' }}>
                {elapsedFmt}
              </Mono>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
              {LIVE_CALL.venue}
            </div>
            <Mono style={{ color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: 5 }}>
              {LIVE_CALL.city.toUpperCase()} · {LIVE_CALL.type.toUpperCase()} · FIT {LIVE_CALL.fit}
            </Mono>
            <Mono style={{ color: 'rgba(255,255,255,0.45)', display: 'block', marginTop: 3 }}>
              {LIVE_CALL.phone}
            </Mono>

            {/* live waveform */}
            <div style={{ marginTop: 20, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EqBars bars={28} color={speaking ? 'var(--accent)' : 'rgba(255,255,255,0.32)'} h={44} w={3} gap={3} idle={!speaking} seed={2} />
            </div>
          </div>

          {/* agent pipeline */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 14, overflow: 'hidden',
            boxShadow: '0 8px 22px -16px rgba(36,28,42,0.22)',
          }}>
            <PanelHead title="AGENT PIPELINE" />
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 11 }}>
              {PIPELINE.map((s) => {
                const active = isPipelineActive(s.activeWhen);
                return (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%', flex: '0 0 7px',
                      background: active ? '#3FBF7F' : 'var(--line)',
                      boxShadow: active ? '0 0 0 3px rgba(63,191,127,0.18)' : 'none',
                      transition: 'background .3s, box-shadow .3s',
                    }} />
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', flex: 1 }}>
                      {s.name}
                    </span>
                    <Mono style={{ color: 'var(--muted)' }}>{s.role}</Mono>
                  </div>
                );
              })}
            </div>
            <div style={{
              padding: '11px 18px',
              borderTop: '1px solid var(--line2)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <Mono style={{ color: 'var(--muted)' }}>END-TO-END</Mono>
              <Mono style={{ color: '#3FBF7F', fontWeight: 600 }}>
                {done ? '—' : '480MS'}
              </Mono>
            </div>
          </div>

          {/* take over */}
          <button
            disabled={done}
            style={{
              padding: 13, borderRadius: 14,
              border: '1px solid var(--line)',
              background: done ? 'var(--surface2)' : 'var(--surface)',
              color: done ? 'var(--faint)' : 'var(--ink)',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: 14, fontWeight: 600,
              cursor: done ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/>
            </svg>
            Take over the call
          </button>
        </div>
      </div>
    </div>
  );
}
