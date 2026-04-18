import supabase, { ensureAwake } from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  await ensureAwake();

  try {
    if (req.method === 'GET') {
      const { resume_id } = req.query;
      const query = supabase.from('applications').select('*').order('created_at', { ascending: false });
      if (resume_id) query.eq('resume_id', parseInt(resume_id));
      
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { job_match_id, resume_id, status } = req.body;
      if (!job_match_id || !resume_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { data: jobMatch } = await supabase
        .from('job_matches')
        .select('*')
        .eq('id', job_match_id)
        .single();

      const { data, error } = await supabase
        .from('applications')
        .insert({
          job_match_id,
          resume_id,
          job_title: jobMatch?.job_title,
          company: jobMatch?.company,
          portal: jobMatch?.portal,
          status: status || 'pending'
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, status, error_message } = req.body;
      const updateData = { status };
      if (error_message) updateData.error_message = error_message;
      if (status === 'applied') updateData.applied_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
