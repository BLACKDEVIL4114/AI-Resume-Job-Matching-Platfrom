import { ensureAwake } from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  
  try {
    await ensureAwake();
    res.status(200).json({ status: 'awake' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
