import supabase, { ensureAwake } from './_supabase.js';

// Enhanced ATS Analysis Logic
const SKILL_CLUSTERS = {
  frontend: ['react', 'vue', 'angular', 'next.js', 'typescript', 'javascript', 'html', 'css', 'tailwind', 'redux', 'sass', 'webpack', 'vite', 'responsive'],
  backend: ['node', 'python', 'java', 'go', 'rust', 'ruby', 'php', 'django', 'flask', 'fastapi', 'spring boot', 'microservices', 'rest api', 'graphql'],
  database: ['sql', 'postgresql', 'mongodb', 'mysql', 'redis', 'nosql', 'firebase', 'sqlite', 'oracle', 'dynamodb'],
  devops: ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'github actions', 'terraform', 'ansible', 'linux', 'bash', 'cicd'],
  ai: ['ai', 'machine learning', 'pytorch', 'tensorflow', 'llm', 'openai', 'nlp', 'data science', 'scikit-learn', 'deep learning', 'pandas', 'numpy']
};

const ACTION_VERBS = ['developed', 'led', 'managed', 'implemented', 'designed', 'optimized', 'scaled', 'architected', 'resolved', 'collaborated', 'increased', 'decreased', 'shipped'];

function analyzeResume(content) {
  const lowerContent = content.toLowerCase();
  
  // 1. Skill Density (40 points)
  let foundKeywords = [];
  let clusterScores = {};
  
  Object.entries(SKILL_CLUSTERS).forEach(([cluster, skills]) => {
    const matched = skills.filter(skill => lowerContent.includes(skill));
    clusterScores[cluster] = matched.length;
    foundKeywords.push(...matched);
  });
  
  const uniqueKeywords = [...new Set(foundKeywords)];
  const keywordIntensity = Math.min(40, (uniqueKeywords.length / 15) * 40);

  // 2. Section Analysis (25 points)
  const sections = {
    contact: { regex: /([a-zA-Z0-9._%+-]+@|phone|mobile|linkedin|github|portfolio)/, score: 5 },
    education: { regex: /(education|degree|university|college|bachelor|master|b\.tech|m\.tech|graduate)/, score: 5 },
    experience: { regex: /(experience|worked|employment|history|internship|professional experience)/, score: 10 },
    skills: { regex: /(skills|technologies|tools|competencies|expertise)/, score: 5 }
  };

  let sectionScore = 0;
  const missingSections = [];
  for (const [name, data] of Object.entries(sections)) {
    if (data.regex.test(lowerContent)) {
      sectionScore += data.score;
    } else {
      missingSections.push(name);
    }
  }

  // 3. Impact & Quantified Results (20 points)
  const metricMatch = lowerContent.match(/\d+%/g) || [];
  const verbMatch = ACTION_VERBS.filter(v => lowerContent.includes(v));
  const impactScore = Math.min(20, (metricMatch.length * 5) + (verbMatch.length * 2));

  // 4. Formatting & Depth (15 points)
  const wordCount = content.split(/\s+/).length;
  let depthScore = 0;
  if (wordCount > 150 && wordCount < 800) depthScore = 15;
  else if (wordCount >= 800) depthScore = 10;
  else depthScore = 5;

  // Final Score
  const score = Math.round(keywordIntensity + sectionScore + impactScore + depthScore);

  // Dynamic Suggestions
  const suggestions = [];
  if (score < 40) suggestions.push('Significant improvements needed. Add detailed skills and experience.');
  if (missingSections.length > 0) suggestions.push(`Add or clearly label these sections: ${missingSections.join(', ')}`);
  if (metricMatch.length === 0) suggestions.push('Add quantifiable metrics (e.g., "Increased performance by 20%") to highlight impact.');
  if (uniqueKeywords.length < 8) suggestions.push('Include more industry-specific technical keywords.');
  if (verbMatch.length < 5) suggestions.push('Use more action verbs to describe your responsibilities.');
  if (wordCount < 150) suggestions.push('Your resume seems too brief. Expand on your projects and achievements.');
  if (score >= 85) suggestions.push('Excellent profile! Your resume is highly optimized for modern ATS systems.');

  return { 
    score: Math.min(100, score), 
    suggestions: suggestions.slice(0, 5), 
    foundKeywords: uniqueKeywords.slice(0, 12) 
  };
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

      const { data: resume, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resume_id)
        .single();
      if (resumeError) throw resumeError;

      const analysis = analyzeResume(resume.content);

      const { data, error } = await supabase
        .from('ats_scores')
        .insert({
          resume_id,
          score: analysis.score,
          suggestions: analysis.suggestions,
          keywords_found: analysis.foundKeywords
        })
        .select()
        .single();
      if (error) throw error;

      await supabase
        .from('resumes')
        .update({ ats_score: analysis.score })
        .eq('id', resume_id);

      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
