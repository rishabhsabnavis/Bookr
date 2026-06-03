from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timezone
import os

load_dotenv()

mongo_password = os.getenv("MONGO_PASSWORD")
client = MongoClient(f'mongodb+srv://gigcaller_user:{mongo_password}@gigcaller.7kql0yu.mongodb.net/?appName=GigCaller')


def log_call(dj_id, venue_id, outcome, transcript, duration_seconds, sentiment=0.0, recording_url=None, follow_up_task=None):
    db = client["gigcaller"]
    db["call_logs"].insert_one({
        "dj_id": dj_id,
        "venue_id": venue_id,
        "timestamp": datetime.now(timezone.utc),
        "duration_seconds": duration_seconds,
        "outcome": outcome,
        "transcript": transcript,
        "sentiment": sentiment,
        "follow_up_task": follow_up_task,
        "hold_approved": None,
        "recording_url": recording_url
    })


