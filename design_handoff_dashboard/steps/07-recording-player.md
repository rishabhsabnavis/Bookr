# Step 7 — Recording player (waveform)

**Goal:** the audio player inside the call drawer (S3 `recording_url` in production).

**Reference:** `dashboard/calls.jsx` (`Recorder`) + `StaticWave` in
`dashboard/primitives.jsx`.

**Build**
1. **StaticWave** primitive: a row of `bars` (~56) flex bars with seeded pseudo-random
   heights (deterministic per mount — don't reshuffle on re-render). A `progress` 0..1
   fills bars left-of-playhead with accent (or a `played` color); unplayed bars use `line`
   at reduced opacity. Clicking the wave seeks (`onSeek(clientX)`).
2. **Recorder**: pill-ish `surface` card — round 42px accent play/pause button (play ▶ /
   pause ❚❚ in `onAccent`), the `StaticWave`, and a mono `m:ss / m:ss` timecode.
   - Play advances a position timer (mock playback ~0.5s per 120ms tick) until it reaches
     duration, then auto-pauses; restart from 0 if pressed at the end.
   - Clicking the waveform seeks; timecode + fill update.
   - In production, swap the timer for a real `<audio src={recordingUrl}>`:
     button ↔ `audio.play()/pause()`, `progress = currentTime/duration`,
     seek sets `audio.currentTime`. Keep the visual identical.

**Acceptance**
- Play fills the waveform progressively and updates the timecode; auto-stops at the end.
- Seeking by click jumps the playhead.
- Only renders when `durationSeconds > 0`.
