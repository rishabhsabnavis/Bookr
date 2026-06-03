import { Mono } from './primitives/Mono';
import type { Turn as TurnType } from '../types/calls';

interface TranscriptThreadProps {
  turns: TurnType[];
  venue: string;
}

interface TurnProps {
  turn: TurnType;
  venue: string;
  typing?: boolean;
}

export function Turn({ turn, venue, typing }: TurnProps) {
  const agent = turn.who === 'agent';
  return (
    <div>
      {turn.objection && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 999,
          background: 'var(--accent-soft)', marginBottom: 7,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>
          </svg>
          <Mono style={{ color: 'var(--accent)', fontWeight: 600 }}>
            OBJECTION HANDLED · {turn.objection.toUpperCase()}
          </Mono>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, flexDirection: agent ? 'row' : 'row-reverse' }}>
        {/* role chip */}
        <div style={{
          flex: '0 0 28px', width: 28, height: 28, borderRadius: 8,
          background: agent ? 'var(--accent)' : 'var(--inset)',
          color: agent ? 'var(--on-accent)' : 'var(--muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 10, fontWeight: 700,
        }}>
          {agent ? 'AI' : (venue || 'V')[0]}
        </div>

        {/* bubble */}
        <div style={{
          maxWidth: '82%', padding: '10px 13px', borderRadius: 13,
          borderTopLeftRadius: agent ? 3 : 13,
          borderTopRightRadius: agent ? 13 : 3,
          background: agent ? 'var(--surface)' : 'var(--accent-soft)',
          border: `1px solid ${agent ? 'var(--line)' : 'var(--accent-line)'}`,
          fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink)',
        }}>
          {turn.text}
          {typing && (
            <span style={{
              display: 'inline-block', width: 7, height: 15, marginLeft: 2,
              background: 'var(--accent)', verticalAlign: 'text-bottom',
              animation: 'bookrBlink 1s step-end infinite',
            }} />
          )}
        </div>
      </div>
    </div>
  );
}

export function TranscriptThread({ turns, venue }: TranscriptThreadProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {turns.map((turn, i) => (
        <Turn key={i} turn={turn} venue={venue} />
      ))}
    </div>
  );
}
