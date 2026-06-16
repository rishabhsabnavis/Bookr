import type { Call } from '../types/calls';
import { MOCK_CALLS } from './mockData';
import type { SoundcheckData } from '../types/soundcheck';

// Normalize the API URL — if the env var was set without a scheme (e.g. in
// Vercel), `${BASE_URL}/path` would resolve as a relative URL against the
// dashboard's own origin and 405. Always force an absolute https URL.
const RAW_API_URL = import.meta.env.VITE_API_URL ?? null;
const BASE_URL = RAW_API_URL
  ? (/^https?:\/\//.test(RAW_API_URL) ? RAW_API_URL : `https://${RAW_API_URL}`)
  : null;
const API_KEY = import.meta.env.VITE_API_KEY ?? '';

// Shared secret sent on every request; the backend rejects calls without it.
function authHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
    ...(extra ?? {}),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCall(raw: any): Call {
  return {
    id: raw._id ?? raw.id,
    venue: raw.venue_name ?? raw.venue ?? raw.venue_id ?? 'Unknown Venue',
    city: raw.city ?? '—',
    type: raw.venue_type ?? '—',
    contact: raw.contact_name ?? '—',
    phone: raw.contact_phone ?? '—',
    when: raw.timestamp ? new Date(raw.timestamp).toLocaleString() : '—',
    durationSeconds: raw.duration_seconds ?? raw.durationSeconds ?? 0,
    outcome: raw.outcome,
    sentiment: raw.sentiment ?? 0,
    fit: raw.fit ?? 0,
    followUp: raw.follow_up_task ?? raw.followUp,
    transcript: Array.isArray(raw.transcript) ? raw.transcript : [],
    recordingUrl: raw.recording_url ?? raw.recordingUrl,
    holdApproved: raw.hold_approved ?? raw.holdApproved ?? null,
  };
}

// Mock fallback is only used when no API URL is configured (pure local/offline
// preview). With a real backend we always show real data — empty when there are
// no calls yet — so demos never display fake venues.
async function listCalls(): Promise<Call[]> {
  if (!BASE_URL) return MOCK_CALLS;
  try {
    const res = await fetch(`${BASE_URL}/calls`, { headers: authHeaders() });
    const data = await res.json();
    return (data.calls ?? []).map(mapCall);
  } catch {
    return [];
  }
}

async function getCall(id: string): Promise<Call | undefined> {
  if (!BASE_URL) return MOCK_CALLS.find((c) => c.id === id);
  try {
    const res = await fetch(`${BASE_URL}/calls/${id}`, { headers: authHeaders() });
    if (!res.ok) return undefined;
    return mapCall(await res.json());
  } catch {
    return undefined;
  }
}

async function decideHold(id: string, decision: 'approve' | 'pass'): Promise<void> {
  if (!BASE_URL) return;
  const endpoint = decision === 'approve' ? 'approve' : 'decline';
  await fetch(`${BASE_URL}/holds/${id}/${endpoint}`, { method: 'POST', headers: authHeaders() });
}

async function createDJ(data: SoundcheckData): Promise<string> {
  if (!BASE_URL) throw new Error('No API URL configured');
  const res = await fetch(`${BASE_URL}/djs`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      dj_name: data.name,
      bio: data.bio,
      genre_tags: data.genres,
      mix_links: data.mixes.map((m) => m.url),
      target_cities: data.cities,
      venue_type_preferences: data.venues,
      past_gigs: data.pastGigs,
      rate_min: data.rate,
      availability: data.dates,
      bpm_range: { min: data.bpmLo, max: data.bpmHi },
    }),
  });
  if (!res.ok) throw new Error('Failed to create DJ profile');
  const json = await res.json();
  return json.dj_id;
}

async function startCampaign(djId: string, city: string, venueType: string): Promise<void> {
  if (!BASE_URL) return;
  await fetch(`${BASE_URL}/campaign/start`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ dj_id: djId, city, venue_type: venueType }),
  });
}

export interface MatchedVenue {
  id: number;
  venue_name: string;
  city: string;
  venue_type: string;
  contact_name: string;
  contact_phone: string;
  similarity: number;
}

async function getMatchedVenues(djId: string, city = '', venueType = ''): Promise<MatchedVenue[]> {
  if (!BASE_URL) return [];
  try {
    const params = new URLSearchParams({ dj_id: djId });
    if (city) params.set('city', city);
    if (venueType) params.set('venue_type', venueType);
    const res = await fetch(`${BASE_URL}/venues/matched?${params}`, { headers: authHeaders() });
    const data = await res.json();
    return data.venues ?? [];
  } catch {
    return [];
  }
}

export const callsClient = { listCalls, getCall, decideHold, createDJ, startCampaign, getMatchedVenues };
