import type { ReactNode } from 'react';
import { LiveDot } from './primitives/LiveDot';
import { Mono } from './primitives/Mono';

interface PanelHeadProps {
  title: string;
  right?: ReactNode;
  live?: boolean;
}

export function PanelHead({ title, right, live }: PanelHeadProps) {
  return (
    <div style={{
      padding: '15px 22px',
      borderBottom: '1px solid var(--line2)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        {live && <LiveDot />}
        <Mono style={{ color: 'var(--muted)', letterSpacing: '0.12em', fontWeight: 600 }}>{title}</Mono>
      </div>
      {right}
    </div>
  );
}
