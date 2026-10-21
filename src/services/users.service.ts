/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================================
// iQuire — Users Service (Phase 16.1 + 14.13.4 merged)
// ============================================================================
// Two purposes:
//   1. Unified user list for the admin Users Manager (16.x)
//   2. Search helpers used by AuthorLinker / StudentPicker (14.13.4)
// ============================================================================

import { supabase } from '../integrations/supabase/client';

// ============================================================================
// Types — Shared
// ============================================================================

export type AccountType = 'member' | 'recruiter' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'deleted';

// ============================================================================
// Types — Search (used by AuthorLinker, StudentPicker)
// ============================================================================

export interface UserSearchResult {
  participant_id: any;
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  account_type: AccountType;
  role: string;
  bio_title: string | null;
  iq_id: string | null;
}

// ============================================================================
// Types — Unified users (used by /admin/users)
// ============================================================================

export interface UnifiedUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar_url: string | null;
  iq_id: string | null;
  participant_id: string | null;
  account_type: AccountType;
  role: string;
  account_status: UserStatus;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
  bio_title: string | null;
  recruiter_company: string | null;
  enrollment_count: number;
}

export interface UserFilters {
  search?: string;
  accountType?: AccountType | 'all';
  status?: UserStatus | 'all';
}

export interface UserStats {
  total: number;
  admins: number;
  recruiters: number;
  members: number;
  active: number;
  suspended: number;
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// HELPERS — formatting
// ============================================================================

export const formatAccountType = (type: AccountType): string => {
  const map: Record<AccountType, string> = {
    member: 'Student / Alumni',
    recruiter: 'Recruiter',
    admin: 'Admin',
  };
  return map[type] ?? type;
};

export const formatUserStatus = (status: UserStatus): string => {
  const map: Record<UserStatus, string> = {
    active: 'Active',
    suspended: 'Suspended',
    deleted: 'Deleted',
  };
  return map[status] ?? status;
};

export const getInitials = (firstName: string, lastName: string): string => {
  const first = firstName?.[0] ?? '';
  const last = lastName?.[0] ?? '';
  return `${first}${last}`.toUpperCase();
};

// ============================================================================
// SEARCH — used by AuthorLinker / StudentPicker (Phase 14.13.4)
// ============================================================================

export const searchUsers = async (
  query: string,
  limit = 10
): Promise<ServiceResponse<UserSearchResult[]>> => {
  try {
    const q = query.trim();

    let dbQuery = supabase
      .from('profiles')
      .select(
        'id, first_name, last_name, email, avatar_url, account_type, role, bio_title, iq_id'
      )
      .eq('account_status', 'active')
      .order('first_name', { ascending: true })
      .limit(limit);

    if (q) {
      const like = `%${q}%`;
      dbQuery = dbQuery.or(
        `first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like}`
      );
    }

    const { data, error } = await dbQuery;

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as UserSearchResult[]) ?? [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// READ — Unified list of all users (Phase 16.1)
// ============================================================================

export const fetchAllUsers = async (
  filters?: UserFilters
): Promise<ServiceResponse<UnifiedUser[]>> => {
  try {
    let query = supabase
      .from('profiles')
      .select(
        'id, email, first_name, last_name, phone, avatar_url, iq_id, participant_id, account_type, role, account_status, verification_status, bio_title, created_at, updated_at'
      )
      .order('created_at', { ascending: false });

    if (filters?.accountType && filters.accountType !== 'all') {
      query = query.eq('account_type', filters.accountType);
    }

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('account_status', filters.status);
    }

    if (filters?.search?.trim()) {
      const q = filters.search.trim();
      query = query.or(
        `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,iq_id.ilike.%${q}%,participant_id.ilike.%${q}%`
      );
    }

    const { data, error } = await query;

    if (error) return { success: false, error: error.message };

    const profiles = (data ?? []) as Array<{
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      phone: string | null;
      avatar_url: string | null;
      iq_id: string | null;
      participant_id: string | null;
      account_type: AccountType;
      role: string;
      account_status: UserStatus;
      verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
      bio_title: string | null;
      created_at: string;
      updated_at: string;
    }>;

    // Enrich with enrollment counts (members) + company name (recruiters)
    const memberIds = profiles
      .filter((p) => p.account_type === 'member')
      .map((p) => p.id);
    const enrollmentCounts: Record<string, number> = {};
    if (memberIds.length > 0) {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('user_id')
        .in('user_id', memberIds);
      (enrollments ?? []).forEach((e: { user_id: string }) => {
        enrollmentCounts[e.user_id] = (enrollmentCounts[e.user_id] ?? 0) + 1;
      });
    }

    const recruiterIds = profiles
      .filter((p) => p.account_type === 'recruiter')
      .map((p) => p.id);
    const recruiterCompanies: Record<string, string> = {};
    if (recruiterIds.length > 0) {
      const { data: recruiters } = await supabase
        .from('recruiter_profiles')
        .select('profile_id, company_name')
        .in('profile_id', recruiterIds);
      (recruiters ?? []).forEach(
        (r: { profile_id: string; company_name: string }) => {
          recruiterCompanies[r.profile_id] = r.company_name;
        }
      );
    }

    const unified: UnifiedUser[] = profiles.map((p) => ({
      id: p.id,
      email: p.email,
      first_name: p.first_name,
      last_name: p.last_name,
      phone: p.phone,
      avatar_url: p.avatar_url,
      iq_id: p.iq_id,
      participant_id: p.participant_id,
      account_type: p.account_type,
      role: p.role,
      account_status: p.account_status,
      verification_status: p.verification_status,
      created_at: p.created_at,
      updated_at: p.updated_at,
      bio_title: p.bio_title,
      recruiter_company: recruiterCompanies[p.id] ?? null,
      enrollment_count: enrollmentCounts[p.id] ?? 0,
    }));

    return { success: true, data: unified };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// READ — Admin-only list
// ============================================================================

export const fetchAdminUsers = async (): Promise<
  ServiceResponse<UnifiedUser[]>
> => {
  return fetchAllUsers({ accountType: 'admin' });
};

// ============================================================================
// READ — Single user by ID
// ============================================================================

export const fetchUserById = async (
  id: string
): Promise<ServiceResponse<UnifiedUser>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(
        'id, email, first_name, last_name, phone, avatar_url, iq_id, participant_id, account_type, role, account_status, verification_status, bio_title, created_at, updated_at'
      )
      .eq('id', id)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'User not found' };

    const p = data as {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      phone: string | null;
      avatar_url: string | null;
      iq_id: string | null;
      participant_id: string | null;
      account_type: AccountType;
      role: string;
      account_status: UserStatus;
      verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
      bio_title: string | null;
      created_at: string;
      updated_at: string;
    };

    let recruiter_company: string | null = null;
    if (p.account_type === 'recruiter') {
      const { data: recruiter } = await supabase
        .from('recruiter_profiles')
        .select('company_name')
        .eq('profile_id', id)
        .maybeSingle();
      recruiter_company =
        (recruiter as { company_name: string } | null)?.company_name ?? null;
    }

    let enrollment_count = 0;
    if (p.account_type === 'member') {
      const { count } = await supabase
        .from('enrollments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', id);
      enrollment_count = count ?? 0;
    }

    return {
      success: true,
      data: { ...p, recruiter_company, enrollment_count },
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// READ — Stats
// ============================================================================

export const fetchUserStats = async (): Promise<UserStats> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('account_type, account_status');

    if (error || !data) {
      return {
        total: 0,
        admins: 0,
        recruiters: 0,
        members: 0,
        active: 0,
        suspended: 0,
      };
    }

    const rows = data as Array<{
      account_type: AccountType;
      account_status: UserStatus;
    }>;

    return {
      total: rows.length,
      admins: rows.filter((r) => r.account_type === 'admin').length,
      recruiters: rows.filter((r) => r.account_type === 'recruiter').length,
      members: rows.filter((r) => r.account_type === 'member').length,
      active: rows.filter((r) => r.account_status === 'active').length,
      suspended: rows.filter((r) => r.account_status === 'suspended').length,
    };
  } catch {
    return {
      total: 0,
      admins: 0,
      recruiters: 0,
      members: 0,
      active: 0,
      suspended: 0,
    };
  }
};

// ============================================================================
// WRITE — Toggle user status
// ============================================================================

export const toggleUserStatus = async (
  id: string,
  status: UserStatus
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ account_status: status })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// WRITE — Send password reset email
// ============================================================================

export const sendPasswordResetEmail = async (
  email: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/login`
        : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      redirectTo ? { redirectTo } : undefined
    );

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// WRITE — Update basics
// ============================================================================

export const updateUserBasics = async (
  id: string,
  input: Partial<{
    first_name: string;
    last_name: string;
    phone: string | null;
    bio_title: string | null;
  }>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(input)
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// WRITE — Create admin account (Phase 16.4)
// ============================================================================
// Calls the admin-create-student Edge Function with account_type: 'admin'.
// Returns credentials that the calling admin must share with the new admin.
// ============================================================================

export interface CreateAdminInput {
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  phone?: string;
  bio_title?: string;
  send_welcome_email?: boolean;
}

export interface CreateAdminResponse {
  user_id: string;
  account_type: 'admin';
  email: string;
  iq_id: null;
  participant_id: string;
  temp_password: string;
  full_name: string;
  enrollment_id: null;
  invite_id: null;
  email_status: 'sent' | 'failed' | 'skipped';
  email_error: string | null;
}

export const createAdmin = async (
  input: CreateAdminInput
): Promise<ServiceResponse<CreateAdminResponse>> => {
  try {
    const payload = {
      account_type: 'admin' as const,
      first_name: input.first_name.trim(),
      last_name: input.last_name.trim(),
      middle_name: input.middle_name?.trim() || undefined,
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || undefined,
      bio_title: input.bio_title?.trim() || undefined,
      send_welcome_email: input.send_welcome_email ?? true,
    };

    const { data, error } = await supabase.functions.invoke<
      CreateAdminResponse & { success: boolean; error?: string }
    >('admin-create-student', {
      body: payload,
    });

    if (error) {
      return {
        success: false,
        error: error.message ?? 'Failed to create admin',
      };
    }

    if (!data || !data.success) {
      return {
        success: false,
        error: data?.error ?? 'Unknown error',
      };
    }

    return { success: true, data: data as CreateAdminResponse };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};