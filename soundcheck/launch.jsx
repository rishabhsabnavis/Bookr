// Soundcheck — launch / handoff screen. The agent takes over and starts dialing.
const { useState: useStateL, useEffect: useEffectL } = React;

function LaunchScreen({ t, data, onBack }) {
  const cities = data.cities.length ? data.cities : ['Brooklyn'];
  const seedVenues = [
    { name: 'Elsewhere', city: cities[0] }, { name: 'Good Room', city: cities[0] },
    { name: 'House of Yes', city: cities[1 % cities.length] }, { name: 'Nowadays', city: cities[0] },
    { name: 'Public Records', city: cities[1 % cities.length] }, { name: 'Mansions', city: cities[2 % cities.length] },
  ];
  const [matched, setMatched] = useStateL(0);
  const [statuses, setStatuses] = useStateL(seedVenues.map(() => 'queued'));
  const target = 18 + data.venues.length * 4 + data.cities.length * 3;

  useEffectL(() => {
    const c = setInterval(() => setMatched((m) => (m < target ? Math.min(target, m + Math.ceil(target / 22)) : m)), 60);
    return () => clearInterval(c);
  }, [target]);

  useEffectL(() => {
    let i = 0;
    const flow = ['dialing', 'connected', 'hold'];
    const seq = setInterval(() => {
      setStatuses((prev) => {
        const next = [...prev];
        const idx = i % next.length;
        const cur = next[idx];
        if (cur === 'queued') next[idx] = 'dialing';
        else if (cur === 'dialing') next[idx] = Math.random() > 0.5 ? 'connected' : 'voicemail';
        else if (cur === 'connected') next[idx] = 'hold';
        else { next[idx] = 'queued'; }
        i++;
        return next;
      });
    }, 900);
    return () => clearInterval(seq);
  }, []);

  const stat = {
    queued: { c: t.muted, bg: t.dark ? 'rgba(255,255,255,0.06)' : t.inset, label: 'QUEUED' },
    dialing: { c: t.accent, bg: t.accentSoft, label: 'DIALING' },
    connected: { c: '#3FBF7F', bg: 'rgba(63,191,127,0.14)', label: 'ON CALL' },
    hold: { c: t.accent, bg: t.accentSoft, label: 'HOLD · NEEDS YOU' },
    voicemail: { c: t.muted, bg: t.dark ? 'rgba(255,255,255,0.06)' : t.inset, label: 'VOICEMAIL' },
  };

  return (
    <div style={{ minHeight: '100%', background: t.bg, fontFamily: t.font, color: t.ink, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6vh 24px 60px' }}>
      <div style={{ width: '100%', maxWidth: 720 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 84, height: 84, borderRadius: 24, background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 26 }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: 24, animation: 'bookrPulse 2s ease-out infinite' }} />
            <EqBars bars={5} color={t.onAccent} h={34} w={4} gap={4} />
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <LiveDot color={t.accent} /><Mono style={{ color: t.accent, fontWeight: 600 }}>CAMPAIGN LIVE</Mono>
          </div>
          <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em' }}>The agent is calling for you</h1>
          <p style={{ margin: '12px 0 0', fontSize: 16, color: t.muted, maxWidth: 460, lineHeight: 1.55 }}>
            {data.name || 'Your profile'} is live. Bookr is dialing venues across {cities.slice(0, 3).join(', ')} and will ping you the moment a room puts a date on hold.
          </p>
        </div>

        {/* stat row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, margin: '34px 0 24px' }}>
          {[{ n: matched, l: 'VENUES MATCHED' }, { n: statuses.filter((s) => s === 'dialing' || s === 'connected').length, l: 'CALLS IN FLIGHT' }, { n: statuses.filter((s) => s === 'hold').length, l: 'HOLDS FOR YOU' }].map((s, i) => (
            <div key={i} style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.r, padding: '18px 20px', textAlign: 'center' }}>
              <div style={{ fontFamily: t.mono, fontSize: 30, fontWeight: 700, color: i === 2 && s.n > 0 ? t.accent : t.ink }}>{s.n}</div>
              <Mono style={{ color: t.muted, marginTop: 4, display: 'block' }}>{s.l}</Mono>
            </div>
          ))}
        </div>

        {/* live queue */}
        <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.r, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${t.line2}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Mono style={{ color: t.muted, letterSpacing: '0.12em' }}>LIVE CALL QUEUE</Mono>
            <EqBars bars={6} color={t.accent} h={16} w={2.5} gap={2.5} />
          </div>
          {seedVenues.map((v, i) => {
            const s = stat[statuses[i]];
            return (
              <div key={i} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: i < seedVenues.length - 1 ? `1px solid ${t.line2}` : 'none' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: t.inset, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 34px' }}>
                  {statuses[i] === 'dialing' || statuses[i] === 'connected'
                    ? <EqBars bars={3} color={t.accent} h={14} w={2} gap={2} seed={i} />
                    : <span style={{ fontSize: 13, fontWeight: 700, color: t.muted }}>{v.name[0]}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600 }}>{v.name}</div>
                  <Mono style={{ color: t.muted }}>{v.city.toUpperCase()}</Mono>
                </div>
                <span style={{ padding: '5px 11px', borderRadius: 999, background: s.bg, color: s.c, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {(statuses[i] === 'connected' || statuses[i] === 'hold') && <LiveDot color={s.c} size={6} />}
                  <Mono style={{ color: s.c, fontWeight: 600 }}>{s.label}</Mono>
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 26 }}>
          <button onClick={onBack} style={{ padding: '12px 22px', borderRadius: t.r, border: `1px solid ${t.line}`, background: 'transparent', color: t.ink2, fontFamily: t.font, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>← Edit profile</button>
        </div>
      </div>
    </div>
  );
}
window.LaunchScreen = LaunchScreen;
