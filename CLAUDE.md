# GigCaller — Project Context for Claude Code

> **How to use this file**: This is a reference document. Use Claude Code to ask questions about architecture decisions, how components connect, what a specific agent should do, or why a particular tech choice was made. Claude Code is not writing code for you — you are. This file just gives it the project context so you don't have to re-explain things every session.

---

## What GigCaller is

A multi-agent voice system that automates DJ gig booking by cold-calling music venues on behalf of DJs. A DJ registers their profile and target cities. The system finds relevant venue contacts, generates a personalized pitch, and an outbound voice agent calls talent buyers, handles the conversation live, and logs outcomes. The DJ gets notified of any holds and approves bookings before they're confirmed.

**The core insight**: The music industry gig booking pipeline is broken — venues use email, DJs use Instagram DMs. There is no automated outreach layer. This project builds it.

---

## Architecture overview

### User layer
- DJ onboarding form (React) — uploads bio, genre tags, mix links, EPK PDF, target cities, venue type preferences, availability, rate range, past gigs
- Dashboard (React) — shows venue queue, call outcomes, holds pending approval, call recordings
- Human-in-the-loop approval — DJ explicitly confirms any hold before agent books

### Orchestration layer
- **LangGraph supervisor agent** — reads DJ profile from MongoDB, delegates to subagents in parallel, aggregates outcomes, triggers HITL interrupt on holds

### Subagent layer (run in parallel under supervisor)
- **Venue discovery agent** — queries pgvector with DJ profile embedding, filters by city + venue type + genre, returns ranked venue list
- **Pitch builder agent** — reads venue profile + DJ profile, generates a tailored 60-second spoken pitch per venue
- **Outbound caller agent** — uses LiveKit outbound SIP to dial venue, delivers pitch, manages call state (ringing → connected → speaking → ended)
- **Objection handler agent** — handles the 4 main objections: fully booked, not hiring DJs, send an email instead, who are you

### Data layer
- **pgvector** — venue profile embeddings + DJ profile embeddings (cosine similarity search)
- **MongoDB** — raw DJ profiles, call logs, booking holds, follow-up tasks
- **AWS S3** — call recording audio storage
- **Venue contact DB** — scraped from web + Booking-Agent.io, structured venue data

---

## Tech stack and why each was chosen

| Layer | Tool | Why |
|---|---|---|
| Voice pipeline | LiveKit Agents SDK | WebRTC-grade real-time audio, native outbound SIP, used by OpenAI and Meta in production |
| Phone calls | LiveKit outbound SIP + Twilio SIP trunk | Required for dialing real phone numbers over PSTN |
| STT | Deepgram Nova-3 | Fastest transcription at ~150ms, telephony-optimized, integrates natively with LiveKit |
| LLM | Claude Sonnet 4.6 | Best at nuanced reasoning, citation-aware responses, tool calling reliability |
| TTS | ElevenLabs | Natural voice quality, low first-syllable latency with streaming |
| Agent orchestration | LangGraph supervisor pattern | Stateful graph, parallel subagent execution, built-in HITL interrupt support |
| Vector DB | pgvector (PostgreSQL extension) | Operational simplicity — no extra service, runs in Postgres, cosine similarity queries, IVFFlat indexing |
| Embeddings | OpenAI text-embedding-3-small | Cost-effective, 512-dimension reduction available, sufficient for venue/DJ similarity |
| App database | MongoDB | Flexible schema for call logs and DJ profiles, async with Motor |
| Backend | FastAPI (async) | Async endpoints, Pydantic validation, auto docs, matches Python async ecosystem |
| Frontend | React + Tailwind | Already in stack, fast UI iteration |
| Deployment | Railway + Docker | Easiest deployment for this stack, GitHub integration, free tier works for demos |
| Audio storage | AWS S3 + boto3 | Standard, cheap, reliable for call recordings |

---

## Critical architectural decisions

### Voice pipeline: STT → LLM → TTS, NOT realtime model
GigCaller uses the classic pipeline (Deepgram → Claude → ElevenLabs), not OpenAI's Realtime API or any speech-to-speech model. Reasons:
- Realtime models don't perform well over PSTN phone calls (optimized for web audio, 8kHz codec degrades quality)
- Pipeline gives full control over what the agent says — critical for pitch generation and objection handling
- Tool calling is more reliable with text-based LLMs
- Debuggability: when something goes wrong you can isolate STT vs LLM vs TTS
- Can swap any component independently without re-architecting

