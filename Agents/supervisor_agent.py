from dotenv import load_dotenv
load_dotenv()

import sys
import os
sys.path.append(os.path.dirname(__file__))

from langgraph_supervisor import create_supervisor
from langgraph.types import interrupt
from langgraph.checkpoint.postgres import PostgresSaver
from langchain_anthropic import ChatAnthropic
from langchain.tools import tool
from objection_handler_agent import objection_handler_agent
from pitch_builder_agent import pitch_builder_agent
from venue_discovery_agent import venue_discovery_agent
from DB.pgvector_client import create_connection
from livekit import api as livekit_api
import psycopg
import asyncio
import json


@tool
def dispatch_call(dj_id: str, venue_id: str, pitch: str) -> str:
    """
    Dispatch an outbound call to a venue via LiveKit.
    Looks up the venue's phone number from pgvector, then creates a LiveKit
    agent dispatch so the outbound caller agent dials the venue and delivers the pitch.

    Args:
        dj_id: MongoDB ObjectId of the DJ profile.
        venue_id: pgvector integer id of the venue.
        pitch: The tailored spoken pitch to deliver on the call.

    Returns:
        str: Confirmation that the call was dispatched, or an error message.
    """
    try:
        conn, cur = create_connection()
        row = None
        if str(venue_id).isdigit():
            cur.execute("SELECT id, venue_name, contact_phone FROM venues WHERE id = %s", (int(venue_id),))
            row = cur.fetchone()
        if row is None:
            first_word = str(venue_id).replace("-", " ").replace("_", " ").split()[0]
            cur.execute("SELECT id, venue_name, contact_phone FROM venues WHERE venue_name ILIKE %s LIMIT 1", (f"{first_word}%",))
            row = cur.fetchone()
        conn.close()
        if not row:
            return f"Error: venue {venue_id} not found in database"
        venue_id, venue_name, phone_number = row

        # Only dial venues that have a real contact number on file. Skip the rest
        # so we never place a call to a venue without a verified phone number.
        if not phone_number or not str(phone_number).strip():
            return (
                f"Number not set up for {venue_name} — no verified contact phone on file. "
                f"Skipping the call and moving to the next venue."
            )

        async def _dispatch():
            lk = livekit_api.LiveKitAPI(
                url=os.getenv("LIVEKIT_URL"),
                api_key=os.getenv("LIVEKIT_API_KEY"),
                api_secret=os.getenv("LIVEKIT_API_SECRET"),
            )
            await lk.agent_dispatch.create_dispatch(
                livekit_api.CreateAgentDispatchRequest(
                    agent_name="outbound-caller",
                    room=f"call_{venue_id}",
                    metadata=json.dumps({
                        "dj_id": dj_id,
                        "venue_id": venue_id,
                        "pitch": pitch,
                        "phone_number": phone_number,
                    }),
                )
            )
            await lk.aclose()
        asyncio.run(_dispatch())
        return f"Call dispatched to {venue_name} at {phone_number}"
    except Exception as e:
        return f"Dispatch failed: {str(e)}"


@tool
def request_dj_approval(venue_name: str, call_log_id: str) -> str:
    """
    Pause the campaign and wait for DJ approval after a hold is secured.
    The graph freezes here until the DJ approves or declines via the dashboard.

    Args:
        venue_name: Name of the venue where the hold was secured.
        call_log_id: MongoDB ID of the call log entry for this hold.

    Returns:
        str: The DJ's decision — "approved" or "declined".
    """
    decision = interrupt({
        "action": "hold_approval_required",
        "venue_name": venue_name,
        "call_log_id": call_log_id,
        "message": f"Hold secured at {venue_name}. Awaiting DJ approval.",
    })
    return f"DJ decision: {decision}"


model = ChatAnthropic(model="claude-sonnet-4-6")

prompt = """
You are the supervisor for GigCaller, a multi-agent system that books DJ gigs by calling music venues.

For each campaign run:
1. Call the venue discovery agent with the DJ profile, target city, and venue type to get a ranked list of matching venues
2. For each venue returned:
   a. Call the pitch builder agent with the DJ ID and venue ID to generate a tailored spoken pitch
   b. Call dispatch_call with the DJ ID, venue ID, and generated pitch to dial the venue
3. After dispatching each call, wait — the outbound agent will log the outcome to MongoDB
4. When a call results in a hold outcome, call request_dj_approval immediately — this pauses the entire campaign until the DJ approves or declines from the dashboard
5. If the DJ approves, move to the next venue. If declined, log it and continue.
6. If objections arise during a call, use the objection handler agent to generate a counter-response

Rules:
- Never confirm a booking autonomously — only holds are permitted
- Always call request_dj_approval before proceeding past any hold outcome
- Process venues one at a time so holds can be reviewed individually
- Always call dispatch_call after building the pitch — do not skip this step
"""

supervisor = create_supervisor(
    agents=[venue_discovery_agent, pitch_builder_agent, objection_handler_agent],
    model=model,
    prompt=prompt,
    tools=[dispatch_call, request_dj_approval],
)

_setup_done = False

def get_app():
    global _setup_done
    conn = psycopg.connect(os.getenv("POSTGRES_URL"), autocommit=True)
    checkpointer = PostgresSaver(conn)
    if not _setup_done:
        checkpointer.setup()
        _setup_done = True
    return supervisor.compile(checkpointer=checkpointer)
