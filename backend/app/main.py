import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app import models
from app.routes import router

# Create all tables (no-op if they already exist)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SGPA Vault API",
    description="VTU SGPA calculator – upload result PDFs and track performance.",
    version="1.0.0",
)

# In production, set ALLOWED_ORIGINS to a comma-separated list of allowed domains.
# Defaults to localhost origins for development.
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/")
def root():
    return {"message": "SGPA Vault API is running 🚀"}
