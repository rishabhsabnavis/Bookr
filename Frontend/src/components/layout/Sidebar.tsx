import { useNavigate } from 'react-router-dom';
import { Brand } from '../Brand';
import { VenueMark } from '../VenueMark';
import { LiveDot } from '../primitives/LiveDot';
import { Mono } from '../primitives/Mono';
import { NavItem, NAV, type NavKey } from './NavItem';
import { MOCK_DJ } from '../../lib/djData';

interface SidebarProps {
  activeTab: NavKey;
  pendingCount: number;
  onTabChange: (tab: NavKey) => void;
}

export function Sidebar({ activeTab, pendingCount, onTabChange }: SidebarProps) {
  const navigate = useNavigate();
  return (
    <div style={{
      width: 270, flex: '0 0 270px',
      padding: '28px 22px',
      display: 'flex', flexDirection: 'column',
      borderRight: '1px solid var(--line)',
      background: 'var(--surface)',
      height: '100%',
    }}>
      <Brand />

      <Mono style={{ color: 'var(--muted)', marginTop: 32, marginBottom: 12, fontSize: 10.5, letterSpacing: '0.14em', display: 'block' }}>
        CAMPAIGN · {MOCK_DJ.cities.length} MARKETS
      </Mono>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map((s) => (
          <NavItem
            key={s.key}
            label={s.label}
            sub={s.sub}
            active={activeTab === s.key}
            live={s.key === 'watch'}
            badge={s.key === 'overview' ? pendingCount : undefined}
            onClick={() => onTabChange(s.key)}
          />
        ))}
      </div>

      <button
        onClick={() => navigate('/onboarding')}
        style={{
          marginTop: 'auto', marginBottom: 12,
          padding: '11px', borderRadius: 14,
          border: '1px solid var(--accent-line)',
          background: 'var(--accent-soft)',
          color: 'var(--accent)',
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
        }}
      >
        + New campaign
      </button>

      <div style={{
        padding: '15px',
        borderRadius: 12,
        background: 'var(--inset)',
        border: '1px solid var(--line2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <VenueMark name={MOCK_DJ.name} size={34} active />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{MOCK_DJ.name}</div>
            <Mono style={{ color: 'var(--muted)' }}>
              {MOCK_DJ.genres.slice(0, 2).join(' · ').toUpperCase()}
            </Mono>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 11 }}>
          <LiveDot size={6} />
          <Mono style={{ color: 'var(--ink2)', fontWeight: 600 }}>AGENT DIALING NOW</Mono>
        </div>
      </div>
    </div>
  );
}
