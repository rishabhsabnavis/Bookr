import { EqBars } from './primitives/EqBars';

interface VenueMarkProps {
  name: string;
  size?: number;
  active?: boolean;
}

export function VenueMark({ name, size = 38, active }: VenueMarkProps) {
  return (
    <div style={{
      width: size, height: size, flex: `0 0 ${size}px`,
      borderRadius: Math.round(size * 0.3),
      background: active ? 'var(--accent-soft)' : 'var(--inset)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {active
        ? <EqBars bars={3} color="var(--accent)" h={Math.round(size * 0.36)} w={2} gap={2} />
        : <span style={{ fontSize: size * 0.36, fontWeight: 700, color: 'var(--muted)' }}>
            {(name || '?')[0]}
          </span>
      }
    </div>
  );
}
