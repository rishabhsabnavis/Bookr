import psycopg2
from pgvector.psycopg2 import register_vector
from dotenv import load_dotenv
import os

load_dotenv()


def create_connection():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT"),
    )
    conn.autocommit = True
    register_vector(conn)
    cursor = conn.cursor()
    return conn, cursor


def create_venues_table():
    conn, cursor = create_connection()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS venues (
            id SERIAL PRIMARY KEY,
            venue_name TEXT,
            city TEXT,
            venue_type TEXT,
            genres_booked TEXT[],
            contact_name TEXT,
            contact_phone TEXT,
            contact_email TEXT,
            website TEXT,
            notes TEXT,
            embedding vector(512)
        );
    """)
    conn.close()


