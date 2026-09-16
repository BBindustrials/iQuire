import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// ============================================================================
// Supabase Client — Singleton
// ============================================================================
// This is the single Supabase client used across the entire iQuire app.
//
// Environment variables (must be set in .env):
//   - VITE_SUPABASE_URL       → Your Supabase project URL
//   - VITE_SUPABASE_ANON_KEY  → Your Supabase anon/public key
//
// SECURITY NOTES:
//   - Never use the service_role key in frontend code
//   - Never commit .env to version control
//   - The anon key is safe for the frontend ONLY when RLS is properly configured
// ============================================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ----------------------------------------------------------------------------
// Fail-fast guard: ensure environment variables exist
// ----------------------------------------------------------------------------
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Missing Supabase environment variables.\n' +
      'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.\n' +
      'See .env.example for the required format.'
  );
}

// ----------------------------------------------------------------------------
// Create the Supabase client
// ----------------------------------------------------------------------------
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,          // Keep user logged in across page reloads
    autoRefreshToken: true,         // Auto-refresh expired tokens
    detectSessionInUrl: true,       // Required for OAuth / magic links
    storage: window.localStorage,   // Where session is stored
    flowType: 'pkce',               // Modern OAuth flow for extra security
  },
});

// ----------------------------------------------------------------------------
// Expose the Supabase URL for edge cases (rarely needed)
// ----------------------------------------------------------------------------
export const SUPABASE_URL = supabaseUrl;