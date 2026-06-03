import { Mono } from '../primitives/Mono';

interface SelectCardProps {
  on: boolean;
  onClick: () => void;
  label: string;
  sub: string;
}

export function SelectCard({ on, onClick, label, sub }: SelectCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: 'left', padding: '15px 17px', borderRadius: 14,
        cursor: 'pointer',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        background: on ? 'var(--accent-soft)' : 'var(--surface)',
        border: `1.5px solid ${on ? 'var(--accent)' : 'var(--line)'}`,
        transition: 'all .14s',
        display: 'flex', alignItems: 'center', gap: 12,
      }}
    >
      <span style={{
        flex: '0 0 20px', width: 20, height: 20, borderRadius: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: on ? 'var(--accent)' : 'transparent',
        border: `1.5px solid ${on ? 'var(--accent)' : 'var(--line)'}`,
        color: 'var(--on-accent)', fontSize: 12, fontWeight: 700,
      }}>
        {on ? '✓' : ''}
      </span>
      <span>
        <span style={{ display: 'block', fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{label}</span>
        <Mono style={{ color: 'var(--muted)', display: 'block', marginTop: 2 }}>{sub}</Mono>
      </span>
    </button>
  );
}
