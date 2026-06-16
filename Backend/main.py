from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
from langgraph.types import Command
from livekit import api
import os
import asyncio
import json
import logging
import uuid
from dotenv import load_dotenv
import sys

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gigcaller")

_background_tasks = set()

load_dotenv()

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from Agents.supervisor_agent import get_app as get_supervisor_app
from DB.seed_venues import embed_text
from DB.pgvector_client import create_connection

app = FastAPI()

# ── API key gate ──────────────────────────────────────────────────────────────
# Require a shared secret on every request so the public API can't be hit by
# anyone who finds the URL. Enforced only when API_KEY is set in the environment,
# so the API stays open until the key is configured on both Railway and Vercel.
# Defined before CORS is added so CORS stays the OUTER middleware — that way the
# 401 still carries CORS headers and preflight (OPTIONS) is handled by CORS.
API_KEY = os.getenv("API_KEY")

@app.middleware("http")
async def require_api_key(request: Request, call_next):
    if API_KEY and request.method != "OPTIONS":
        if request.headers.get("x-api-key") != API_KEY:
            return JSONResponse(status_code=401, content={"detail": "Unauthorized"})
    return await call_next(request)

# Restrict browser callers to the Vercel dashboard (any deploy URL) and local dev.
# Note: CORS only constrains browsers — the API_KEY gate above is what blocks scripts.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://bookr-.*\.vercel\.app|http://localhost:\d+",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

mongo_password = os.getenv("MONGO_PASSWORD")
mongo_client = MongoClient(
    f"mongodb+srv://gigcaller_user:{mongo_password}@gigcaller.7kql0yu.mongodb.net/?appName=GigCaller"
)
db = mongo_client["gigcaller"]

# ── Request models ────────────────────────────────────────────────────────────

class StartCampaignRequest(BaseModel):
    dj_id: str
    city: str
    venue_type: str

class DispatchCallRequest(BaseModel):
    dj_id: str
    venue_id: str
    pitch: str
    phone_number: str

class DJProfileRequest(BaseModel):
    dj_name: str
    bio: str
    genre_tags: list[str]
    mix_links: list[str]
    target_cities: list[str]
    venue_type_preferences: list[str]
    past_gigs: str
    rate_min: int
    availability: list[str]
    bpm_range: dict

# ── Campaign ──────────────────────────────────────────────────────────────────

@app.post("/campaign/start")
async def start_campaign(request: StartCampaignRequest):
    dj = db["dj_profiles"].find_one({"_id": ObjectId(request.dj_id)})
    if not dj:
        raise HTTPException(status_code=404, detail="DJ not found")

    profile_summary = (
        f"{dj['dj_name']} — genres: {', '.join(dj.get('genre_tags', []))}, "
        f"bio: {dj.get('bio', '')}, "
        f"past gigs: {dj.get('past_gigs', '')}, "
        f"mix links: {', '.join(dj.get('mix_links', []))}"
    )

    # Fresh thread per run — reusing one thread replays the whole history into
    # every LLM call (token bloat + rate limits). The active thread is stored in
    # Mongo so the hold endpoints can resume it.
    thread_id = f"campaign_{request.dj_id}_{uuid.uuid4().hex[:8]}"
    db["campaigns"].update_one(
        {"dj_id": request.dj_id},
        {"$set": {"thread_id": thread_id}},
        upsert=True,
    )
    config = {"configurable": {"thread_id": thread_id}}
    initial_input = {
        "messages": [
            {
                "role": "user",
                "content": (
                    f"Start a booking campaign for DJ ID {request.dj_id}. "
                    f"DJ profile: {profile_summary}. "
                    f"Target: {request.venue_type} venues in {request.city}."
                )
            }
        ]
    }

    def run_campaign():
        try:
            logger.info(f"Campaign starting for DJ {request.dj_id}")
            supervisor = get_supervisor_app()
            result = supervisor.invoke(initial_input, config)
            logger.info(f"Campaign finished for DJ {request.dj_id}: {result}")
        except Exception as e:
            logger.error(f"Campaign failed for DJ {request.dj_id}: {e}", exc_info=True)

    task = asyncio.create_task(asyncio.to_thread(run_campaign))
    _background_tasks.add(task)
    task.add_done_callback(_background_tasks.discard)
    return {"status": "campaign started", "thread_id": config["configurable"]["thread_id"]}

def active_thread_id(dj_id: str) -> str:
    campaign = db["campaigns"].find_one({"dj_id": dj_id})
    if not campaign:
        raise HTTPException(status_code=404, detail="No campaign found for this DJ")
    return campaign["thread_id"]

@app.get("/campaign/{dj_id}/status")
async def get_campaign_status(dj_id: str):
    config = {"configurable": {"thread_id": active_thread_id(dj_id)}}
    state = get_supervisor_app().get_state(config)
    if not state:
        raise HTTPException(status_code=404, detail="No campaign found for this DJ")
    return {"status": "paused" if state.next else "running", "next": state.next}

# ── Hold approval (HITL resume) ───────────────────────────────────────────────

@app.get("/holds/pending")
async def get_pending_holds():
    holds = list(db["call_logs"].find({"outcome": "hold", "hold_approved": None}))
    for h in holds:
        h["_id"] = str(h["_id"])
        h["dj_id"] = str(h["dj_id"])
        h["venue_id"] = str(h["venue_id"])
    await asyncio.to_thread(attach_venue_details, holds)
    return {"holds": holds}

@app.post("/holds/{call_log_id}/approve")
async def approve_hold(call_log_id: str):
    db["call_logs"].update_one(
        {"_id": ObjectId(call_log_id)},
        {"$set": {"hold_approved": True}}
    )
    log = db["call_logs"].find_one({"_id": ObjectId(call_log_id)})
    config = {"configurable": {"thread_id": active_thread_id(str(log["dj_id"]))}}
    await asyncio.to_thread(get_supervisor_app().invoke, Command(resume="approved"), config)
    return {"status": "approved", "call_log_id": call_log_id}

