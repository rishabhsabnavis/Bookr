import { VenueMark } from './VenueMark';
import { OutcomeBadge } from './OutcomeBadge';
import { SolidBtn, GhostBtn } from './buttons';
import { Mono } from './primitives/Mono';
import type { Call } from '../types/calls';
import type { HoldStatus } from '../types/calls';

interface HoldCardProps {
  call: Call;
  status: HoldStatus;
  onApprove: () => void;
  onPass: () => void;
  onWatch: () => void;
}

function quoteFor(call: Call): string {
  const turn = call.transcript.find(
    (x) => x.who === 'buyer' && /hold|open|work|pencil|two thousand|sixteen|fourteen/i.test(x.text)
  );
  return turn?.text ?? 'Buyer agreed to hold the date pending your approval.';
}

const TERMS_LABELS = ['DATE OFFERED', 'RATE', 'SLOT', 'NEGOTIATED BY'] as const;

export function HoldCard({ call, status, onApprove, onPass, onWatch }: HoldCardProps) {
  const h = call.hold;
  if (!h) return null;

  const decided = status === 'booked' || status === 'declined';

  const borderColor = status === 'booked'
    ? '#3FBF7F'
    : status === 'declined'
    ? 'var(--line)'
    : 'var(--accent-line)';

  const termValues = [h.date, `$${h.rate.toLocaleString()}`, h.slot, 'Bookr agent'];

  return (
    <div style={{
      position: 'relative',
      background: 'var(--surface)',
      border: `1px solid ${borderColor}`,
      borderRadius: 14,
      padding: 22,
      boxShadow: '0 8px 22px -16px rgba(36,28,42,0.22)',
      opacity: status === 'declined' ? 0.62 : 1,
      transition: 'opacity .2s, border-color .2s',
    }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <VenueMark name={call.venue} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>{call.venue}</span>
            {status === 'pending'  && <OutcomeBadge outcome="hold"     live />}
            {status === 'booked'   && <OutcomeBadge outcome="booked"   live />}
            {status === 'declined' && <OutcomeBadge outcome="declined" />}
          </div>
          <Mono style={{ color: 'var(--muted)', display: 'block', marginTop: 4 }}>
            {call.city.toUpperCase()} · {call.type.toUpperCase()} · FIT {call.fit}
          </Mono>
        </div>
      </div>

      {/* ── Terms grid ─────────────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 1, background: 'var(--line2)',
        border: '1px solid var(--line2)',
        borderRadius: 10, overflow: 'hidden',
        margin: '18px 0',
      }}>
        {TERMS_LABELS.map((label, i) => (
          <div key={label} style={{ background: 'var(--surface)', padding: '12px 14px' }}>
            <Mono style={{ color: 'var(--muted)', display: 'block', marginBottom: 5 }}>{label}</Mono>
            <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{termValues[i]}</span>
          </div>
        ))}
      </div>

      {/* ── Quote ──────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 10,
        padding: '12px 14px',
        borderRadius: 10,
        background: 'var(--surface2)',
        marginBottom: decided ? 0 : 18,
      }}>
        <span style={{ color: 'var(--accent)', fontSize: 20, lineHeight: 1, fontFamily: 'Georgia, serif', flexShrink: 0 }}>
          "
        </span>
        <span style={{ fontSize: 13.5, color: 'var(--ink2)', lineHeight: 1.5 }}>
          {quoteFor(call)}
        </span>
      </div>

      {/* ── Actions ────────────────────────────────────────────────── */}
      {status === 'pending' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SolidBtn onClick={onApprove}>Approve &amp; book</SolidBtn>
          <GhostBtn onClick={onPass}>Pass</GhostBtn>
          <button
            onClick={onWatch}
            style={{
              marginLeft: 'auto', border: 'none', background: 'transparent',
              color: 'var(--accent)',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Review call →
          </button>
        </div>
      )}

      {status === 'booked' && (
        <div style={{
          marginTop: 18, display: 'flex', alignItems: 'center', gap: 8,
          color: '#3FBF7F',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>
            Booked — contract sent to {call.venue}. Agent moved on.
          </span>
        </div>
      )}
    </div>
  );
}
