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
    SELECT venue_name, city, venue_type, contact_name, contact_phone, contact_email,
           1 - (embedding <=> %s::vector) AS similarity
    FROM venues
    WHERE city = %s AND venue_type = %s
    ORDER BY embedding <=> %s::vector
    LIMIT 10;
    """, (djembedding, city, venue_type, djembedding)
    )
    rows = cur.fetchall()
    conn.close()

    return [
    {
        "venue_name": row[0],
        "city": row[1],
        "venue_type": row[2],
        "contact_name": row[3],
        "contact_phone": row[4],
        "contact_email": row[5],
        "similarity": round(row[6], 4)
    }
    for row in rows
    ]       


model = ChatAnthropic(model="claude-sonnet-4-6")
prompt = """
You are a venue discovery agent for a multi-agent voice system.
You are responsible for discovering venues for a DJ.
"""
venue_discovery_agent = create_agent(
    model = model,
    tools = [search_venues],
    system_prompt = prompt

)
