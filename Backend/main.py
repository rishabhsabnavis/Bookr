from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
from langgraph.types import Command
from livekit import api
import os
import asyncio
import json
import logging
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
    config = {"configurable": {"thread_id": f"campaign_{request.dj_id}"}}
    initial_input = {
        "messages": [
            {
                "role": "user",
                "content": f"Start a booking campaign for DJ ID {request.dj_id} targeting {request.venue_type} venues in {request.city}."
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

@app.get("/campaign/{dj_id}/status")
async def get_campaign_status(dj_id: str):
    config = {"configurable": {"thread_id": f"campaign_{dj_id}"}}
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
    return {"holds": holds}

@app.post("/holds/{call_log_id}/approve")
async def approve_hold(call_log_id: str):
    db["call_logs"].update_one(
        {"_id": ObjectId(call_log_id)},
        {"$set": {"hold_approved": True}}
    )
    log = db["call_logs"].find_one({"_id": ObjectId(call_log_id)})
    config = {"configurable": {"thread_id": f"campaign_{str(log['dj_id'])}"}}
    await asyncio.to_thread(get_supervisor_app().invoke, Command(resume="approved"), config)
    return {"status": "approved", "call_log_id": call_log_id}

@app.post("/holds/{call_log_id}/decline")
async def decline_hold(call_log_id: str):
    db["call_logs"].update_one(
        {"_id": ObjectId(call_log_id)},
        {"$set": {"hold_approved": False}}
    )
    log = db["call_logs"].find_one({"_id": ObjectId(call_log_id)})
    config = {"configurable": {"thread_id": f"campaign_{str(log['dj_id'])}"}}
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

@app.get("/calls")
async def get_calls():
    calls = list(db["call_logs"].find().sort("timestamp", -1).limit(50))
    for c in calls:
        c["_id"] = str(c["_id"])
        c["dj_id"] = str(c["dj_id"])
        c["venue_id"] = str(c["venue_id"])
    return {"calls": calls}

@app.get("/calls/{call_log_id}")
async def get_call(call_log_id: str):
    call = db["call_logs"].find_one({"_id": ObjectId(call_log_id)})
    if not call:
        raise HTTPException(status_code=404, detail="Call log not found")
    call["_id"] = str(call["_id"])
    call["dj_id"] = str(call["dj_id"])
    call["venue_id"] = str(call["venue_id"])
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
    if city:
        filters.append("city = %s")
        params.append(city)
    if venue_type:
        filters.append("venue_type = %s")
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
