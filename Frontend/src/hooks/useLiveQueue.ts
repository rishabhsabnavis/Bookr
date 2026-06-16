import { useState, useEffect } from 'react';
import { callsClient } from '../lib/callsClient';

export type QueueStatus = 'queued' | 'dialing' | 'connected' | 'voicemail';

export interface QueueEntry {
  name: string;
  city: string;
  status: QueueStatus;
}

// No mock fallback — the queue is empty until a real DJ's matched venues load.
const FALLBACK: QueueEntry[] = [];

const FLOW: Record<QueueStatus, QueueStatus> = {
  queued: 'dialing', dialing: 'connected', connected: 'voicemail', voicemail: 'queued',
};

export function useLiveQueue() {
  const [queue, setQueue] = useState<QueueEntry[]>(FALLBACK);

  useEffect(() => {
    const djId = localStorage.getItem('bookr.dj_id');
    if (!djId) return;
    const raw = localStorage.getItem('bookr.data');
    const parsed = raw ? JSON.parse(raw) : null;
    const city = parsed?.cities?.[0] ?? '';
    const venueType = parsed?.venues?.[0] ?? '';
    callsClient.getMatchedVenues(djId, city, venueType).then((venues) => {
      if (venues.length > 0) {
        setQueue(venues.slice(0, 6).map((v, i) => ({
          name: v.venue_name,
          city: v.city,
          status: (['connected', 'dialing', 'queued', 'queued', 'queued', 'queued'] as QueueStatus[])[i] ?? 'queued',
        })));
      }
    });
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setQueue((q) => {
        if (q.length === 0) return q; // nothing to cycle yet — avoid indexing []
        const next = q.map((x) => ({ ...x }));
        const i = Math.floor(Math.random() * next.length);
        next[i].status = FLOW[next[i].status];
        return next;
      });
    }, 1400);
    return () => clearInterval(iv);
  }, []);

  return queue;
}
