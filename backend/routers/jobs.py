import json
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from services.matcher import match_jobs
from services.scraper import scrape_naukri
from models.schemas import JobMatch

router = APIRouter(prefix="/jobs", tags=["Jobs"])

class MatchRequest(BaseModel):
    resume_text: str

@router.post("/match", response_model=List[JobMatch])
async def get_job_matches(request: MatchRequest):
    try:
        db_path = os.path.join("data", "jobs_db.json")
        if not os.path.exists(db_path):
            raise HTTPException(status_code=404, detail="Jobs database not found")
            
        with open(db_path, "r") as f:
            jobs = json.load(f)
            
        return match_jobs(request.resume_text, jobs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scrape", response_model=List[JobMatch])
async def get_scraped_jobs(title: str, location: str = "Ahmedabad"):
    try:
        return scrape_naukri(title, location)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
