import requests
from bs4 import BeautifulSoup
from models.schemas import JobMatch

def scrape_naukri(job_title: str, location: str = "Ahmedabad") -> list:
    try:
        # Format strings for URL
        title_url = job_title.lower().replace(" ", "-")
        location_url = location.lower()
        url = f"https://www.naukri.com/{title_url}-jobs-in-{location_url}"
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            print(f"Naukri Scraper: Received status {response.status_code}")
            return []

        soup = BeautifulSoup(response.content, "html.parser")
        job_listings = soup.find_all("div", class_="srp-jobtuple-wrapper")
        
        results = []
        for job in job_listings[:10]:
            try:
                title = job.find("a", class_="title").text.strip()
                company = job.find("a", class_="comp-name").text.strip()
                loc = job.find("span", class_="locWraper").text.strip()
                salary = job.find("span", class_="sal-wrap").text.strip()
                link = job.find("a", class_="title")["href"]
                
                results.append(JobMatch(
                    title=title,
                    company=company,
                    location=loc,
                    salary=salary,
                    match_score=0, # Score will be calculated later
                    job_url=link,
                    description="Live job from Naukri.com"
                ))
            except:
                continue
                
        return results
    except Exception as e:
        print(f"Scraper Error: {e}")
        return []
