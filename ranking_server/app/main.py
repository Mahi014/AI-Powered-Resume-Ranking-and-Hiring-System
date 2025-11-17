# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router
from .config import FRONTEND_ORIGIN

app = FastAPI(title="Resume Ranking Service")

allowed_origins = [FRONTEND_ORIGIN, "http://localhost:5173", "http://localhost:5000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
