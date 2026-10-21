// ============================================================================
// iQuire — Cohorts Service (Phase 15.8)
// ============================================================================
// Admin CRUD for cohorts + "set as next" logic.
// ============================================================================

import { supabase } from '../integrations/supabase/client';

// ============================================================================
// Types
// ============================================================================

export type CohortStatus = 'open' | 'closed' | 'completed';

export interface CohortWithCourse {
  id: string;
  course_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  schedule: string | null;
  format: string | null;
  fee: string | null;
  capacity: number | null;
  spots_left: number | null;
  status: CohortStatus;
  is_next: boolean;
  cohort_token: string | null;
  registration_url: string | null;
  created_at: string;
  updated_at: string;

  // Joined
  course: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

export interface CohortInput {
  course_id: string;
  name: string;
  start_date?: string | null;
  end_date?: string | null;
  schedule?: string | null;
  format?: string | null;
  fee?: string | null;
  capacity?: number | null;
  spots_left?: number | null;
  status?: CohortStatus;
  is_next?: boolean;
  cohort_token?: string | null;
  registration_url?: string | null;
}

export interface CohortStats {
  total: number;
  open: number;
  closed: number;
  completed: number;
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// Select shape (shared)
// ============================================================================

const COHORT_SELECT = `
  *,
  course:courses(id, title, slug)
`;

// ============================================================================
// HELPERS
// ============================================================================

export const formatCohortStatus = (status: CohortStatus): string => {
  const map: Record<CohortStatus, string> = {
    open: 'Open',
    closed: 'Closed',
    completed: 'Completed',
  };
  return map[status] ?? status;
};

// ============================================================================
// READ — List all cohorts (admin)
// ============================================================================

export const fetchAllCohorts = async (): Promise<
  ServiceResponse<CohortWithCourse[]>
> => {
  try {
    const { data, error } = await supabase
      .from('cohorts')
      .select(COHORT_SELECT)
      .order('start_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return {
      success: true,
      data: (data as unknown as CohortWithCourse[]) ?? [],
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// READ — Single cohort
// ============================================================================

export const fetchCohortById = async (
  id: string
): Promise<ServiceResponse<CohortWithCourse>> => {
  try {
    const { data, error } = await supabase
      .from('cohorts')
      .select(COHORT_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Cohort not found' };

    return {
      success: true,
      data: data as unknown as CohortWithCourse,
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// READ — Stats
// ============================================================================

export const fetchCohortStats = async (): Promise<CohortStats> => {
  try {
    const { data, error } = await supabase.from('cohorts').select('status');
    if (error || !data) {
      return { total: 0, open: 0, closed: 0, completed: 0 };
    }

    const rows = data as { status: CohortStatus }[];
    return {
      total: rows.length,
      open: rows.filter((r) => r.status === 'open').length,
      closed: rows.filter((r) => r.status === 'closed').length,
      completed: rows.filter((r) => r.status === 'completed').length,
    };
  } catch {
    return { total: 0, open: 0, closed: 0, completed: 0 };
  }
};

// ============================================================================
// WRITE — Create cohort
// ============================================================================

export const createCohort = async (
  input: CohortInput
): Promise<ServiceResponse<CohortWithCourse>> => {
  try {
    // If marking as next, unset other "next" cohorts for this course first
    if (input.is_next) {
      await supabase
        .from('cohorts')
        .update({ is_next: false })
        .eq('course_id', input.course_id)
        .eq('is_next', true);
    }

    const { data, error } = await supabase
      .from('cohorts')
      .insert(input)
      .select(COHORT_SELECT)
      .single();

    if (error) return { success: false, error: error.message };
    return {
      success: true,
      data: data as unknown as CohortWithCourse,
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// WRITE — Update cohort
// ============================================================================

export const updateCohort = async (
  id: string,
  input: Partial<CohortInput>
): Promise<ServiceResponse<CohortWithCourse>> => {
  try {
    // If marking as next, unset other next cohorts for this course
    if (input.is_next && input.course_id) {
      await supabase
        .from('cohorts')
        .update({ is_next: false })
        .eq('course_id', input.course_id)
        .eq('is_next', true)
        .neq('id', id);
    }

    const { data, error } = await supabase
      .from('cohorts')
      .update(input)
      .eq('id', id)
      .select(COHORT_SELECT)
      .single();

    if (error) return { success: false, error: error.message };
    return {
      success: true,
      data: data as unknown as CohortWithCourse,
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// WRITE — Set as next (atomic)
// ============================================================================

export const setAsNextCohort = async (
  id: string,
  courseId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // 1. Unset all others in this course
    const { error: unsetError } = await supabase
      .from('cohorts')
      .update({ is_next: false })
      .eq('course_id', courseId)
      .eq('is_next', true);

    if (unsetError) return { success: false, error: unsetError.message };

    // 2. Set this one
    const { error: setError } = await supabase
      .from('cohorts')
      .update({ is_next: true })
      .eq('id', id);

    if (setError) return { success: false, error: setError.message };

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// WRITE — Delete cohort
// ============================================================================
// Blocks delete if any enrollments reference this cohort (safety).
// ============================================================================

export const deleteCohort = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check for enrollments referencing this cohort
    const { count, error: countError } = await supabase
      .from('enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('cohort_id', id);

    if (countError) {
      return { success: false, error: countError.message };
    }

    if ((count ?? 0) > 0) {
      return {
        success: false,
        error: `Cannot delete — ${count} enrollment${
          count === 1 ? '' : 's'
        } reference this cohort. Archive it (set status to 'completed') instead.`,
      };
    }

    const { error } = await supabase.from('cohorts').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};