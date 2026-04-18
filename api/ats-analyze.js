import supabase, { ensureAwake } from './_supabase.js';

// Simulated ATS analysis - in production, integrate with AI/ML service
function analyzeResume(content) {
  const keywords = [
    // Core Engineering
    'experience', 'skills', 'education', 'projects', 'achievements',
    'leadership', 'team', 'management', 'technical', 'communication',
    'problem-solving', 'agile', 'scrum', 'git', 'ci/cd', 'devops',
    // Frontend
    'react', 'typescript', 'next.js', 'javascript', 'tailwind', 'redux', 'vue',
    'angular', 'css', 'html', 'responsive', 'performance',
    // Backend & Languages
    'node', 'python', 'java', 'go', 'rust', 'c++', 'ruby', 'php', 'sql',
    'postgresql', 'mongodb', 'graphql', 'rest api', 'microservices',
    // AI & Cloud
    'ai', 'machine learning', 'pytorch', 'tensorflow', 'llm', 'openai',
    'cloud', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform'
  ];

  const lowerContent = content.toLowerCase();
  const foundKeywords = keywords.filter(kw => lowerContent.includes(kw));
  const keywordScore = (foundKeywords.length / keywords.length) * 40;

  const hasContact = /email|phone|linkedin|github/.test(lowerContent) ? 15 : 0;
  const hasEducation = /education|degree|university|college/.test(lowerContent) ? 15 : 0;
  const hasExperience = /experience|worked|developed|managed/.test(lowerContent) ? 20 : 0;
  const hasSkills = /skills|technologies|tools/.test(lowerContent) ? 10 : 0;

  const score = Math.min(100, Math.round(keywordScore + hasContact + hasEducation + hasExperience + hasSkills));

  const suggestions = [];
  if (score < 40) suggestions.push('Add more relevant keywords and technical skills');
  if (!hasContact) suggestions.push('Include contact information (email, phone, LinkedIn)');
  if (!hasEducation) suggestions.push('Add education section with degrees and institutions');
  if (!hasExperience) suggestions.push('Highlight work experience with quantifiable achievements');
  if (keywordScore < 20) suggestions.push('Include industry-specific keywords and technologies');
  if (score < 60) suggestions.push('Add projects or certifications to strengthen your profile');
  if (score >= 80) suggestions.push('Excellent! Your resume is well-optimized for ATS systems');

  return { score, suggestions, foundKeywords: foundKeywords.slice(0, 10) };
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
