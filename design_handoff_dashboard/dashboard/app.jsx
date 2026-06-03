// Bookr Dashboard — app shell: sidebar nav, hold/HITL state, persistence, responsive, tweaks.
const { useState: useStateA, useEffect: useEffectA } = React;

const DASH_TWEAKS = /*EDITMODE-BEGIN*/{
  "accent": "#FC814A",
  "dark": false,
  "density": "comfortable",
  "radius": 14
}/*EDITMODE-END*/;

const NAV = [
  { key: 'overview', label: 'Overview', sub: 'Holds & today' },
  { key: 'watch', label: 'Watch live', sub: 'In-flight call' },
  { key: 'calls', label: 'Call log', sub: 'Outcomes & transcripts' },
];

function dLoad(key, fb) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } }

function useVW() {
  const [w, setW] = useStateA(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffectA(() => { const on = () => setW(window.innerWidth); window.addEventListener('resize', on); return () => window.removeEventListener('resize', on); }, []);
  return w;
}

function DashApp() {
  const [t0, setTweak] = useTweaks(DASH_TWEAKS);
  const t = bookrTokens(t0.dark ? 'dark' : 'light', { accent: t0.accent });
  t.r = t0.radius; t.dense = t0.density === 'compact';

  const vw = useVW();
  const mobile = vw < 900;

  const calls = window.CALLS;
  const [tab, setTab] = useStateA(() => dLoad('bookr.dash.tab', 'overview'));
  // hold decision state: id -> 'pending' | 'booked' | 'declined'
  const initHolds = () => {
    const seed = {};
    calls.forEach((c) => { if (c.outcome === 'hold') seed[c.id] = 'pending'; });
    return { ...seed, ...dLoad('bookr.dash.holds', {}) };
  };
  const [holdState, setHoldState] = useStateA(initHolds);
  const [openId, setOpenId] = useStateA(null);

  useEffectA(() => { localStorage.setItem('bookr.dash.tab', JSON.stringify(tab)); }, [tab]);
  useEffectA(() => { localStorage.setItem('bookr.dash.holds', JSON.stringify(holdState)); }, [holdState]);

  const approve = (id) => setHoldState((s) => ({ ...s, [id]: 'booked' }));
  const pass = (id) => setHoldState((s) => ({ ...s, [id]: 'declined' }));

  // live queue (overview) — cycles statuses like the launch screen
  const [queue, setQueue] = useStateA(() => [
    { name: 'Paragon', city: 'Brooklyn', status: 'connected' },
    { name: 'Black Flamingo', city: 'Brooklyn', status: 'dialing' },
    { name: 'TBA Brooklyn', city: 'Brooklyn', status: 'queued' },
    { name: 'The Virgil', city: 'Los Angeles', status: 'queued' },
    { name: 'Catch One', city: 'Los Angeles', status: 'queued' },
  ]);
  useEffectA(() => {
    const iv = setInterval(() => setQueue((q) => {
      const n = q.map((x) => ({ ...x }));
      const i = Math.floor(Math.random() * n.length);
      const flow = { queued: 'dialing', dialing: 'connected', connected: 'voicemail', voicemail: 'queued' };
      n[i].status = flow[n[i].status] || 'queued';
      return n;
    }), 1400);
    return () => clearInterval(iv);
  }, []);

  const pendingCount = calls.filter((c) => c.outcome === 'hold' && holdState[c.id] === 'pending').length;

  const openCall = openId ? calls.find((c) => c.id === openId) : null;
  const eff = openCall ? (holdState[openCall.id] === 'booked' ? 'booked' : holdState[openCall.id] === 'declined' ? 'declined' : openCall.outcome) : null;

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

  const NavItem = ({ s }) => {
    const active = tab === s.key;
    const badge = s.key === 'overview' && pendingCount > 0 ? pendingCount : null;
    return (
      <button onClick={() => setTab(s.key)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: Math.max(9, t.r - 3), textAlign: 'left', fontFamily: t.font, cursor: 'pointer', background: active ? (t.dark ? t.surface2 : t.inset) : 'transparent', border: `1px solid ${active ? t.line : 'transparent'}`, width: '100%' }}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: active ? t.ink : t.ink2 }}>{s.label}</span>
          <span style={{ display: 'block', fontSize: 12, color: t.muted, marginTop: 2 }}>{s.sub}</span>
        </span>
        {s.key === 'watch' && <LiveDot color={t.accent} size={7} />}
        {badge && <span style={{ minWidth: 20, height: 20, padding: '0 6px', borderRadius: 999, background: t.accent, color: t.onAccent, fontFamily: t.mono, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</span>}
      </button>
    );
  };

  const Sidebar = (
    <div style={{ width: 270, flex: '0 0 270px', padding: '28px 22px', display: 'flex', flexDirection: 'column', borderRight: `1px solid ${t.line}`, background: t.surface, height: '100%' }}>
      <Brand t={t} />
      <Mono style={{ color: t.muted, marginTop: 32, marginBottom: 12, fontSize: 10.5, letterSpacing: '0.14em' }}>CAMPAIGN · {window.DASH_DJ.cities.length} MARKETS</Mono>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>{NAV.map((s) => <NavItem key={s.key} s={s} />)}</div>
      <div style={{ marginTop: 'auto', padding: '15px', borderRadius: Math.max(10, t.r - 2), background: t.dark ? t.surface2 : t.inset, border: `1px solid ${t.line2}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <VenueMark t={t} name={window.DASH_DJ.name} size={34} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: t.ink }}>{window.DASH_DJ.name}</div>
            <Mono style={{ color: t.muted }}>{window.DASH_DJ.genres.slice(0, 2).join(' · ').toUpperCase()}</Mono>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 11 }}>
          <LiveDot color={t.accent} size={6} /><Mono style={{ color: t.ink2, fontWeight: 600 }}>AGENT DIALING NOW</Mono>
        </div>
      </div>
    </div>
  );

  const TopBar = (
    <div style={{ padding: '14px 18px', borderBottom: `1px solid ${t.line}`, background: t.surface, position: 'sticky', top: 0, zIndex: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Brand t={t} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><LiveDot color={t.accent} size={7} /><Mono style={{ color: t.accent, fontWeight: 600 }}>LIVE</Mono></div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 13, overflowX: 'auto' }}>
        {NAV.map((s) => {
          const active = tab === s.key;
          const badge = s.key === 'overview' && pendingCount > 0 ? pendingCount : null;
          return (
            <button key={s.key} onClick={() => setTab(s.key)} style={{ flex: '0 0 auto', padding: '7px 14px', borderRadius: 999, fontFamily: t.font, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: active ? t.accent : 'transparent', color: active ? t.onAccent : t.muted, border: `1px solid ${active ? t.accent : t.line}`, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              {s.label}{badge && <span style={{ minWidth: 16, height: 16, padding: '0 4px', borderRadius: 999, background: active ? t.onAccent : t.accent, color: active ? t.accent : t.onAccent, fontFamily: t.mono, fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: mobile ? 'column' : 'row', background: t.bg, fontFamily: t.font, color: t.ink, overflow: 'hidden' }}>
      {mobile ? null : Sidebar}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {mobile && TopBar}
        <div style={{ flex: 1, overflowY: 'auto', padding: mobile ? '22px 18px 40px' : '34px 40px 48px' }}>
          {tab === 'overview' && <Overview t={t} calls={calls} holdState={holdState} onApprove={approve} onPass={pass} onWatch={() => setTab('watch')} queue={queue} />}
          {tab === 'watch' && <WatchLive t={t} mobile={mobile} />}
          {tab === 'calls' && <CallsView t={t} calls={calls} holdState={holdState} onOpen={setOpenId} mobile={mobile} />}
        </div>
      </div>
      {openCall && <CallDrawer t={t} call={openCall} eff={eff} onClose={() => setOpenId(null)} onApprove={approve} onPass={pass} onWatch={() => { setOpenId(null); setTab('watch'); }} />}
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

window.DashApp = DashApp;
