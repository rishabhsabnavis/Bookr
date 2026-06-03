import { useState, useEffect } from 'react';

export type QueueStatus = 'queued' | 'dialing' | 'connected' | 'voicemail';

export interface QueueEntry {
  name: string;
  city: string;
  status: QueueStatus;
}

const INITIAL_QUEUE: QueueEntry[] = [
  { name: 'Paragon',       city: 'Brooklyn',     status: 'connected' },
  { name: 'Black Flamingo',city: 'Brooklyn',     status: 'dialing' },
  { name: 'TBA Brooklyn',  city: 'Brooklyn',     status: 'queued' },
  { name: 'The Virgil',    city: 'Los Angeles',  status: 'queued' },
  { name: 'Catch One',     city: 'Los Angeles',  status: 'queued' },
];

const FLOW: Record<QueueStatus, QueueStatus> = {
  queued:    'dialing',
  dialing:   'connected',
  connected: 'voicemail',
  voicemail: 'queued',
};

export function useLiveQueue() {
  const [queue, setQueue] = useState<QueueEntry[]>(INITIAL_QUEUE);

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
