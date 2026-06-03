import type { ReactNode } from 'react';

interface ChipProps {
  on?: boolean;
  onClick: () => void;
  children: ReactNode;
  dashed?: boolean;
  sm?: boolean;
}

export function Chip({ on, onClick, children, dashed, sm }: ChipProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: sm ? '7px 13px' : '9px 16px',
        borderRadius: 999, fontSize: sm ? 13 : 13.5,
        fontWeight: 500,
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        cursor: 'pointer',
        background: on ? 'var(--accent)' : dashed ? 'transparent' : 'var(--surface)',
        color: on ? 'var(--on-accent)' : dashed ? 'var(--muted)' : 'var(--ink2)',
        border: `1px ${dashed ? 'dashed' : 'solid'} ${on ? 'var(--accent)' : 'var(--line)'}`,
        transition: 'all .14s',
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}
    >
      {on ? '✓ ' : ''}{children}
    </button>
  );
}
