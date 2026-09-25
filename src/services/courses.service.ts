/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================================
// iQuire — Courses Service (Phase 10D.3)
// ============================================================================
// All read/write operations for courses, cohorts, previous cohorts.
// ============================================================================

import { supabase } from '../integrations/supabase/client';
import type {
  Course,
  CourseWithRelations,
  Cohort,
  PreviousCohort,
  CourseInput,
  CohortInput,
  PreviousCohortInput,
} from '../types/courses.types';

// ============================================================================
// Response type
// ============================================================================

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Re-export all public types used by consumers
export type {
  Course,
  CourseWithRelations,
  Cohort,
  PreviousCohort,
  CourseInput,
  CohortInput,
  PreviousCohortInput,
  CourseAccent,
  CourseStatus,
  CohortStatus,
} from '../types/courses.types';


// ============================================================================
// Typed table accessors
// ----------------------------------------------------------------------------
// The Supabase client is not generated with a `Database` generic, so
// `.from('cohorts')` / `.from('previous_cohorts')` / `.from('courses')` infer
// narrow row shapes that are missing columns (e.g. `is_next`), and reject
// `.insert()` / `.update()` payloads as excess properties. These helpers
// centralize a single cast per table so the rest of the file stays clean.
//
// Replace with generated Supabase types for full type safety:
//   npx supabase gen types typescript --project-id <id> --schema public \
//     > src/integrations/supabase/types.ts
//   then createClient<Database>(...)
// ============================================================================

const coursesTable = (): any => supabase.from('courses');
const cohortsTable = (): any => supabase.from('cohorts');
const previousCohortsTable = (): any => supabase.from('previous_cohorts');

// ============================================================================
// DEFAULTS — in case DB returns empty JSONB
// ============================================================================

const DEFAULT_PRICING = {
  fee: 'TBA',
  includes: [],
};

const DEFAULT_FINAL_CTA = {
  headline: 'Ready to get started?',
  subheadline: 'Join the next cohort.',
};

// ============================================================================
// Normalize a raw course row into a typed Course
// ============================================================================

const normalizeCourse = (raw: any): Course => ({
  id: raw.id,
  slug: raw.slug,
  title: raw.title,
  tagline: raw.tagline ?? null,
  description: raw.description ?? null,
  duration: raw.duration ?? null,
  format: raw.format ?? null,
  level: raw.level ?? null,
  accent: raw.accent ?? null,
  emoji: raw.emoji ?? null,
  thumbnail_url: raw.thumbnail_url ?? null,
  hero_image_url: raw.hero_image_url ?? null,
  certificate_included: raw.certificate_included ?? true,
  status: raw.status ?? 'draft',
  display_order: raw.display_order ?? 0,
  why_this_program: raw.why_this_program ?? null,
  challenges: raw.challenges ?? [],
  what_you_learn: raw.what_you_learn ?? [],
  week_journey: raw.week_journey ?? [],
  experience: raw.experience ?? [],
  outcomes: raw.outcomes ?? [],
  who_its_for: raw.who_its_for ?? [],
  prerequisites: raw.prerequisites ?? null,
  skills_professional: raw.skills_professional ?? [],
  skills_digital: raw.skills_digital ?? [],
  skills_career: raw.skills_career ?? [],
  curriculum: raw.curriculum ?? [],
  whats_included: raw.whats_included ?? [],
  pricing:
    raw.pricing && Object.keys(raw.pricing).length > 0
      ? raw.pricing
      : DEFAULT_PRICING,
  faqs: raw.faqs ?? [],
  final_cta:
    raw.final_cta && Object.keys(raw.final_cta).length > 0
      ? raw.final_cta
      : DEFAULT_FINAL_CTA,
  created_at: raw.created_at,
  updated_at: raw.updated_at,
});

// ============================================================================
// PUBLIC READ
// ============================================================================

/**
 * Fetch all published courses (for /courses landing page).
 */
export const fetchPublishedCourses = async (): Promise<
  ServiceResponse<Course[]>
