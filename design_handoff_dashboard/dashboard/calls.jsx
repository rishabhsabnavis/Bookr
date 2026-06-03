// Bookr Dashboard — Calls outcomes table + detail drawer (transcript + recording).
const { useState: useStateC, useEffect: useEffectC, useRef: useRefC } = React;

const FILTERS = ['All', 'Hold', 'Booked', 'Declined', 'Voicemail', 'No answer'];
const FILTER_MAP = { Hold: 'hold', Booked: 'booked', Declined: 'declined', Voicemail: 'voicemail', 'No answer': 'no_answer' };

function fmtDur(s) {
  if (!s) return '—';
  const m = Math.floor(s / 60), ss = s % 60;
  return m + ':' + String(ss).padStart(2, '0');
}

function CallsView({ t, calls, holdState, onOpen, mobile }) {
  const [filter, setFilter] = useStateC('All');
  const view = calls.filter((c) => {
    if (filter === 'All') return true;
    if (filter === 'Booked') return c.outcome === 'booked' || holdState[c.id] === 'booked';
    return c.outcome === FILTER_MAP[filter];
  });

  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', color: t.ink }}>Call log</h1>
        <p style={{ margin: '8px 0 0', fontSize: 14.5, color: t.muted }}>Every outbound call, transcript, and recording the agent produced today.</p>
      </div>

      {/* filter chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => {
          const on = filter === f;
          const count = f === 'All' ? calls.length : (f === 'Booked' ? calls.filter((c) => c.outcome === 'booked' || holdState[c.id] === 'booked').length : calls.filter((c) => c.outcome === FILTER_MAP[f]).length);
          return (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 14px', borderRadius: 999, border: `1px solid ${on ? t.accent : t.line}`, background: on ? t.accent : t.surface, color: on ? t.onAccent : t.ink2, fontFamily: t.font, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              {f}<Mono style={{ color: on ? t.onAccent : t.muted, opacity: 0.85 }}>{count}</Mono>
            </button>
          );
        })}
      </div>

      {/* table */}
      <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.r, overflow: 'hidden', boxShadow: t.shadowSm }}>
        {!mobile && (
          <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 0.8fr 1.6fr 1.2fr', gap: 16, padding: '12px 22px', borderBottom: `1px solid ${t.line2}`, background: t.dark ? t.inset : t.surface2 }}>
            {['VENUE', 'TIME', 'LENGTH', 'SENTIMENT', 'OUTCOME'].map((h) => <Mono key={h} style={{ color: t.muted, letterSpacing: '0.1em' }}>{h}</Mono>)}
          </div>
        )}
        {view.map((c, i) => {
          const eff = holdState[c.id] === 'booked' ? 'booked' : holdState[c.id] === 'declined' ? 'declined' : c.outcome;
          return (
            <button key={c.id} onClick={() => onOpen(c.id)} style={{ width: '100%', textAlign: 'left', display: 'grid', gridTemplateColumns: mobile ? '1fr auto' : '2.2fr 1fr 0.8fr 1.6fr 1.2fr', gap: mobile ? 10 : 16, alignItems: 'center', padding: mobile ? '14px 16px' : '14px 22px', border: 'none', borderBottom: i < view.length - 1 ? `1px solid ${t.line2}` : 'none', background: 'transparent', cursor: 'pointer', fontFamily: t.font }}
              onMouseEnter={(e) => e.currentTarget.style.background = t.dark ? t.inset : t.surface2}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <VenueMark t={t} name={c.venue} size={36} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: t.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.venue}</div>
                  <Mono style={{ color: t.muted }}>{c.city.toUpperCase()}{mobile ? ' · ' + c.when.split('· ')[1] : ''}</Mono>
                </div>
              </div>
              {!mobile && <span style={{ fontSize: 13.5, color: t.ink2 }}>{c.when.split('· ')[1]}</span>}
              {!mobile && <Mono style={{ color: t.ink2 }}>{fmtDur(c.dur)}</Mono>}
              {!mobile && (c.dur > 0 ? <Sentiment t={t} v={c.sentiment} /> : <span style={{ color: t.faint }}>—</span>)}
              <div style={{ display: 'flex', justifyContent: mobile ? 'flex-end' : 'flex-start' }}><OutcomeBadge t={t} outcome={eff} live={eff === 'hold'} /></div>
            </button>
          );
        })}
        {view.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: t.muted, fontSize: 14 }}>No calls with this outcome.</div>}
      </div>
    </div>
  );
}

