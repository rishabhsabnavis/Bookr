import { LiveDot } from './primitives/LiveDot';
import { Mono } from './primitives/Mono';
import { outcomeStyle } from '../lib/outcomeStyle';
import type { Outcome } from '../types/calls';

interface OutcomeBadgeProps {
  outcome: Outcome | string;
  live?: boolean;
}

export function OutcomeBadge({ outcome, live }: OutcomeBadgeProps) {
  const s = outcomeStyle(outcome);
  return (
    <span style={{
      padding: '5px 11px', borderRadius: 999,
      background: s.bg,
      display: 'inline-flex', alignItems: 'center', gap: 6,
      whiteSpace: 'nowrap',
    }}>
      {live && (outcome === 'hold' || outcome === 'booked') && (
        <LiveDot color={s.c} size={6} />
      )}
      <Mono style={{ color: s.c, fontWeight: 600 }}>{s.label}</Mono>
    </span>
  );
}
