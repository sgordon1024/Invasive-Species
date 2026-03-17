// Supabase client — shared across the entire app.
// Import this anywhere you need database access or auth.
//
// Required env vars (see .env.example):
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_ANON_KEY

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If env vars are missing the main site still loads fine.
// Passport pages will show a "not configured" message instead of crashing.
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

export const supabaseReady = Boolean(supabase);
