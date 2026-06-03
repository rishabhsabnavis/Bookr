// Bookr — shared design tokens + tiny primitives. Exposed on window.
// Neutral grotesk (Helvetica-like) + JetBrains Mono technical accents.

const BOOKR_FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const BOOKR_MONO = '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace';

function bookrTokens(theme, opts) {
  const dark = theme === 'dark';
  const accent = (opts && opts.accent) || '#FC814A';
  // derive a soft + line tint from the accent
  const hex = accent.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
  const rgba = (a) => `rgba(${r},${g},${b},${a})`;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const onAccent = lum > 0.62 ? '#1A1206' : '#FFFFFF';
  return {
    dark,
    font: BOOKR_FONT,
    mono: BOOKR_MONO,
    // surfaces
    bg:       dark ? '#211B27' : '#ECEBEC',
    surface:  dark ? '#2D2635' : '#FFFFFF',
    surface2: dark ? '#372F40' : '#F5F4F5',
    inset:    dark ? '#241E2B' : '#EFEEEF',
    // lines
    line:     dark ? 'rgba(255,255,255,0.10)' : '#DEDCDF',
    line2:    dark ? 'rgba(255,255,255,0.06)' : '#E9E8EA',
    // text
    ink:      dark ? '#F1EFF1' : '#2A2230',
    ink2:     dark ? '#CFC9D2' : '#564256',
    muted:    dark ? '#96939B' : '#8C8893',
    faint:    dark ? '#6E6878' : '#B6B2BB',
    // brand
    grape:    '#564256',
    grapeDeep:dark ? '#1A1520' : '#3C2F3D',
    accent:   accent,
    accentSoft: dark ? rgba(0.18) : rgba(0.12),
    accentLine: dark ? rgba(0.42) : rgba(0.45),
    onAccent: onAccent,
    silver:   '#BFBFBF',
    granite:  '#96939B',
    // misc
    shadow:   dark ? '0 1px 0 rgba(255,255,255,0.04) inset, 0 18px 50px -24px rgba(0,0,0,0.6)'
                   : '0 1px 0 rgba(255,255,255,0.8) inset, 0 18px 44px -26px rgba(36,28,42,0.30)',
    shadowSm: dark ? '0 8px 24px -16px rgba(0,0,0,0.7)' : '0 8px 22px -16px rgba(36,28,42,0.22)',
  };
}

// Animated equalizer / waveform — `bars` count, `color`, `h` height px.
function EqBars({ bars = 5, color, h = 26, w = 3, gap = 3, idle = false, seed = 0 }) {
  const heights = [0.45, 0.9, 0.6, 1, 0.5, 0.85, 0.7, 0.95, 0.4, 0.75, 0.55, 0.88];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap, height: h }}>
      {Array.from({ length: bars }).map((_, i) => (
        <span key={i} style={{
          width: w, height: h, borderRadius: w, background: color,
          transformOrigin: 'center',
          animation: idle ? 'none' : `bookrEq ${0.7 + (i % 4) * 0.18}s ease-in-out ${(i + seed) * 0.09}s infinite`,
          transform: idle ? `scaleY(${heights[(i + seed) % heights.length]})` : undefined,
        }} />
      ))}
    </div>
  );
}

// Pulsing live dot
function LiveDot({ color = '#FC814A', size = 8 }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: size, height: size }}>
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, animation: 'bookrPing 1.8s cubic-bezier(0,0,.2,1) infinite' }} />
      <span style={{ position: 'relative', width: size, height: size, borderRadius: '50%', background: color }} />
    </span>
  );
}

// Mono micro-label
function Mono({ children, style }) {
  return <span style={{ fontFamily: BOOKR_MONO, fontSize: 11, letterSpacing: '0.04em', whiteSpace: 'nowrap', ...style }}>{children}</span>;
}

Object.assign(window, { bookrTokens, EqBars, LiveDot, Mono, BOOKR_FONT, BOOKR_MONO });
