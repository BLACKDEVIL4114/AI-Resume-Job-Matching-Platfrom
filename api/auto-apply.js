import supabase, { ensureAwake } from './_supabase.js';

// Simulated auto-apply - in production, integrate with Selenium/Puppeteer backend
async function simulateAutoApply(jobMatch, resumeId) {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

  // Simulate success/failure
  const success = Math.random() > 0.2; // 80% success rate

  return {
    success,
    message: success 
      ? `Successfully applied to ${jobMatch.job_title} at ${jobMatch.company} via ${jobMatch.portal}` 
      : `Failed to apply: ${['Form validation error', 'Portal timeout', 'Captcha detected'][Math.floor(Math.random() * 3)]}`
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
      const { job_match_ids, resume_id } = req.body;
      if (!job_match_ids || !Array.isArray(job_match_ids) || !resume_id) {
        return res.status(400).json({ error: 'Missing job_match_ids array or resume_id' });
      }

      const results = [];

      for (const jobMatchId of job_match_ids) {
        const { data: jobMatch } = await supabase
          .from('job_matches')
          .select('*')
          .eq('id', jobMatchId)
          .single();

        if (!jobMatch) {
          results.push({ job_match_id: jobMatchId, success: false, message: 'Job match not found' });
          continue;
        }

        // Create application record
        const { data: application } = await supabase
          .from('applications')
          .insert({
            job_match_id: jobMatchId,
            resume_id,
            job_title: jobMatch.job_title,
            company: jobMatch.company,
            portal: jobMatch.portal,
            status: 'processing'
          })
          .select()
          .single();

        // Simulate auto-apply
        const result = await simulateAutoApply(jobMatch, resume_id);

        // Update application status
        await supabase
          .from('applications')
          .update({
            status: result.success ? 'applied' : 'failed',
            applied_at: result.success ? new Date().toISOString() : null,
            error_message: result.success ? null : result.message
          })
          .eq('id', application.id);

        results.push({
          job_match_id: jobMatchId,
          application_id: application.id,
          ...result
        });
      }

      return res.status(200).json({ results });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