// Sliding detail drawer
function CallDrawer({ t, call, eff, onClose, onApprove, onPass, onWatch }) {
  const [open, setOpen] = useStateC(false);
  useEffectC(() => { const r = requestAnimationFrame(() => setOpen(true)); return () => cancelAnimationFrame(r); }, []);
  const close = () => { setOpen(false); setTimeout(onClose, 240); };
  if (!call) return null;
  const w = Math.min(560, typeof window !== 'undefined' ? window.innerWidth : 560);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
      <div onClick={close} style={{ position: 'absolute', inset: 0, background: 'rgba(20,14,26,0.42)', opacity: open ? 1 : 0, transition: 'opacity .24s' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: w, maxWidth: '100vw', background: t.bg, borderLeft: `1px solid ${t.line}`, transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .26s cubic-bezier(.4,0,.2,1)', display: 'flex', flexDirection: 'column', boxShadow: '-30px 0 60px -30px rgba(0,0,0,0.4)' }}>
        {/* header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${t.line}`, background: t.surface, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <VenueMark t={t} name={call.venue} size={46} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 19, fontWeight: 700, color: t.ink }}>{call.venue}</span>
              <OutcomeBadge t={t} outcome={eff} live={eff === 'hold'} />
            </div>
            <Mono style={{ color: t.muted, display: 'block', marginTop: 5 }}>{call.city.toUpperCase()} · {call.type.toUpperCase()} · {call.phone}</Mono>
          </div>
          <button onClick={close} style={{ border: 'none', background: 'transparent', color: t.muted, cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>
          {/* meta row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: t.line2, border: `1px solid ${t.line2}`, borderRadius: t.r, overflow: 'hidden', marginBottom: 20 }}>
            {[{ l: 'WHEN', v: call.when.split('· ')[1] }, { l: 'DURATION', v: fmtDur(call.dur) }, { l: 'CONTACT', v: call.contact }].map((x, i) => (
              <div key={i} style={{ background: t.surface, padding: '12px 14px' }}>
                <Mono style={{ color: t.muted, display: 'block', marginBottom: 5 }}>{x.l}</Mono>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: t.ink }}>{x.v}</span>
              </div>
            ))}
          </div>

          {/* recording */}
          {call.dur > 0 && <Recorder t={t} dur={call.dur} />}

          {/* hold terms + HITL action inside drawer */}
          {call.outcome === 'hold' && (
            <div style={{ margin: '20px 0', padding: '16px 18px', borderRadius: t.r, border: `1px solid ${eff === 'booked' ? '#3FBF7F' : t.accentLine}`, background: eff === 'declined' ? t.surface2 : t.accentSoft }}>
              <Mono style={{ color: eff === 'booked' ? '#3FBF7F' : t.accent, fontWeight: 600 }}>{eff === 'booked' ? 'APPROVED — BOOKED' : eff === 'declined' ? 'PASSED' : 'HOLD AWAITING YOUR APPROVAL'}</Mono>
              <div style={{ display: 'flex', gap: 22, margin: '12px 0 14px' }}>
                <div><div style={{ fontSize: 18, fontWeight: 700, color: t.ink }}>{call.hold.date}</div><Mono style={{ color: t.muted }}>DATE</Mono></div>
                <div><div style={{ fontSize: 18, fontWeight: 700, color: t.ink }}>${call.hold.rate.toLocaleString()}</div><Mono style={{ color: t.muted }}>RATE</Mono></div>
                <div><div style={{ fontSize: 18, fontWeight: 700, color: t.ink }}>{call.hold.slot}</div><Mono style={{ color: t.muted }}>SLOT</Mono></div>
              </div>
              {eff === 'pending' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <SolidBtn t={t} tone="green" sm onClick={() => { onApprove(call.id); }}>Approve &amp; book</SolidBtn>
                  <GhostBtn t={t} sm onClick={() => { onPass(call.id); }}>Pass</GhostBtn>
                </div>
              )}
            </div>
          )}

          {/* follow-up */}
          {call.follow && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 15px', borderRadius: t.r, background: t.surface, border: `1px solid ${t.line}`, marginBottom: 20 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: t.inset, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.muted, flex: '0 0 30px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <div><Mono style={{ color: t.muted, display: 'block', marginBottom: 2 }}>FOLLOW-UP TASK</Mono><span style={{ fontSize: 13.5, color: t.ink, fontWeight: 500 }}>{call.follow}</span></div>
            </div>
          )}

          {/* transcript */}
          <Mono style={{ color: t.muted, letterSpacing: '0.12em', display: 'block', marginBottom: 14 }}>TRANSCRIPT</Mono>
          {call.transcript.length === 0
            ? <div style={{ fontSize: 13.5, color: t.muted, padding: '20px 0' }}>No conversation — {eff === 'no_answer' ? 'the line rang out.' : 'number was not in service.'}</div>
            : <TranscriptThread t={t} turns={call.transcript} venue={call.venue} />}
        </div>
      </div>
    </div>
  );
}

