import { Mono } from './primitives/Mono';

interface SentimentProps {
  v: number; // -1..1
}

export function Sentiment({ v }: SentimentProps) {
  const pos = Math.round(((v + 1) / 2) * 100);
  const c = v > 0.25 ? '#3FBF7F' : v < -0.05 ? '#D9685A' : 'var(--muted)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 110 }}>
      <div style={{ position: 'relative', flex: 1, height: 5, borderRadius: 5, background: 'var(--inset)' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${pos}%`, background: c, borderRadius: 5,
        }} />
      </div>
      <Mono style={{ color: c, fontWeight: 600, width: 30, textAlign: 'right' }}>
        {v > 0 ? '+' : ''}{v.toFixed(2)}
      </Mono>
    </div>
  );
}
