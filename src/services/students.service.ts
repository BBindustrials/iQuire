// ============================================================================
// iQuire — Students Service (Phase 11B.5 + 15.8)
// ============================================================================
// Wraps Edge Function calls + student list/edit operations for the admin UI.
// ============================================================================

import { supabase } from '../integrations/supabase/client';

// ============================================================================
// Types
// ============================================================================

export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

export interface StudentListItem {
  id: string;
  iq_id: string | null;
  participant_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  account_status: 'active' | 'suspended' | 'deleted';
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  created_at: string;
  must_change_password: boolean;
  created_by_admin: string | null;
  enrollments?: { id: string; course_title: string | null; status: string }[];
}

export interface CreateStudentInput {
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  phone?: string;
  gender?: Gender;
  country?: string;
  state?: string;
  lga?: string;
  cohort_token: string;
  course_id?: string;
  cohort_id?: string;
}

export interface CreateStudentResponse {
  user_id: string;
  email: string;
  iq_id: string;
  participant_id: string;
  temp_password: string;
  full_name: string;
  enrollment_id: string | null;
  invite_id: string | null;
  email_status: 'sent' | 'failed' | 'skipped';
  email_error: string | null;
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// LIST — All students
// ============================================================================

export const fetchStudents = async (): Promise<ServiceResponse<StudentListItem[]>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(
        'id, iq_id, participant_id, first_name, last_name, email, phone, account_status, verification_status, created_at, must_change_password, created_by_admin'
      )
      .eq('account_type', 'member')
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };

    return { success: true, data: (data as unknown as StudentListItem[]) ?? [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// GET ONE — Student by ID
// ============================================================================

export const fetchStudentById = async (
  id: string
): Promise<ServiceResponse<StudentListItem>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(
        'id, iq_id, participant_id, first_name, last_name, email, phone, account_status, verification_status, created_at, must_change_password, created_by_admin'
      )
      .eq('id', id)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Student not found' };

    return { success: true, data: data as unknown as StudentListItem };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// CREATE — Calls Edge Function (admin-create-student)
// ============================================================================

export const createStudent = async (
  input: CreateStudentInput
): Promise<ServiceResponse<CreateStudentResponse>> => {
  try {
    const { data, error } = await supabase.functions.invoke('admin-create-student', {
      body: input,
    });

    if (error) {
      return {
        success: false,
        error: error.message ?? 'Failed to create student',
      };
    }

    if (!data) {
      return { success: false, error: 'No response from server' };
    }

    // Edge Function returns { success: true, ...credentials } or { success: false, error }
    const response = data as unknown as
      | ({ success: true } & CreateStudentResponse)
      | { success: false; error: string };

    if (!response.success) {
      return {
        success: false,
        error:
          (response as { success: false; error: string }).error ??
          'Unknown error',
      };
    }

    return { success: true, data: response as CreateStudentResponse };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// UPDATE — Basic profile fields
// ============================================================================

export const updateStudent = async (
  id: string,
  input: Partial<{
    first_name: string;
    middle_name: string;
    last_name: string;
    phone: string;
    gender: Gender;
    country: string;
    state: string;
    lga: string;
  }>
): Promise<ServiceResponse<StudentListItem>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(input)
      .eq('id', id)
      .select(
        'id, iq_id, participant_id, first_name, last_name, email, phone, account_status, verification_status, created_at, must_change_password, created_by_admin'
      )
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as unknown as StudentListItem };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// TOGGLE — Deactivate / reactivate
// ============================================================================

export const toggleStudentStatus = async (
  id: string,
  status: 'active' | 'suspended'
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
// RESEND — Welcome email
// ============================================================================

export const resendWelcomeEmail = async (params: {
  invite_id: string;
  email: string;
  first_name: string;
  last_name: string;
  iq_id: string;
  temp_password: string;
}): Promise<ServiceResponse<{ message_id: string }>> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: params,
    });

    if (error) return { success: false, error: error.message };

    if (!data) return { success: false, error: 'No response from server' };

    const response = data as unknown as
      | ({ success: true; message_id: string })
      | { success: false; error: string };

    if (!response.success) {
      return {
        success: false,
        error:
          (response as { success: false; error: string }).error ?? 'Failed',
      };
    }

    return { success: true, data: { message_id: response.message_id } };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// COURSES — for dropdowns
// ============================================================================

export const fetchCoursesForSelect = async (): Promise<
  ServiceResponse<{ id: string; title: string }[]>
> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('id, title')
      .order('display_order', { ascending: true });

    if (error) return { success: false, error: error.message };
    return {
      success: true,
      data: (data as { id: string; title: string }[]) ?? [],
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// COHORTS — for dropdowns
// ============================================================================
// By default returns only open cohorts (public-facing behavior).
// Pass { includeAll: true } to include closed + completed cohorts
// (needed for admin enrollment flows + legacy alumni registration).
// ============================================================================

export const fetchCohortsForCourse = async (
  courseId: string,
  options?: { includeAll?: boolean }
): Promise<ServiceResponse<{ id: string; name: string }[]>> => {
  try {
    let query = supabase
      .from('cohorts')
      .select('id, name, status, start_date')
      .eq('course_id', courseId);

    // Default: only open cohorts
    if (!options?.includeAll) {
      query = query.eq('status', 'open');
    }

    const { data, error } = await query.order('start_date', {
      ascending: false,
      nullsFirst: false,
    });

    if (error) return { success: false, error: error.message };

    const list = (data ?? []).map(
      (c: { id: string; name: string }) => ({
        id: c.id,
        name: c.name,
      })
    );

    return { success: true, data: list };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};