> => {
  try {
    const { data, error } = await coursesTable()
      .select('*')
      .eq('status', 'published')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };

    const courses = (data ?? []).map(normalizeCourse);
    return { success: true, data: courses };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

/**
 * Fetch one published course + next cohort + previous cohorts (for /courses/:slug).
 */
export const fetchCourseBySlug = async (
  slug: string
): Promise<ServiceResponse<CourseWithRelations>> => {
  try {
    // 1. Course
    const { data: courseRow, error: courseError } = await coursesTable()
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (courseError) return { success: false, error: courseError.message };
    if (!courseRow) return { success: false, error: 'Course not found' };

    const course = normalizeCourse(courseRow);

    // 2. Next cohort
    const { data: cohortRow } = await cohortsTable()
      .select('*')
      .eq('course_id', course.id)
      .eq('is_next', true)
      .maybeSingle();

    // 3. Previous cohorts
    const { data: previousRows } = await previousCohortsTable()
      .select('*')
      .eq('course_id', course.id)
      .order('display_order', { ascending: true });

    const result: CourseWithRelations = {
      ...course,
      next_cohort: (cohortRow as Cohort) ?? null,
      previous_cohorts: (previousRows as PreviousCohort[]) ?? [],
    };

    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

/**
 * Fetch a course ID by slug (useful for admin + enrollments).
 */
export const fetchCourseIdBySlug = async (
  slug: string
): Promise<ServiceResponse<string>> => {
  try {
    const { data, error } = await coursesTable()
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Course not found' };

    return { success: true, data: data.id };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN READ
// ============================================================================

/**
 * Fetch ALL courses (including drafts) for admin.
 */
export const fetchAllCourses = async (): Promise<ServiceResponse<Course[]>> => {
  try {
    const { data, error } = await coursesTable()
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };

    const courses = (data ?? []).map(normalizeCourse);
    return { success: true, data: courses };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

/**
 * Fetch one course by ID (admin edit).
 */
export const fetchCourseById = async (
  id: string
): Promise<ServiceResponse<CourseWithRelations>> => {
  try {
    const { data: courseRow, error: courseError } = await coursesTable()
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (courseError) return { success: false, error: courseError.message };
    if (!courseRow) return { success: false, error: 'Course not found' };

    const course = normalizeCourse(courseRow);

    const [{ data: cohortRow }, { data: previousRows }] = await Promise.all([
      cohortsTable()
        .select('*')
        .eq('course_id', id)
        .eq('is_next', true)
        .maybeSingle(),
      previousCohortsTable()
        .select('*')
        .eq('course_id', id)
        .order('display_order', { ascending: true }),
    ]);

    return {
      success: true,
      data: {
        ...course,
        next_cohort: (cohortRow as Cohort) ?? null,
        previous_cohorts: (previousRows as PreviousCohort[]) ?? [],
      },
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// COURSE CRUD
// ============================================================================

export const createCourse = async (
  input: CourseInput
): Promise<ServiceResponse<Course>> => {
  try {
    const { data, error } = await coursesTable()
      .insert(input as any)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: normalizeCourse(data) };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const updateCourse = async (
  id: string,
  input: Partial<CourseInput>
): Promise<ServiceResponse<Course>> => {
  try {
    const { data, error } = await coursesTable()
      .update(input as any)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: normalizeCourse(data) };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const deleteCourse = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await coursesTable().delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// COHORT CRUD
// ============================================================================

export const fetchNextCohort = async (
  courseId: string
): Promise<ServiceResponse<Cohort | null>> => {
  try {
    const { data, error } = await cohortsTable()
      .select('*')
      .eq('course_id', courseId)
      .eq('is_next', true)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as Cohort) ?? null };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const fetchCohortsByCourse = async (
  courseId: string
): Promise<ServiceResponse<Cohort[]>> => {
  try {
    const { data, error } = await cohortsTable()
      .select('*')
      .eq('course_id', courseId)
      .order('start_date', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as Cohort[]) ?? [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const createCohort = async (
  input: CohortInput
): Promise<ServiceResponse<Cohort>> => {
  try {
    // If this is the "next" cohort, unset other next cohorts for this course
    if (input.is_next) {
      await cohortsTable()
        .update({ is_next: false } as any)
        .eq('course_id', input.course_id)
        .eq('is_next', true);
    }

    const { data, error } = await cohortsTable()
      .insert(input as any)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Cohort };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const updateCohort = async (
  id: string,
  input: Partial<CohortInput>
): Promise<ServiceResponse<Cohort>> => {
  try {
    // If marking as next, unset others
    if (input.is_next && input.course_id) {
      await cohortsTable()
        .update({ is_next: false } as any)
        .eq('course_id', input.course_id)
        .eq('is_next', true)
        .neq('id', id);
    }

    const { data, error } = await cohortsTable()
      .update(input as any)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Cohort };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const deleteCohort = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await cohortsTable().delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// PREVIOUS COHORT CRUD
// ============================================================================

export const fetchPreviousCohorts = async (
  courseId: string
): Promise<ServiceResponse<PreviousCohort[]>> => {
  try {
    const { data, error } = await previousCohortsTable()
      .select('*')
      .eq('course_id', courseId)
      .order('display_order', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data as PreviousCohort[]) ?? [] };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const createPreviousCohort = async (
  input: PreviousCohortInput
): Promise<ServiceResponse<PreviousCohort>> => {
  try {
    const { data, error } = await previousCohortsTable()
      .insert(input as any)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as PreviousCohort };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const updatePreviousCohort = async (
  id: string,
  input: Partial<PreviousCohortInput>
): Promise<ServiceResponse<PreviousCohort>> => {
  try {
    const { data, error } = await previousCohortsTable()
      .update(input as any)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as PreviousCohort };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const deletePreviousCohort = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await previousCohortsTable().delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Format a date string (ISO) into human-readable form.
 */
export const formatCourseDate = (iso: string | null): string => {
  if (!iso || iso === 'TBA') return 'To be announced';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Short date formatter (e.g., "May 12, 2026").
 */
export const formatShortDate = (iso: string | null): string => {
  if (!iso || iso === 'TBA') return 'TBA';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};