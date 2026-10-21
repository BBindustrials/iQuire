// ============================================================================
// iQuire — Enrollments Service (Phase 15.2)
// ============================================================================
// Full CRUD + bulk operations + stats for the enrollments table.
// Auto-timestamps: applied_at, started_at, completed_at, dropped_at.
// Auto-alumni trigger on enrollment_completed fires from DB.
// ============================================================================

import { supabase } from '../integrations/supabase/client';

// ============================================================================
// Types
// ============================================================================

export type EnrollmentStatus = 'applied' | 'active' | 'completed' | 'dropped';

export interface EnrollmentWithRelations {
  id: string;
  user_id: string;
  course_id: string;
  cohort_id: string | null;
  status: EnrollmentStatus;
  applied_at: string;
  started_at: string | null;
  completed_at: string | null;
  dropped_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;

  // Joined
  student: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    iq_id: string | null;
    participant_id: string | null;
    avatar_url: string | null;
    account_status: 'active' | 'suspended' | 'deleted';
  } | null;

  course: {
    id: string;
    title: string;
    slug: string;
  } | null;

  cohort: {
    id: string;
    name: string;
    start_date: string | null;
    end_date: string | null;
  } | null;
}

export interface EnrollmentInput {
  user_id: string;
  course_id: string;
  cohort_id?: string | null;
  status?: EnrollmentStatus;
  /** Only used when status = 'completed' to override the auto-timestamp */
  completed_at?: string | null;
  /** Only used when status = 'applied'/'active'/'dropped' to override the auto-timestamp */
  applied_at?: string | null;
  started_at?: string | null;
  dropped_at?: string | null;
  notes?: string | null;
}

