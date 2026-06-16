import { useState, useEffect } from 'react';
import { callsClient } from '../lib/callsClient';

export type QueueStatus =
  | 'dialing' | 'hold' | 'booked' | 'voicemail'
  | 'declined' | 'no_answer' | 'wrong_number' | 'nonumber';

export interface QueueEntry {
  name: string;
  city: string;
  status: QueueStatus;
}

// label + whether it should render in the accent (live) style
export const QUEUE_STATUS: Record<QueueStatus, { label: string; accent: boolean }> = {
  dialing:      { label: 'DIALING',           accent: true  },
  hold:         { label: 'HOLD · NEEDS YOU',  accent: true  },
  booked:       { label: 'BOOKED',            accent: false },
  voicemail:    { label: 'VOICEMAIL',         accent: false },
  declined:     { label: 'DECLINED',          accent: false },
  no_answer:    { label: 'NO ANSWER',         accent: false },
  wrong_number: { label: 'WRONG NUMBER',      accent: false },
  nonumber:     { label: 'NUMBER NOT SET UP', accent: false },
};

interface MatchedRow { name: string; city: string; dialable: boolean; }

export function useLiveQueue() {
  const [venues, setVenues] = useState<MatchedRow[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);

  // Load the DJ's real matched venues; dialable = has a phone on file.
  useEffect(() => {
    const djId = localStorage.getItem('bookr.dj_id');
    if (!djId) return;
    const raw = localStorage.getItem('bookr.data');
    const parsed = raw ? JSON.parse(raw) : null;
    const city = parsed?.cities?.[0] ?? '';
    const venueType = parsed?.venues?.[0] ?? '';
    callsClient.getMatchedVenues(djId, city, venueType).then((vs) => {
      setVenues(vs.slice(0, 6).map((v) => ({
        name: v.venue_name,
        city: v.city,
        dialable: !!(v.contact_phone && String(v.contact_phone).trim()),
      })));
    });
  }, []);

  // Reflect the real call status: poll /calls and map each dialable venue to its
  // logged outcome. Until a call log exists it shows "dialing"; venues without a
  // number stay "number not set up".
  useEffect(() => {
    if (venues.length === 0) return;
    let cancelled = false;
    const poll = async () => {
      const calls = await callsClient.listCalls();
      const outcomeByVenue = new Map<string, QueueStatus>();
      for (const c of calls) {
        if (c.venue) outcomeByVenue.set(c.venue, c.outcome as QueueStatus);
      }
      if (cancelled) return;
      setQueue(venues.map((v) => ({
        name: v.name,
        city: v.city,
        status: !v.dialable ? 'nonumber' : (outcomeByVenue.get(v.name) ?? 'dialing'),
      })));
    };
    poll();
    const iv = setInterval(poll, 3000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [venues]);

  return queue;
}
