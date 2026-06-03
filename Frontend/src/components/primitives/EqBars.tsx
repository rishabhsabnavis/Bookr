interface EqBarsProps {
  bars?: number;
  color?: string;
  h?: number;
  w?: number;
  gap?: number;
  idle?: boolean;
  seed?: number;
}

const HEIGHTS = [0.45, 0.9, 0.6, 1, 0.5, 0.85, 0.7, 0.95, 0.4, 0.75, 0.55, 0.88];

export function EqBars({ bars = 5, color = 'var(--accent)', h = 26, w = 3, gap = 3, idle = false, seed = 0 }: EqBarsProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap, height: h }}>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          style={{
            width: w,
            height: h,
            borderRadius: w,
            background: color,
            transformOrigin: 'center',
            '--eq-dur': `${0.7 + (i % 4) * 0.18}s`,
            '--eq-delay': `${(i + seed) * 0.09}s`,
            animation: idle ? 'none' : 'bookrEq var(--eq-dur) ease-in-out var(--eq-delay) infinite',
            transform: idle ? `scaleY(${HEIGHTS[(i + seed) % HEIGHTS.length]})` : undefined,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