export interface EnrollmentStats {
  total: number;
  applied: number;
  active: number;
  completed: number;
  dropped: number;
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// SELECT shape (shared)
// ============================================================================

const ENROLLMENT_SELECT = `
  *,
  student:profiles!enrollments_user_id_fkey(
    id, first_name, last_name, email, iq_id, participant_id, avatar_url, account_status
  ),
  course:courses(id, title, slug),
  cohort:cohorts(id, name, start_date, end_date)
`;

// ============================================================================
// HELPERS — Auto-timestamp logic
// ============================================================================

/**
 * Given a status and current timestamps, returns the timestamps to set.
 * Only fills a timestamp if it was previously null — preserves historical
 * data (e.g., a legacy alumnus with a manually set completed_at).
 */
export const applyStatusTimestamps = (
  status: EnrollmentStatus,
  current: {
    applied_at?: string | null;
    started_at?: string | null;
    completed_at?: string | null;
    dropped_at?: string | null;
  } = {}
): {
  applied_at?: string;
  started_at?: string;
  completed_at?: string;
  dropped_at?: string;
} => {
  const now = new Date().toISOString();
  const updates: {
    applied_at?: string;
    started_at?: string;
    completed_at?: string;
    dropped_at?: string;
  } = {};

  switch (status) {
    case 'applied':
      if (!current.applied_at) updates.applied_at = now;
      break;

    case 'active':
      if (!current.applied_at) updates.applied_at = now;
      if (!current.started_at) updates.started_at = now;
      break;

    case 'completed':
      if (!current.applied_at) updates.applied_at = now;
      if (!current.started_at) updates.started_at = now;
      if (!current.completed_at) updates.completed_at = now;
      break;

    case 'dropped':
      if (!current.dropped_at) updates.dropped_at = now;
      break;
  }

  return updates;
};

/**
 * Returns true if the enrollment is in a "terminal" state where the student
 * shouldn't appear in active course views.
 */
export const isEnrollmentComplete = (status: EnrollmentStatus): boolean =>
  status === 'completed';

export const isEnrollmentActive = (status: EnrollmentStatus): boolean =>
  status === 'active' || status === 'applied';

/**
 * Pretty label for UI.
 */
export const formatEnrollmentStatus = (status: EnrollmentStatus): string => {
  const map: Record<EnrollmentStatus, string> = {
    applied: 'Applied',
    active: 'Active',
    completed: 'Completed',
    dropped: 'Dropped',
  };
  return map[status] ?? status;
};

/**
 * Extract initials from a name — safe fallback when no avatar.
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
};

// ============================================================================
// READ — List all enrollments (admin)
// ============================================================================

export const fetchAllEnrollments = async (): Promise<
  ServiceResponse<EnrollmentWithRelations[]>
> => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select(ENROLLMENT_SELECT)
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return {
      success: true,
      data: (data as unknown as EnrollmentWithRelations[]) ?? [],
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// READ — Enrollments for a specific student
// ============================================================================

export const fetchEnrollmentsByStudent = async (
  userId: string
): Promise<ServiceResponse<EnrollmentWithRelations[]>> => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select(ENROLLMENT_SELECT)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return {
      success: true,
      data: (data as unknown as EnrollmentWithRelations[]) ?? [],
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// READ — Single enrollment
// ============================================================================

export const fetchEnrollmentById = async (
  id: string
): Promise<ServiceResponse<EnrollmentWithRelations>> => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select(ENROLLMENT_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Enrollment not found' };

    return {
      success: true,
      data: data as unknown as EnrollmentWithRelations,
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// READ — Stats
// ============================================================================

export const fetchEnrollmentStats = async (): Promise<EnrollmentStats> => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('status');

    if (error || !data) {
      return { total: 0, applied: 0, active: 0, completed: 0, dropped: 0 };
    }

    const rows = data as { status: EnrollmentStatus }[];
    return {
      total: rows.length,
      applied: rows.filter((r) => r.status === 'applied').length,
      active: rows.filter((r) => r.status === 'active').length,
      completed: rows.filter((r) => r.status === 'completed').length,
      dropped: rows.filter((r) => r.status === 'dropped').length,
    };
  } catch {
    return { total: 0, applied: 0, active: 0, completed: 0, dropped: 0 };
  }
};

// ============================================================================
// WRITE — Create enrollment
// ============================================================================

export const createEnrollment = async (
  input: EnrollmentInput
): Promise<ServiceResponse<EnrollmentWithRelations>> => {
  try {
    const status = input.status ?? 'active';

    // Auto-fill timestamps unless caller provided overrides
    const autoTimestamps = applyStatusTimestamps(status);

    const payload = {
      user_id: input.user_id,
      course_id: input.course_id,
      cohort_id: input.cohort_id ?? null,
      status,
      applied_at: input.applied_at ?? autoTimestamps.applied_at ?? null,
      started_at: input.started_at ?? autoTimestamps.started_at ?? null,
      completed_at: input.completed_at ?? autoTimestamps.completed_at ?? null,
      dropped_at: input.dropped_at ?? autoTimestamps.dropped_at ?? null,
      notes: input.notes ?? null,
    };

    const { data, error } = await supabase
      .from('enrollments')
      .insert(payload)
      .select(ENROLLMENT_SELECT)
      .single();

    if (error) return { success: false, error: error.message };
    return {
      success: true,
      data: data as unknown as EnrollmentWithRelations,
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// WRITE — Update enrollment
// ============================================================================

export const updateEnrollment = async (
  id: string,
  input: Partial<EnrollmentInput>
): Promise<ServiceResponse<EnrollmentWithRelations>> => {
  try {
    const payload: Record<string, unknown> = {};

    // If status is changing, apply appropriate timestamps
    if (input.status) {
      // Fetch current to know what's already set
      const { data: current } = await supabase
        .from('enrollments')
        .select('applied_at, started_at, completed_at, dropped_at')
        .eq('id', id)
        .maybeSingle();

      const autoTimestamps = applyStatusTimestamps(
        input.status,
        (current as {
          applied_at: string | null;
          started_at: string | null;
          completed_at: string | null;
          dropped_at: string | null;
        }) ?? {}
      );

      payload.status = input.status;
      // Only apply auto-timestamps not explicitly overridden by caller
      if (input.applied_at === undefined && autoTimestamps.applied_at) {
        payload.applied_at = autoTimestamps.applied_at;
      }
      if (input.started_at === undefined && autoTimestamps.started_at) {
        payload.started_at = autoTimestamps.started_at;
      }
      if (input.completed_at === undefined && autoTimestamps.completed_at) {
        payload.completed_at = autoTimestamps.completed_at;
      }
      if (input.dropped_at === undefined && autoTimestamps.dropped_at) {
        payload.dropped_at = autoTimestamps.dropped_at;
      }
    }

    // Explicit overrides (from caller) always win
    if (input.applied_at !== undefined) payload.applied_at = input.applied_at;
    if (input.started_at !== undefined) payload.started_at = input.started_at;
    if (input.completed_at !== undefined)
      payload.completed_at = input.completed_at;
    if (input.dropped_at !== undefined) payload.dropped_at = input.dropped_at;

    if (input.cohort_id !== undefined) payload.cohort_id = input.cohort_id;
    if (input.notes !== undefined) payload.notes = input.notes;
    if (input.course_id !== undefined) payload.course_id = input.course_id;

    const { data, error } = await supabase
      .from('enrollments')
      .update(payload)
      .eq('id', id)
      .select(ENROLLMENT_SELECT)
      .single();

    if (error) return { success: false, error: error.message };
    return {
      success: true,
      data: data as unknown as EnrollmentWithRelations,
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// WRITE — Delete enrollment
// ============================================================================

export const deleteEnrollment = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('enrollments')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// BULK — Update status for many enrollments
// ============================================================================

export const bulkUpdateEnrollmentStatus = async (
  ids: string[],
  status: EnrollmentStatus,
  options?: { completed_at?: string | null }
): Promise<{ success: boolean; error?: string; updated?: number }> => {
  if (ids.length === 0) return { success: true, updated: 0 };

  try {
    // Build the update payload — same timestamps logic as single update
    // but applied uniformly. If caller provided a specific completed_at,
    // use it for all. Otherwise let the trigger do nothing (we set now()).
    const now = new Date().toISOString();

    const payload: Record<string, unknown> = { status };

    switch (status) {
      case 'applied':
        payload.applied_at = now;
        break;
      case 'active':
        payload.applied_at = now;
        payload.started_at = now;
        break;
      case 'completed':
        payload.completed_at = options?.completed_at ?? now;
        break;
      case 'dropped':
        payload.dropped_at = now;
        break;
    }

    const { error } = await supabase
      .from('enrollments')
      .update(payload)
      .in('id', ids);

    if (error) return { success: false, error: error.message };
    return { success: true, updated: ids.length };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// BULK — Move enrollments to a different cohort
// ============================================================================

export const bulkMoveEnrollments = async (
  ids: string[],
  cohortId: string | null
): Promise<{ success: boolean; error?: string; updated?: number }> => {
  if (ids.length === 0) return { success: true, updated: 0 };

  try {
    const { error } = await supabase
      .from('enrollments')
      .update({ cohort_id: cohortId })
      .in('id', ids);

    if (error) return { success: false, error: error.message };
    return { success: true, updated: ids.length };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// BULK — Delete many enrollments
// ============================================================================

export const bulkDeleteEnrollments = async (
  ids: string[]
): Promise<{ success: boolean; error?: string; deleted?: number }> => {
  if (ids.length === 0) return { success: true, deleted: 0 };

  try {
    const { error } = await supabase
      .from('enrollments')
      .delete()
      .in('id', ids);

    if (error) return { success: false, error: error.message };
    return { success: true, deleted: ids.length };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// VALIDATION — Check for duplicate enrollment
// ============================================================================

export const checkDuplicateEnrollment = async (
  userId: string,
  courseId: string,
  cohortId: string | null
): Promise<{ exists: boolean; enrollmentId?: string; status?: EnrollmentStatus }> => {
  try {
    let query = supabase
      .from('enrollments')
      .select('id, status')
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (cohortId) {
      query = query.eq('cohort_id', cohortId);
    } else {
      query = query.is('cohort_id', null);
    }

    const { data } = await query.maybeSingle();

    if (!data) return { exists: false };

    return {
      exists: true,
      enrollmentId: (data as { id: string }).id,
      status: (data as { status: EnrollmentStatus }).status,
    };
  } catch {
    return { exists: false };
  }
};


// ============================================================================
// BULK — Create many enrollments at once (Phase 15.5)
// ============================================================================
// Skips duplicates automatically. Returns counts for UI feedback.
// ============================================================================

export interface BulkEnrollResult {
  enrolled: number;
  skipped: number;
  errors: number;
  createdIds: string[];
}

export const bulkCreateEnrollments = async (
  userIds: string[],
  courseId: string,
  cohortId: string | null,
  status: EnrollmentStatus = 'active',
  options?: { completed_at?: string | null; notes?: string | null }
): Promise<{ success: boolean; data?: BulkEnrollResult; error?: string }> => {
  if (userIds.length === 0) {
    return {
      success: true,
      data: { enrolled: 0, skipped: 0, errors: 0, createdIds: [] },
    };
  }

  try {
    // 1. Find existing enrollments for this course + cohort
    let existingQuery = supabase
      .from('enrollments')
      .select('user_id')
      .eq('course_id', courseId)
      .in('user_id', userIds);

    if (cohortId) {
      existingQuery = existingQuery.eq('cohort_id', cohortId);
    } else {
      existingQuery = existingQuery.is('cohort_id', null);
    }

    const { data: existing, error: existingError } = await existingQuery;

    if (existingError) {
      return { success: false, error: existingError.message };
    }

    const alreadyEnrolled = new Set(
      (existing ?? []).map((e: { user_id: string }) => e.user_id)
    );

    // 2. Filter to students not already enrolled
    const toEnroll = userIds.filter((id) => !alreadyEnrolled.has(id));
    const skipped = userIds.length - toEnroll.length;

    if (toEnroll.length === 0) {
      return {
        success: true,
        data: {
          enrolled: 0,
          skipped,
          errors: 0,
          createdIds: [],
        },
      };
    }

    // 3. Build payload using the same timestamp logic as single create
    const autoTimestamps = applyStatusTimestamps(status);
    const completedAt =
      options?.completed_at ??
      (status === 'completed' ? autoTimestamps.completed_at : null);

    const rows = toEnroll.map((userId) => ({
      user_id: userId,
      course_id: courseId,
      cohort_id: cohortId,
      status,
      applied_at: autoTimestamps.applied_at ?? new Date().toISOString(),
      started_at: autoTimestamps.started_at ?? null,
      completed_at: completedAt ?? null,
      dropped_at: autoTimestamps.dropped_at ?? null,
      notes: options?.notes ?? null,
    }));

    // 4. Insert in one batch
    const { data: inserted, error: insertError } = await supabase
      .from('enrollments')
      .insert(rows)
      .select('id');

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    const createdIds = (inserted ?? []).map((r: { id: string }) => r.id);

    return {
      success: true,
      data: {
        enrolled: createdIds.length,
        skipped,
        errors: 0,
        createdIds,
      },
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};