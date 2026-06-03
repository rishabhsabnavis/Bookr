# Step 1 — Data layer: types + API client (mock-first)

**Goal:** one typed source of truth for calls + holds, with a swappable client so the UI
can build against mock data now and the FastAPI endpoints later.

**Reference:** README → "Data model"; sample values in `dashboard/data.jsx`
(`CALLS`, `LIVE_CALL`, `DASH_DJ`).

**Build**
1. TypeScript interfaces:
   ```ts
   type Outcome = 'booked'|'hold'|'declined'|'voicemail'|'no_answer'|'wrong_number';
   type HoldStatus = 'pending'|'booked'|'declined';      // UI-side decision state
   interface Turn { who: 'agent'|'buyer'; text: string; objection?: string }
   interface HoldTerms { date: string; rate: number; slot: string }
   interface Call {
     id: string; venue: string; city: string; type: string;
     contact: string; phone: string; when: string;     // display string
     durationSeconds: number; outcome: Outcome; sentiment: number; // -1..1
     fit: number;                                        // 0..100 match score
     hold?: HoldTerms; followUp?: string; transcript: Turn[];
     recordingUrl?: string; holdApproved?: boolean|null;
   }
   ```
2. A `callsClient` with `listCalls()`, `getCall(id)`, and
   `decideHold(id, 'approve'|'pass')`. Back it with the mock array from `data.jsx` now;
   leave a clear seam to point at `GET /calls`, `GET /calls/:id`,
   `POST /calls/:id/hold` (FastAPI) later. `decideHold('approve')` sets
   `hold_approved=true` + outcome→`booked`; `'pass'` sets `hold_approved=false` +
   outcome→`declined`.
3. A small client-state store (Zustand/Context/your choice) holding the calls list and a
   `holdState: Record<id, HoldStatus>` derived from `hold_approved`. Persist `holdState`
   and the active view to `localStorage` (keys `bookr.dash.*`) so a refresh keeps decisions.

**Acceptance**
- `listCalls()` returns the 10 seed calls; 3 are `hold` + `pending`.
- `decideHold` flips status and is reflected everywhere reading the store.
- Refresh preserves decisions + current view.

**Note:** `durationSeconds: 0` ⇒ no transcript / no recording (no_answer, wrong_number).
