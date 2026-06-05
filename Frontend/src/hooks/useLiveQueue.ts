import { useState, useEffect } from 'react';
import { callsClient } from '../lib/callsClient';

export type QueueStatus = 'queued' | 'dialing' | 'connected' | 'voicemail';

export interface QueueEntry {
  name: string;
  city: string;
  status: QueueStatus;
}

const FALLBACK: QueueEntry[] = [
  { name: 'Paragon',        city: 'Brooklyn',     status: 'connected' },
  { name: 'Black Flamingo', city: 'Brooklyn',     status: 'dialing'   },
  { name: 'TBA Brooklyn',   city: 'Brooklyn',     status: 'queued'    },
  { name: 'The Virgil',     city: 'Los Angeles',  status: 'queued'    },
  { name: 'Catch One',      city: 'Los Angeles',  status: 'queued'    },
];

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
