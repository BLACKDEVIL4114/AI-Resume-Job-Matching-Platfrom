import { createClient } from '@supabase/supabase-js';

// These should be replaced with actual Supabase Project URL and Anon Key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Mock client for local development if keys are missing
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if Supabase is properly configured with real keys
export const isSupabaseConfigured = supabaseUrl !== 'https://your-project.supabase.co';

/**
 * PRO TIP: To enable real Google Auth:
 * 1. Create a Supabase project at supabase.com
 * 2. Go to Authentication -> Providers -> Google
 * 3. Follow the instructions to get a Google Client ID and Secret
 * 4. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file
 */
