# Step 2 — App shell: sidebar, responsive top bar, routing

**Goal:** the dashboard frame with three views switchable from nav. No view content yet —
just placeholders.

**Reference:** `dashboard/app.jsx` (`DashApp`, `Sidebar`, `TopBar`, `NavItem`, `Brand`).
See README screenshots region: fixed left sidebar on desktop, sticky pill top bar on mobile.

**Build**
1. **Brand**: 30×30 rounded-9 accent tile containing a 3-bar `<EqBars/>` in `onAccent`,
   next to "Bookr" at 19px/700/`-0.02em`.
2. **Desktop sidebar** (≥900px): 270px fixed, `surface` bg, right `line` border.
   - mono caption `CAMPAIGN · {n} MARKETS`
   - nav items (Overview / Watch live / Call log) — each a left-aligned button with
     label (14/600) + sub (12/muted); active item gets `inset` bg + `line` border + radius
     `r-3`. `Watch live` shows a trailing `<LiveDot/>`; `Overview` shows a pending-holds
     count pill (accent bg, onAccent text) when > 0.
   - bottom DJ card: monogram + name + genres mono + `● AGENT DIALING NOW`.
3. **Mobile top bar** (<900px): sticky; Brand + `● LIVE`; horizontal scroll row of nav
   pills (active = accent fill). Same pending badge behavior.
4. Routing: local state `tab` ('overview'|'watch'|'calls') persisted to `localStorage`
   (`bookr.dash.tab`). Content area scrolls independently; padding `34px 40px` desktop /
   `22px 18px` mobile.

**Acceptance**
- Resizing across 900px swaps sidebar ↔ top bar with no layout break.
- Nav switches the content region; selection persists across refresh.
- Pending-holds badge reads from the Step 1 store.

**Watch out:** the whole app is `height: 100vh; overflow: hidden` with only the content
column scrolling — match this so the sidebar/top bar stay pinned.
