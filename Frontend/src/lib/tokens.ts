const BOOKR_FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const BOOKR_MONO = '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace';

export interface Tokens {
  dark: boolean;
  font: string;
  mono: string;
  bg: string;
  surface: string;
  surface2: string;
  inset: string;
  line: string;
  line2: string;
  ink: string;
  ink2: string;
  muted: string;
  faint: string;
  grape: string;
  grapeDeep: string;
  accent: string;
  accentSoft: string;
  accentLine: string;
  onAccent: string;
  silver: string;
  granite: string;
  shadow: string;
  shadowSm: string;
  r: number;
  dense: boolean;
}

export function tokens(
  theme: 'light' | 'dark',
  opts: { accent?: string; r?: number; dense?: boolean } = {}
): Tokens {
  const dark = theme === 'dark';
  const accent = opts.accent ?? '#FC814A';
  const hex = accent.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const rgba = (a: number) => `rgba(${r},${g},${b},${a})`;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const onAccent = lum > 0.62 ? '#1A1206' : '#FFFFFF';

  return {
    dark,
    font: BOOKR_FONT,
    mono: BOOKR_MONO,
    bg:       dark ? '#211B27' : '#ECEBEC',
    surface:  dark ? '#2D2635' : '#FFFFFF',
    surface2: dark ? '#372F40' : '#F5F4F5',
    inset:    dark ? '#241E2B' : '#EFEEEF',
    line:     dark ? 'rgba(255,255,255,0.10)' : '#DEDCDF',
    line2:    dark ? 'rgba(255,255,255,0.06)' : '#E9E8EA',
    ink:      dark ? '#F1EFF1' : '#2A2230',
    ink2:     dark ? '#CFC9D2' : '#564256',
    muted:    dark ? '#96939B' : '#8C8893',
    faint:    dark ? '#6E6878' : '#B6B2BB',
    grape:    '#564256',
    grapeDeep: dark ? '#1A1520' : '#3C2F3D',
    accent,
    accentSoft:  dark ? rgba(0.18) : rgba(0.12),
    accentLine:  dark ? rgba(0.42) : rgba(0.45),
    onAccent,
    silver:  '#BFBFBF',
    granite: '#96939B',
    shadow:  dark
      ? '0 1px 0 rgba(255,255,255,0.04) inset, 0 18px 50px -24px rgba(0,0,0,0.6)'
      : '0 1px 0 rgba(255,255,255,0.8) inset, 0 18px 44px -26px rgba(36,28,42,0.30)',
    shadowSm: dark
      ? '0 8px 24px -16px rgba(0,0,0,0.7)'
      : '0 8px 22px -16px rgba(36,28,42,0.22)',
    r:     opts.r     ?? 14,
    dense: opts.dense ?? false,
  };
}

export { BOOKR_FONT, BOOKR_MONO };
