import { useState, useEffect } from 'react';
import { EqBars } from '../../components/primitives/EqBars';
import { LiveDot } from '../../components/primitives/LiveDot';
import { Mono } from '../../components/primitives/Mono';
import { callsClient } from '../../lib/callsClient';
import type { SoundcheckData } from '../../types/soundcheck';

type CallStatus = 'dialing' | 'hold' | 'booked' | 'voicemail' | 'declined' | 'no_answer' | 'wrong_number' | 'nonumber';

interface Props {
  data: SoundcheckData;
  onBack: () => void;
}

interface VenueRow { name: string; city: string; dialable: boolean; }

const STATUS_STYLE: Record<CallStatus, { c: string; bg: string; label: string }> = {
  dialing:      { c: 'var(--accent)', bg: 'var(--accent-soft)',    label: 'DIALING'           },
  hold:         { c: 'var(--accent)', bg: 'var(--accent-soft)',    label: 'HOLD · NEEDS YOU'  },
  booked:       { c: '#3FBF7F',       bg: 'rgba(63,191,127,0.14)', label: 'BOOKED'            },
  voicemail:    { c: 'var(--muted)',  bg: 'var(--inset)',          label: 'VOICEMAIL'         },
  declined:     { c: 'var(--muted)',  bg: 'var(--inset)',          label: 'DECLINED'          },
  no_answer:    { c: 'var(--muted)',  bg: 'var(--inset)',          label: 'NO ANSWER'         },
  wrong_number: { c: 'var(--muted)',  bg: 'var(--inset)',          label: 'WRONG NUMBER'      },
  nonumber:     { c: 'var(--faint)',  bg: 'var(--inset)',          label: 'NUMBER NOT SET UP' },
};

export function LaunchScreen({ data, onBack }: Props) {
  const cities = data.cities.length ? data.cities : ['your markets'];
  const [venueList, setVenueList] = useState<VenueRow[]>([]);
  const [statuses, setStatuses] = useState<CallStatus[]>([]);
  const [matched, setMatched] = useState(0);

  // Fetch the real matched venues for this DJ. Venues with a phone are dialable;
  // the rest are shown but flagged "number not set up" and never dialed.
  useEffect(() => {
    const djId = localStorage.getItem('bookr.dj_id');
    if (!djId) return;
    callsClient.getMatchedVenues(djId, data.cities[0] ?? '', data.venues[0] ?? '').then((venues) => {
      const list: VenueRow[] = venues.slice(0, 8).map((v) => ({
        name: v.venue_name,
        city: v.city,
        dialable: !!(v.contact_phone && String(v.contact_phone).trim()),
      }));
      setVenueList(list);
      // dialable venues start "dialing"; once a real call log lands for the
      // venue, polling below swaps in its actual outcome.
      setStatuses(list.map((v) => (v.dialable ? 'dialing' : 'nonumber') as CallStatus));
    });
  }, []);

  // Animate matched count up to real venue count
  useEffect(() => {
    const target = venueList.length;
    if (matched >= target) return;
    const iv = setInterval(() => setMatched((m) => m < target ? Math.min(target, m + 1) : m), 80);
    return () => clearInterval(iv);
  }, [venueList.length, matched]);

  // Reflect REAL call status: poll /calls and map each dialable venue to its
  // logged outcome (hold/voicemail/declined/...). Until a call log exists for a
  // venue it stays "dialing". Non-dialable venues stay "number not set up".
  useEffect(() => {
    if (venueList.length === 0) return;
    let cancelled = false;
    const poll = async () => {
      const calls = await callsClient.listCalls();
      const outcomeByVenue = new Map<string, CallStatus>();
      for (const c of calls) {
        if (c.venue) outcomeByVenue.set(c.venue, c.outcome as CallStatus);
      }
      if (cancelled) return;
      setStatuses(venueList.map((v) =>
        !v.dialable ? 'nonumber' : (outcomeByVenue.get(v.name) ?? 'dialing')
      ));
    };
    poll();
    const iv = setInterval(poll, 3000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [venueList]);

  const inFlight = statuses.filter((s) => s === 'dialing').length;
  const holds    = statuses.filter((s) => s === 'hold').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', color: 'var(--ink)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6vh 24px 60px' }}>
      <div style={{ width: '100%', maxWidth: 720 }}>

        {/* hero */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 84, height: 84, borderRadius: 24, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 26, animation: 'bookrPulse 2s ease-out infinite' }}>
            <EqBars bars={5} color="var(--on-accent)" h={34} w={4} gap={4} />
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <LiveDot /><Mono style={{ color: 'var(--accent)', fontWeight: 600 }}>CAMPAIGN LIVE</Mono>
          </div>
          <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em' }}>
            The agent is calling for you
          </h1>
          <p style={{ margin: '12px 0 0', fontSize: 16, color: 'var(--muted)', maxWidth: 460, lineHeight: 1.55 }}>
            {data.name || 'Your profile'} is live. Bookr is dialing venues across {cities.slice(0, 3).join(', ')} and will ping you the moment a room puts a date on hold.
          </p>
        </div>

        {/* stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, margin: '34px 0 24px' }}>
          {[
            { n: matched,  l: 'VENUES MATCHED' },
            { n: inFlight, l: 'CALLS IN FLIGHT' },
            { n: holds,    l: 'HOLDS FOR YOU', accent: holds > 0 },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: '18px 20px', textAlign: 'center' }}>
              <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 30, fontWeight: 700, color: s.accent ? 'var(--accent)' : 'var(--ink)' }}>{s.n}</div>
              <Mono style={{ color: 'var(--muted)', marginTop: 4, display: 'block' }}>{s.l}</Mono>
            </div>
          ))}
        </div>

        {/* live queue */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Mono style={{ color: 'var(--muted)', letterSpacing: '0.12em' }}>LIVE CALL QUEUE</Mono>
            <EqBars bars={6} color="var(--accent)" h={16} w={2.5} gap={2.5} />
          </div>
          {venueList.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <Mono style={{ color: 'var(--muted)' }}>MATCHING VENUES…</Mono>
            </div>
          )}
          {venueList.map((v, i) => {
            const s = STATUS_STYLE[statuses[i] ?? 'queued'];
            const active = statuses[i] === 'dialing' || statuses[i] === 'hold';
            return (
              <div key={i} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: i < venueList.length - 1 ? '1px solid var(--line2)' : 'none' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--inset)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 34px' }}>
                  {active
                    ? <EqBars bars={3} color="var(--accent)" h={14} w={2} gap={2} seed={i} />
                    : <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>{v.name[0]}</span>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{v.name}</div>
                  <Mono style={{ color: 'var(--muted)' }}>{v.city.toUpperCase()}</Mono>
                </div>
                <span style={{ padding: '5px 11px', borderRadius: 999, background: s.bg, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {active && <LiveDot color={s.c} size={6} />}
                  <Mono style={{ color: s.c, fontWeight: 600 }}>{s.label}</Mono>
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 26 }}>
          <button onClick={onBack} style={{ padding: '12px 22px', borderRadius: 14, border: '1px solid var(--line)', background: 'transparent', color: 'var(--ink2)', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            ← Edit profile
          </button>
        </div>
      </div>
    </div>
  );
}
