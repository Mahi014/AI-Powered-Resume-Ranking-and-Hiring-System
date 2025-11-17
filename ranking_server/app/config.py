# app/config.py
from dotenv import load_dotenv
load_dotenv()

import os

# Database
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    PG_USER = os.environ.get("PG_USER", "postgres")
    PG_PASSWORD = os.environ.get("PG_PASSWORD", "password")
    PG_HOST = os.environ.get("PG_HOST", "localhost")
    PG_PORT = os.environ.get("PG_PORT", "5432")
    PG_DATABASE = os.environ.get("PG_DATABASE", "yourdb")
    DATABASE_URL = f"postgresql://{PG_USER}:{PG_PASSWORD}@{PG_HOST}:{PG_PORT}/{PG_DATABASE}"

DB_DSN = DATABASE_URL

# TF-IDF / Ranking tuning
TFIDF_MAX_FEATURES = int(os.environ.get("TFIDF_MAX_FEATURES", 5000))
TFIDF_NGRAM = (1, 2)
SKILL_BOOST_WEIGHT = float(os.environ.get("SKILL_BOOST_WEIGHT", 0.20))
TOP_K = int(os.environ.get("TOP_K", 10))

# CORS / Frontend
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")
