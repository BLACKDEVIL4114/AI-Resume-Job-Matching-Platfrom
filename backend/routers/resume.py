from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from services.parser import parse_pdf, parse_resume
from services.matcher import ats_score
from models.schemas import ResumeData, ATSResult

router = APIRouter(prefix="/resume", tags=["Resume"])

class ATSRequest(BaseModel):
    resume_text: str
    job_description: str

@router.post("/parse", response_model=ResumeData)
async def parse_resume_endpoint(file: UploadFile = File(...)):
    try:
        content = await file.read()
        raw_text = parse_pdf(content)
        if not raw_text:
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")
        return parse_resume(raw_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ats-score", response_model=ATSResult)
async def get_ats_score(request: ATSRequest):
    try:
        return ats_score(request.resume_text, request.job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Note: Using 'router' for consistency with main.py
router = router 
