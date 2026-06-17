# GigCaller — Multi-Agent Voice System for Automated DJ Gig Booking

The DJ gig booking pipeline is broken: venues use email, DJs use Instagram DMs, and there is no automated outreach layer between them. A working DJ spends 5–10 hours a week cold-calling and DMing venues that mostly never respond — or pays a booking agent 10–15% of every gig fee. GigCaller automates the entire outbound pipeline. A DJ registers their profile once; the system finds matching venues, generates a personalized pitch per venue, and an AI voice agent cold-calls talent buyers, handles objections live, and logs every outcome. The DJ only steps in when a venue puts a date on hold — approving or declining from a dashboard.

## How it works

```
DJ onboarding (React) ──► FastAPI backend ──► LangGraph supervisor
                                                    │
                          ┌─────────────────────────┼─────────────────────────┐
                          ▼                         ▼                         ▼
                  Venue discovery            Pitch builder            Objection handler
                (pgvector cosine sim)     (tailored 60s pitch)      (4 common objections)
                                                    │
                                                    ▼
                                          Outbound caller agent
                                       (LiveKit SIP → real phone)
                                                    │
                                                    ▼
                                 Call logged to MongoDB ──► hold? ──► surfaced on dashboard
                                                                      DJ approves / declines
```

- **Supervisor (LangGraph)** reads the DJ profile from MongoDB, delegates to subagents, aggregates outcomes, and uses PostgreSQL-backed checkpointing so campaign state survives restarts.
- **Venue discovery** embeds the DJ's profile (OpenAI `text-embedding-3-small`) and runs a pgvector cosine-similarity search over the venue store (~95 venues), filtered by city + venue type and ranked by genre/style fit.
- **Pitch builder** generates a venue-specific spoken pitch: intro → social proof → value prop → ask → mix link.
- **Outbound caller** dials over LiveKit outbound SIP (Twilio trunk), delivers the pitch, and manages the live conversation turn-by-turn. Only venues with a contact number on file are dialed.
- **Objection handler** counters the four standard objections: fully booked, not hiring DJs, "send an email", and "who are you".

### Human-in-the-loop is non-negotiable

The agent never confirms a booking on its own. When a venue agrees to a hold, the agent **logs the hold and surfaces it on the DJ's dashboard** — it sits pending until the DJ explicitly approves or declines. Nothing is confirmed without that human yes. This is a deliberate trust and safety decision, not a technical limitation.

## Voice pipeline

Classic STT → LLM → TTS, **not** a realtime speech-to-speech model:

| Stage | Tool | Latency |
|---|---|---|
| STT | Deepgram Nova-3 | ~150ms |
| LLM | Claude Sonnet | ~350ms first token |
| TTS | ElevenLabs (streaming) | ~75ms first syllable |
| **End-to-end target** | | **< 600ms** |

Why not OpenAI Realtime / speech-to-speech: realtime models degrade on 8kHz PSTN phone audio, the pipeline gives full control over what the agent says (critical for pitch delivery and objection handling), tool calling is more reliable with text LLMs, and each component can be debugged or swapped independently.

## Tech stack

| Layer | Tool |
|---|---|
| Voice / telephony | LiveKit Agents SDK, LiveKit outbound SIP + Twilio Elastic SIP trunk |
| Orchestration | LangGraph supervisor pattern (LangChain 1.0 agents) |
| LLM | Claude Sonnet |
| STT / TTS | Deepgram Nova-3 / ElevenLabs |
| Vector search | Neon Postgres + pgvector, OpenAI `text-embedding-3-small` @ 512 dims |
| App database | MongoDB Atlas (`dj_profiles`, `campaigns`, `call_logs`) |
| Backend | FastAPI (async), API-key gated + CORS-locked |
| Frontend | React + Vite + TypeScript + Tailwind |
| Deployment | Railway (API + worker as separate services), Vercel (frontend) |

## Repo structure

```
Backend/main.py                    FastAPI routes (/djs, /campaign/start, /calls, /holds, ...)
Agents/supervisor_agent.py         LangGraph supervisor, dispatch_call tool, get_app() factory
Agents/venue_discovery_agent.py    search_venues tool (pgvector cosine search)
Agents/pitch_builder_agent.py      build_pitch tool
Agents/objection_handler_agent.py  objection-handling agent (no tools)
Agents/outbound_caller_agent.py    LiveKit worker — STT→LLM→TTS call agent
DB/mongo_client.py                 Mongo access incl. log_call()
DB/pgvector_client.py              Postgres/pgvector access (psycopg2)
Frontend/                          React dashboard (/) and onboarding wizard (/onboarding)
Dockerfile.api                     FastAPI backend image (Railway service 1)
Dockerfile.worker                  LiveKit outbound agent image (Railway service 2)
```

Call logging is intentionally **not** an agent — it's a plain `log_call()` function called by the outbound caller after every call. Pure database writes need no reasoning.

## Running it

Two Postgres clients coexist (intentional — they serve different layers):

- `DB/pgvector_client.py` (psycopg2) reads `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`
- `Agents/supervisor_agent.py` (psycopg v3, for the LangGraph checkpointer) reads `POSTGRES_URL` as a single connection string

Other required env vars: MongoDB Atlas URI, Anthropic, OpenAI, Deepgram, ElevenLabs API keys, and LiveKit URL + API key + secret + SIP trunk ID (Twilio trunk wired through LiveKit).

```bash
pip install -r requirements.txt

# Backend API
uvicorn Backend.main:app --port 8000

# LiveKit outbound worker (separate process/service)
python Agents/outbound_caller_agent.py dev

# Frontend
cd Frontend && npm install && npm run dev
```

In production, `Dockerfile.api` and `Dockerfile.worker` deploy as two separate Railway services (the API binds to Railway's injected `$PORT`); the frontend deploys to Vercel with an SPA rewrite (`Frontend/vercel.json`).

## Key design decisions

- **pgvector over Pinecone/Weaviate** — runs inside the existing Postgres instance, no extra service to operate. Cosine similarity (`<=>`) over 512-dim embeddings is plenty for a venue store this size and keeps queries fast.
- **STT→LLM→TTS over realtime models** — control, PSTN audio quality, debuggability (see above).
- **Human approval before any booking** — the agent can hold and log, but a DJ must approve each hold from the dashboard before it's confirmed.
- **Fresh DB connections per campaign** — the supervisor opens a new psycopg connection per invocation (`get_app()` factory) rather than a module-level global, since serverless Postgres (Neon) closes idle connections.
- **Only dial verified numbers** — venues without a contact phone are surfaced as matches but never called.

## Unit economics

~$0.13 variable cost per AI call. At a few hundred outbound calls/month that's a few dollars of variable cost — replacing 5–10 hours/week of manual outreach and the 10–15% agent commission per booked gig.
