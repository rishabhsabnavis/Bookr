from langchain.agents import create_agent
from langchain.tools import tool
from langchain_anthropic import ChatAnthropic
import os
from dotenv import load_dotenv
from bson import ObjectId
from pymongo import MongoClient
from DB.pgvector_client import create_connection

load_dotenv()


@tool
def build_pitch(dj_id: str, venue_id: str):
    """
    Generate a tailored 60-second spoken pitch for a DJ to deliver to a specific venue.

    Fetches the DJ profile from MongoDB and the venue profile from pgvector,
    then uses Claude to generate a personalized pitch based on the DJ's genres,
    bio, and past gigs matched against the venue's type and booking preferences.

    The pitch follows this structure: intro (DJ name + sound) → social proof
    (relevant past gig) → value prop (why this DJ fits this venue) → ask
    (available date) → mix link reference. Tone adapts to venue type — high
    energy for nightclubs, warm and professional for weddings, relaxed for bars.

    Args:
        dj_id (str): MongoDB ObjectId of the DJ profile.
        venue_id (str): pgvector table id of the venue.

    Returns:
        str: A tailored spoken pitch (~60 seconds when read aloud, under 150 words).
    """
    mongo_password = os.getenv("MONGO_PASSWORD")
    client = MongoClient(f'mongodb+srv://gigcaller_user:{mongo_password}@gigcaller.7kql0yu.mongodb.net/?appName=GigCaller')

    db = client["gigcaller"]

    dj = db["dj_profiles"].find_one({
        "_id": ObjectId(dj_id)
    })

    conn, cur = create_connection()

    cur.execute("""
        SELECT venue_name, city, venue_type, genres_booked, notes
        FROM venues
        WHERE id = %s
    """, (venue_id,))

    venue = cur.fetchone()

    llm = ChatAnthropic(model="claude-sonnet-4-6")
    response = llm.invoke(f"""
        Generate a 60-second spoken pitch.
        DJ: {dj['dj_name']}, genres: {dj['genre_tags']}, bio: {dj['bio']}, past gigs: {dj['past_gigs']}
        Venue: {venue[0]}, type: {venue[2]}, city: {venue[1]}, books: {venue[3]}, notes: {venue[4]}
    """)
    client.close()
    conn.close()
    return response.content





model = ChatAnthropic(model="claude-sonnet-4-6")
prompt = """
You are a pitch builder agent for GigCaller, a multi-agent system that books DJ gigs at music venues.

Your job is to generate tailored, spoken pitches that a DJ's booking assistant will deliver live over the phone to venue talent buyers.

When given a DJ ID and venue ID, call the build_pitch tool to fetch both profiles and generate the pitch.

Every pitch must follow this exact structure:
1. Intro — DJ name and their sound in one sentence
2. Social proof — one past gig most relevant to this specific venue type
3. Value prop — one specific reason this DJ is a great fit for this venue
4. Ask — a direct request for one available date or residency slot
5. Mix link — reference one mix link as proof of sound

Rules:
- Keep it under 150 words — it must sound natural when spoken aloud in 60 seconds
- Match the tone to the venue type: high energy for nightclubs, warm and professional for weddings, relaxed and conversational for bars
- Never use formal business language — this is a phone call, not an email
- Be specific — generic pitches get rejected, mention the venue by name and reference their genre or vibe
"""

pitch_builder_agent = create_agent(
    model = model,
    tools = [build_pitch],
    system_prompt = prompt,
    name = "pitch_builder_agent",
)






