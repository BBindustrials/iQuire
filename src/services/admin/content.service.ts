/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================================
// iQuire — Admin Content Service (Phase 17.11 - Fixed)
// ============================================================================

import { supabase } from '../../integrations/supabase/client';

// Proper types for our rows
export interface CohortSession {
  id?: string;
  cohort_id: string;
  course_id: string;
  title: string;
  description?: string | null;
  session_date: string;
  duration_minutes?: number;
  meeting_url?: string | null;
  meeting_platform?: string | null;
  recording_url?: string | null;
  status?: 'scheduled' | 'live' | 'completed' | 'cancelled';
  display_order?: number;
  created_by?: string | null;
}

export interface Lesson {
  id?: string;
  cohort_id: string;
  course_id: string;
  title: string;
  description?: string | null;
  content_type: string;
  video_url?: string | null;
  pdf_url?: string | null;
  body?: string | null;
  external_links?: unknown;
  module_number?: number | null;
  display_order?: number;
  published?: boolean;
  created_by?: string | null;
}

export interface Material {
  id?: string;
  course_id: string;
  title: string;
  description?: string | null;
  material_type: string;
  file_url?: string | null;
  external_url?: string | null;
  display_order?: number;
  published?: boolean;
}

export interface Assignment {
  id?: string;
  cohort_id: string;
  course_id: string;
  title: string;
  description?: string | null;
  instructions?: string | null;
  submission_type: string;
  due_date?: string | null;
  max_score?: number | null;
  published?: boolean;
  display_order?: number;
  created_by?: string | null;
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// COHORT SESSIONS
// ============================================================================

export const fetchSessionsForCohort = async (cohortId: string): Promise<ServiceResponse<CohortSession[]>> => {
  try {
    const { data, error } = await supabase
      .from('cohort_sessions')
      .select('*')
      .eq('cohort_id', cohortId)
      .order('session_date', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as CohortSession[]) ?? [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const upsertSession = async (session: CohortSession): Promise<ServiceResponse<CohortSession>> => {
  try {
    const { data, error } = await supabase
      .from('cohort_sessions')
      .upsert(session)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as CohortSession };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const deleteSession = async (id: string) => {
  try {
    const { error } = await supabase.from('cohort_sessions').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// LESSONS
// ============================================================================

export const fetchLessonsForCohort = async (cohortId: string): Promise<ServiceResponse<Lesson[]>> => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('cohort_id', cohortId)
      .order('display_order', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as Lesson[]) ?? [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const upsertLesson = async (lesson: Lesson): Promise<ServiceResponse<Lesson>> => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .upsert(lesson as any)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Lesson };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const deleteLesson = async (id: string) => {
  try {
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// MATERIALS
// ============================================================================

export const fetchMaterialsForCourse = async (courseId: string): Promise<ServiceResponse<Material[]>> => {
  try {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('course_id', courseId)
      .order('display_order', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as Material[]) ?? [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const upsertMaterial = async (material: Material): Promise<ServiceResponse<Material>> => {
  try {
    const { data, error } = await supabase
      .from('materials')
      .upsert(material as any)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Material };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const deleteMaterial = async (id: string) => {
  try {
    const { error } = await supabase.from('materials').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ASSIGNMENTS
// ============================================================================

export const fetchAssignmentsForCohort = async (cohortId: string): Promise<ServiceResponse<Assignment[]>> => {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('cohort_id', cohortId)
      .order('due_date', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as Assignment[]) ?? [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const upsertAssignment = async (assignment: Assignment): Promise<ServiceResponse<Assignment>> => {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .upsert(assignment as any)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Assignment };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const deleteAssignment = async (id: string) => {
  try {
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};