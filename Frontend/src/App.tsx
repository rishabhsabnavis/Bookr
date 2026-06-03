import { useEffect } from 'react';
import { useVW } from './hooks/useVW';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { CallDrawer } from './components/CallDrawer';
import { Overview } from './views/Overview';
import { WatchLive } from './views/WatchLive';
import { CallLog } from './views/CallLog';
import { useDashboardStore } from './store/dashboardStore';
import type { NavKey } from './components/layout/NavItem';

export default function App() {
  const { calls, holdState, activeView, openId, loadCalls, setView, setOpenId, decideHold } = useDashboardStore();
  const vw = useVW();
  const mobile = vw < 900;

  useEffect(() => { loadCalls(); }, [loadCalls]);

  const pendingCount = calls.filter(
    (c) => c.outcome === 'hold' && holdState[c.id] === 'pending'
  ).length;

  const handleTabChange = (tab: NavKey) => setView(tab);

  return (
    <div
      data-theme="light"
      style={{
        height: '100vh', display: 'flex',
        flexDirection: mobile ? 'column' : 'row',
        background: 'var(--bg)',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        color: 'var(--ink)',
        overflow: 'hidden',
      }}
    >
      {!mobile && (
        <Sidebar
          activeTab={activeView}
          pendingCount={pendingCount}
          onTabChange={handleTabChange}
        />
      )}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {mobile && (
          <TopBar
            activeTab={activeView}
            pendingCount={pendingCount}
            onTabChange={handleTabChange}
          />
        )}

        <div style={{
          flex: 1, overflowY: 'auto',
          padding: mobile ? '22px 18px 40px' : '34px 40px 48px',
        }}>
          {activeView === 'overview' && <Overview />}
          {activeView === 'watch'    && <WatchLive />}
          {activeView === 'calls'    && <CallLog />}
        </div>
      </div>

      {openId && (() => {
        const call = calls.find((c) => c.id === openId);
        if (!call) return null;
        return (
          <CallDrawer
            call={call}
            holdStatus={holdState[openId]}
            onClose={() => setOpenId(null)}
            onApprove={() => decideHold(openId, 'approve')}
            onPass={() => decideHold(openId, 'pass')}
            onWatch={() => { setOpenId(null); setView('watch'); }}
          />
        );
      })()}
    </div>
  );
}
