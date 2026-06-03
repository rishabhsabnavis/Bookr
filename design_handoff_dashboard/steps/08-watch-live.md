# Step 8 — Watch live: streaming transcript + waveform + pipeline

**Goal:** the "listen in on an in-flight call" view — the most motion-heavy screen.

**Reference:** `dashboard/watch.jsx` (`WatchLive`) reusing `Turn` (Step 6), `PanelHead`,
`EqBars`, `LiveDot`. Sample call: `LIVE_CALL` in `dashboard/data.jsx`.

**Build**
1. **Layout**: header + a `1fr 300px` grid (stacks on mobile, panel on top).
2. **Transcript column** (`surface` card): `PanelHead` `LIVE TRANSCRIPT` + `LiveDot`, and a
   right-side state label that changes: `AGENT SPEAKING` (accent) / `BUYER SPEAKING` /
   `LISTENING` / `HOLD PLACED`. Body streams the conversation:
   - reveal turns one at a time; type out the **current** turn character-by-character
     (agent ~22ms, buyer ~16ms; step a few chars per tick). The in-progress turn shows a
     blinking caret (reuse `Turn`'s `typing`). Auto-scroll to bottom as it grows.
   - objection turns still get the `OBJECTION HANDLED` chip as they appear.
   - when the script ends, append a success panel: `Hold placed — May 28 · $1,400` +
     mono `SENT TO YOUR APPROVAL QUEUE` + a `Replay` button (restarts the stream).
   - **Production**: replace the scripted typewriter with a WebSocket/SSE stream of
     `{who, textDelta, objection?}` events from the outbound-caller agent; same rendering.
3. **Right column**:
   - **Call card** on `grape` (#564256, or `surface` in dark) — white text: `● ON CALL`
     + running timer, venue (22/700), mono `CITY · TYPE · FIT`, phone, and a 28-bar
     **live waveform** that animates (`bookrEq`) only while the agent is speaking, else
     sits in a frozen seeded shape.
   - **Agent pipeline** panel: rows `Deepgram / STT`, `Claude Sonnet / REASONING`,
     `ElevenLabs / TTS` — each a status dot (green glow when that stage is active:
     STT when listening, TTS when speaking, reasoning always) + name + mono role. Footer:
     `END-TO-END` → `480MS` (the spec's sub-600ms target), `—` once the call ends.
   - **Take over the call** button (phone icon); disabled after the call ends.

**Acceptance**
- Transcript types out, advances speaker-by-speaker, and auto-scrolls.
- Waveform animates only during agent speech; pipeline dots reflect the active stage.
- Reaching the end shows the hold panel; Replay restarts cleanly.

**Tie-off:** the hold this call places is the same kind the Step 4 queue approves — in a
real build, "HOLD PLACED" pushes a new pending hold into the store so the loop closes.
