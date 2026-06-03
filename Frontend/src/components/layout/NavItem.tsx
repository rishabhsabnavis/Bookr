import { LiveDot } from '../primitives/LiveDot';

interface NavItemProps {
  label: string;
  sub: string;
  active: boolean;
  badge?: number;
  live?: boolean;
  onClick: () => void;
}

export function NavItem({ label, sub, active, badge, live, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px', borderRadius: 11, textAlign: 'left',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        cursor: 'pointer', width: '100%',
        background: active ? 'var(--inset)' : 'transparent',
        border: `1px solid ${active ? 'var(--line)' : 'transparent'}`,
      }}
    >
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: active ? 'var(--ink)' : 'var(--ink2)' }}>
          {label}
        </span>
        <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
          {sub}
        </span>
      </span>
      {live && <LiveDot size={7} />}
      {badge != null && badge > 0 && (
        <span style={{
          minWidth: 20, height: 20, padding: '0 6px', borderRadius: 999,
          background: 'var(--accent)', color: 'var(--on-accent)',
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 11, fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}

export const NAV = [
  { key: 'overview', label: 'Overview',   sub: 'Holds & today' },
  { key: 'watch',    label: 'Watch live',  sub: 'In-flight call' },
  { key: 'calls',    label: 'Call log',    sub: 'Outcomes & transcripts' },
] as const;

export type NavKey = typeof NAV[number]['key'];
