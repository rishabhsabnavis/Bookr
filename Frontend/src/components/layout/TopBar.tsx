import { Brand } from '../Brand';
import { LiveDot } from '../primitives/LiveDot';
import { Mono } from '../primitives/Mono';
import { NAV, type NavKey } from './NavItem';

interface TopBarProps {
  activeTab: NavKey;
  pendingCount: number;
  onTabChange: (tab: NavKey) => void;
}

export function TopBar({ activeTab, pendingCount, onTabChange }: TopBarProps) {
  return (
    <div style={{
      padding: '14px 18px',
      borderBottom: '1px solid var(--line)',
      background: 'var(--surface)',
      position: 'sticky', top: 0, zIndex: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Brand />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <LiveDot size={7} />
          <Mono style={{ color: 'var(--accent)', fontWeight: 600 }}>LIVE</Mono>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 13, overflowX: 'auto', paddingBottom: 2 }}>
        {NAV.map((s) => {
          const active = activeTab === s.key;
          const soon = 'soon' in s && s.soon;
          const badge = s.key === 'overview' && pendingCount > 0 ? pendingCount : null;
          return (
            <button
              key={s.key}
              onClick={soon ? undefined : () => onTabChange(s.key)}
              disabled={soon}
              style={{
                flex: '0 0 auto', padding: '7px 14px', borderRadius: 999,
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: 13, fontWeight: 600, cursor: soon ? 'default' : 'pointer',
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? 'var(--on-accent)' : 'var(--muted)',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
                display: 'inline-flex', alignItems: 'center', gap: 7,
                opacity: soon ? 0.45 : 1,
              }}
            >
              {s.label}
              {soon && (
                <span style={{
                  padding: '1px 6px', borderRadius: 999, background: 'var(--inset)',
                  border: '1px solid var(--line2)', color: 'var(--muted)',
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                }}>SOON</span>
              )}
              {badge != null && (
                <span style={{
                  minWidth: 16, height: 16, padding: '0 4px', borderRadius: 999,
                  background: active ? 'var(--on-accent)' : 'var(--accent)',
                  color: active ? 'var(--accent)' : 'var(--on-accent)',
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: 10, fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
