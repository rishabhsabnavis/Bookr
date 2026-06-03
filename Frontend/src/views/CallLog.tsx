import { useState } from 'react';
import { VenueMark } from '../components/VenueMark';
import { OutcomeBadge } from '../components/OutcomeBadge';
import { Sentiment } from '../components/Sentiment';
import { Mono } from '../components/primitives/Mono';
import { useDashboardStore } from '../store/dashboardStore';
import { useVW } from '../hooks/useVW';
import { fmtDur } from '../lib/fmtDur';
import type { Outcome } from '../types/calls';

const FILTERS = ['All', 'Hold', 'Booked', 'Declined', 'Voicemail', 'No answer'] as const;
type Filter = typeof FILTERS[number];

const FILTER_MAP: Record<string, Outcome> = {
  Hold: 'hold', Booked: 'booked', Declined: 'declined',
  Voicemail: 'voicemail', 'No answer': 'no_answer',
};

export function CallLog() {
  const { calls, holdState, setOpenId } = useDashboardStore();
  const [filter, setFilter] = useState<Filter>('All');
  const vw = useVW();
  const mobile = vw < 900;

  const effectiveOutcome = (id: string, outcome: Outcome): Outcome =>
    holdState[id] === 'booked' ? 'booked'
    : holdState[id] === 'declined' ? 'declined'
    : outcome;

  const countFor = (f: Filter): number => {
    if (f === 'All') return calls.length;
    if (f === 'Booked') return calls.filter((c) =>
      c.outcome === 'booked' || holdState[c.id] === 'booked'
    ).length;
    return calls.filter((c) => c.outcome === FILTER_MAP[f]).length;
  };

  const view = calls.filter((c) => {
    if (filter === 'All') return true;
    if (filter === 'Booked') return c.outcome === 'booked' || holdState[c.id] === 'booked';
    return c.outcome === FILTER_MAP[filter];
  });

  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }}>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--ink)' }}>
          Call log
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 14.5, color: 'var(--muted)' }}>
          Every outbound call, transcript, and recording the agent produced today.
        </p>
      </div>

      {/* ── Filter chips ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => {
          const on = filter === f;
          const count = countFor(f);
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 14px', borderRadius: 999,
                border: `1px solid ${on ? 'var(--accent)' : 'var(--line)'}`,
                background: on ? 'var(--accent)' : 'var(--surface)',
                color: on ? 'var(--on-accent)' : 'var(--ink2)',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 7,
              }}
            >
              {f}
              <Mono style={{ color: on ? 'var(--on-accent)' : 'var(--muted)', opacity: 0.85 }}>
                {count}
              </Mono>
            </button>
          );
        })}
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 8px 22px -16px rgba(36,28,42,0.22)',
      }}>
        {/* desktop header */}
        {!mobile && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2.2fr 1fr 0.8fr 1.6fr 1.2fr',
            gap: 16, padding: '12px 22px',
            borderBottom: '1px solid var(--line2)',
            background: 'var(--surface2)',
          }}>
            {['VENUE', 'TIME', 'LENGTH', 'SENTIMENT', 'OUTCOME'].map((h) => (
              <Mono key={h} style={{ color: 'var(--muted)', letterSpacing: '0.1em' }}>{h}</Mono>
            ))}
          </div>
        )}

        {/* rows */}
        {view.map((c, i) => {
          const eff = effectiveOutcome(c.id, c.outcome);
          const time = c.when.split('· ')[1] ?? c.when;
          return (
            <button
              key={c.id}
              onClick={() => setOpenId(c.id)}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              style={{
                width: '100%', textAlign: 'left',
                display: 'grid',
                gridTemplateColumns: mobile ? '1fr auto' : '2.2fr 1fr 0.8fr 1.6fr 1.2fr',
                gap: mobile ? 10 : 16,
                alignItems: 'center',
                padding: mobile ? '14px 16px' : '14px 22px',
                border: 'none',
                borderBottom: i < view.length - 1 ? '1px solid var(--line2)' : 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                transition: 'background .1s',
              }}
            >
              {/* venue */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <VenueMark name={c.venue} size={36} />
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: 14.5, fontWeight: 600, color: 'var(--ink)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {c.venue}
                  </div>
                  <Mono style={{ color: 'var(--muted)' }}>
                    {c.city.toUpperCase()}{mobile ? ' · ' + time : ''}
                  </Mono>
                </div>
              </div>

              {/* time — desktop only */}
              {!mobile && (
                <span style={{ fontSize: 13.5, color: 'var(--ink2)' }}>{time}</span>
              )}

              {/* length — desktop only */}
              {!mobile && (
                <Mono style={{ color: 'var(--ink2)' }}>{fmtDur(c.durationSeconds)}</Mono>
              )}

              {/* sentiment — desktop only */}
              {!mobile && (
                c.durationSeconds > 0
                  ? <Sentiment v={c.sentiment} />
                  : <span style={{ color: 'var(--faint)' }}>—</span>
              )}

              {/* outcome */}
              <div style={{ display: 'flex', justifyContent: mobile ? 'flex-end' : 'flex-start' }}>
                <OutcomeBadge outcome={eff} live={eff === 'hold'} />
              </div>
            </button>
          );
        })}

        {/* empty state */}
        {view.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
            No calls with this outcome.
          </div>
        )}
      </div>
    </div>
  );
}
