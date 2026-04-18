from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import resume, jobs, apply

app = FastAPI(
    title="JobApplyAI - AI Resume Matching Platform",
    description="Real NLP-powered resume matcher with ATS scoring and auto-apply",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(resume.router)
app.include_router(jobs.router)
app.include_router(apply.router)

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "ok",
        "version": "2.0.0",
        "engine": "JobApplyAI-FastAPI-Pro",
        "nlp": "spaCy (en_core_web_sm)"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
