import supabase, { ensureAwake } from './_supabase.js';
import axios from 'axios';

// Fetch real jobs from multiple sources
// Fetch real jobs from multiple sources
async function fetchJobsFromAPIs(skills, location = 'India') {
  const searchQuery = skills.slice(0, 3).join(' OR ');
  const jobs = [];

  const apiCalls = [
    // Adzuna API
    (async () => {
      const adzunaAppId = process.env.ADZUNA_APP_ID || '8e8f4f4e';
      const adzunaKey = process.env.ADZUNA_API_KEY || 'demo-key';
      const res = await axios.get(
        `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${adzunaAppId}&app_key=${adzunaKey}&results_per_page=15&what=${encodeURIComponent(searchQuery)}&content-type=application/json`,
        { timeout: 5000 }
      );
      return res.data?.results?.map(job => ({
        title: job.title,
        company: job.company?.display_name || 'Company',
        location: job.location?.display_name || location,
        salary: job.salary_min && job.salary_max 
          ? `₹${Math.round(job.salary_min/100000)}-${Math.round(job.salary_max/100000)} LPA`
          : 'Not disclosed',
        description: job.description?.substring(0, 300) || '',
        url: job.redirect_url,
        portal: 'adzuna',
        source: 'Adzuna'
      })) || [];
    })(),

    // RemoteOK API
    (async () => {
      const res = await axios.get('https://remoteok.com/api', {
        timeout: 5000,
        headers: { 'User-Agent': 'JobApplyAI/1.0' }
      });
      if (!Array.isArray(res.data)) return [];
      return res.data.slice(1, 16).map(job => ({
        title: job.position,
        company: job.company,
        location: job.location || 'Remote',
        salary: job.salary_min && job.salary_max 
          ? `$${job.salary_min/1000}k-$${job.salary_max/1000}k`
          : 'Competitive',
        description: job.description?.substring(0, 300) || '',
        url: job.url || `https://remoteok.com/remote-jobs/${job.id}`,
        portal: 'remoteok',
        source: 'RemoteOK'
      }));
    })(),

    // Arbeitnow API
    (async () => {
      const res = await axios.get('https://www.arbeitnow.com/api/job-board-api', {
        timeout: 5000
      });
      return res.data?.data?.slice(0, 10).map(job => ({
        title: job.title,
        company: job.company_name,
        location: job.location || 'Remote',
        salary: 'Competitive',
        description: job.description?.substring(0, 300) || '',
        url: job.url,
        portal: 'arbeitnow',
        source: 'Arbeitnow'
      })) || [];
    })()
  ];

  const results = await Promise.allSettled(apiCalls);
  
  results.forEach(result => {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      jobs.push(...result.value);
    }
  });

  return jobs;
}


// Match jobs based on resume skills
function calculateMatchScore(job, skills) {
  let score = 50; // Base score
  
  const jobText = `${job.title} ${job.description}`.toLowerCase();
  
  skills.forEach(skill => {
    if (jobText.includes(skill.toLowerCase())) {
      score += 10;
    }
  });

  return Math.min(100, score);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  await ensureAwake();

  try {
    if (req.method === 'POST') {
      const { resume_id } = req.body;
      if (!resume_id) {
        return res.status(400).json({ error: 'Missing resume_id' });
      }

      // Get resume content
      const { data: resume, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resume_id)
        .single();
      if (resumeError) throw resumeError;

      // Extract skills from resume
      const commonSkills = [
        'javascript', 'python', 'java', 'react', 'node', 'angular', 'vue',
        'sql', 'mongodb', 'aws', 'docker', 'kubernetes', 'devops',
        'machine learning', 'data science', 'frontend', 'backend', 'fullstack'
      ];
      
      const resumeText = resume.content.toLowerCase();
      const foundSkills = commonSkills.filter(skill => resumeText.includes(skill));
      
      // If no skills found, use generic terms
      const searchSkills = foundSkills.length > 0 ? foundSkills : ['software', 'developer', 'engineer'];

      // Fetch real jobs
      console.log('Fetching real jobs for skills:', searchSkills);
      const jobs = await fetchJobsFromAPIs(searchSkills);
      console.log(`Found ${jobs.length} real jobs`);

      if (jobs.length === 0) {
        return res.status(200).json({ message: 'No jobs found', jobs: [] });
      }

      // Calculate match scores and insert into database
      const jobsWithScores = jobs.map(job => ({
        ...job,
        match_score: calculateMatchScore(job, foundSkills)
      }));

      // Sort by match score
      jobsWithScores.sort((a, b) => b.match_score - a.match_score);

      // Delete old matches for this resume
      await supabase.from('job_matches').delete().eq('resume_id', resume_id);

      // Insert new matches
      const insertData = jobsWithScores.map(job => ({
        resume_id,
        job_title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        match_score: job.match_score,
        portal: job.portal,
        job_url: job.url,
        description: job.description,
        source: job.source
      }));

      const { data, error } = await supabase
        .from('job_matches')
        .insert(insertData)
        .select();
      
      if (error) throw error;

      return res.status(201).json({ jobs: data, count: data.length });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
