/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================================
// iQuire — Student Service (Phase 17.1 + Hero Image Fix + Fail-Safe Queries)
// ============================================================================

import { supabase } from '../integrations/supabase/client';

// ============================================================================
// Types
// ============================================================================

export type EnrollmentStatus = 'applied' | 'active' | 'completed' | 'dropped';
export type SessionStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';
export type AssignmentSubmissionStatus =
  | 'submitted'
  | 'graded'
  | 'returned'
  | 'resubmission-requested';
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface MyEnrollment {
  id: string;
  course_id: string;
  cohort_id: string | null;
  status: EnrollmentStatus;
  applied_at: string;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  course: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    thumbnail_url: string | null;
    hero_image_url: string | null;
    duration: string | null;
    format: string | null;
    level: string | null;
    emoji: string | null;
    accent: string | null;
  } | null;
  cohort: {
    id: string;
    name: string;
    start_date: string | null;
    end_date: string | null;
    schedule: string | null;
    format: string | null;
    cohort_token: string | null;
  } | null;
}

export interface MyCourse {
  course_id: string;
  enrollment_id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  hero_image_url: string | null;
  emoji: string | null;
  accent: string | null;
  duration: string | null;
  format: string | null;
  level: string | null;
  cohort_id: string | null;
  cohort_name: string | null;
  cohort_start: string | null;
  cohort_end: string | null;
  status: EnrollmentStatus;
  total_lessons: number;
  total_sessions: number;
  upcoming_sessions: number;
  pending_assignments: number;
  progress_percent: number;
}

export interface MySession {
  id: string;
  cohort_id: string;
  course_id: string;
  title: string;
  description: string | null;
  session_date: string;
  duration_minutes: number;
  meeting_url: string | null;
  meeting_platform: string | null;
  recording_url: string | null;
  status: SessionStatus;
  course_title: string | null;
  cohort_name: string | null;
}

export interface MyLesson {
  id: string;
  cohort_id: string;
  course_id: string;
  title: string;
  description: string | null;
  content_type: 'video' | 'pdf' | 'text' | 'link' | 'mixed';
  video_url: string | null;
  pdf_url: string | null;
  body: string | null;
  external_links: { title: string; url: string }[];
  module_number: number | null;
  display_order: number;
  course_title: string | null;
}

export interface MyMaterial {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  material_type: 'pdf' | 'doc' | 'link' | 'video' | 'other';
  file_url: string | null;
  external_url: string | null;
  display_order: number;
}

export interface MyAssignment {
  id: string;
  cohort_id: string;
  course_id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  submission_type: 'link' | 'text' | 'file';
  due_date: string | null;
  max_score: number | null;
  course_title: string | null;
  cohort_name: string | null;
  submission: MySubmission | null;
  is_overdue: boolean;
  days_until_due: number | null;
}

export interface MySubmission {
  id: string;
  assignment_id: string;
  user_id: string;
  submission_url: string | null;
  submission_text: string | null;
  file_url: string | null;
  status: AssignmentSubmissionStatus;
  score: number | null;
  feedback: string | null;
  graded_at: string | null;
  submitted_at: string;
}

export interface MyAnnouncement {
  id: string;
  title: string;
  body: string;
  priority: AnnouncementPriority;
  course_id: string | null;
  cohort_id: string | null;
  auto_generated: boolean;
  auto_type: string | null;
  published_at: string;
  expires_at: string | null;
}

export interface MyCertificate {
  enrollment_id: string;
  course_id: string;
  course_title: string;
  course_slug: string;
  cohort_name: string | null;
  completed_at: string;
  certificate_number: string;
  student_name: string;
}

export interface StudentStats {
  active_courses: number;
  completed_courses: number;
  total_lessons_available: number;
  upcoming_sessions: number;
  pending_assignments: number;
  unread_announcements: number;
  certificates_earned: number;
  next_session: MySession | null;
  next_assignment: MyAssignment | null;
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
};

export const formatSessionDate = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatSessionTime = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const formatRelativeDate = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  return formatSessionDate(iso);
};

export const formatEnrollmentStatus = (status: EnrollmentStatus): string => {
  const map: Record<EnrollmentStatus, string> = {
    applied: 'Applied',
    active: 'Active',
    completed: 'Completed',
    dropped: 'Dropped',
  };
  return map[status] ?? status;
};

// ============================================================================
// ENROLLMENTS
// ============================================================================