### pgvector over Pinecone or other managed vector DBs
- Runs inside existing Postgres instance — no extra service to manage
- Operational simplicity is the point at this stage
- Cosine similarity with IVFFlat indexing is sufficient for 500–1000 venue profiles
- Signals database engineering understanding to SWE hiring managers (not just "I used a vector API")
- Use `text-embedding-3-small` with `dimensions=512` to reduce from 1536 for faster queries

### LangGraph supervisor over flat agent list
- Supervisor reads DJ profile → decides which venues to target → delegates to venue discovery + pitch builder in parallel → queues calls sequentially
- Parallel execution via LangGraph's map-reduce pattern (venue discovery + pitch builder run simultaneously)
- State persistence across call turns via LangGraph checkpointing
- HITL via `interrupt()` — agent pauses and waits for DJ approval before confirming any hold

### Human-in-the-loop is non-negotiable
The agent never confirms a booking autonomously. It can hold, log, and follow up — but any actual booking confirmation requires explicit DJ approval through the dashboard. This is both a safety design and a product decision (DJs need to trust the system before handing over full autonomy).

---

## Agent responsibilities in detail

### Supervisor agent
- Entry point for every campaign
- Reads DJ profile from MongoDB
- Runs venue discovery subagent to get ranked venue list
- Presents list to DJ on dashboard (DJ can remove venues before calls start)
- For each approved venue: runs pitch builder → queues outbound call
- Monitors call outcomes → triggers HITL on holds → logs everything

### Venue discovery agent
- Input: DJ profile embedding (genre, city, venue type preferences)
- Queries pgvector with cosine similarity
- Filters: city match, venue type match, genre compatibility
- Returns: ranked list of 10–20 venues with contact info and fit score
- Data source: pre-scraped venue DB (Crawl4AI + Booking-Agent.io)

### Pitch builder agent
- Input: specific venue profile + DJ full profile
- Generates a tailored spoken pitch (~60 seconds when read aloud)
- Structure: intro (DJ name + sound) → social proof (relevant past gig) → value prop (why this venue) → ask (available date) → mix link reference
- Pitch should vary meaningfully per venue type (nightclub pitch ≠ wedding venue pitch)

### Outbound caller agent
- Dials venue via LiveKit outbound SIP
- Detects: human answered vs IVR vs voicemail (LiveKit AMD — Answering Machine Detection)
- If IVR: navigates to relevant department
- If voicemail: leaves a shortened 20-second version of the pitch
- If human: delivers full pitch, manages conversation turns
- Passes to objection handler when resistance detected

### Objection handler agent
The 4 objections to handle and counter-strategies:
1. "We're fully booked" → "Totally understand — would a Thursday residency slot or a future Friday work? I'm flexible on dates"
2. "We're not hiring DJs" → "That makes sense — I'm not looking for a permanent slot, just one showcase night to see if the crowd responds. Happy to do it at a reduced rate"
3. "Send us an email" → "Of course, I'll send that right over — could I get the best contact for booking? And is there a particular night you're currently looking to fill?"
4. "Who are you / how did you get this number" → "I'm [DJ name]'s booking assistant — [DJ name] plays [genre] and has performed at [relevant venue]. We reached out because [venue name] seems like a great fit for the sound"

### Call logging (not an agent)
- Implemented as a plain `log_call()` function in `DB/mongo_client.py`
- Called directly by the outbound caller agent after every call ends (success, fail, or voicemail)
- Logs: venue name, contact, timestamp, call duration, outcome (booked/hold/declined/voicemail/no answer), raw transcript, sentiment score, follow-up task if any
- Stores in MongoDB `call_logs` collection
- If outcome is "hold": supervisor triggers HITL interrupt → sends DJ dashboard notification
- No agent needed — call logging is pure database writes with no reasoning required

---

## Data schemas

### DJ profile (MongoDB)
```
{
  dj_name: string,
  bio: string,                    // 2-3 sentences, used verbatim in pitch intro
  genre_tags: string[],           // e.g. ["Bollywood", "Afrobeats", "Hip-Hop"]
  bpm_range: { min: int, max: int },
  mix_links: string[],            // up to 3 SoundCloud/Mixcloud URLs
  epk_text: string,               // extracted text from EPK PDF via PyMuPDF
  target_cities: string[],        // up to 5
  venue_type_preferences: string[], // ["nightclub", "bar", "wedding", "corporate", "festival", "university"]
  availability: string[],         // open weekend dates
  rate_min: int,                  // minimum fee in USD
  past_gigs: string,              // freetext, used for social proof in pitch
  embedding: vector(512),         // OpenAI text-embedding-3-small, stored in pgvector
  created_at: datetime
}
```

