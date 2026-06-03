import { useRef } from 'react';

interface StaticWaveProps {
  bars?: number;
  progress?: number;
  h?: number;
  onSeek?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function StaticWave({ bars = 56, progress = 0, h = 40, onSeek }: StaticWaveProps) {
  const heights = useRef<number[]>([]);
  if (heights.current.length === 0) {
    heights.current = Array.from({ length: bars }, (_, i) =>
      0.22 + Math.abs(Math.sin(i * 1.7) * 0.55 + Math.sin(i * 0.6) * 0.3) * 0.78
    );
  }

  return (
    <div
      onClick={onSeek}
      style={{
        display: 'flex', alignItems: 'center', gap: 2,
        height: h, cursor: onSeek ? 'pointer' : 'default', flex: 1,
      }}
    >
      {heights.current.map((hv, i) => {
        const played = i / bars <= progress;
        return (
          <span
            key={i}
            style={{
              flex: 1,
              height: `${Math.max(8, hv * 100)}%`,
              borderRadius: 2,
              background: played ? 'var(--accent)' : 'var(--line)',
              opacity: played ? 1 : 0.5,
            }}
          />
        );
      })}
    </div>
  );
}
