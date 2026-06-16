from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_anthropic import ChatAnthropic
from DB.pgvector_client import create_connection
from DB.seed_venues import embed_text

load_dotenv()

@tool
def search_venues(dj_profile: str, city: str, venue_type: str) -> list[dict]:
    """
    Search for venues that match a DJ's profile using vector similarity.

    Takes the DJ's genre tags, venue type preferences, and target city,
    embeds them using OpenAI text-embedding-3-small, and runs a cosine
    similarity search against the venue database in pgvector.

    Returns a ranked list of up to 10 venues sorted by fit score,
    filtered by city and venue type. Each result includes venue name,
    contact info, and similarity score.

    Args:
        dj_profile (str): A description of the DJ including genre, style, and past gigs.
        city (str): The target city to search venues in.
        venue_type (str): The type of venue to filter by (e.g. nightclub, bar, wedding).

    Returns:
        list[dict]: Ranked list of matching venues with contact details and fit score.
    """
    conn, cur = create_connection()
    text_to_embed = f"DJ playing {dj_profile} looking for {venue_type} venues in {city}"
    djembedding = embed_text(text_to_embed)
    cur.execute("""
    SELECT id, venue_name, city, venue_type, contact_name, contact_phone, contact_email,
           1 - (embedding <=> %s::vector) AS similarity
    FROM venues
    WHERE LOWER(city) = LOWER(%s) AND LOWER(venue_type) = LOWER(%s)
    ORDER BY (contact_phone IS NOT NULL AND contact_phone <> '') DESC,
             embedding <=> %s::vector
    LIMIT 10;
    """, (djembedding, city, venue_type, djembedding)
    )
    rows = cur.fetchall()
    conn.close()

    # dialable venues (with a real phone) are returned first so the supervisor
    # calls those; venues without a number are flagged so it can skip them.
    return [
    {
        "venue_id": row[0],
        "venue_name": row[1],
        "city": row[2],
        "venue_type": row[3],
        "contact_name": row[4],
        "contact_phone": row[5],
        "contact_email": row[6],
        "dialable": bool(row[5] and str(row[5]).strip()),
        "similarity": round(row[7], 4)
    }
    for row in rows
    ]


model = ChatAnthropic(model="claude-sonnet-4-6")
prompt = """
You are a venue discovery agent for a multi-agent voice system.
You are responsible for discovering venues for a DJ.

CRITICAL OUTPUT RULE: every time you report venues, you MUST include each venue's
integer venue_id (exactly as returned by search_venues) right next to its name —
in tables as the first column, and in any summary line. Downstream agents
(pitch builder, call dispatcher) can only look venues up by this integer ID.
A response without venue_ids breaks the pipeline.

Example format: "venue_id: 1 — Echoes Nightclub (fit 0.62, Marcus Reid, +1...)"
"""
venue_discovery_agent = create_agent(
    model = model,
    tools = [search_venues],
    system_prompt = prompt,
    name = "venue_discovery_agent",
)
