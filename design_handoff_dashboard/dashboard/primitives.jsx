// Bookr Dashboard — shared primitives. All take tokens `t` (t.r = radius, t.dense).
const { useState: useStateP, useEffect: useEffectP, useRef: useRefP } = React;

// Outcome → color + label mapping (mirrors the call_logs outcome enum)
function outcomeStyle(t, outcome) {
  const green = '#3FBF7F';
  const map = {
    booked:       { c: green,    bg: 'rgba(63,191,127,0.14)', label: 'BOOKED' },
    hold:         { c: t.accent, bg: t.accentSoft,            label: 'HOLD' },
    declined:     { c: t.muted,  bg: t.dark ? 'rgba(255,255,255,0.06)' : t.inset, label: 'DECLINED' },
    voicemail:    { c: '#6C8FE0',bg: 'rgba(108,143,224,0.13)',label: 'VOICEMAIL' },
    no_answer:    { c: t.faint,  bg: t.dark ? 'rgba(255,255,255,0.05)' : t.inset, label: 'NO ANSWER' },
    wrong_number: { c: t.faint,  bg: t.dark ? 'rgba(255,255,255,0.05)' : t.inset, label: 'WRONG NUMBER' },
  };
  return map[outcome] || map.no_answer;
}

function OutcomeBadge({ t, outcome, live }) {
  const s = outcomeStyle(t, outcome);
  return (
    <span style={{ padding: '5px 11px', borderRadius: 999, background: s.bg, display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
      {live && (outcome === 'hold' || outcome === 'booked') && <LiveDot color={s.c} size={6} />}
      <Mono style={{ color: s.c, fontWeight: 600 }}>{s.label}</Mono>
    </span>
  );
}

// Round venue monogram (or live EQ when on a call)
function VenueMark({ t, name, size = 38, active }) {
  return (
    <div style={{ width: size, height: size, flex: `0 0 ${size}px`, borderRadius: Math.round(size * 0.3), background: active ? t.accentSoft : t.inset, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {active
        ? <EqBars bars={3} color={t.accent} h={Math.round(size * 0.36)} w={2} gap={2} />
        : <span style={{ fontSize: size * 0.36, fontWeight: 700, color: t.muted }}>{(name || '?')[0]}</span>}
    </div>
  );
}

function StatCard({ t, n, label, accent, sub }) {
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.r, padding: t.dense ? '16px 18px' : '20px 22px', boxShadow: t.shadowSm }}>
      <div style={{ fontFamily: t.mono, fontSize: 32, fontWeight: 700, lineHeight: 1, color: accent ? t.accent : t.ink }}>{n}</div>
      <Mono style={{ color: t.muted, marginTop: 9, display: 'block', letterSpacing: '0.1em' }}>{label}</Mono>
      {sub && <div style={{ fontSize: 12.5, color: t.muted, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

// Sentiment bar (-1..1) — red→neutral→green
function Sentiment({ t, v }) {
  const pos = Math.round(((v + 1) / 2) * 100);
  const c = v > 0.25 ? '#3FBF7F' : v < -0.05 ? '#D9685A' : t.muted;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 110 }}>
      <div style={{ position: 'relative', flex: 1, height: 5, borderRadius: 5, background: t.inset }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pos}%`, background: c, borderRadius: 5 }} />
      </div>
      <Mono style={{ color: c, fontWeight: 600, width: 30, textAlign: 'right' }}>{v > 0 ? '+' : ''}{v.toFixed(2)}</Mono>
    </div>
  );
}

// Static seeded waveform (for recordings). `progress` 0..1 fills the played portion.
function StaticWave({ t, bars = 56, progress = 0, color, played, h = 40, onSeek }) {
  const heights = useRefP(null);
  if (!heights.current) {
    heights.current = Array.from({ length: bars }).map((_, i) =>
      0.22 + Math.abs(Math.sin(i * 1.7) * 0.55 + Math.sin(i * 0.6) * 0.3) * 0.78);
  }
  return (
    <div onClick={onSeek} style={{ display: 'flex', alignItems: 'center', gap: 2, height: h, cursor: onSeek ? 'pointer' : 'default', flex: 1 }}>
      {heights.current.map((hv, i) => {
        const on = i / bars <= progress;
        return <span key={i} style={{ flex: 1, height: `${Math.max(8, hv * 100)}%`, borderRadius: 2, background: on ? (played || color || t.accent) : (color ? color : t.line), opacity: on ? 1 : 0.5 }} />;
      })}
    </div>
  );
}

// Section header used across panels
function PanelHead({ t, title, right, live }) {
  return (
    <div style={{ padding: t.dense ? '13px 18px' : '15px 22px', borderBottom: `1px solid ${t.line2}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        {live && <LiveDot color={t.accent} />}
        <Mono style={{ color: t.muted, letterSpacing: '0.12em', fontWeight: 600 }}>{title}</Mono>
      </div>
      {right}
    </div>
  );
}

function GhostBtn({ t, children, onClick, sm }) {
  return (
    <button onClick={onClick} style={{ padding: sm ? '8px 13px' : '11px 18px', borderRadius: t.r, border: `1px solid ${t.line}`, background: 'transparent', color: t.ink2, fontFamily: t.font, fontSize: sm ? 13 : 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>{children}</button>
  );
}

function SolidBtn({ t, children, onClick, sm, tone }) {
  const bg = tone === 'green' ? '#3FBF7F' : t.accent;
  return (
    <button onClick={onClick} style={{ padding: sm ? '8px 14px' : '11px 20px', borderRadius: t.r, border: 'none', background: bg, color: tone === 'green' ? '#06281A' : t.onAccent, fontFamily: t.font, fontSize: sm ? 13 : 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>{children}</button>
  );
}

Object.assign(window, { outcomeStyle, OutcomeBadge, VenueMark, StatCard, Sentiment, StaticWave, PanelHead, GhostBtn, SolidBtn });
