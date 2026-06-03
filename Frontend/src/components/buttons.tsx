import type { ReactNode } from 'react';

interface BtnProps {
  children: ReactNode;
  onClick?: () => void;
  sm?: boolean;
}

export function SolidBtn({ children, onClick, sm }: BtnProps & { tone?: 'green' | 'accent' }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: sm ? '8px 14px' : '11px 20px',
        borderRadius: 14, border: 'none',
        background: '#3FBF7F',
        color: '#06281A',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        fontSize: sm ? 13 : 14, fontWeight: 700,
        cursor: 'pointer', whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

export function GhostBtn({ children, onClick, sm }: BtnProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: sm ? '8px 13px' : '11px 18px',
        borderRadius: 14,
        border: '1px solid var(--line)',
        background: 'transparent',
        color: 'var(--ink2)',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        fontSize: sm ? 13 : 14, fontWeight: 600,
        cursor: 'pointer', whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}