// Static transcript thread (used in drawer)
function TranscriptThread({ t, turns, venue }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {turns.map((turn, i) => <Turn key={i} t={t} turn={turn} venue={venue} />)}
    </div>
  );
}

function Turn({ t, turn, venue, typing }) {
  const agent = turn.who === 'agent';
  return (
    <div>
      {turn.objection && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: t.accentSoft, marginBottom: 7 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2.4" strokeLinecap="round"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>
          <Mono style={{ color: t.accent, fontWeight: 600 }}>OBJECTION HANDLED · {turn.objection.toUpperCase()}</Mono>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, flexDirection: agent ? 'row' : 'row-reverse' }}>
        <div style={{ flex: '0 0 28px', width: 28, height: 28, borderRadius: 8, background: agent ? t.accent : t.inset, color: agent ? t.onAccent : t.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.mono, fontSize: 10, fontWeight: 700 }}>
          {agent ? 'AI' : (venue || 'V')[0]}
        </div>
        <div style={{ maxWidth: '82%', padding: '10px 13px', borderRadius: 13, borderTopLeftRadius: agent ? 3 : 13, borderTopRightRadius: agent ? 13 : 3, background: agent ? (t.dark ? t.surface2 : t.surface) : t.accentSoft, border: `1px solid ${agent ? t.line : t.accentLine}`, fontSize: 13.5, lineHeight: 1.5, color: t.ink }}>
          {turn.text}{typing && <span style={{ display: 'inline-block', width: 7, height: 15, marginLeft: 2, background: t.accent, verticalAlign: 'text-bottom', animation: 'bookrBlink 1s step-end infinite' }} />}
        </div>
      </div>
    </div>
  );
}

// Recording player (mock) — play/pause drives a progress timer over the waveform.
function Recorder({ t, dur }) {
  const [playing, setPlaying] = useStateC(false);
  const [pos, setPos] = useStateC(0); // seconds
  useEffectC(() => {
    if (!playing) return;
    const iv = setInterval(() => setPos((p) => { if (p >= dur) { setPlaying(false); return dur; } return p + 0.5; }), 120);
    return () => clearInterval(iv);
  }, [playing, dur]);
  const prog = dur ? pos / dur : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: t.r, background: t.surface, border: `1px solid ${t.line}` }}>
      <button onClick={() => { if (pos >= dur) setPos(0); setPlaying((p) => !p); }} style={{ flex: '0 0 42px', width: 42, height: 42, borderRadius: '50%', border: 'none', background: t.accent, color: t.onAccent, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {playing
          ? <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
          : <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l12-7z"/></svg>}
      </button>
      <StaticWave t={t} h={34} progress={prog} onSeek={(e) => { const r = e.currentTarget.getBoundingClientRect(); setPos(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * dur); }} />
      <Mono style={{ color: t.muted, width: 84, textAlign: 'right' }}>{fmtDur(Math.round(pos))} / {fmtDur(dur)}</Mono>
    </div>
  );
}

Object.assign(window, { CallsView, CallDrawer, TranscriptThread, Turn, fmtDur });
