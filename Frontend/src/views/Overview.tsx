import { StatCard } from '../components/StatCard';
import { PanelHead } from '../components/PanelHead';
import { HoldCard } from '../components/HoldCard';
import { VenueMark } from '../components/VenueMark';
import { EqBars } from '../components/primitives/EqBars';
import { LiveDot } from '../components/primitives/LiveDot';
import { Mono } from '../components/primitives/Mono';
import { useDashboardStore } from '../store/dashboardStore';
import { useLiveQueue } from '../hooks/useLiveQueue';
import { MOCK_DJ } from '../lib/djData';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function Overview() {
  const { calls, holdState, decideHold, setView } = useDashboardStore();
  const queue = useLiveQueue();

  const completed = calls.filter((c) => c.durationSeconds > 0).length;
  const allHolds = calls.filter((c) => c.outcome === 'hold');
  const pendingCount = allHolds.filter((c) => holdState[c.id] === 'pending').length;
  const bookedCount = calls.filter((c) => c.outcome === 'booked').length
    + allHolds.filter((c) => holdState[c.id] === 'booked').length;
  const estFees = bookedCount > 0
    ? '$' + (bookedCount * 1.4).toFixed(1) + 'k'
    : '$0';

  return (
    <div style={{ maxWidth: 920, margin: '0 auto' }}>

      {/* ── Greeting ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, marginBottom: 22,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--ink)' }}>
            {greeting()}, {MOCK_DJ.name}
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 15, color: 'var(--muted)' }}>
            Your agent ran {calls.length} calls today across {MOCK_DJ.cities.slice(0, 2).join(' & ')}.
          </p>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 9,
          padding: '9px 15px', borderRadius: 999,
          background: 'var(--surface)', border: '1px solid var(--line)',
        }}>
          <LiveDot />
          <Mono style={{ color: 'var(--accent)', fontWeight: 600 }}>CAMPAIGN LIVE</Mono>
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12, marginBottom: 30,
      }}
        className="stats-grid"
      >
        <StatCard n={completed}    label="CALLS COMPLETED" />
        <StatCard n={pendingCount} label="HOLDS FOR YOU"   accent={pendingCount > 0} />
        <StatCard n={bookedCount}  label="BOOKED" />
        <StatCard n={estFees}      label="EST. BOOKED FEES" />
      </div>

      {/* ── Holds section placeholder (Step 4) ───────────────────────── */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
            Needs your approval
          </h2>
          {pendingCount > 0 && (
            <span style={{
              minWidth: 22, height: 22, padding: '0 7px', borderRadius: 999,
              background: 'var(--accent)', color: 'var(--on-accent)',
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 12, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {pendingCount}
            </span>
          )}
          <Mono style={{ color: 'var(--muted)', marginLeft: 4 }}>
            BOOKR NEVER CONFIRMS WITHOUT YOU
          </Mono>
        </div>

        {allHolds.length === 0 ? (
          <div style={{
            padding: 34, borderRadius: 14,
            border: '1.5px dashed var(--line)',
            background: 'var(--surface2)',
            textAlign: 'center', marginBottom: 34,
          }}>
            <div style={{ display: 'inline-flex', marginBottom: 12 }}>
              <EqBars bars={5} color="var(--faint)" h={20} w={3} gap={3} idle />
            </div>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)', maxWidth: 420, marginInline: 'auto', lineHeight: 1.5 }}>
              No holds yet. The agent will surface any here the moment a venue puts a date on the table.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: 14, marginBottom: 34,
          }}>
            {allHolds.map((c) => (
              <HoldCard
                key={c.id}
                call={c}
                status={holdState[c.id] ?? 'pending'}
                onApprove={() => decideHold(c.id, 'approve')}
                onPass={() => decideHold(c.id, 'pass')}
                onWatch={() => setView('watch')}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Live call queue ───────────────────────────────────────────── */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 8px 22px -16px rgba(36,28,42,0.22)',
      }}>
        <PanelHead
          title="LIVE CALL QUEUE"
          live
          right={<EqBars bars={6} color="var(--accent)" h={16} w={2.5} gap={2.5} />}
        />
        {queue.map((v, i) => {
          const active = v.status === 'dialing' || v.status === 'connected';
          const label = v.status === 'dialing' ? 'DIALING'
            : v.status === 'connected' ? 'ON CALL'
            : v.status === 'voicemail' ? 'VOICEMAIL'
            : 'QUEUED';

          return (
            <div
              key={v.name}
              style={{
                padding: '13px 22px',
                display: 'flex', alignItems: 'center', gap: 14,
                borderBottom: i < queue.length - 1 ? '1px solid var(--line2)' : 'none',
              }}
            >
              <VenueMark name={v.name} size={34} active={active} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{v.name}</div>
                <Mono style={{ color: 'var(--muted)' }}>{v.city.toUpperCase()}</Mono>
              </div>
              <span style={{
                padding: '5px 11px', borderRadius: 999,
                background: active ? 'var(--accent-soft)' : 'var(--inset)',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                {active && <LiveDot size={6} />}
                <Mono style={{ color: active ? 'var(--accent)' : 'var(--muted)', fontWeight: 600 }}>
                  {label}
                </Mono>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
