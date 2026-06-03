import type { Call } from '../types/calls';
import { MOCK_CALLS } from './mockData';

// Swap BASE_URL to point at the FastAPI server when ready.
const BASE_URL = import.meta.env.VITE_API_URL ?? null;

async function listCalls(): Promise<Call[]> {
  if (!BASE_URL) return MOCK_CALLS;
  const res = await fetch(`${BASE_URL}/calls`);
  const data = await res.json();
  return data.calls;
}

async function getCall(id: string): Promise<Call | undefined> {
  if (!BASE_URL) return MOCK_CALLS.find((c) => c.id === id);
  const res = await fetch(`${BASE_URL}/calls/${id}`);
  if (!res.ok) return undefined;
  return res.json();
}

async function decideHold(id: string, decision: 'approve' | 'pass'): Promise<void> {
  if (!BASE_URL) return;
  const endpoint = decision === 'approve' ? 'approve' : 'decline';
  await fetch(`${BASE_URL}/holds/${id}/${endpoint}`, { method: 'POST' });
}

export const callsClient = { listCalls, getCall, decideHold };
