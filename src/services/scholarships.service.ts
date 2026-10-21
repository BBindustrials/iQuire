// ============================================================================
// iQuire — Scholarships Service (Phase 12D.2)
// ============================================================================

import { supabase } from '../integrations/supabase/client';
import type {
  Scholarship,
  ScholarshipWithCourse,
  ScholarshipInput,
} from '../types/content.types';

// Re-export types for consumers of this service
export type { Scholarship, ScholarshipWithCourse, ScholarshipInput };

// ============================================================================
// Types
// ============================================================================

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// PUBLIC — Fetch published scholarships
// ============================================================================

export const fetchPublishedScholarships = async (): Promise<
  ServiceResponse<ScholarshipWithCourse[]>
> => {
  try {
    const { data, error } = await supabase
      .from('scholarships')
      .select(`
        *,
        course:courses(id, title, slug)
      `)
      .eq('status', 'published')
      .order('display_order', { ascending: true })
      .order('deadline', { ascending: true, nullsFirst: false });

    if (error) return { success: false, error: error.message };
    return {
      success: true,
      data: (data as unknown as ScholarshipWithCourse[]) ?? [],
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// PUBLIC — Fetch one scholarship by slug
// ============================================================================

export const fetchScholarshipBySlug = async (
  slug: string
): Promise<ServiceResponse<ScholarshipWithCourse>> => {
  try {
    const { data, error } = await supabase
      .from('scholarships')
      .select(`
        *,
        course:courses(id, title, slug)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Scholarship not found' };

    return {
      success: true,
      data: data as unknown as ScholarshipWithCourse,
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — List all scholarships
// ============================================================================

export const fetchAllScholarships = async (): Promise<
  ServiceResponse<ScholarshipWithCourse[]>
> => {
  try {
    const { data, error } = await supabase
      .from('scholarships')
      .select(`
        *,
        course:courses(id, title, slug)
      `)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return {
      success: true,
      data: (data as unknown as ScholarshipWithCourse[]) ?? [],
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Get one by ID
// ============================================================================

export const fetchScholarshipById = async (
  id: string
): Promise<ServiceResponse<ScholarshipWithCourse>> => {
  try {
    const { data, error } = await supabase
      .from('scholarships')
      .select(`
        *,
        course:courses(id, title, slug)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Scholarship not found' };

    return {
      success: true,
      data: data as unknown as ScholarshipWithCourse,
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Create
// ============================================================================

export const createScholarship = async (
  input: ScholarshipInput
): Promise<ServiceResponse<Scholarship>> => {
  try {
    const { data, error } = await supabase
      .from('scholarships')
      .insert(input)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Scholarship };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Update
// ============================================================================

export const updateScholarship = async (
  id: string,
  input: Partial<ScholarshipInput>
): Promise<ServiceResponse<Scholarship>> => {
  try {
    const { data, error } = await supabase
      .from('scholarships')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Scholarship };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Delete
// ============================================================================

export const deleteScholarship = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('scholarships').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};