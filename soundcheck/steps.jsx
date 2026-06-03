// Soundcheck — the four step bodies. Each takes { t, data, set }.
const { useState: useStateS } = React;

const card = (t) => ({ background: t.dark ? t.surface2 : t.surface, border: `1px solid ${t.line}`, borderRadius: t.r, padding: t.dense ? '18px 20px' : '20px 22px' });

function StepIdentity({ t, data, set }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.dense ? 20 : 26, maxWidth: 640 }}>
      <TextField t={t} label="Stage name" value={data.name} onChange={(v) => set('name', v)} placeholder="e.g. DJ Aanya" />
      <TextField t={t} label="One-line bio" multiline rows={3} value={data.bio} onChange={(v) => set('bio', v)}
        placeholder="Bollywood-house selector turning weddings into warehouse parties."
        hint={`${(data.bio || '').length}/180 · USED VERBATIM IN PITCHES`} />
      <div>
        <SectionLabel t={t}>Electronic press kit</SectionLabel>
        <Dropzone t={t} file={data.epk} onPick={() => set('epk', 'DJ-Aanya-EPK-2026.pdf')} onClear={() => set('epk', null)} />
      </div>
    </div>
  );
}

function StepSound({ t, data, set }) {
  const [link, setLink] = useStateS('');
  const allGenres = ['Afrobeats', 'Amapiano', 'House', 'Bollywood', 'Hip-Hop', 'Disco', 'Bass', 'Techno', 'Garage', 'Funk', 'R&B', 'Baile Funk'];
  const toggle = (g) => set('genres', data.genres.includes(g) ? data.genres.filter((x) => x !== g) : [...data.genres, g]);
  const addLink = () => { if (!link.trim()) return; const plat = /mixcloud/i.test(link) ? 'Mixcloud' : /spotify/i.test(link) ? 'Spotify' : 'SoundCloud'; set('mixes', [...data.mixes, { platform: plat, url: link.trim() }]); setLink(''); };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.dense ? 20 : 26 }}>
      <div>
        <SectionLabel t={t} right={<Mono style={{ color: t.muted }}>{data.genres.length} SELECTED</Mono>}>Genre tags</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
          {allGenres.map((g) => <Chip key={g} t={t} on={data.genres.includes(g)} onClick={() => toggle(g)}>{g}</Chip>)}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'start' }}>
        <div style={card(t)}>
          <SectionLabel t={t} right={<Mono style={{ color: t.accent, fontSize: 13, fontWeight: 600 }}>{data.bpmLo}–{data.bpmHi} BPM</Mono>}>Tempo range</SectionLabel>
          <DualRange t={t} min={60} max={180} lo={data.bpmLo} hi={data.bpmHi} onChange={(lo, hi) => { set('bpmLo', lo); set('bpmHi', hi); }} />
        </div>
        <div style={card(t)}>
          <SectionLabel t={t}>Mix links</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {data.mixes.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px', borderRadius: Math.max(8, t.r - 4), background: t.inset, border: `1px solid ${t.line2}` }}>
                <EqBars bars={4} color={t.accent} h={15} w={2.5} gap={2.5} seed={i} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: t.ink }}>{m.platform}</div>
                  <Mono style={{ color: t.muted, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.url}</Mono>
                </div>
                <button onClick={() => set('mixes', data.mixes.filter((_, j) => j !== i))} style={{ border: 'none', background: 'transparent', color: t.faint, cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4 }}>×</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={link} onChange={(e) => setLink(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addLink()} placeholder="Paste SoundCloud / Mixcloud link"
                style={{ flex: 1, minWidth: 0, fontFamily: t.font, fontSize: 13.5, color: t.ink, background: t.dark ? t.inset : t.surface, border: `1px solid ${t.line}`, borderRadius: Math.max(8, t.r - 4), padding: '0 13px', height: 40, outline: 'none' }} />
              <button onClick={addLink} style={{ flex: '0 0 auto', padding: '0 16px', height: 40, borderRadius: Math.max(8, t.r - 4), border: `1px solid ${t.line}`, background: t.dark ? t.surface : t.surface, color: t.ink2, fontFamily: t.font, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Add</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepTargets({ t, data, set }) {
  const [city, setCity] = useStateS('');
  const suggestions = ['Brooklyn', 'Los Angeles', 'London', 'Berlin', 'Austin', 'Miami', 'Toronto'].filter((c) => !data.cities.includes(c));
  const addCity = (c) => { const v = (c || city).trim(); if (!v || data.cities.includes(v) || data.cities.length >= 5) return; set('cities', [...data.cities, v]); setCity(''); };
  const venues = [
    { v: 'Nightclub', s: 'LATE, HIGH-ENERGY' }, { v: 'Bar / Lounge', s: 'EARLY SETS, VIBE' },
    { v: 'Wedding', s: 'PRIVATE, PREMIUM' }, { v: 'Corporate', s: 'BRAND EVENTS' },
    { v: 'Festival', s: 'STAGE SLOTS' }, { v: 'University', s: 'CAMPUS NIGHTS' },
  ];
  const toggleV = (v) => set('venues', data.venues.includes(v) ? data.venues.filter((x) => x !== v) : [...data.venues, v]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.dense ? 22 : 28, maxWidth: 720 }}>
      <div>
        <SectionLabel t={t} right={<Mono style={{ color: data.cities.length >= 5 ? t.accent : t.muted }}>{data.cities.length}/5 CITIES</Mono>}>Target cities</SectionLabel>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input value={city} onChange={(e) => setCity(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCity()} placeholder="Add a city the agent should call into"
            style={{ flex: 1, fontFamily: t.font, fontSize: 14.5, color: t.ink, background: t.dark ? t.inset : t.surface, border: `1px solid ${t.line}`, borderRadius: t.r, padding: '0 15px', height: t.dense ? 44 : 50, outline: 'none' }} />
          <button onClick={() => addCity()} style={{ padding: '0 20px', borderRadius: t.r, border: 'none', background: t.accent, color: t.onAccent, fontFamily: t.font, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Add</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
          {data.cities.map((c) => (
            <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 10px 8px 15px', borderRadius: 999, background: t.accent, color: t.onAccent, fontSize: 13.5, fontWeight: 600 }}>
              {c}<button onClick={() => set('cities', data.cities.filter((x) => x !== c))} style={{ border: 'none', background: 'rgba(0,0,0,0.15)', color: t.onAccent, width: 18, height: 18, borderRadius: '50%', cursor: 'pointer', fontSize: 13, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </span>
          ))}
          {data.cities.length < 5 && suggestions.slice(0, 4).map((c) => <Chip key={c} t={t} dashed onClick={() => addCity(c)}>+ {c}</Chip>)}
        </div>
      </div>
      <div>
        <SectionLabel t={t} right={<Mono style={{ color: t.muted }}>{data.venues.length} TYPES</Mono>}>Venue types</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 11 }}>
          {venues.map(({ v, s }) => <SelectCard key={v} t={t} on={data.venues.includes(v)} onClick={() => toggleV(v)} label={v} sub={s} />)}
        </div>
      </div>
    </div>
  );
}

function StepLogistics({ t, data, set }) {
  // upcoming weekend dates from June 2026
  const base = new Date(2026, 5, 1);
  const days = [];
  for (let i = 0; i < 28 && days.length < 9; i++) {
    const d = new Date(base); d.setDate(base.getDate() + i);
    const dow = d.getDay();
    if (dow === 5 || dow === 6) days.push(d);
  }
  const fmt = (d) => ({ dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()], day: d.getDate(), mon: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()] });
  const key = (d) => `${d.getMonth()}-${d.getDate()}`;
  const toggleD = (k) => set('dates', data.dates.includes(k) ? data.dates.filter((x) => x !== k) : [...data.dates, k]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.dense ? 22 : 28, maxWidth: 720 }}>
      <div>
        <SectionLabel t={t} right={<Mono style={{ color: t.muted }}>{data.dates.length} NIGHTS OPEN</Mono>}>Availability — upcoming weekends</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {days.map((d) => {
            const k = key(d), on = data.dates.includes(k), f = fmt(d);
            return (
              <button key={k} onClick={() => toggleD(k)} style={{
                width: 76, padding: '12px 0', borderRadius: t.r, cursor: 'pointer', fontFamily: t.font, textAlign: 'center',
                background: on ? t.accent : (t.dark ? t.inset : t.surface), border: `1.5px solid ${on ? t.accent : t.line}`, transition: 'all .14s',
              }}>
                <Mono style={{ color: on ? t.onAccent : t.muted, display: 'block' }}>{f.dow}</Mono>
                <span style={{ display: 'block', fontSize: 22, fontWeight: 700, color: on ? t.onAccent : t.ink, lineHeight: 1.2 }}>{f.day}</span>
                <Mono style={{ color: on ? t.onAccent : t.faint, display: 'block', fontSize: 10 }}>{f.mon.toUpperCase()}</Mono>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <div style={card(t)}>
          <SectionLabel t={t} right={<Mono style={{ color: t.accent, fontSize: 14, fontWeight: 600 }}>${data.rate.toLocaleString()}+</Mono>}>Minimum fee / night</SectionLabel>
          <input type="range" min={250} max={5000} step={50} value={data.rate} onChange={(e) => set('rate', +e.target.value)}
            style={{ width: '100%', accentColor: t.accent, margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <Mono style={{ color: t.muted }}>$250</Mono><Mono style={{ color: t.muted }}>$5,000</Mono>
          </div>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <TextField t={t} label="Past gigs — social proof for the call" multiline rows={2} value={data.pastGigs} onChange={(v) => set('pastGigs', v)}
            placeholder="Opened for Black Coffee at Output, residency at Elsewhere Rooftop…" optional />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StepIdentity, StepSound, StepTargets, StepLogistics });