@app.post("/holds/{call_log_id}/decline")
async def decline_hold(call_log_id: str):
    db["call_logs"].update_one(
        {"_id": ObjectId(call_log_id)},
        {"$set": {"hold_approved": False}}
    )
    log = db["call_logs"].find_one({"_id": ObjectId(call_log_id)})
    config = {"configurable": {"thread_id": active_thread_id(str(log["dj_id"]))}}
    await asyncio.to_thread(get_supervisor_app().invoke, Command(resume="declined"), config)
    return {"status": "declined", "call_log_id": call_log_id}

# ── Call dispatch ─────────────────────────────────────────────────────────────

@app.post("/calls/dispatch")
async def dispatch_call(request: DispatchCallRequest):
    livekit_api = api.LiveKitAPI(
        url=os.getenv("LIVEKIT_URL"),
        api_key=os.getenv("LIVEKIT_API_KEY"),
        api_secret=os.getenv("LIVEKIT_API_SECRET"),
    )
    await livekit_api.agent_dispatch.create_dispatch(
        api.CreateAgentDispatchRequest(
            agent_name="outbound-caller",
            room=f"call_{request.venue_id}",
            metadata=json.dumps({
                "dj_id": request.dj_id,
                "venue_id": request.venue_id,
                "pitch": request.pitch,
                "phone_number": request.phone_number,
            }),
        )
    )
    await livekit_api.aclose()
    return {"status": "call dispatched", "venue_id": request.venue_id}

# ── Call logs ─────────────────────────────────────────────────────────────────

def attach_venue_details(calls: list) -> None:
    """Join venue details from Postgres into call log dicts (in place).

    call_logs documents only store venue_id — venue name/city/contact live in
    the venues table, so the dashboard needs them merged into the response.
    """
    ids = {int(c["venue_id"]) for c in calls if str(c.get("venue_id", "")).isdigit()}
    if not ids:
        return
    try:
        conn, cur = create_connection()
        cur.execute(
            "SELECT id, venue_name, city, venue_type, contact_name, contact_phone FROM venues WHERE id = ANY(%s)",
            (list(ids),),
        )
        venues = {row[0]: row for row in cur.fetchall()}
        conn.close()
    except Exception as e:
        logger.error(f"Failed to attach venue details: {e}")
        return
    for c in calls:
        if not str(c.get("venue_id", "")).isdigit():
            continue
        v = venues.get(int(c["venue_id"]))
        if v:
            c["venue_name"], c["city"], c["venue_type"], c["contact_name"], c["contact_phone"] = v[1:]

@app.get("/calls")
async def get_calls():
    calls = list(db["call_logs"].find().sort("timestamp", -1).limit(50))
    for c in calls:
        c["_id"] = str(c["_id"])
        c["dj_id"] = str(c["dj_id"])
        c["venue_id"] = str(c["venue_id"])
    await asyncio.to_thread(attach_venue_details, calls)
    return {"calls": calls}

@app.get("/calls/{call_log_id}")
async def get_call(call_log_id: str):
    call = db["call_logs"].find_one({"_id": ObjectId(call_log_id)})
    if not call:
        raise HTTPException(status_code=404, detail="Call log not found")
    call["_id"] = str(call["_id"])
    call["dj_id"] = str(call["dj_id"])
    call["venue_id"] = str(call["venue_id"])
    await asyncio.to_thread(attach_venue_details, [call])
    return call

# ── Venue matching ────────────────────────────────────────────────────────────

@app.get("/venues/matched")
async def get_matched_venues(dj_id: str, city: str = "", venue_type: str = ""):
    dj = db["dj_profiles"].find_one({"_id": ObjectId(dj_id)})
    if not dj:
        raise HTTPException(status_code=404, detail="DJ not found")
    profile_text = f"{dj['dj_name']} plays {', '.join(dj.get('genre_tags', []))} in {city or ', '.join(dj.get('target_cities', []))}"
    embedding = embed_text(profile_text)
    conn, cur = create_connection()
    params = [embedding]
    filters = []
    # case-insensitive so "Nightclub"/"nightclub" and "New York"/"new york" all match
    if city:
        filters.append("LOWER(city) = LOWER(%s)")
        params.append(city)
    if venue_type:
        filters.append("LOWER(venue_type) = LOWER(%s)")
        params.append(venue_type)
    where = ("WHERE " + " AND ".join(filters)) if filters else ""
    params.append(embedding)
    cur.execute(f"""
        SELECT id, venue_name, city, venue_type, contact_name, contact_phone,
               1 - (embedding <=> %s::vector) AS similarity
        FROM venues
        {where}
        ORDER BY embedding <=> %s::vector
        LIMIT 12;
    """, params)
    rows = cur.fetchall()
    conn.close()
    return {"venues": [
        {"id": r[0], "venue_name": r[1], "city": r[2], "venue_type": r[3],
         "contact_name": r[4], "contact_phone": r[5], "similarity": round(r[6], 4)}
        for r in rows
    ]}

# ── DJ profiles ───────────────────────────────────────────────────────────────

@app.post("/djs")
async def create_dj(request: DJProfileRequest):
    result = db["dj_profiles"].insert_one(request.model_dump())
    return {"dj_id": str(result.inserted_id)}

@app.get("/djs/{dj_id}")
async def get_dj(dj_id: str):
    dj = db["dj_profiles"].find_one({"_id": ObjectId(dj_id)})
    if not dj:
        raise HTTPException(status_code=404, detail="DJ not found")
    dj["_id"] = str(dj["_id"])
    return dj
