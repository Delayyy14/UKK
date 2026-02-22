import { createClient } from '@supabase/supabase-js';

// During build time (npm run build), environment variables might not be present.
// We provide placeholder values to prevent the 'supabaseUrl is required' error.
// The actual values must be set in your Vercel/Production environment variables.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
