import os
import pandas as pd
from openai import OpenAI
from dotenv import load_dotenv
from DB.pgvector_client import create_connection, create_venues_table

load_dotenv()

client = OpenAI()


def embed_text(text: str) -> list[float]:
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text,
        dimensions=512
    )
    return response.data[0].embedding


def insert_venue(cursor, row, embedding):
    cursor.execute("""
        INSERT INTO venues (
            venue_name, city, venue_type, genres_booked,
            contact_name, contact_phone, contact_email,
            website, notes, embedding
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        row["venue_name"],
        row["city"],
        row["venue_type"],
        row["genres_booked"].split(","),
        row["contact_name"],
        row["contact_phone"],
        row["contact_email"],
        row["website"],
        row["notes"],
        embedding
    ))


def seed():
    create_venues_table()

    conn, cursor = create_connection()
    csv_path = os.path.join(os.path.dirname(__file__), "venues_mock.csv")
    df = pd.read_csv(csv_path)

    for _, row in df.iterrows():
        # build a descriptive string to embed — combines the fields most relevant to matching
        text_to_embed = f"{row['venue_name']} in {row['city']}. Type: {row['venue_type']}. Genres: {row['genres_booked']}. {row['notes']}"
        embedding = embed_text(text_to_embed)
        insert_venue(cursor, row, embedding)
        print(f"Inserted: {row['venue_name']}")

    conn.close()
    print("Done — all venues seeded.")


if __name__ == "__main__":
    seed()
