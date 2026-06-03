// Bookr Dashboard — "Watch live" view: streaming transcript + waveform as the
// outbound caller agent works a call in real time.
const { useState: useStateW, useEffect: useEffectW, useRef: useRefW } = React;

function WatchLive({ t, mobile }) {
  const call = window.LIVE_CALL;
  const turns = call.transcript;
  const [shown, setShown] = useStateW(1);      // how many turns revealed
  const [typed, setTyped] = useStateW(0);       // chars typed on the latest turn
  const [done, setDone] = useStateW(false);
  const scroller = useRefW(null);

  const cur = turns[shown - 1];
  const speaking = cur && cur.who === 'agent' && typed < cur.text.length;

  // typewriter reveal
  useEffectW(() => {
    if (!cur) return;
    if (typed < cur.text.length) {
      const speed = cur.who === 'agent' ? 22 : 16;
      const id = setTimeout(() => setTyped((n) => n + Math.max(1, Math.round(cur.text.length / 60))), speed);
      return () => clearTimeout(id);
    }
    // turn finished — advance after a beat
    if (shown < turns.length) {
      const id = setTimeout(() => { setShown((s) => s + 1); setTyped(0); }, cur.who === 'agent' ? 700 : 520);
      return () => clearTimeout(id);
    } else {
      const id = setTimeout(() => setDone(true), 600);
      return () => clearTimeout(id);
    }
  }, [typed, shown, cur]);

  useEffectW(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [typed, shown]);

  const restart = () => { setShown(1); setTyped(0); setDone(false); };
  const elapsed = 8 + shown * 14 + Math.round(typed / 6);

  const visible = turns.slice(0, shown).map((turn, i) =>
    i === shown - 1 ? { ...turn, text: turn.text.slice(0, typed) } : turn);

  const state = done ? 'HOLD PLACED' : speaking ? 'AGENT SPEAKING' : cur && cur.who === 'buyer' ? 'BUYER SPEAKING' : 'LISTENING';

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', color: t.ink }}>Watch live</h1>
        <p style={{ margin: '8px 0 0', fontSize: 14.5, color: t.muted }}>Listen in as the agent works a call. You can take over at any time.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 300px', gap: 16, flex: 1, minHeight: 0 }}>
        {/* transcript column */}
        <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.r, display: 'flex', flexDirection: 'column', minHeight: 0, boxShadow: t.shadowSm, order: mobile ? 2 : 1 }}>
          <PanelHead t={t} title="LIVE TRANSCRIPT" live right={<Mono style={{ color: speaking ? t.accent : t.muted, fontWeight: 600 }}>{state}</Mono>} />
          <div ref={scroller} style={{ flex: 1, overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: mobile ? 320 : 0 }}>
            {visible.map((turn, i) => (
              <Turn key={i} t={t} turn={turn} venue={call.venue} typing={i === shown - 1 && (speaking || (turn.who === 'agent' && typed < turns[i].text.length))} />
            ))}
            {done && (
              <div style={{ marginTop: 6, padding: '14px 16px', borderRadius: t.r, border: `1px solid ${t.accentLine}`, background: t.accentSoft, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: '0 0 34px', width: 34, height: 34, borderRadius: 10, background: t.accent, color: t.onAccent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.ink }}>Hold placed — May 28 · $1,400</div>
                  <Mono style={{ color: t.muted }}>SENT TO YOUR APPROVAL QUEUE</Mono>
                </div>
                <GhostBtn t={t} sm onClick={restart}>Replay</GhostBtn>
              </div>
            )}
          </div>
        </div>

        {/* live panel column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, order: mobile ? 1 : 2 }}>
          {/* call card */}
          <div style={{ background: t.dark ? t.surface : t.grape, borderRadius: t.r, padding: '22px 20px', color: '#fff', boxShadow: t.shadowSm, position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <LiveDot color={t.accent} /><Mono style={{ color: t.accent, fontWeight: 600 }}>{done ? 'CALL ENDED' : 'ON CALL'}</Mono>
              <Mono style={{ color: 'rgba(255,255,255,0.6)', marginLeft: 'auto' }}>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</Mono>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{call.venue}</div>
            <Mono style={{ color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: 5 }}>{call.city.toUpperCase()} · {call.type.toUpperCase()} · FIT {call.fit}</Mono>
            <Mono style={{ color: 'rgba(255,255,255,0.45)', display: 'block', marginTop: 3 }}>{call.phone}</Mono>
            {/* waveform */}
            <div style={{ marginTop: 20, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              {Array.from({ length: 28 }).map((_, i) => (
                <span key={i} style={{ width: 3, height: 44, borderRadius: 3, background: speaking ? t.accent : 'rgba(255,255,255,0.32)', transformOrigin: 'center', animation: speaking ? `bookrEq ${0.6 + (i % 5) * 0.16}s ease-in-out ${i * 0.04}s infinite` : 'none', transform: speaking ? undefined : `scaleY(${0.2 + Math.abs(Math.sin(i)) * 0.5})` }} />
              ))}
            </div>
          </div>

          {/* who's speaking + pipeline */}
          <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.r, overflow: 'hidden', boxShadow: t.shadowSm }}>
            <PanelHead t={t} title="AGENT PIPELINE" />
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 11 }}>
              {[{ k: 'Deepgram', v: 'STT', on: !speaking }, { k: 'Claude Sonnet', v: 'REASONING', on: true }, { k: 'ElevenLabs', v: 'TTS', on: speaking }].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.on && !done ? '#3FBF7F' : t.line, flex: '0 0 7px', boxShadow: s.on && !done ? '0 0 0 3px rgba(63,191,127,0.18)' : 'none' }} />
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: t.ink, flex: 1 }}>{s.k}</span>
                  <Mono style={{ color: t.muted }}>{s.v}</Mono>
                </div>
              ))}
            </div>
            <div style={{ padding: '11px 18px', borderTop: `1px solid ${t.line2}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Mono style={{ color: t.muted }}>END-TO-END</Mono>
              <Mono style={{ color: '#3FBF7F', fontWeight: 600 }}>{done ? '—' : '480MS'}</Mono>
            </div>
          </div>

          {/* takeover */}
          <button disabled={done} style={{ padding: '13px', borderRadius: t.r, border: `1px solid ${t.line}`, background: done ? t.surface2 : t.surface, color: done ? t.faint : t.ink, fontFamily: t.font, fontSize: 14, fontWeight: 600, cursor: done ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>
            Take over the call
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WatchLive });
