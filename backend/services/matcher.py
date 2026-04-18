from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from models.schemas import ATSResult, JobMatch
from services.parser import SKILLS_LIST

def ats_score(resume_text: str, job_description: str) -> ATSResult:
    try:
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([resume_text, job_description])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        score = int(similarity * 100)

        grade = ""
        if score >= 80: grade = "Excellent ✅"
        elif score >= 60: grade = "Good 👍"
        elif score >= 40: grade = "Average ⚠️"
        else: grade = "Poor ❌"

        # Keyword matching
        resume_lower = resume_text.lower()
        jd_lower = job_description.lower()
        
        matched = []
        missing = []
        
        for skill in SKILLS_LIST:
            s_low = skill.lower()
            if s_low in jd_lower:
                if s_low in resume_lower:
                    matched.append(skill)
                else:
                    missing.append(skill)

        return ATSResult(
            score=score,
            grade=grade,
            matched_keywords=list(set(matched)),
            missing_keywords=list(set(missing))
        )
    except Exception as e:
        print(f"Error in ats_score: {e}")
        return ATSResult(score=0, grade="Error", matched_keywords=[], missing_keywords=[])

def match_jobs(resume_text: str, jobs: list) -> list:
    try:
        results = []
        for job_data in jobs:
            score_data = ats_score(resume_text, job_data["description"])
            results.append(JobMatch(
                title=job_data["title"],
                company=job_data["company"],
                location=job_data["location"],
                salary=job_data["salary"],
                match_score=score_data.score,
                job_url=job_data["job_url"],
                description=job_data["description"]
            ))
        
        # Sort by score
        return sorted(results, key=lambda x: x.match_score, reverse=True)[:10]
    except Exception as e:
        print(f"Error in match_jobs: {e}")
        return []
