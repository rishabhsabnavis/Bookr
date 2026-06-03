import type { ReactNode } from 'react';

interface SectionLabelProps {
  children: ReactNode;
  right?: ReactNode;
}

export function SectionLabel({ children, right }: SectionLabelProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
      <label style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{children}</label>
      {right}
    </div>
  );
}
