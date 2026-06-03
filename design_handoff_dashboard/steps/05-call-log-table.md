# Step 5 — Call log: outcomes table + filters

**Goal:** the scannable record of every call with outcome, sentiment, and length.

**Reference:** `dashboard/calls.jsx` (`CallsView`, `FILTERS`, `fmtDur`) and `OutcomeBadge`,
`Sentiment`, `VenueMark` in `dashboard/primitives.jsx`.

**Build**
1. Header: `Call log` (28/700) + subline.
2. **Filter chips**: `All / Hold / Booked / Declined / Voicemail / No answer`, each a pill
   with a trailing mono count. Active = accent fill / onAccent text. `Booked` counts
   outcome `booked` **plus** approved holds (read Step 1 store).
3. **Table** (`surface` card, hairline rows):
   - desktop header row (`surface2` bg) with mono labels:
     `VENUE | TIME | LENGTH | SENTIMENT | OUTCOME`, grid
     `2.2fr 1fr 0.8fr 1.6fr 1.2fr`.
   - each row is a button (hover → `surface2`): `VenueMark` + venue (14.5/600) + city mono;
     time; `fmtDur` length (`m:ss`, `—` if 0); `<Sentiment/>` bar; `<OutcomeBadge/>`.
   - **OutcomeBadge** colors: booked=success, hold=accent (+LiveDot), declined=muted,
     voicemail=`#6C8FE0`, no_answer/wrong_number=faint. All mono UPPERCASE pills.
   - **Sentiment** bar: track `inset`, fill width = `(v+1)/2`, color green >0.25 /
     negative <-0.05 / muted else, with signed value mono on the right. Hide for duration 0.
   - effective outcome respects hold decisions (approved hold shows BOOKED here too).
4. **Mobile**: collapse to two columns — venue (+ time in the mono subline) and a
   right-aligned outcome badge; drop time/length/sentiment columns.
5. Clicking a row opens the detail drawer (Step 6) via the store's `openId`.

**Acceptance**
- Filters recompute counts live; `Booked` includes approved holds.
- Row hover + click-to-open works; empty filter shows "No calls with this outcome."
- Sentiment colors/length formatting match the prototype.