export const fetchMyEnrollments = async (): Promise<
  ServiceResponse<MyEnrollment[]>
> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('enrollments')
      .select(
        `
        id, course_id, cohort_id, status,
        applied_at, started_at, completed_at, notes,
        course:courses(
          id, title, slug, description, thumbnail_url, hero_image_url,
          duration, format, level, emoji, accent
        ),
        cohort:cohorts(
          id, name, start_date, end_date, schedule, format, cohort_token
        )
      `
      )
      .eq('user_id', userId)
      .in('status', ['active', 'completed'])
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };

    return {
      success: true,
      data: (data as unknown as MyEnrollment[]) ?? [],
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// COURSES — enriched cards
// ============================================================================

export const fetchMyCourses = async (): Promise<
  ServiceResponse<MyCourse[]>
> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    const enrollmentsRes = await fetchMyEnrollments();
    if (!enrollmentsRes.success || !enrollmentsRes.data) {
      return {
        success: false,
        error: enrollmentsRes.error ?? 'Failed to load enrollments',
      };
    }

    const enrollments = enrollmentsRes.data.filter(
      (e) => e.status === 'active' || e.status === 'completed'
    );

    if (enrollments.length === 0) return { success: true, data: [] };

    const cohortIds = enrollments
      .map((e) => e.cohort_id)
      .filter((id): id is string => !!id);

    const [lessonsRes, sessionsRes, assignmentsRes, submissionsRes] =
      await Promise.all([
        cohortIds.length > 0
          ? supabase
              .from('lessons')
              .select('cohort_id')
              .in('cohort_id', cohortIds)
              .eq('published', true)
          : Promise.resolve({ data: [], error: null }),
        cohortIds.length > 0
          ? supabase
              .from('cohort_sessions')
              .select('id, cohort_id, session_date, status')
              .in('cohort_id', cohortIds)
          : Promise.resolve({ data: [], error: null }),
        cohortIds.length > 0
          ? supabase
              .from('assignments')
              .select('id, cohort_id, due_date')
              .in('cohort_id', cohortIds)
              .eq('published', true)
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from('assignment_submissions')
          .select('assignment_id')
          .eq('user_id', userId),
      ]);

    const lessonsByCohort: Record<string, number> = {};
    (lessonsRes.data ?? []).forEach((l: { cohort_id: string }) => {
      lessonsByCohort[l.cohort_id] = (lessonsByCohort[l.cohort_id] ?? 0) + 1;
    });

    const sessionsByCohort: Record<string, number> = {};
    const upcomingByCohort: Record<string, number> = {};
    const now = new Date();
    (sessionsRes.data ?? []).forEach(
      (s: { cohort_id: string; session_date: string; status: string }) => {
        sessionsByCohort[s.cohort_id] =
          (sessionsByCohort[s.cohort_id] ?? 0) + 1;
        if (s.status === 'scheduled' && new Date(s.session_date) > now) {
          upcomingByCohort[s.cohort_id] =
            (upcomingByCohort[s.cohort_id] ?? 0) + 1;
        }
      }
    );

    const submittedIds = new Set(
      (submissionsRes.data ?? []).map(
        (s: { assignment_id: string }) => s.assignment_id
      )
    );

    const assignmentsByCohort: Record<string, number> = {};
    const pendingByCohort: Record<string, number> = {};
    (assignmentsRes.data ?? []).forEach(
      (a: { id: string; cohort_id: string }) => {
        assignmentsByCohort[a.cohort_id] =
          (assignmentsByCohort[a.cohort_id] ?? 0) + 1;
        if (!submittedIds.has(a.id)) {
          pendingByCohort[a.cohort_id] =
            (pendingByCohort[a.cohort_id] ?? 0) + 1;
        }
      }
    );

    const courses: MyCourse[] = enrollments.map((e) => {
      const cohortId = e.cohort_id ?? '';
      const totalLessons = lessonsByCohort[cohortId] ?? 0;
      const totalSessions = sessionsByCohort[cohortId] ?? 0;
      const upcomingSessions = upcomingByCohort[cohortId] ?? 0;
      const pendingAssignments = pendingByCohort[cohortId] ?? 0;

      const totalAssignments = assignmentsByCohort[cohortId] ?? 0;
      const submittedAssignments = totalAssignments - pendingAssignments;
      const progress =
        totalAssignments > 0
          ? Math.round((submittedAssignments / totalAssignments) * 100)
          : e.status === 'completed'
          ? 100
          : 0;

      return {
        course_id: e.course_id,
        enrollment_id: e.id,
        title: e.course?.title ?? 'Untitled course',
        slug: e.course?.slug ?? '',
        description: e.course?.description ?? null,
        thumbnail_url: e.course?.thumbnail_url ?? null,
        hero_image_url: e.course?.hero_image_url ?? null,
        emoji: e.course?.emoji ?? null,
        accent: e.course?.accent ?? null,
        duration: e.course?.duration ?? null,
        format: e.course?.format ?? null,
        level: e.course?.level ?? null,
        cohort_id: e.cohort_id,
        cohort_name: e.cohort?.name ?? null,
        cohort_start: e.cohort?.start_date ?? null,
        cohort_end: e.cohort?.end_date ?? null,
        status: e.status,
        total_lessons: totalLessons,
        total_sessions: totalSessions,
        upcoming_sessions: upcomingSessions,
        pending_assignments: pendingAssignments,
        progress_percent: progress,
      };
    });

    return { success: true, data: courses };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// COURSES — full detail (Fail-Safe)
// ============================================================================

export interface MyCourseDetail {
  enrollment: MyEnrollment;
  lessons: MyLesson[];
  materials: MyMaterial[];
  sessions: MySession[];
  assignments: MyAssignment[];
}

export const fetchMyCourseDetail = async (
  courseId: string
): Promise<ServiceResponse<MyCourseDetail>> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    // 1. Fetch the enrollment
    const { data: enrollData, error: enrollError } = await supabase
      .from('enrollments')
      .select(
        `
        id, course_id, cohort_id, status,
        applied_at, started_at, completed_at, notes,
        course:courses(
          id, title, slug, description, thumbnail_url, hero_image_url,
          duration, format, level, emoji, accent
        ),
        cohort:cohorts(
          id, name, start_date, end_date, schedule, format, cohort_token
        )
      `
      )
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .in('status', ['active', 'completed'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (enrollError) {
      console.error('Enrollment fetch error:', enrollError);
      return { success: false, error: enrollError.message };
    }
    
    if (!enrollData) {
      return { success: false, error: 'Not enrolled in this course' };
    }

    const enrollment = enrollData as unknown as MyEnrollment;
    const cohortId = enrollment.cohort_id;

    // 2. If no cohort, return empty data immediately
    if (!cohortId) {
      return {
        success: true,
        data: {
          enrollment,
          lessons: [],
          materials: [],
          sessions: [],
          assignments: [],
        },
      };
    }

    // 3. Fetch all related data safely (wrap each in catch)
    const fetchLessons = async () => {
      try {
        const { data } = await supabase
          .from('lessons')
          .select('*, course:courses(title)')
          .eq('cohort_id', cohortId)
          .eq('published', true)
          .order('display_order', { ascending: true });
        return data ?? [];
      } catch { return []; }
    };

    const fetchMaterials = async () => {
      try {
        const { data } = await supabase
          .from('materials')
          .select('*')
          .eq('course_id', courseId)
          .eq('published', true)
          .order('display_order', { ascending: true });
        return data ?? [];
      } catch { return []; }
    };

    const fetchSessions = async () => {
      try {
        const { data } = await supabase
          .from('cohort_sessions')
          .select('*, course:courses(title), cohort:cohorts(name)')
          .eq('cohort_id', cohortId)
          .order('session_date', { ascending: true });
        return data ?? [];
      } catch { return []; }
    };

    const fetchAssignments = async () => {
      try {
        const { data } = await supabase
          .from('assignments')
          .select(
            '*, course:courses(title), cohort:cohorts(name), submission:assignment_submissions(*)'
          )
          .eq('cohort_id', cohortId)
          .eq('published', true)
          .order('due_date', { ascending: true });
        return data ?? [];
      } catch { return []; }
    };

    // Execute all in parallel, but with guarantees they resolve
    const [rawLessons, rawMaterials, rawSessions, rawAssignments] = await Promise.all([
      fetchLessons(),
      fetchMaterials(),
      fetchSessions(),
      fetchAssignments(),
    ]);

    // 4. Format the data
    const lessons: MyLesson[] = rawLessons.map((l: any) => ({
      id: l.id,
      cohort_id: l.cohort_id,
      course_id: l.course_id,
      title: l.title,
      description: l.description ?? null,
      content_type: l.content_type,
      video_url: l.video_url ?? null,
      pdf_url: l.pdf_url ?? null,
      body: l.body ?? null,
      external_links: l.external_links ?? [],
      module_number: l.module_number ?? null,
      display_order: l.display_order ?? 0,
      course_title: l.course?.title ?? null,
    }));

    const sessions: MySession[] = rawSessions.map((s: any) => ({
      id: s.id,
      cohort_id: s.cohort_id,
      course_id: s.course_id,
      title: s.title,
      description: s.description ?? null,
      session_date: s.session_date,
      duration_minutes: s.duration_minutes ?? 90,
      meeting_url: s.meeting_url ?? null,
      meeting_platform: s.meeting_platform ?? null,
      recording_url: s.recording_url ?? null,
      status: s.status,
      course_title: s.course?.title ?? null,
      cohort_name: s.cohort?.name ?? null,
    }));

    const now = new Date();
    const assignments: MyAssignment[] = rawAssignments.map((a: any) => {
      const subs = (a.submission as MySubmission[]) ?? [];
      const mySub = subs[0] ?? null;
      const dueDate = a.due_date ?? null;
      
      let isOverdue = false;
      let daysUntilDue = null;
      if (dueDate) {
        const diff = new Date(dueDate).getTime() - now.getTime();
        daysUntilDue = Math.ceil(diff / (1000 * 60 * 60 * 24));
        isOverdue = diff < 0 && !mySub;
      }

      return {
        id: a.id,
        cohort_id: a.cohort_id,
        course_id: a.course_id,
        title: a.title,
        description: a.description ?? null,
        instructions: a.instructions ?? null,
        submission_type: a.submission_type,
        due_date: dueDate,
        max_score: a.max_score ?? null,
        course_title: a.course?.title ?? null,
        cohort_name: a.cohort?.name ?? null,
        submission: mySub,
        is_overdue: isOverdue,
        days_until_due: daysUntilDue,
      };
    });

    const materials: MyMaterial[] = rawMaterials.map((m: any) => ({
      id: m.id,
      course_id: m.course_id,
      title: m.title,
      description: m.description ?? null,
      material_type: m.material_type,
      file_url: m.file_url ?? null,
      external_url: m.external_url ?? null,
      display_order: m.display_order ?? 0,
    }));

    return {
      success: true,
      data: { enrollment, lessons, materials, sessions, assignments },
    };

  } catch (err) {
    console.error('fetchMyCourseDetail crash:', err);
    return { success: false, error: String(err) };
  }
};
// ============================================================================
// SESSIONS
// ============================================================================

export const fetchUpcomingSessions = async (
  limit = 10
): Promise<ServiceResponse<MySession[]>> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    const { data: enrollData, error: enrollError } = await supabase
      .from('enrollments')
      .select('cohort_id')
      .eq('user_id', userId)
      .in('status', ['active', 'completed']);

    if (enrollError) return { success: false, error: enrollError.message };

    const cohortIds = (enrollData ?? [])
      .map((e: { cohort_id: string | null }) => e.cohort_id)
      .filter((id): id is string => !!id);

    if (cohortIds.length === 0) return { success: true, data: [] };

    const { data, error } = await supabase
      .from('cohort_sessions')
      .select('*, course:courses(title), cohort:cohorts(name)')
      .in('cohort_id', cohortIds)
      .gte('session_date', new Date().toISOString())
      .in('status', ['scheduled', 'live'])
      .order('session_date', { ascending: true })
      .limit(limit);

    if (error) return { success: false, error: error.message };

    const sessions = (data ?? []).map((s: Record<string, unknown>) => ({
      id: s.id as string,
      cohort_id: s.cohort_id as string,
      course_id: s.course_id as string,
      title: s.title as string,
      description: (s.description as string | null) ?? null,
      session_date: s.session_date as string,
      duration_minutes: (s.duration_minutes as number) ?? 90,
      meeting_url: (s.meeting_url as string | null) ?? null,
      meeting_platform: (s.meeting_platform as string | null) ?? null,
      recording_url: (s.recording_url as string | null) ?? null,
      status: s.status as SessionStatus,
      course_title: ((s.course as { title: string } | null)?.title) ?? null,
      cohort_name: ((s.cohort as { name: string } | null)?.name) ?? null,
    }));

    return { success: true, data: sessions };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const fetchPastSessions = async (
  limit = 20
): Promise<ServiceResponse<MySession[]>> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    const { data: enrollData, error: enrollError } = await supabase
      .from('enrollments')
      .select('cohort_id')
      .eq('user_id', userId)
      .in('status', ['active', 'completed']);

    if (enrollError) return { success: false, error: enrollError.message };

    const cohortIds = (enrollData ?? [])
      .map((e: { cohort_id: string | null }) => e.cohort_id)
      .filter((id): id is string => !!id);

    if (cohortIds.length === 0) return { success: true, data: [] };

    const { data, error } = await supabase
      .from('cohort_sessions')
      .select('*, course:courses(title), cohort:cohorts(name)')
      .in('cohort_id', cohortIds)
      .lt('session_date', new Date().toISOString())
      .in('status', ['completed', 'cancelled'])
      .order('session_date', { ascending: false })
      .limit(limit);

    if (error) return { success: false, error: error.message };

    const sessions = (data ?? []).map((s: Record<string, unknown>) => ({
      id: s.id as string,
      cohort_id: s.cohort_id as string,
      course_id: s.course_id as string,
      title: s.title as string,
      description: (s.description as string | null) ?? null,
      session_date: s.session_date as string,
      duration_minutes: (s.duration_minutes as number) ?? 90,
      meeting_url: (s.meeting_url as string | null) ?? null,
      meeting_platform: (s.meeting_platform as string | null) ?? null,
      recording_url: (s.recording_url as string | null) ?? null,
      status: s.status as SessionStatus,
      course_title: ((s.course as { title: string } | null)?.title) ?? null,
      cohort_name: ((s.cohort as { name: string } | null)?.name) ?? null,
    }));

    return { success: true, data: sessions };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// LESSONS
// ============================================================================

export const fetchLessonsForCohort = async (
  cohortId: string
): Promise<ServiceResponse<MyLesson[]>> => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*, course:courses(title)')
      .eq('cohort_id', cohortId)
      .eq('published', true)
      .order('display_order', { ascending: true });

    if (error) return { success: false, error: error.message };

    const lessons = (data ?? []).map((l: Record<string, unknown>) => ({
      id: l.id as string,
      cohort_id: l.cohort_id as string,
      course_id: l.course_id as string,
      title: l.title as string,
      description: (l.description as string | null) ?? null,
      content_type: l.content_type as MyLesson['content_type'],
      video_url: (l.video_url as string | null) ?? null,
      pdf_url: (l.pdf_url as string | null) ?? null,
      body: (l.body as string | null) ?? null,
      external_links: (l.external_links as { title: string; url: string }[]) ?? [],
      module_number: (l.module_number as number | null) ?? null,
      display_order: (l.display_order as number) ?? 0,
      course_title: ((l.course as { title: string } | null)?.title) ?? null,
    }));

    return { success: true, data: lessons };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const fetchLessonsForCourse = async (
  courseId: string
): Promise<ServiceResponse<MyLesson[]>> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    const { data: enroll } = await supabase
      .from('enrollments')
      .select('cohort_id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .in('status', ['active', 'completed'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const cohortId = (enroll as { cohort_id: string | null } | null)?.cohort_id;
    if (!cohortId) return { success: true, data: [] };

    return fetchLessonsForCohort(cohortId);
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// MATERIALS
// ============================================================================

export const fetchMaterialsForCourse = async (
  courseId: string
): Promise<ServiceResponse<MyMaterial[]>> => {
  try {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('course_id', courseId)
      .eq('published', true)
      .order('display_order', { ascending: true });

    if (error) return { success: false, error: error.message };

    const materials = (data ?? []).map((m: Record<string, unknown>) => ({
      id: m.id as string,
      course_id: m.course_id as string,
      title: m.title as string,
      description: (m.description as string | null) ?? null,
      material_type: m.material_type as MyMaterial['material_type'],
      file_url: (m.file_url as string | null) ?? null,
      external_url: (m.external_url as string | null) ?? null,
      display_order: (m.display_order as number) ?? 0,
    }));

    return { success: true, data: materials };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ASSIGNMENTS
// ============================================================================

export const fetchMyAssignments = async (): Promise<
  ServiceResponse<MyAssignment[]>
> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    const { data: enrollData, error: enrollError } = await supabase
      .from('enrollments')
      .select('cohort_id')
      .eq('user_id', userId)
      .in('status', ['active', 'completed']);

    if (enrollError) return { success: false, error: enrollError.message };

    const cohortIds = (enrollData ?? [])
      .map((e: { cohort_id: string | null }) => e.cohort_id)
      .filter((id): id is string => !!id);

    if (cohortIds.length === 0) return { success: true, data: [] };

    const { data, error } = await supabase
      .from('assignments')
      .select(
        '*, course:courses(title), cohort:cohorts(name), submission:assignment_submissions(*)'
      )
      .in('cohort_id', cohortIds)
      .eq('published', true)
      .order('due_date', { ascending: true });

    if (error) return { success: false, error: error.message };

    const now = new Date();
    const assignments: MyAssignment[] = (data ?? []).map(
      (a: Record<string, unknown>) => {
        const subs = (a.submission as MySubmission[] | null) ?? [];
        const mySub = subs[0] ?? null;
        const dueDate = a.due_date as string | null;

        let isOverdue = false;
        let daysUntilDue: number | null = null;
        if (dueDate) {
          const due = new Date(dueDate);
          const diff = due.getTime() - now.getTime();
          daysUntilDue = Math.ceil(diff / (1000 * 60 * 60 * 24));
          isOverdue = diff < 0 && !mySub;
        }

        return {
          id: a.id as string,
          cohort_id: a.cohort_id as string,
          course_id: a.course_id as string,
          title: a.title as string,
          description: (a.description as string | null) ?? null,
          instructions: (a.instructions as string | null) ?? null,
          submission_type: a.submission_type as MyAssignment['submission_type'],
          due_date: dueDate,
          max_score: (a.max_score as number | null) ?? null,
          course_title:
            ((a.course as { title: string } | null)?.title) ?? null,
          cohort_name:
            ((a.cohort as { name: string } | null)?.name) ?? null,
          submission: mySub,
          is_overdue: isOverdue,
          days_until_due: daysUntilDue,
        };
      }
    );

    return { success: true, data: assignments };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const fetchAssignmentsForCohort = async (
  cohortId: string
): Promise<ServiceResponse<MyAssignment[]>> => {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select(
        '*, course:courses(title), cohort:cohorts(name), submission:assignment_submissions(*)'
      )
      .eq('cohort_id', cohortId)
      .eq('published', true)
      .order('due_date', { ascending: true });

    if (error) return { success: false, error: error.message };

    const now = new Date();
    const assignments: MyAssignment[] = (data ?? []).map(
      (a: Record<string, unknown>) => {
        const subs = (a.submission as MySubmission[] | null) ?? [];
        const mySub = subs[0] ?? null;
        const dueDate = a.due_date as string | null;

        let isOverdue = false;
        let daysUntilDue: number | null = null;
        if (dueDate) {
          const due = new Date(dueDate);
          const diff = due.getTime() - now.getTime();
          daysUntilDue = Math.ceil(diff / (1000 * 60 * 60 * 24));
          isOverdue = diff < 0 && !mySub;
        }

        return {
          id: a.id as string,
          cohort_id: a.cohort_id as string,
          course_id: a.course_id as string,
          title: a.title as string,
          description: (a.description as string | null) ?? null,
          instructions: (a.instructions as string | null) ?? null,
          submission_type: a.submission_type as MyAssignment['submission_type'],
          due_date: dueDate,
          max_score: (a.max_score as number | null) ?? null,
          course_title:
            ((a.course as { title: string } | null)?.title) ?? null,
          cohort_name:
            ((a.cohort as { name: string } | null)?.name) ?? null,
          submission: mySub,
          is_overdue: isOverdue,
          days_until_due: daysUntilDue,
        };
      }
    );

    return { success: true, data: assignments };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export const fetchMySubmission = async (
  assignmentId: string
): Promise<ServiceResponse<MySubmission>> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('assignment_submissions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Not submitted yet' };

    return { success: true, data: data as MySubmission };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

export interface SubmitAssignmentInput {
  assignment_id: string;
  submission_url?: string;
  submission_text?: string;
}

export const submitAssignment = async (
  input: SubmitAssignmentInput
): Promise<ServiceResponse<MySubmission>> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    if (!input.submission_url && !input.submission_text) {
      return { success: false, error: 'Provide a submission URL or text' };
    }

    const { data, error } = await supabase
      .from('assignment_submissions')
      .upsert(
        {
          assignment_id: input.assignment_id,
          user_id: userId,
          submission_url: input.submission_url ?? null,
          submission_text: input.submission_text ?? null,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        },
        { onConflict: 'assignment_id,user_id' }
      )
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as MySubmission };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// ANNOUNCEMENTS
// ============================================================================

export const fetchMyAnnouncements = async (
  limit = 30
): Promise<ServiceResponse<MyAnnouncement[]>> => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) return { success: false, error: error.message };

    const announcements = (data ?? []).map((a: Record<string, unknown>) => ({
      id: a.id as string,
      title: a.title as string,
      body: a.body as string,
      priority: a.priority as AnnouncementPriority,
      course_id: (a.course_id as string | null) ?? null,
      cohort_id: (a.cohort_id as string | null) ?? null,
      auto_generated: (a.auto_generated as boolean) ?? false,
      auto_type: (a.auto_type as string | null) ?? null,
      published_at: a.published_at as string,
      expires_at: (a.expires_at as string | null) ?? null,
    }));

    return { success: true, data: announcements };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

// ============================================================================
// CERTIFICATES
// ============================================================================

export const fetchMyCertificates = async (): Promise<
  ServiceResponse<MyCertificate[]>
> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('enrollments')
      .select(
        `
        id, course_id, cohort_id, completed_at,
        course:courses(title, slug),
        cohort:cohorts(name),
        profile:profiles(first_name, last_name)
      `
      )
      .eq('user_id', userId)
      .eq('status', 'completed')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false });

    if (error) return { success: false, error: error.message };

    const certificates: MyCertificate[] = (data ?? []).map(
      (row: Record<string, unknown>) => {
        const course = row.course as { title: string; slug: string } | null;
        const cohort = row.cohort as { name: string } | null;
        const profile = row.profile as
          | { first_name: string; last_name: string }
          | null;

        const enrollmentId = row.id as string;

        return {
          enrollment_id: enrollmentId,
          course_id: row.course_id as string,
          course_title: course?.title ?? 'Course',
          course_slug: course?.slug ?? '',
          cohort_name: cohort?.name ?? null,
          completed_at: row.completed_at as string,
          certificate_number: generateCertNumber(enrollmentId),
          student_name: profile
            ? `${profile.first_name} ${profile.last_name}`.trim()
            : 'Student',
        };
      }
    );

    return { success: true, data: certificates };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};

