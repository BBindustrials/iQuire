// ============================================================================
// iQuire — Jobs Service (Phase 12D.2)
// ============================================================================

import { supabase } from '../integrations/supabase/client';
import type {
  Job,
  JobWithCourse,
  JobInput,
  JobFilters,
  JobStatus,
} from '../types/content.types';

// ============================================================================
// Types
// ============================================================================

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// PUBLIC — Fetch published jobs with filters
// ============================================================================

export const fetchPublishedJobs = async (
  filters?: JobFilters
): Promise<ServiceResponse<JobWithCourse[]>> => {
  try {
    let query = supabase
      .from('jobs')
      .select(`
        *,
        course:courses(id, title, slug)
      `)
      .eq('status', 'published')
      .order('featured', { ascending: false })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.workMode && filters.workMode !== 'all') {
      query = query.eq('work_mode', filters.workMode);
    }
    if (filters?.opportunityType && filters.opportunityType !== 'all') {
      query = query.eq('opportunity_type', filters.opportunityType);
    }
    if (filters?.experienceLevel && filters.experienceLevel !== 'all') {
      query = query.eq('experience_level', filters.experienceLevel);
    }
    if (filters?.featuredOnly) {
      query = query.eq('featured', true);
    }

    const { data, error } = await query;

    if (error) return { success: false, error: error.message };

    let jobs = (data as unknown as JobWithCourse[]) ?? [];

    // Client-side search filter (Supabase doesn't support multi-column ILIKE cheaply)
    if (filters?.search?.trim()) {
      const q = filters.search.toLowerCase().trim();
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location?.toLowerCase().includes(q) ||
          j.required_skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    return { success: true, data: jobs };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// PUBLIC — Fetch one job by slug
// ============================================================================

export const fetchJobBySlug = async (
  slug: string
): Promise<ServiceResponse<JobWithCourse>> => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        course:courses(id, title, slug)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Job not found' };

    return { success: true, data: data as unknown as JobWithCourse };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — List all
// ============================================================================

export const fetchAllJobs = async (): Promise<ServiceResponse<JobWithCourse[]>> => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        course:courses(id, title, slug)
      `)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as unknown as JobWithCourse[]) ?? [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Get one by ID
// ============================================================================

export const fetchJobById = async (
  id: string
): Promise<ServiceResponse<JobWithCourse>> => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        course:courses(id, title, slug)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Job not found' };

    return { success: true, data: data as unknown as JobWithCourse };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Create
// ============================================================================

export const createJob = async (
  input: JobInput
): Promise<ServiceResponse<Job>> => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .insert(input)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Job };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Update
// ============================================================================

export const updateJob = async (
  id: string,
  input: Partial<JobInput>
): Promise<ServiceResponse<Job>> => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Job };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Delete
// ============================================================================

export const deleteJob = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN — Toggle status (quick action)
// ============================================================================

export const toggleJobStatus = async (
  id: string,
  status: JobStatus
): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.from('jobs').update({ status }).eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
};

// ============================================================================
// ADMIN — Toggle featured (quick action)
// ============================================================================

export const toggleJobFeatured = async (
  id: string,
  featured: boolean
): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.from('jobs').update({ featured }).eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
};

// ============================================================================
// HELPERS
// ============================================================================

/** Format a deadline as "Closes Jan 15, 2027" or "Closes in 12 days" */
export const formatJobDeadline = (deadline: string | null): string => {
  if (!deadline) return '';
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return '';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Closed';
  if (diffDays === 0) return 'Closes today';
  if (diffDays === 1) return 'Closes tomorrow';
  if (diffDays <= 14) return `Closes in ${diffDays} days`;

  return `Closes ${d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
};

/** Check if a deadline is in the past */
export const isJobDeadlinePassed = (deadline: string | null): boolean => {
  if (!deadline) return false;
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
};