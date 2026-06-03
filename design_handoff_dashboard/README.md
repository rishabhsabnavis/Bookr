# Handoff: Bookr DJ Dashboard

Incremental build plan for porting the **Bookr dashboard** design into the real
codebase (React + Tailwind front end, FastAPI / MongoDB back end — see the GigCaller
spec). Built to be transferred to Claude Code **one step at a time**.

---

## How to use this package

The design reference is the HTML prototype `Bookr Dashboard.html` (+ its `dashboard/*.jsx`
and `directions/tokens.jsx` source). It is a **design reference**, not production code to
paste in — recreate it in your real stack (React function components + Tailwind),
wiring it to the FastAPI endpoints and MongoDB `call_logs` collection from the spec.

The build is split into **9 ordered steps** in `steps/`. Each step file is a
self-contained prompt you can hand to Claude Code on its own — it states the goal,
points at the matching part of the prototype, gives the exact data shape and tokens,
and lists acceptance criteria. Do them in order; each assumes the previous shipped.

| # | File | Builds |
|---|------|--------|
| 0 | `steps/00-foundation.md` | Tailwind theme from design tokens + motion keyframes |
| 1 | `steps/01-data-layer.md` | Types + API client for calls / holds (mock-first) |
| 2 | `steps/02-app-shell.md` | Sidebar + responsive top bar + view routing |
| 3 | `steps/03-overview-stats.md` | Greeting, stat cards, live call queue |
| 4 | `steps/04-hold-approval.md` | **HITL** hold cards + approve/pass mutations |
| 5 | `steps/05-call-log-table.md` | Outcomes table + filter chips |
| 6 | `steps/06-call-drawer.md` | Detail drawer: transcript thread + follow-up |
| 7 | `steps/07-recording-player.md` | Waveform recording player |
| 8 | `steps/08-watch-live.md` | Streaming transcript + waveform + agent pipeline |

> Tip: paste one step, let Claude Code finish + you review, commit, then paste the next.

---

## Fidelity

**High-fidelity.** Colors, type, spacing, radii, and motion are final. Recreate
pixel-faithfully using your component library where one exists, but keep the exact
token values below.

---

## Design tokens (light theme — source: `directions/tokens.jsx`)

**Color**
| Token | Hex | Use |
|---|---|---|
| `accent` | `#FC814A` | single accent — CTAs, selected, HOLD, live dots |
| `accentSoft` | `rgba(252,129,74,0.12)` | accent fills / chips |
| `accentLine` | `rgba(252,129,74,0.45)` | accent borders |
| `onAccent` | `#FFFFFF` | text on accent (auto → dark if accent is light) |
| `bg` | `#ECEBEC` | app background |
| `surface` | `#FFFFFF` | cards, sidebar, rows |
| `surface2` | `#F5F4F5` | table header, hover |
| `inset` | `#EFEEEF` | wells, monograms |
| `line` | `#DEDCDF` | primary borders |
| `line2` | `#E9E8EA` | hairlines / dividers |
| `ink` | `#2A2230` | primary text |
| `ink2` | `#564256` | secondary text (Vintage Grape) |
| `muted` | `#8C8893` | tertiary / mono labels |
| `faint` | `#B6B2BB` | disabled |
| `grape` | `#564256` | dark call-card surface (Watch live) |
| success / booked | `#3FBF7F` | BOOKED, "Approve & book", positive sentiment |
| voicemail | `#6C8FE0` | VOICEMAIL badge |
| negative | `#D9685A` | negative sentiment |

**Dark theme** (toggle): `bg #211B27`, `surface #2D2635`, `surface2 #372F40`,
`inset #241E2B`, `ink #F1EFF1`, `ink2 #CFC9D2`, lines at `rgba(255,255,255,0.10/0.06)`.
Derive both from one `tokens(theme, {accent})` helper — port `bookrTokens()` verbatim.

**Type**
- Sans (everything): `"Helvetica Neue", Helvetica, Arial, sans-serif`
- Mono (technical micro-labels only — BPM, status, counts, URLs, badges):
  `"JetBrains Mono", ui-monospace, Menlo, monospace`, ~11px, `letter-spacing: 0.04–0.12em`, often UPPERCASE
- Scale: page h1 28–30 / 700 / `-0.025em`; section h2 16 / 700; body 14–15; labels 13.5 / 600; mono 10.5–11

**Radius / spacing / shadow**
- Corner radius token `r` default **14px** (tweakable 4–22). Pills = `999px`.
- Card padding 18–22px; row padding 14px×22px; grid `gap` 12–16px.
- `shadowSm`: `0 8px 22px -16px rgba(36,28,42,0.22)`

**Motion keyframes** (port to CSS / Tailwind plugin):
- `bookrEq` — `scaleY(0.32)↔1` — equalizer bars (live audio)
- `bookrPing` — expanding fading ring — `LiveDot`
- `bookrPulse` — expanding box-shadow — big mic on launch
- `bookrBlink` — opacity 1↔0 step-end — streaming caret

---

## Data model (from the spec — `uploads/CLAUDE.md`)

Call log = MongoDB `call_logs`:
```
{ dj_id, venue_id, timestamp, duration_seconds, sentiment (-1..1),
  outcome: "booked"|"hold"|"declined"|"voicemail"|"no_answer"|"wrong_number",
  transcript, follow_up_task, hold_approved: bool|null, recording_url }
```
The prototype's richer per-row shape (with venue/city/type/fit/hold terms) is what the
UI consumes — see `steps/01-data-layer.md` for the exact TypeScript interface to build,
and `dashboard/data.jsx` for realistic sample values to seed mocks.

**HITL rule (non-negotiable):** the agent never books autonomously. A `hold` stays
`hold_approved: null` until the DJ approves in the dashboard → only then does it become
`booked`. Steps 4 + 6 implement this gate.

---

## Files in this bundle
- `Bookr Dashboard.html` — the prototype (open it to see the target)
- `dashboard/` — prototype source: `data, primitives, overview, calls, watch, app`
- `directions/tokens.jsx` — the token + EqBars/LiveDot/Mono helpers to port first
- `steps/00…08` — the ordered build prompts

If you want the onboarding flow too, `Bookr Onboarding — Soundcheck.html` +
`soundcheck/` ship the same system end-to-end.
