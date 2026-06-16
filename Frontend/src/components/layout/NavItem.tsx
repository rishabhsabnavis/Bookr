import { LiveDot } from '../primitives/LiveDot';

interface NavItemProps {
  label: string;
  sub: string;
  active: boolean;
  badge?: number;
  live?: boolean;
  soon?: boolean;
  onClick: () => void;
}

export function NavItem({ label, sub, active, badge, live, soon, onClick }: NavItemProps) {
  return (
    <button
      onClick={soon ? undefined : onClick}
      disabled={soon}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px', borderRadius: 11, textAlign: 'left',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        cursor: soon ? 'default' : 'pointer', width: '100%',
        background: active ? 'var(--inset)' : 'transparent',
        border: `1px solid ${active ? 'var(--line)' : 'transparent'}`,
        opacity: soon ? 0.45 : 1,
      }}
    >
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: soon ? 'var(--muted)' : active ? 'var(--ink)' : 'var(--ink2)' }}>
          {label}
        </span>
        <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
          {sub}
        </span>
      </span>
      {soon && (
        <span style={{
          padding: '2px 7px', borderRadius: 999,
          background: 'var(--inset)', border: '1px solid var(--line2)',
          color: 'var(--muted)',
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
        }}>
          SOON
        </span>
      )}
      {live && !soon && <LiveDot size={7} />}
      {!soon && badge != null && badge > 0 && (
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
  { key: 'watch',    label: 'Watch live',  sub: 'In-flight call', soon: true },
  { key: 'calls',    label: 'Call log',    sub: 'Outcomes & transcripts' },
] as const;

export type NavKey = typeof NAV[number]['key'];
