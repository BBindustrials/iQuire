// ============================================================================
// iQuire — Recruiters Service (Phase 12C.2)
// ============================================================================

import { supabase } from '../integrations/supabase/client';

// ============================================================================
// Types
// ============================================================================

export type RecruiterVerificationStatus =
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'suspended';

export interface RecruiterListItem {
  id: string;
  profile_id: string;
  position: string;
  company_name: string;
  industry: string;
  company_website: string | null;
  company_size: string | null;
  company_description: string | null;
  company_linkedin_url: string | null;
  linkedin_url: string | null;
  hiring_needs: string | null;
  verification_status: RecruiterVerificationStatus;
  verification_notes: string | null;
  verified_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;

  // Joined from profiles
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  account_status: 'active' | 'suspended' | 'deleted';
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// Raw row shape (from Supabase join) — avoids `any`
// ============================================================================

interface RawRecruiterRow {
  id: string;
  profile_id: string;
  position: string;
  company_name: string;
  industry: string;
  company_website: string | null;
  company_size: string | null;
  company_description: string | null;
  company_linkedin_url: string | null;
  linkedin_url: string | null;
  hiring_needs: string | null;
  verification_status: RecruiterVerificationStatus;
  verification_notes: string | null;
  verified_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  profile: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    account_status: 'active' | 'suspended' | 'deleted';
  } | null;
}

const flattenRow = (row: RawRecruiterRow): RecruiterListItem => ({
  id: row.id,
  profile_id: row.profile_id,
  position: row.position,
  company_name: row.company_name,
  industry: row.industry,
  company_website: row.company_website,
  company_size: row.company_size,
  company_description: row.company_description,
  company_linkedin_url: row.company_linkedin_url,
  linkedin_url: row.linkedin_url,
  hiring_needs: row.hiring_needs,
  verification_status: row.verification_status,
  verification_notes: row.verification_notes,
  verified_at: row.verified_at,
  rejected_at: row.rejected_at,
  rejection_reason: row.rejection_reason,
  created_at: row.created_at,
  updated_at: row.updated_at,
  email: row.profile?.email ?? '',
  first_name: row.profile?.first_name ?? '',
  last_name: row.profile?.last_name ?? '',
  phone: row.profile?.phone ?? null,
  account_status: row.profile?.account_status ?? 'active',
});

// ============================================================================
// LIST
// ============================================================================

export const fetchAllRecruiters = async (): Promise<
  ServiceResponse<RecruiterListItem[]>
> => {
  try {
    const { data, error } = await supabase
      .from('recruiter_profiles')
      .select(`
        *,
        profile:profiles!recruiter_profiles_profile_id_fkey (
          email, first_name, last_name, phone, account_status
        )
      `)
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };

    const items = ((data ?? []) as unknown as RawRecruiterRow[]).map(flattenRow);
    return { success: true, data: items };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// GET ONE
// ============================================================================

export const fetchRecruiterById = async (
  id: string
): Promise<ServiceResponse<RecruiterListItem>> => {
  try {
    const { data, error } = await supabase
      .from('recruiter_profiles')
      .select(`
        *,
        profile:profiles!recruiter_profiles_profile_id_fkey (
          email, first_name, last_name, phone, account_status
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Recruiter not found' };

    return {
      success: true,
      data: flattenRow(data as unknown as RawRecruiterRow),
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// VERIFY
// ============================================================================

export const verifyRecruiter = async (
  id: string,
  adminId: string,
  notes?: string
): Promise<ServiceResponse<RecruiterListItem>> => {
  try {
    const { data, error } = await supabase
      .from('recruiter_profiles')
      .update({
        verification_status: 'verified',
        verification_notes: notes ?? null,
        verified_by: adminId,
        rejection_reason: null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    const row = data as unknown as RawRecruiterRow & { profile?: null };
    const partial = {
      ...(row as unknown as RecruiterListItem),
      email: '',
      first_name: '',
      last_name: '',
      phone: null,
      account_status: 'active' as const,
    };
    return { success: true, data: partial };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// REJECT
// ============================================================================

export const rejectRecruiter = async (
  id: string,
  adminId: string,
  reason: string
): Promise<ServiceResponse<RecruiterListItem>> => {
  try {
    const { data, error } = await supabase
      .from('recruiter_profiles')
      .update({
        verification_status: 'rejected',
        rejection_reason: reason,
        rejected_by: adminId,
        verification_notes: null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    const row = data as unknown as RecruiterListItem;
    const partial = {
      ...row,
      email: '',
      first_name: '',
      last_name: '',
      phone: null,
      account_status: 'active' as const,
    };
    return { success: true, data: partial };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// SUSPEND
// ============================================================================

export const suspendRecruiter = async (
  id: string,
  adminId: string,
  reason?: string
): Promise<ServiceResponse<RecruiterListItem>> => {
  try {
    const { data, error } = await supabase
      .from('recruiter_profiles')
      .update({
        verification_status: 'suspended',
        verification_notes: reason ?? null,
        verified_by: adminId,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    const row = data as unknown as RecruiterListItem;
    const partial = {
      ...row,
      email: '',
      first_name: '',
      last_name: '',
      phone: null,
      account_status: 'active' as const,
    };
    return { success: true, data: partial };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// RESET TO PENDING
// ============================================================================

export const resetRecruiterToPending = async (
  id: string
): Promise<ServiceResponse<RecruiterListItem>> => {
  try {
    const { data, error } = await supabase
      .from('recruiter_profiles')
      .update({
        verification_status: 'pending',
        rejection_reason: null,
        verification_notes: null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    const row = data as unknown as RecruiterListItem;
    const partial = {
      ...row,
      email: '',
      first_name: '',
      last_name: '',
      phone: null,
      account_status: 'active' as const,
    };
    return { success: true, data: partial };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};