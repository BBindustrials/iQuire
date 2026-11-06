/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================================
// iQuire — Courses Service (Phase 17.16 — Fee Fix)
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

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

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

const coursesTable = (): any => supabase.from('courses');
const cohortsTable = (): any => supabase.from('cohorts');
const previousCohortsTable = (): any => supabase.from('previous_cohorts');

const DEFAULT_PRICING = { fee: 'TBA', includes: [] as string[] };
const DEFAULT_FINAL_CTA = {
  headline: 'Ready to get started?',
  subheadline: 'Join the next cohort.',
};

// ============================================================================
// normalizeCourse — preserves the full pricing object
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
  featured_on_homepage: raw.featured_on_homepage ?? false,
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
  // Preserve pricing as-is, with safe defaults
  pricing: {
    fee: raw.pricing?.fee ?? DEFAULT_PRICING.fee,
    includes: raw.pricing?.includes ?? DEFAULT_PRICING.includes,
    paymentOptions: raw.pricing?.paymentOptions ?? undefined,
    financialSupport: raw.pricing?.financialSupport ?? undefined,
  },
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

export const fetchPublishedCourses = async (): Promise<ServiceResponse<Course[]>> => {
  try {
    const { data, error } = await coursesTable()
      .select('*')
      .eq('status', 'published')
      .order('display_order', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []).map(normalizeCourse) };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// PUBLIC READ — with next cohort fee
// ============================================================================

export const fetchPublishedCoursesWithFees = async (): Promise<
  ServiceResponse<Array<Course & { next_cohort_fee: string | null }>>
> => {
  try {
    const { data: courses, error: coursesError } = await coursesTable()
      .select('*')
      .eq('status', 'published')
      .order('display_order', { ascending: true });

    if (coursesError) return { success: false, error: coursesError.message };

    // Fetch all "next" cohort fees in a single query
    const { data: cohorts, error: cohortsError } = await cohortsTable()
      .select('course_id, fee')
      .eq('is_next', true);

    if (cohortsError) return { success: false, error: cohortsError.message };

    const feeByCourse: Record<string, string | null> = {};
    (cohorts ?? []).forEach((c: any) => {
      feeByCourse[c.course_id] = c.fee ?? null;
    });

    const result = (courses ?? []).map((row: any) => ({
      ...normalizeCourse(row),
      next_cohort_fee: feeByCourse[row.id] ?? null,
    }));

    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const fetchCourseBySlug = async (
  slug: string
): Promise<ServiceResponse<CourseWithRelations>> => {
  try {
    const { data: courseRow, error: courseError } = await coursesTable()
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (courseError) return { success: false, error: courseError.message };
    if (!courseRow) return { success: false, error: 'Course not found' };

    const course = normalizeCourse(courseRow);

    const { data: cohortRow } = await cohortsTable()
      .select('*')
      .eq('course_id', course.id)
      .eq('is_next', true)
      .maybeSingle();

    const { data: previousRows } = await previousCohortsTable()
      .select('*')
      .eq('course_id', course.id)
      .order('display_order', { ascending: true });

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
// FEATURED COURSES (homepage)
// ============================================================================

export const fetchFeaturedCourses = async (): Promise<
  ServiceResponse<Array<Course & { next_cohort: { schedule: string | null; start_date: string | null; fee: string | null } | null }>>
> => {
  try {
    const { data: courses, error: coursesError } = await coursesTable()
      .select('*')
      .eq('status', 'published')
      .eq('featured_on_homepage', true)
      .order('display_order', { ascending: true });
      // ← removed .limit(4) so all featured courses appear

    if (coursesError) return { success: false, error: coursesError.message };

    const courseIds = (courses ?? []).map((c: any) => c.id);

    const { data: cohorts, error: cohortsError } = await cohortsTable()
      .select('course_id, schedule, start_date, fee')
      .in('course_id', courseIds)
      .eq('is_next', true);

    if (cohortsError) return { success: false, error: cohortsError.message };

    const cohortByCourse: Record<string, any> = {};
    (cohorts ?? []).forEach((c: any) => {
      cohortByCourse[c.course_id] = {
        schedule: c.schedule,
        start_date: c.start_date,
        fee: c.fee,
      };
    });

    const result = (courses ?? []).map((row: any) => ({
      ...normalizeCourse(row),
      next_cohort: cohortByCourse[row.id] ?? null,
    }));

    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN READ
// ============================================================================

export const fetchAllCourses = async (): Promise<ServiceResponse<Course[]>> => {
  try {
    const { data, error } = await coursesTable()
      .select('*')
      .order('display_order', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []).map(normalizeCourse) };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ADMIN READ — with next cohort fee
// ============================================================================

export const fetchAllCoursesWithFees = async (): Promise<
  ServiceResponse<Array<Course & { next_cohort_fee: string | null }>>
> => {
  try {
    const { data: courses, error: coursesError } = await coursesTable()
      .select('*')
      .order('display_order', { ascending: true });

    if (coursesError) return { success: false, error: coursesError.message };

    // Fetch all "next" cohorts in one query
    const { data: cohorts, error: cohortsError } = await cohortsTable()
      .select('course_id, fee')
      .eq('is_next', true);

    if (cohortsError) return { success: false, error: cohortsError.message };

    const feeByCourse: Record<string, string | null> = {};
    (cohorts ?? []).forEach((c: any) => {
      feeByCourse[c.course_id] = c.fee ?? null;
    });

    const result = (courses ?? []).map((row: any) => ({
      ...normalizeCourse(row),
      next_cohort_fee: feeByCourse[row.id] ?? null,
    }));

    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

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
    console.log('[updateCourse] ID:', id);
    console.log('[updateCourse] Input:', input);

    // Build safe payload
    const payload: any = { ...input };

    // If pricing is being updated, merge with existing to prevent JSONB data loss
    if (input.pricing) {
      const { data: existing, error: fetchErr } = await coursesTable()
        .select('pricing')
        .eq('id', id)
        .single();

      if (!fetchErr && existing?.pricing) {
        payload.pricing = {
          ...existing.pricing,
          ...input.pricing,
        };
        console.log('[updateCourse] Merged pricing:', payload.pricing);
      }
    }

    const { data, error } = await coursesTable()
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[updateCourse] Supabase error:', error);
      return { success: false, error: error.message };
    }

    console.log('[updateCourse] Success. New pricing:', data?.pricing);
    return { success: true, data: normalizeCourse(data) };
  } catch (err) {
    console.error('[updateCourse] Caught error:', err);
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
// COHORT CRUD (unchanged — keeping your existing logic)
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

export const isRegistrationOpen = (cohort: Cohort | null | undefined): boolean => {
  if (!cohort) return false;
  return cohort.status === 'open' && !!cohort.registration_url;
};

export const getRegistrationUrl = (cohort: Cohort | null | undefined): string | null => {
  if (!isRegistrationOpen(cohort)) return null;
  return cohort!.registration_url;
};

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