const generateCertNumber = (enrollmentId: string): string => {
  const hash = enrollmentId.replace(/-/g, '').slice(0, 8).toUpperCase();
  return `IQ-CERT-${hash}`;
};

// ============================================================================
// STATS
// ============================================================================

export const fetchMyStats = async (): Promise<
  ServiceResponse<StudentStats>
> => {
  try {
    const [coursesRes, upcomingRes, assignmentsRes, announcementsRes, certsRes] =
      await Promise.all([
        fetchMyCourses(),
        fetchUpcomingSessions(20),
        fetchMyAssignments(),
        fetchMyAnnouncements(30),
        fetchMyCertificates(),
      ]);

    const courses = coursesRes.success ? coursesRes.data ?? [] : [];
    const upcoming = upcomingRes.success ? upcomingRes.data ?? [] : [];
    const assignments = assignmentsRes.success ? assignmentsRes.data ?? [] : [];
    const announcements = announcementsRes.success
      ? announcementsRes.data ?? []
      : [];
    const certificates = certsRes.success ? certsRes.data ?? [] : [];

    const activeCourses = courses.filter((c) => c.status === 'active');
    const completedCourses = courses.filter((c) => c.status === 'completed');
    const pendingAssignments = assignments.filter(
      (a) => !a.submission && !a.is_overdue
    );

    const totalLessons = courses.reduce((sum, c) => sum + c.total_lessons, 0);

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const unreadAnnouncements = announcements.filter(
      (a) => new Date(a.published_at).getTime() > sevenDaysAgo
    ).length;

    return {
      success: true,
      data: {
        active_courses: activeCourses.length,
        completed_courses: completedCourses.length,
        total_lessons_available: totalLessons,
        upcoming_sessions: upcoming.length,
        pending_assignments: pendingAssignments.length,
        unread_announcements: unreadAnnouncements,
        certificates_earned: certificates.length,
        next_session: upcoming[0] ?? null,
        next_assignment: pendingAssignments[0] ?? null,
      },
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
};