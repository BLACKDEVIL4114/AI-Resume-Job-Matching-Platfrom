# backend/services/scraper.py
import requests
import json
import os
from bs4 import BeautifulSoup
from models.schemas import JobMatch
from typing import List

# API Configurations
ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID", "8e8f4f4e")
ADZUNA_API_KEY = os.getenv("ADZUNA_API_KEY", "demo-key")

def fetch_adzuna_jobs(query: str, location: str = "India") -> List[JobMatch]:
    print(f"[REALS-TIME] Calling Adzuna API for: {query}")
    try:
        url = f"https://api.adzuna.com/v1/api/jobs/in/search/1"
        params = {
            "app_id": ADZUNA_APP_ID,
            "app_key": ADZUNA_API_KEY,
            "results_per_page": 20,
            "what": query,
            "where": location,
            "content-type": "application/json"
        }
        
        response = requests.get(url, params=params, timeout=10)
        if response.status_code != 200:
            return []
            
        data = response.json()
        results = []
        for job in data.get("results", []):
            results.append(JobMatch(
                title=job.get("title", ""),
                company=job.get("company", {}).get("display_name", "Global Corp"),
                location=job.get("location", {}).get("display_name", location),
                salary="Competitive", 
                match_score=0,
                job_url=job.get("redirect_url", ""),
                description=job.get("description", "")[:500]
            ))
        return results
    except Exception as e:
        print(f"[ERROR] Adzuna Fetch: {e}")
        return []

def fetch_remoteok_jobs(query: str) -> List[JobMatch]:
    print(f"[REAL-TIME] Calling RemoteOK for: {query}")
    try:
        # RemoteOK requires User-Agent
        headers = {"User-Agent": "JobApplyAI-Engine/2.0"}
        response = requests.get("https://remoteok.com/api", headers=headers, timeout=10)
        
        if response.status_code != 200:
            return []
            
        data = response.json()
        if not isinstance(data, list):
            return []
            
        # RemoteOK returns a list where [0] is legal info
        jobs = data[1:31] 
        results = []
        
        query_terms = query.lower().split()
        
        for job in jobs:
            text = (job.get("position", "") + " " + job.get("description", "")).lower()
            # Basic client-side filtering since RemoteOK API returns ALL current jobs
            if any(term in text for term in query_terms):
                results.append(JobMatch(
                    title=job.get("position", ""),
                    company=job.get("company", "Remote Tech"),
                    location="Remote",
                    salary=f"${job.get('salary_min', 0)} - ${job.get('salary_max', 0)} USD",
                    match_score=0,
                    job_url=job.get("url", ""),
                    description=job.get("description", "")[:500]
                ))
        return results
    except Exception as e:
        print(f"[ERROR] RemoteOK Fetch: {e}")
        return []

def get_real_time_jobs(skills: List[str], location: str = "India") -> List[JobMatch]:
    """Unified engine to fetch real currently existing jobs"""
    query = " ".join(skills[:3]) if skills else "Software Engineer"
    
    jobs = []
    
    # 1. Fetch from Adzuna (India-specific on-site)
    # We use India as the default location for on-site jobs
    print(f"[REALS-TIME] Searching for on-site jobs in {location}...")
    india_jobs = fetch_adzuna_jobs(query, location)
    jobs.extend(india_jobs)
    
    # 2. Fetch from RemoteOK (Global Remote)
    # This ensures we always have global remote options
    print(f"[REAL-TIME] Searching for global remote jobs...")
    remote_jobs = fetch_remoteok_jobs(query)
    jobs.extend(remote_jobs)
    
    # 3. Fallback to Local DB only if we found very few or no jobs
    if len(jobs) < 5:
        print("[FALLBACK] Found few real-time jobs, augmenting with local database")
        try:
            db_path = os.path.join(os.path.dirname(__file__), "..", "data", "jobs_db.json")
            if os.path.exists(db_path):
                with open(db_path, "r") as f:
                    local_data = json.load(f)
                    # Add jobs that aren't already represented
                    for j in local_data[:20]:
                        jobs.append(JobMatch(
                            title=j["title"],
                            company=j["company"],
                            location=j["location"],
                            salary=j["salary"],
                            match_score=0,
                            job_url=j["job_url"],
                            description=j["description"]
                        ))
        except Exception as e:
            print(f"[CRITICAL] Error reading local DB: {e}")
            
    return jobs

def scrape_naukri(job_title: str, location: str = "India") -> list:
    # Retained for backward compatibility or future enhancement
    return get_real_time_jobs([job_title], location)
