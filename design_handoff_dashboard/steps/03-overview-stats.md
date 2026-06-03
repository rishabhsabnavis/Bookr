# Step 3 — Overview: greeting, stat cards, live call queue

**Goal:** the top of the Overview view (everything except the hold cards, which are Step 4).

**Reference:** `dashboard/overview.jsx` (`Overview` greeting + stats + queue) and
`StatCard`, `VenueMark`, `PanelHead`, `outcomeStyle` in `dashboard/primitives.jsx`.

**Build**
1. **Header row**: `Good evening, {firstName}` (30/700/`-0.025em`) + subline
   "Your agent ran {n} calls today across {cities}". Right side: a `● CAMPAIGN LIVE`
   pill (surface bg, `line` border, `LiveDot` + mono accent text). Wrap on mobile.
2. **Stat row**: 4-up grid (`repeat(4,1fr)`, gap 12). Each `StatCard`: big number in
   **mono** 32/700, mono caption under it. Cards: `CALLS COMPLETED`, `HOLDS FOR YOU`
   (number turns accent when > 0), `BOOKED`, `EST. BOOKED FEES`. Collapse to 2-up on
   narrow widths.
3. **VenueMark** primitive: round-ish (radius = 30% of size) monogram tile, `inset` bg,
   first letter in muted 700; when `active`, swap to `accentSoft` bg + a 3-bar `<EqBars/>`.
4. **Live call queue** panel: `surface` card, `PanelHead` titled `LIVE CALL QUEUE` with a
   `LiveDot` and a 6-bar `<EqBars/>` on the right. Rows: `VenueMark` (active when
   dialing/connected) + name + city mono + a status pill. Status cycles
   `queued → dialing → connected → voicemail` on a timer (~1.4s/random row) — replicate
   the ambient "agent is working" motion. Active statuses (dialing/connected) use
   `accentSoft` pill + `LiveDot`; others use `inset`.

**Acceptance**
- Stat numbers come from the Step 1 store (completed = duration>0; holds = pending count;
  booked = outcome booked + approved holds).
- Queue rows animate through statuses continuously without layout shift.

**Numbers are real or omitted** — no decorative stats. Keep the 4 cards above; don't add more.
