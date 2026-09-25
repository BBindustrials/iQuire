// ============================================================================
// iQuire — Admin Service
// ============================================================================
// Data fetching for admin dashboard. Uses RLS-bypassing queries where needed.
// NOTE: All queries here run under the admin's authenticated session.
//       RLS policies for admin access to all rows come in Phase 7.
// ============================================================================

import { supabase } from '../integrations/supabase/client';


// ============================================================================
// Types
// ============================================================================

export interface DashboardStats {
  totalUsers: number;
  students: number;
  nysc: number;
  recruiters: number;
  admins: number;
  verified: number;
  pending: number;
  recentSignups: number; // last 7 days
}

export interface RecentUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  created_at: string;
}

export interface SignupTrendPoint {
  date: string;   // YYYY-MM-DD
  count: number;
}

// ============================================================================
// Dashboard Stats
// ============================================================================

export const getDashboardStats = async (): Promise<{
  data: DashboardStats | null;
  error: string | null;
}> => {
  try {
    // Fetch minimal data to count client-side
    // (small dataset, easier than 6 separate queries)
    const { data, error } = await supabase
      .from('profiles')
      .select('role, verification_status, created_at');

    if (error) return { data: null, error: error.message };

    const rows = (data ?? []) as Array<{
      role: string;
      verification_status: RecentUser['verification_status'];
      created_at: string;
    }>;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const stats: DashboardStats = {
      totalUsers: rows.length,
      students: rows.filter((r) => r.role === 'student').length,
      nysc: rows.filter((r) => r.role === 'nysc').length,
      recruiters: rows.filter((r) => r.role === 'recruiter').length,
      admins: rows.filter((r) => r.role === 'admin').length,
      verified: rows.filter((r) => r.verification_status === 'verified').length,
      pending: rows.filter((r) => r.verification_status === 'pending').length,
      recentSignups: rows.filter((r) => new Date(r.created_at) >= sevenDaysAgo).length,
    };

    return { data: stats, error: null };
  } catch (err) {
    return { data: null, error: String(err) };
  }
};

// ============================================================================
// Recent Users
// ============================================================================

export const getRecentUsers = async (
  limit = 5
): Promise<{ data: RecentUser[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, role, verification_status, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return { data: null, error: error.message };
    return { data: (data as RecentUser[]) ?? [], error: null };
  } catch (err) {
    return { data: null, error: String(err) };
  }
};

// ============================================================================
// Signup Trend — last N days
// ============================================================================

export const getSignupTrend = async (
  days = 7
): Promise<{ data: SignupTrendPoint[] | null; error: string | null }> => {
  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: true });

    if (error) return { data: null, error: error.message };

    // Bucket into days
    const buckets: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = 0;
    }

    const signupRows = (data ?? []) as Array<{ created_at: string }>;
    signupRows.forEach((row) => {
      const key = new Date(row.created_at).toISOString().slice(0, 10);
      if (key in buckets) buckets[key] += 1;
    });

    const trend: SignupTrendPoint[] = Object.entries(buckets).map(
      ([date, count]) => ({ date, count })
    );

    return { data: trend, error: null };
  } catch (err) {
    return { data: null, error: String(err) };
  }
};