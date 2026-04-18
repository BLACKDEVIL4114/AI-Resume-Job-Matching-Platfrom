import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function wakeDatabase() {
  try {
    await supabase.from('resumes').select('id').limit(1);
  } catch (err) {
    console.warn('[DB Wake] Initial query failed, retrying...', err.message);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await supabase.from('resumes').select('id').limit(1);
  }
}

let wakePromise = null;
export async function ensureAwake() {
  if (!wakePromise) wakePromise = wakeDatabase();
  return wakePromise;
}

export default supabase;
