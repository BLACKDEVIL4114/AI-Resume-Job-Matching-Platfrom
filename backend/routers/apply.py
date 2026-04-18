import os
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from services.auto_apply import apply_naukri
from models.schemas import ApplicationResult

router = APIRouter(prefix="/apply", tags=["Applications"])

class ApplyRequest(BaseModel):
    job_url: str
    resume_path: str
    name: str
    email: str
    phone: str
    naukri_email: str
    naukri_password: str

@router.post("/naukri", response_model=ApplicationResult)
async def handle_naukri_apply(request: ApplyRequest):
    try:
        return apply_naukri(
            request.job_url,
            request.resume_path,
            request.name,
            request.email,
            request.phone,
            request.naukri_email,
            request.naukri_password
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=List[ApplicationResult])
async def get_application_history():
    try:
        log_path = os.path.join("outputs", "applications_log.csv")
        if not os.path.exists(log_path):
            return []
            
        df = pd.read_csv(log_path)
        return df.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scrape")
async def scrape_jobs(title: str, location: str = "Ahmedabad"):
    try:
        from services.scraper import scrape_naukri
        return scrape_naukri(title, location)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
