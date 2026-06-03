import { EqBars } from './primitives/EqBars';

export function Brand() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9,
        background: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <EqBars bars={3} color="var(--on-accent)" h={13} w={2.5} gap={2.5} />
      </div>
      <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
        Bookr
      </span>
    </div>
  );
}
