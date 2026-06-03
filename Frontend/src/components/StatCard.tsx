import { Mono } from './primitives/Mono';

interface StatCardProps {
  n: number | string;
  label: string;
  accent?: boolean;
}

export function StatCard({ n, label, accent }: StatCardProps) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--line)',
      borderRadius: 14,
      padding: '20px 22px',
      boxShadow: '0 8px 22px -16px rgba(36,28,42,0.22)',
    }}>
      <div style={{
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontSize: 32, fontWeight: 700, lineHeight: 1,
        color: accent ? 'var(--accent)' : 'var(--ink)',
      }}>
        {n}
      </div>
      <Mono style={{ color: 'var(--muted)', marginTop: 9, display: 'block', letterSpacing: '0.1em' }}>
        {label}
      </Mono>
    </div>
  );
}
