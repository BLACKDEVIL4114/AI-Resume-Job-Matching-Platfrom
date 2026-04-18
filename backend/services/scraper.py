# backend/services/scraper.py
import requests
from bs4 import BeautifulSoup
from models.schemas import JobMatch

def scrape_naukri(job_title: str, location: str = "Ahmedabad") -> list:
    print(f"[SCRAPER] Searching Naukri for: {job_title} in {location}")
    results = []
    try:
        search_title = job_title.replace(" ", "-").lower()
        search_location = location.replace(" ", "-").lower()
        url = f"https://www.naukri.com/{search_title}-jobs-in-{search_location}"
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            print(f"[SCRAPER] Failed with status: {response.status_code}")
            return []
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        job_cards = soup.find_all("article", class_="jobTuple", limit=10)
        
        if not job_cards:
            job_cards = soup.find_all("div", class_="job-container", limit=10)
        
        for card in job_cards:
            try:
                title_tag = card.find("a", class_="title")
                company_tag = card.find("a", class_="subTitle")
                location_tag = card.find("li", class_="location")
                salary_tag = card.find("li", class_="salary")
                
                title = title_tag.text.strip() if title_tag else job_title
                company = company_tag.text.strip() if company_tag else "Company"
                loc = location_tag.text.strip() if location_tag else location
                salary = salary_tag.text.strip() if salary_tag else "Not disclosed"
                job_url = title_tag["href"] if title_tag and title_tag.get("href") else url
                
                results.append(JobMatch(
                    title=title,
                    company=company,
                    location=loc,
                    salary=salary,
                    match_score=0,
                    job_url=job_url,
                    description=f"{title} role at {company} in {loc}"
                ))
            except Exception as e:
                print(f"[SCRAPER] Error parsing card: {e}")
                continue
        
        print(f"[SCRAPER] Found {len(results)} jobs")
        return results
        
    except Exception as e:
        print(f"[SCRAPER] Exception: {e}")
        return []
