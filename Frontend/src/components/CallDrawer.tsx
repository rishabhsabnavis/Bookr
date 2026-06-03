import { useState, useEffect } from 'react';
import { Recorder } from './Recorder';
import { VenueMark } from './VenueMark';
import { OutcomeBadge } from './OutcomeBadge';
import { TranscriptThread } from './TranscriptThread';
import { SolidBtn, GhostBtn } from './buttons';
import { Mono } from './primitives/Mono';
import { fmtDur } from '../lib/fmtDur';
import type { Call } from '../types/calls';
import type { HoldStatus } from '../types/calls';

interface CallDrawerProps {
  call: Call;
  holdStatus: HoldStatus | undefined;
  onClose: () => void;
  onApprove: () => void;
  onPass: () => void;
  onWatch: () => void;
}

const W = Math.min(560, typeof window !== 'undefined' ? window.innerWidth : 560);

export function CallDrawer({ call, holdStatus, onClose, onApprove, onPass, onWatch }: CallDrawerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const r = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(r);
  }, []);

  const close = () => {
    setOpen(false);
    setTimeout(onClose, 240);
  };

  const eff = holdStatus === 'booked' ? 'booked'
    : holdStatus === 'declined' ? 'declined'
    : call.outcome;

  const holdLabel = holdStatus === 'booked' ? 'APPROVED — BOOKED'
    : holdStatus === 'declined' ? 'PASSED'
    : 'HOLD AWAITING YOUR APPROVAL';

  const holdBorder = holdStatus === 'booked' ? '#3FBF7F'
    : 'var(--accent-line)';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
      {/* scrim */}
      <div
        onClick={close}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(20,14,26,0.42)',
          opacity: open ? 1 : 0,
          transition: 'opacity .24s',
        }}
      />

      {/* panel */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0,
        width: W, maxWidth: '100vw',
        background: 'var(--bg)',
        borderLeft: '1px solid var(--line)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .26s cubic-bezier(.4,0,.2,1)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-30px 0 60px -30px rgba(0,0,0,0.4)',
      }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--line)',
          background: 'var(--surface)',
          display: 'flex', alignItems: 'flex-start', gap: 14,
        }}>
          <VenueMark name={call.venue} size={46} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 19, fontWeight: 700, color: 'var(--ink)' }}>{call.venue}</span>
              <OutcomeBadge outcome={eff} live={eff === 'hold'} />
            </div>
            <Mono style={{ color: 'var(--muted)', display: 'block', marginTop: 5 }}>
              {call.city.toUpperCase()} · {call.type.toUpperCase()} · {call.phone}
            </Mono>
          </div>
          <button
            onClick={close}
            style={{
              border: 'none', background: 'transparent',
              color: 'var(--muted)', cursor: 'pointer',
              fontSize: 22, lineHeight: 1, padding: 4,
            }}
          >×</button>
        </div>

        {/* ── Body ───────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>

          {/* meta grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
            gap: 1, background: 'var(--line2)',
            border: '1px solid var(--line2)',
            borderRadius: 14, overflow: 'hidden', marginBottom: 20,
          }}>
            {[
              { l: 'WHEN',     v: call.when.split('· ')[1] ?? call.when },
              { l: 'DURATION', v: fmtDur(call.durationSeconds) },
              { l: 'CONTACT',  v: call.contact },
            ].map((x) => (
              <div key={x.l} style={{ background: 'var(--surface)', padding: '12px 14px' }}>
                <Mono style={{ color: 'var(--muted)', display: 'block', marginBottom: 5 }}>{x.l}</Mono>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{x.v}</span>
              </div>
            ))}
          </div>

          {/* recording player */}
          {call.durationSeconds > 0 && (
            <Recorder durationSeconds={call.durationSeconds} />
          )}

          {/* hold block */}
          {call.outcome === 'hold' && call.hold && (
            <div style={{
              margin: '0 0 20px',
              padding: '16px 18px', borderRadius: 14,
              border: `1px solid ${holdBorder}`,
              background: holdStatus === 'declined' ? 'var(--surface2)' : 'var(--accent-soft)',
            }}>
              <Mono style={{
                color: holdStatus === 'booked' ? '#3FBF7F' : 'var(--accent)',
                fontWeight: 600,
              }}>
                {holdLabel}
              </Mono>
              <div style={{ display: 'flex', gap: 22, margin: '12px 0 14px' }}>
                {[
                  { v: call.hold.date,                    l: 'DATE' },
                  { v: `$${call.hold.rate.toLocaleString()}`, l: 'RATE' },
                  { v: call.hold.slot,                    l: 'SLOT' },
                ].map((x) => (
                  <div key={x.l}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>{x.v}</div>
                    <Mono style={{ color: 'var(--muted)' }}>{x.l}</Mono>
                  </div>
                ))}
              </div>
              {(!holdStatus || holdStatus === 'pending') && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <SolidBtn sm onClick={onApprove}>Approve &amp; book</SolidBtn>
                  <GhostBtn sm onClick={onPass}>Pass</GhostBtn>
                </div>
              )}
            </div>
          )}

          {/* follow-up task */}
          {call.followUp && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 15px', borderRadius: 14,
              background: 'var(--surface)', border: '1px solid var(--line)',
              marginBottom: 20,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'var(--inset)', flex: '0 0 30px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--muted)',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              </div>
              <div>
                <Mono style={{ color: 'var(--muted)', display: 'block', marginBottom: 2 }}>FOLLOW-UP TASK</Mono>
                <span style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 500 }}>{call.followUp}</span>
              </div>
            </div>
          )}

          {/* transcript */}
          <Mono style={{ color: 'var(--muted)', letterSpacing: '0.12em', display: 'block', marginBottom: 14 }}>
            TRANSCRIPT
          </Mono>
          {call.durationSeconds === 0 || call.transcript.length === 0 ? (
            <div style={{ fontSize: 13.5, color: 'var(--muted)', padding: '20px 0' }}>
              No conversation — {eff === 'no_answer' ? 'the line rang out.' : 'number was not in service.'}
            </div>
          ) : (
            <TranscriptThread turns={call.transcript} venue={call.venue} />
          )}

          {/* watch live link */}
          {call.outcome === 'hold' && (
            <button
              onClick={onWatch}
              style={{
                marginTop: 20, border: 'none', background: 'transparent',
                color: 'var(--accent)',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: 0,
              }}
            >
              Watch this call live →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
