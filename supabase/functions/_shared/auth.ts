// ============================================================================
// Auth helpers — verify caller is an authenticated admin
// ============================================================================

import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface AuthContext {
  callerId: string;
  adminClient: SupabaseClient;
}

/**
 * Verifies the request is from an authenticated admin.
 * Returns null if verification fails.
 */
export const verifyAdmin = async (
  req: Request
): Promise<AuthContext | null> => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !anonKey || !serviceKey) {
    console.error('[auth] Missing Supabase env vars');
    return null;
  }

  // Use the caller's JWT to identify them
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return null;

  const callerId = userData.user.id;

  // Use service role to check admin status (bypasses RLS)
  const adminClient = createClient(supabaseUrl, serviceKey);

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('account_type')
    .eq('id', callerId)
    .single();

  if (
    profileError ||
    !profile ||
    (profile as { account_type: string }).account_type !== 'admin'
  ) {
    return null;
  }

  return { callerId, adminClient };
};