### Venue profile (pgvector + MongoDB)
```
{
  venue_name: string,
  city: string,
  venue_type: string,
  genres_booked: string[],        // what music they typically book
  contact_name: string,
  contact_phone: string,
  contact_email: string,
  website: string,
  notes: string,                  // scraped context (capacity, vibe, recent events)
  embedding: vector(512),         // embedded from venue description text
  last_called: datetime,
  call_count: int
}
```

### Call log (MongoDB)
```
{
  dj_id: ObjectId,
  venue_id: ObjectId,
  timestamp: datetime,
  duration_seconds: int,
  outcome: enum["booked", "hold", "declined", "voicemail", "no_answer", "wrong_number"],
  transcript: string,
  sentiment: float,               // -1 to 1
  follow_up_task: string | null,
  hold_approved: bool | null,     // null until DJ reviews
  recording_url: string           // S3 URL
}
```

---

## 8-week build plan (checklist)

### Phase 1 — Foundation
- [ ] Week 1: Voice pipeline skeleton — LiveKit + Deepgram STT + Claude + ElevenLabs TTS working in a loop
- [ ] Week 2: Venue RAG pipeline — scrape 50–100 venues, embed with OpenAI, store in pgvector, query function returning top-5 matches
- [ ] Week 3: Pitch builder agent + FastAPI backend — DJ onboarding form, EPK parsing with PyMuPDF, pitch generation per venue

### Phase 2 — Agent core
- [ ] Week 4: Outbound calling agent — LiveKit outbound SIP, dial a real phone number, agent speaks pitch, call state management
- [ ] Week 5: Objection handler + multi-turn conversation graph — LangGraph states: intro → pitch → objection → counter → close → log
- [ ] Week 6: LangGraph supervisor + parallel subagents — wire everything together, add HITL checkpoint, MongoDB call logging

### Phase 3 — Ship
- [ ] Week 7: Dashboard UI — React, call outcomes table, hold approval flow, call recording playback
- [ ] Week 8: Docker + deploy to Railway, record 2-minute demo video, write GitHub README

---

## Latency targets
- STT (Deepgram Nova-3): ~150ms
- LLM first token (Claude Sonnet): ~350ms
- TTS first syllable (ElevenLabs streaming): ~75ms
- Target end-to-end: under 600ms from venue utterance to agent reply
- Above 600ms feels sluggish on a phone call — monitor this from week 4

---

## Resume framing (for interview prep)

**Project title**: GigCaller — Multi-Agent Voice System for Automated DJ Gig Booking

**Key bullets**:
- Designed LangGraph supervisor-subagent architecture with parallel execution across venue discovery, pitch generation, and outbound call handling agents
- Built RAG pipeline over 500+ venue profiles using pgvector and OpenAI embeddings — retrieves top-5 venue matches per DJ profile with cosine similarity
- Implemented real-time voice pipeline using LiveKit outbound SIP, Deepgram Nova-3 STT, and ElevenLabs TTS — targeting sub-600ms end-to-end latency
- Implemented human-in-the-loop interrupt pattern via LangGraph — agent halts for DJ approval before confirming any hold

**Skills this demonstrates**: multi-agent orchestration, LangGraph, RAG, pgvector, vector embeddings, LiveKit, real-time voice, WebRTC/SIP, FastAPI, MongoDB, Docker, human-in-the-loop design

---

## Questions to ask Claude Code

Things this context enables you to ask without re-explaining:
- "Why did we choose pgvector over Pinecone for this project?"
- "What state does the objection handler agent need to track?"
- "Walk me through how the supervisor delegates to subagents in parallel"
- "What fields does the venue discovery agent need from the DJ profile to run its query?"
- "What's the call state machine for the outbound caller agent?"
- "How does the HITL interrupt work in LangGraph and where does it sit in GigCaller's flow?"
- "What's the difference between the pitch for a nightclub vs a wedding venue?"
- "Why are we using STT→LLM→TTS instead of a realtime model?"
- "What does the log_call function write to MongoDB after a voicemail?"
