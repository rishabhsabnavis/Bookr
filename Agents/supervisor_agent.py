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
import psycopg


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
2. For each venue returned, call the pitch builder agent with the DJ ID and venue ID to generate a tailored spoken pitch
3. When a call results in a hold outcome, call request_dj_approval immediately — this pauses the entire campaign until the DJ approves or declines from the dashboard
4. If the DJ approves, move to the next venue. If declined, log it and continue.
5. If objections arise during a call, use the objection handler agent to generate a counter-response

Rules:
- Never confirm a booking autonomously — only holds are permitted
- Always call request_dj_approval before proceeding past any hold outcome
- Process venues one at a time so holds can be reviewed individually
"""

supervisor = create_supervisor(
    agents=[venue_discovery_agent, pitch_builder_agent, objection_handler_agent],
    model=model,
    prompt=prompt,
    tools=[request_dj_approval],
)

_pg_conn = psycopg.connect(os.getenv("POSTGRES_URL"), autocommit=True)
_checkpointer = PostgresSaver(_pg_conn)
_checkpointer.setup()

app = supervisor.compile(checkpointer=_checkpointer)
