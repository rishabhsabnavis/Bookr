# Step 0 — Foundation: theme tokens + motion

**Goal:** stand up the design system so every later step has tokens to reference.
Nothing visual ships yet except a tokens module and global keyframes.

**Reference:** `directions/tokens.jsx` (the `bookrTokens()` helper + `EqBars`, `LiveDot`,
`Mono`). README → "Design tokens".

**Build**
1. A `tokens(theme: 'light'|'dark', { accent }): Tokens` function that returns the full
   token object — port `bookrTokens()` exactly, including the accent-derived
   `accentSoft / accentLine / onAccent` (onAccent flips to dark ink when accent luminance
   > 0.62). Keep `r` (radius) and `dense` as fields callers set after.
2. Wire it into Tailwind: expose the light/dark palette as CSS variables on a `[data-theme]`
   root and map them in `tailwind.config` (`bg`, `surface`, `surface2`, `inset`, `line`,
   `line2`, `ink`, `ink2`, `muted`, `faint`, `accent`, plus `success #3FBF7F`,
   `voicemail #6C8FE0`, `negative #D9685A`). Fonts: `font-sans` = Helvetica Neue stack,
   `font-mono` = JetBrains Mono (import from Google Fonts).
3. Global keyframes `bookrEq`, `bookrPing`, `bookrPulse`, `bookrBlink` (values in README).
4. Three shared primitives as components:
   - `<EqBars bars color h w gap idle seed />` — animated equalizer (audio activity)
   - `<LiveDot color size />` — pulsing dot (`bookrPing`)
   - `<Mono>` — the technical micro-label (mono font, 11px, tracked, nowrap)

**Acceptance**
- Toggling `data-theme="dark"` swaps every surface/ink token.
- Changing the accent input recolors accent + soft/line/onAccent derivations.
- `<EqBars/>` animates; `idle` renders a frozen seeded shape.

**Do not** introduce a second accent or any gradient. One accent, neutral grays.
