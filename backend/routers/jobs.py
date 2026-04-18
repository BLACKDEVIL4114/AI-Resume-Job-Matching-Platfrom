# backend/routers/jobs.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.matcher import match_jobs
from models.schemas import JobMatch
import json
import os
from typing import List

router = APIRouter(prefix="/jobs", tags=["Jobs"])

class MatchRequest(BaseModel):
    resume_text: str

@router.post("/match", response_model=List[JobMatch])
async def match_jobs_endpoint(request: MatchRequest):
    try:
        db_path = os.path.join(os.path.dirname(__file__), "..", "data", "jobs_db.json")
        with open(db_path, "r") as f:
            jobs = json.load(f)
        return match_jobs(request.resume_text, jobs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list", response_model=List[JobMatch])
async def list_all_jobs():
    try:
        db_path = os.path.join(os.path.dirname(__file__), "..", "data", "jobs_db.json")
        with open(db_path, "r") as f:
            jobs = json.load(f)
        return [
            JobMatch(
                title=j["title"],
                company=j["company"],
                location=j["location"],
                salary=j["salary"],
                match_score=0,
                job_url=j["job_url"],
                description=j["description"]
            ) for j in jobs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
