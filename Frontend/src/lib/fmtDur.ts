export function fmtDur(s: number): string {
  if (!s) return '—';
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}
