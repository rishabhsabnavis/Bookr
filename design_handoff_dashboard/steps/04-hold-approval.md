# Step 4 — Hold approval (the HITL gate)

**Goal:** the product's core safety feature — DJ approves/passes every venue hold before
anything books. This is the highest-priority screen.

**Reference:** `dashboard/overview.jsx` (`HoldCard`, `quoteFor`, the "Needs your approval"
section). README → "HITL rule".

**Build**
1. **Section head**: `Needs your approval` (16/700) + a count pill (accent) + mono caption
   `BOOKR NEVER CONFIRMS WITHOUT YOU`.
2. **Hold cards** grid: `repeat(auto-fill, minmax(380px, 1fr))`, gap 14. Each `HoldCard`:
   - header: `VenueMark` + venue (17/700) + status badge (HOLD pending / BOOKED / DECLINED)
     + mono `CITY · TYPE · FIT {n}`.
   - **terms grid** (2×2, hairline-separated cells on `line2`): `DATE OFFERED`, `RATE`
     (`$1,400`), `SLOT`, `NEGOTIATED BY` = "Bookr agent". Each cell: mono label + 14.5/600 value.
   - **quote** block (`surface2` bg, accent open-quote glyph): the buyer line that agreed to
     the hold — pull the first buyer turn matching hold/open/work/rate keywords (`quoteFor`).
   - **actions** (pending only): `Approve & book` (solid **success #3FBF7F**, dark-green
     text) + `Pass` (ghost) + right-aligned text link `Review call →` (jumps to Watch live).
3. **State transitions** via Step 1 `decideHold`:
   - Approve → card border turns success, badge → `BOOKED`, actions replaced by a green
     check row "Booked — contract sent to {venue}. Agent moved on."
   - Pass → badge → `DECLINED`, card dims to ~0.62 opacity.
   - Decisions update the sidebar/overview pending count immediately + persist.
4. Empty state when no holds: dashed `inset` panel with an idle `<EqBars/>` and copy
   "No holds yet. The agent will surface any here the moment a venue puts a date on the table."

**Acceptance**
- Approving/passing is reflected in the Call log (Step 5) and stat cards without reload.
- A booked/declined hold can't be re-decided (actions gone).
- Border/opacity/badge states match the three statuses exactly.

**This is the one screen to get pixel-right** — it's the trust moment of the product.
