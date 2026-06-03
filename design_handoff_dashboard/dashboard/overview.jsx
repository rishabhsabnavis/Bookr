// Bookr Dashboard — Overview view + the human-in-the-loop hold-approval flow.
const { useState: useStateO, useEffect: useEffectO } = React;

// One hold card. Approve → books; Pass → declines. This is the HITL gate from the spec:
// the agent never confirms a booking autonomously.
function HoldCard({ t, call, status, onApprove, onPass, onWatch }) {
  const h = call.hold;
  const decided = status === 'booked' || status === 'declined';
  return (
    <div style={{ position: 'relative', background: t.surface, border: `1px solid ${status === 'booked' ? '#3FBF7F' : status === 'declined' ? t.line : t.accentLine}`, borderRadius: t.r, padding: t.dense ? '18px' : '22px', boxShadow: t.shadowSm, opacity: status === 'declined' ? 0.62 : 1, transition: 'opacity .2s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <VenueMark t={t} name={call.venue} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: t.ink }}>{call.venue}</span>
            {status === 'pending' && <OutcomeBadge t={t} outcome="hold" live />}
            {status === 'booked' && <OutcomeBadge t={t} outcome="booked" live />}
            {status === 'declined' && <OutcomeBadge t={t} outcome="declined" />}
          </div>
          <Mono style={{ color: t.muted, display: 'block', marginTop: 4 }}>{call.city.toUpperCase()} · {call.type.toUpperCase()} · FIT {call.fit}</Mono>
        </div>
      </div>

      {/* Offered terms */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: t.line2, border: `1px solid ${t.line2}`, borderRadius: Math.max(8, t.r - 4), overflow: 'hidden', margin: t.dense ? '15px 0' : '18px 0' }}>
        {[{ l: 'DATE OFFERED', v: h.date }, { l: 'RATE', v: '$' + h.rate.toLocaleString() }, { l: 'SLOT', v: h.slot }, { l: 'NEGOTIATED BY', v: 'Bookr agent' }].map((x, i) => (
          <div key={i} style={{ background: t.surface, padding: '12px 14px' }}>
            <Mono style={{ color: t.muted, display: 'block', marginBottom: 5 }}>{x.l}</Mono>
            <span style={{ fontSize: 14.5, fontWeight: 600, color: t.ink }}>{x.v}</span>
          </div>
        ))}
      </div>

      {/* Why / quote pulled from transcript */}
      <div style={{ display: 'flex', gap: 10, padding: '12px 14px', borderRadius: Math.max(8, t.r - 4), background: t.dark ? t.inset : t.surface2, marginBottom: decided ? 0 : (t.dense ? 15 : 18) }}>
        <span style={{ color: t.accent, fontSize: 20, lineHeight: 1, fontFamily: 'Georgia, serif' }}>“</span>
        <span style={{ fontSize: 13.5, color: t.ink2, lineHeight: 1.5 }}>{quoteFor(call)}</span>
      </div>

      {status === 'pending' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SolidBtn t={t} tone="green" onClick={onApprove}>Approve &amp; book</SolidBtn>
          <GhostBtn t={t} onClick={onPass}>Pass</GhostBtn>
          <button onClick={onWatch} style={{ marginLeft: 'auto', border: 'none', background: 'transparent', color: t.accent, fontFamily: t.font, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Review call →</button>
        </div>
      )}
      {status === 'booked' && (
        <div style={{ marginTop: t.dense ? 15 : 18, display: 'flex', alignItems: 'center', gap: 8, color: '#3FBF7F' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>Booked — contract sent to {call.venue}. Agent moved on.</span>
        </div>
      )}
    </div>
  );
}

function quoteFor(call) {
  const turn = call.transcript.find((x) => x.who === 'buyer' && /hold|open|work|pencil|two thousand|sixteen|fourteen/i.test(x.text));
  return turn ? turn.text : 'Buyer agreed to hold the date pending your approval.';
}

function Overview({ t, calls, holdState, onApprove, onPass, onWatch, queue }) {
  const dj = window.DASH_DJ;
  const pending = calls.filter((c) => c.outcome === 'hold' && holdState[c.id] === 'pending');
  const allHolds = calls.filter((c) => c.outcome === 'hold');
  const booked = calls.filter((c) => c.outcome === 'booked').length + allHolds.filter((c) => holdState[c.id] === 'booked').length;
  const completed = calls.filter((c) => c.dur > 0).length;

  return (
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      {/* greeting */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em', color: t.ink }}>Good evening, {dj.name.split(' ')[1]}</h1>
          <p style={{ margin: '8px 0 0', fontSize: 15, color: t.muted }}>Your agent ran {calls.length} calls today across {dj.cities.join(' & ')}.</p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '9px 15px', borderRadius: 999, background: t.surface, border: `1px solid ${t.line}` }}>
          <LiveDot color={t.accent} /><Mono style={{ color: t.accent, fontWeight: 600 }}>CAMPAIGN LIVE</Mono>
        </div>
      </div>

      {/* stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 30 }}>
        <StatCard t={t} n={completed} label="CALLS COMPLETED" />
        <StatCard t={t} n={pending.length} label="HOLDS FOR YOU" accent={pending.length > 0} />
        <StatCard t={t} n={booked} label="BOOKED" />
        <StatCard t={t} n={'$' + (booked * 1.4).toFixed(1) + 'k'} label="EST. BOOKED FEES" />
      </div>

      {/* HITL — holds needing approval */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: t.ink }}>Needs your approval</h2>
        {pending.length > 0 && <span style={{ minWidth: 22, height: 22, padding: '0 7px', borderRadius: 999, background: t.accent, color: t.onAccent, fontFamily: t.mono, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{pending.length}</span>}
        <Mono style={{ color: t.muted, marginLeft: 4 }}>BOOKR NEVER CONFIRMS WITHOUT YOU</Mono>
      </div>

      {allHolds.length === 0
        ? <Empty t={t} text="No holds yet. The agent will surface any here the moment a venue puts a date on the table." />
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 14, marginBottom: 34 }}>
            {allHolds.map((c) => (
              <HoldCard key={c.id} t={t} call={c} status={holdState[c.id]} onApprove={() => onApprove(c.id)} onPass={() => onPass(c.id)} onWatch={onWatch} />
            ))}
          </div>
        )}

      {/* live queue */}
      <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.r, overflow: 'hidden', boxShadow: t.shadowSm }}>
        <PanelHead t={t} title="LIVE CALL QUEUE" live right={<EqBars bars={6} color={t.accent} h={16} w={2.5} gap={2.5} />} />
        {queue.map((v, i) => {
          const s = outcomeStyle(t, v.status === 'dialing' || v.status === 'connected' ? 'hold' : v.status === 'connected' ? 'booked' : v.status);
          const label = v.status === 'dialing' ? 'DIALING' : v.status === 'connected' ? 'ON CALL' : v.status === 'queued' ? 'QUEUED' : s.label;
          const active = v.status === 'dialing' || v.status === 'connected';
          return (
            <div key={i} style={{ padding: '13px 22px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: i < queue.length - 1 ? `1px solid ${t.line2}` : 'none' }}>
              <VenueMark t={t} name={v.name} size={34} active={active} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: t.ink }}>{v.name}</div>
                <Mono style={{ color: t.muted }}>{v.city.toUpperCase()}</Mono>
              </div>
              <span style={{ padding: '5px 11px', borderRadius: 999, background: active ? t.accentSoft : t.inset, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {active && <LiveDot color={t.accent} size={6} />}
                <Mono style={{ color: active ? t.accent : t.muted, fontWeight: 600 }}>{label}</Mono>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Empty({ t, text }) {
  return (
    <div style={{ padding: '34px', borderRadius: t.r, border: `1.5px dashed ${t.line}`, background: t.dark ? t.inset : t.surface2, textAlign: 'center', marginBottom: 34 }}>
      <div style={{ display: 'inline-flex', marginBottom: 12 }}><EqBars bars={5} color={t.faint} h={20} w={3} gap={3} idle /></div>
      <p style={{ margin: 0, fontSize: 14, color: t.muted, maxWidth: 420, marginInline: 'auto', lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

Object.assign(window, { Overview });
