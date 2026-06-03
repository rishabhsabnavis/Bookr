from pymongo import MongoClient
import os 
from dotenv import load_dotenv


load_dotenv()

mongo_password = os.getenv("MONGO_PASSWORD")
client = MongoClient(f'mongodb+srv://gigcaller_user:{mongo_password}@gigcaller.7kql0yu.mongodb.net/?appName=GigCaller')

db = client["gigcaller"]

db["dj_profiles"].insert_one({
    "dj_name": "RISH",
    "bio": "I am a music artist that's based out of St.Louis. I like blending different genres and showcasing my energy and vibrancy.",
    "genre_tags": ["Hip-Hop", "Afrobeats", "Bollywood", "R&B"],
    "mix_links": ["https://soundcloud.com/rish/mix1", "https://mixcloud.com/rish/mix2"],
    "target_cities": ["St. Louis", "Chicago", "New York", "Dallas"],
    "venue_type_preferences": ["nightclub", "bar"],
    "past_gigs": "Headlined Friday night at Echoes Nightclub in Chicago, resident DJ at The Loft St. Louis for 3 months, performed at Bollywood Basement NYC",
    "rate_min": 500,
    "availability": ["2026-06-07", "2026-06-14", "2026-06-21", "2026-06-28"],
    "bpm_range": {"min": 120, "max": 140}
})


client.close()
