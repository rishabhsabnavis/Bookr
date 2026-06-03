from dotenv import load_dotenv
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from livekit import agents, api
from livekit.agents import AgentSession, Agent, RunContext
from livekit.plugins import silero, deepgram, anthropic, elevenlabs
from livekit.plugins.turn_detector.multilingual import MultilingualModel
from livekit.agents.llm import function_tool
from pymongo import MongoClient
from DB.pgvector_client import create_connection
from DB.mongo_client import log_call
from bson import ObjectId
import logging
import json
import time

load_dotenv()

logger = logging.getLogger("outbound-caller")

class Assistant(Agent):
    def __init__(self, dj_profile, pitch, venue_profile, dj_id, venue_id):
        self._dj_id = dj_id
        self._venue_id = venue_id
        self._start_time: float | None = None
        self._transcript_turns: list[dict] = []
        super().__init__(instructions=f"""
        You are a professional booking assistant calling on behalf of DJ {dj_profile['dj_name']}.

## Your goal
Get the talent buyer to agree to book {dj_profile['dj_name']} for an upcoming date, or at minimum secure a hold.

## The pitch (deliver this naturally, not verbatim)
{pitch}

## Conversation flow
1. Confirm you're speaking with the right person (talent buyer / booking manager)
2. Briefly introduce yourself and DJ {dj_profile['dj_name']}
3. Deliver the pitch conversationally — keep it under 60 seconds
4. Ask for a specific available date
5. If they express interest, confirm a hold and get their email for follow-up
6. End the call professionally regardless of outcome

## Handling objections
- "We're fully booked" → "Totally understand — would a Thursday residency slot or a future Friday work? I'm flexible on dates."
- "We're not hiring DJs" → "That makes sense — I'm not looking for a permanent slot, just one showcase night to see if the crowd responds. Happy to do it at a reduced rate."
- "Send us an email" → "Of course, I'll send that right over — could I get the best contact for booking? And is there a particular night you're currently looking to fill?"
- "Who are you / how did you get this number" → "I'm {dj_profile['dj_name']}'s booking assistant — {dj_profile['dj_name']} plays {', '.join(dj_profile['genre_tags'])} and has performed at {dj_profile['past_gigs']}. We reached out because {venue_profile['venue_name']} seemed like a great fit."

## Rules
- Never confirm a booking — only a hold. Say "I'll confirm that with {dj_profile['dj_name']} and get back to you within 24 hours."
- Keep responses short. This is a phone call, not an email.
- Do not read from the pitch verbatim — speak naturally.
- If you reach voicemail, leave a 20-second version: name, genre, one past gig, mix link, callback number.
- If the person is hostile or clearly uninterested after two attempts, thank them and end the call.

## DJ info for reference
- Genre: {', '.join(dj_profile['genre_tags'])}
- Past gigs: {dj_profile['past_gigs']}
- Mix links: {dj_profile['mix_links'][0] if dj_profile.get('mix_links') else 'available on request'}
- Rate range: starting at ${dj_profile['rate_min']}
""")
    @function_tool
    async def end_call(self, ctx: RunContext, outcome: str, sentiment: float = 0.0):
        """
        End the call and log the result.

        Args:
            outcome: one of hold, declined, voicemail, no_answer, wrong_number
            sentiment: your estimate of how the call went, from -1.0 (hostile) to 1.0 (very positive)
        """
        current_speech = ctx.session.current_speech
        if current_speech:
            await current_speech.wait_for_playout()

        duration = int(time.time() - self._start_time) if self._start_time else 0

        await ctx.session.aclose()
        log_call(
            dj_id=self._dj_id,
            venue_id=self._venue_id,
            outcome=outcome,
            transcript=self._transcript_turns,
            duration_seconds=duration,
            sentiment=round(max(-1.0, min(1.0, sentiment)), 2),
        )
   




async def entrypoint(ctx: agents.JobContext):
    mongo_password = os.getenv("MONGO_PASSWORD")
    mongo_client = MongoClient(f'mongodb+srv://gigcaller_user:{mongo_password}@gigcaller.7kql0yu.mongodb.net/?appName=GigCaller')
    db = mongo_client["gigcaller"]

    metadata = json.loads(ctx.job.metadata)
    dj_id = metadata.get("dj_id")
    venue_id = metadata.get("venue_id")
    pitch = metadata.get("pitch")

    dj_profile = db["dj_profiles"].find_one({"_id": ObjectId(dj_id)})

    conn, cur = create_connection()
    cur.execute("SELECT venue_name, city, venue_type, genres_booked, notes FROM venues WHERE id = %s", (venue_id,))
    row = cur.fetchone()
    venue_profile = {
        "venue_name": row[0],
        "city": row[1],
        "venue_type": row[2],
        "genres_booked": row[3],
        "notes": row[4]
    }
    conn.close()
    mongo_client.close()

    phone_number = metadata.get("phone_number")
    participant_identity = f"sip_{phone_number}"
    outbound_trunk_id = os.getenv("LIVEKIT_SIP_TRUNK_ID")

    assistant = Assistant(dj_profile, pitch, venue_profile, dj_id, venue_id)

    session = AgentSession(
        stt=deepgram.STT(model="nova-3"),
        llm=anthropic.LLM(model="claude-sonnet-4-6"),
        tts=elevenlabs.TTS(),
        vad=silero.VAD.load(),
        turn_detection=MultilingualModel(),
    )

    await session.start(
        room=ctx.room,
        agent=assistant
    )

    try:
        await ctx.api.sip.create_sip_participant(
            api.CreateSIPParticipantRequest(
                room_name=ctx.room.name,
                sip_trunk_id=outbound_trunk_id,
                sip_call_to=phone_number,
                participant_identity=participant_identity,
                wait_until_answered=True,
            )
        )

        participant = await ctx.wait_for_participant(identity=participant_identity)
        logger.info(f"participant joined: {participant.identity}")
        assistant._start_time = time.time()

        @session.on("conversation_item_added")
        def on_item(item):
            role = getattr(item, "role", None)
            text = getattr(item, "text_content", None) or ""
            if role and text:
                assistant._transcript_turns.append({
                    "who": "agent" if role == "assistant" else "buyer",
                    "text": text,
                })

    except api.TwirpError as e:
        logger.error(
            f"error creating SIP participant: {e.message}, "
            f"SIP status: {e.metadata.get('sip_status_code')} "
            f"{e.metadata.get('sip_status')}"
        )
        ctx.shutdown()
        return

    await session.generate_reply(
        instruction=f"Greet the caller nicely and introduce yourself as a booking assistant for DJ {dj_profile['dj_name']}"
    )


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
    print("Agent started successfully")

