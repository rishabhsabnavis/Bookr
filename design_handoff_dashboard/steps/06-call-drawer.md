# Step 6 — Call detail drawer: transcript + follow-up + inline HITL

**Goal:** the right-side drawer opened from a call-log row, showing the full call.

**Reference:** `dashboard/calls.jsx` (`CallDrawer`, `TranscriptThread`, `Turn`). The
`Recorder` inside it is Step 7 — stub the player area for now.

**Build**
1. **Overlay + panel**: fixed full-screen scrim (`rgba(20,14,26,0.42)`, fade in) + a
   right panel max-width 560px that slides in (`translateX(100%)→0`,
   `cubic-bezier(.4,0,.2,1)`, ~260ms). Close on scrim click or ×; reverse the animation
   before unmounting (~240ms).
2. **Header** (`surface`): `VenueMark` 46 + venue (19/700) + `OutcomeBadge` + mono
   `CITY · TYPE · PHONE`, and the × button.
3. **Body** (scrolls):
   - **meta grid** 3-up hairline cells: `WHEN`, `DURATION` (`fmtDur`), `CONTACT`.
   - **recording player** placeholder (Step 7 fills it) — only when duration > 0.
   - **hold block** (only if outcome `hold`): tinted `accentSoft` panel titled by state
     (`HOLD AWAITING YOUR APPROVAL` / `APPROVED — BOOKED` / `PASSED`), big DATE / RATE /
     SLOT values, and — when still pending — small `Approve & book` + `Pass` buttons that
     call the same `decideHold` from Step 4 (kept in sync).
   - **follow-up task** card (if present): check icon + mono `FOLLOW-UP TASK` + text.
   - **transcript thread**: `TranscriptThread` → `Turn` per line:
     - agent turns left, buyer turns right (reverse flex); 28px role chip (`AI` accent /
       venue-initial inset); bubble radius 13 with a flattened top corner toward the chip;
       agent bubble `surface`, buyer bubble `accentSoft` + accent border.
     - if `turn.objection`, render an `◆ OBJECTION HANDLED · {OBJECTION}` accent chip
       above the bubble (the spec's 4 objections).
     - support a `typing` flag that appends a blinking caret (reused by Step 8).
   - duration 0 ⇒ no transcript; show "the line rang out." / "number was not in service."

**Acceptance**
- Drawer opens/closes smoothly from any row; scrim click + × both close.
- Approving inside the drawer updates the table, overview, and sidebar count together.
- Objection chips appear on the right transcript turns; agent/buyer sides correct.
