// Soundcheck — reusable form primitives. All take tokens `t` (which carries
// t.r = corner radius and t.dense = compact flag). Exposed on window.
const { useState: useStateUI, useRef: useRefUI, useEffect: useEffectUI } = React;

function SectionLabel({ t, children, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: t.dense ? 9 : 12 }}>
      <label style={{ fontSize: 13.5, fontWeight: 600, color: t.ink }}>{children}</label>
      {right}
    </div>
  );
}

function TextField({ t, label, value, onChange, placeholder, multiline, rows = 3, hint, optional, prefix }) {
  const [focus, setFocus] = useStateUI(false);
  const base = {
    width: '100%', fontFamily: t.font, fontSize: 15, color: t.ink, background: t.dark ? t.inset : t.surface,
    border: `1px solid ${focus ? t.accent : t.line}`, borderRadius: t.r,
    padding: multiline ? '13px 15px' : '0 15px', height: multiline ? 'auto' : (t.dense ? 44 : 50),
    outline: 'none', resize: 'none', lineHeight: multiline ? 1.55 : 'normal',
    boxShadow: focus ? `0 0 0 3px ${t.accentSoft}` : 'none', transition: 'border-color .15s, box-shadow .15s',
  };
  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
          <label style={{ fontSize: 13.5, fontWeight: 600, color: t.ink }}>{label}</label>
          {optional && <Mono style={{ color: t.faint }}>OPTIONAL</Mono>}
          {hint && <Mono style={{ color: t.muted }}>{hint}</Mono>}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {prefix && <span style={{ marginRight: -39, zIndex: 1, paddingLeft: 15, color: t.muted, fontSize: 15, pointerEvents: 'none' }}>{prefix}</span>}
        {multiline
          ? <textarea rows={rows} value={value} placeholder={placeholder} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} onChange={(e) => onChange(e.target.value)} style={base} />
          : <input value={value} placeholder={placeholder} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} onChange={(e) => onChange(e.target.value)} style={{ ...base, paddingLeft: prefix ? 39 : 15 }} />}
      </div>
    </div>
  );
}

function Chip({ t, on, onClick, children, dashed, sm }) {
  return (
    <button onClick={onClick} style={{
      padding: sm ? '7px 13px' : (t.dense ? '8px 14px' : '9px 16px'),
      borderRadius: 999, fontSize: sm ? 13 : 13.5, fontWeight: 500, fontFamily: t.font, cursor: 'pointer',
      background: on ? t.accent : (dashed ? 'transparent' : t.surface),
      color: on ? t.onAccent : (dashed ? t.muted : t.ink2),
      border: `1px ${dashed ? 'dashed' : 'solid'} ${on ? t.accent : t.line}`,
      transition: 'all .14s', display: 'inline-flex', alignItems: 'center', gap: 6,
    }}>{on ? '✓ ' : ''}{children}</button>
  );
}

// Draggable dual-thumb range
function DualRange({ t, min, max, lo, hi, onChange, unit = '' }) {
  const ref = useRefUI(null);
  const drag = useRefUI(null);
  const pct = (v) => ((v - min) / (max - min)) * 100;
  useEffectUI(() => {
    const move = (e) => {
      if (!drag.current || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      let v = Math.round(min + (Math.max(0, Math.min(1, x / rect.width))) * (max - min));
      if (drag.current === 'lo') onChange(Math.min(v, hi - 1), hi);
      else onChange(lo, Math.max(v, lo + 1));
    };
    const up = () => { drag.current = null; };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [lo, hi, min, max, onChange]);
  const thumb = (key, v) => (
    <div onPointerDown={(e) => { e.preventDefault(); drag.current = key; }} style={{
      position: 'absolute', left: `${pct(v)}%`, top: '50%', transform: 'translate(-50%,-50%)',
      width: 22, height: 22, borderRadius: '50%', background: t.surface, border: `2.5px solid ${t.accent}`,
      boxShadow: t.shadowSm, cursor: 'grab', touchAction: 'none', zIndex: 2,
    }} />
  );
  return (
    <div>
      <div ref={ref} style={{ position: 'relative', height: 6, background: t.inset, borderRadius: 6, margin: '10px 0' }}>
        <div style={{ position: 'absolute', left: `${pct(lo)}%`, right: `${100 - pct(hi)}%`, top: 0, bottom: 0, background: t.accent, borderRadius: 6 }} />
        {thumb('lo', lo)}{thumb('hi', hi)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
        <Mono style={{ color: t.muted }}>{min}{unit}</Mono><Mono style={{ color: t.muted }}>{max}{unit}</Mono>
      </div>
    </div>
  );
}

// EPK dropzone (mock upload)
function Dropzone({ t, file, onPick, onClear }) {
  const [hover, setHover] = useStateUI(false);
  if (file) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '15px 17px', borderRadius: t.r, border: `1px solid ${t.line}`, background: t.dark ? t.inset : t.surface }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: t.accentSoft, color: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 40px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.ink }}>{file}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 3 }}>
            <LiveDot color="#3FBF7F" size={6} />
            <Mono style={{ color: t.muted }}>PARSED · 2 PAGES · READY FOR PITCHES</Mono>
          </div>
        </div>
        <button onClick={onClear} style={{ border: 'none', background: 'transparent', color: t.muted, cursor: 'pointer', fontSize: 13, fontFamily: t.font, fontWeight: 600 }}>Replace</button>
      </div>
    );
  }
  return (
    <button onClick={onPick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      width: '100%', padding: '26px', borderRadius: t.r, cursor: 'pointer', fontFamily: t.font,
      border: `1.5px dashed ${hover ? t.accent : t.line}`, background: hover ? t.accentSoft : (t.dark ? t.inset : t.surface2),
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all .15s',
    }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, background: t.surface, border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.accent }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 21h14"/></svg>
      </div>
      <div style={{ fontSize: 14.5, fontWeight: 600, color: t.ink }}>Drop your EPK, or click to upload</div>
      <Mono style={{ color: t.muted }}>PDF · WE EXTRACT YOUR BIO &amp; STATS</Mono>
    </button>
  );
}

// Selectable venue-type card
function SelectCard({ t, on, onClick, label, sub }) {
  return (
    <button onClick={onClick} style={{
      textAlign: 'left', padding: t.dense ? '13px 15px' : '15px 17px', borderRadius: t.r, cursor: 'pointer', fontFamily: t.font,
      background: on ? t.accentSoft : (t.dark ? t.inset : t.surface),
      border: `1.5px solid ${on ? t.accent : t.line}`, transition: 'all .14s',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <span style={{
        flex: '0 0 20px', width: 20, height: 20, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: on ? t.accent : 'transparent', border: `1.5px solid ${on ? t.accent : t.line}`, color: t.onAccent, fontSize: 12, fontWeight: 700,
      }}>{on ? '✓' : ''}</span>
      <span>
        <span style={{ display: 'block', fontSize: 14.5, fontWeight: 600, color: t.ink }}>{label}</span>
        <Mono style={{ color: t.muted, display: 'block', marginTop: 2 }}>{sub}</Mono>
      </span>
    </button>
  );
}

Object.assign(window, { SectionLabel, TextField, Chip, DualRange, Dropzone, SelectCard });
