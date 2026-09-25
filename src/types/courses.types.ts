// ============================================================================
// iQuire — Course Types (Phase 10D.3)
// ============================================================================
// TypeScript shapes matching the DB tables.
// ============================================================================

// ============================================================================
// Enums
// ============================================================================

export type CourseStatus = 'draft' | 'published' | 'archived';
export type CourseAccent = 'blue' | 'green' | 'purple' | 'orange';
export type CohortStatus = 'open' | 'closed' | 'completed';

// ============================================================================
// JSONB sub-types
// ============================================================================

export interface CourseChallenge {
  title: string;
  description: string;
}

export interface CourseModule {
  number: string;
  title: string;
  description?: string;
}

export interface CourseWeek {
  week: string;
  title: string;
}

export interface CourseFaq {
  id: string;
  question: string;
  answer: string;
}

export interface CoursePricing {
  fee: string;
  includes: string[];
  paymentOptions?: string;
  financialSupport?: string;
}

export interface CourseFinalCta {
  headline: string;
  subheadline: string;
}

// ============================================================================
// Course
// ============================================================================

export interface Course {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;

  duration: string | null;
  format: string | null;
  level: string | null;
  accent: CourseAccent | null;
  emoji: string | null;

  thumbnail_url: string | null;
  hero_image_url: string | null;
  certificate_included: boolean;

  status: CourseStatus;
  display_order: number;

  // Content sections
  why_this_program: string | null;
  challenges: CourseChallenge[];
  what_you_learn: CourseModule[];
  week_journey: CourseWeek[];
  experience: string[];
  outcomes: string[];
  who_its_for: string[];
  prerequisites: string | null;
  skills_professional: string[];
  skills_digital: string[];
  skills_career: string[];
  curriculum: CourseModule[];
  whats_included: string[];
  pricing: CoursePricing;
  faqs: CourseFaq[];
  final_cta: CourseFinalCta | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Cohort
// ============================================================================

export interface Cohort {
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
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Previous Cohort
// ============================================================================

export interface PreviousCohort {
  id: string;
  course_id: string;
  name: string;
  date_range: string;
  format: string | null;
  participants: number | null;
  outcome: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Composite: Course with all relations
// ============================================================================

export interface CourseWithRelations extends Course {
  next_cohort: Cohort | null;
  previous_cohorts: PreviousCohort[];
}

// ============================================================================
// Form input types (for admin)
// ============================================================================

export interface CourseInput {
  slug: string;
  title: string;
  tagline?: string | null;
  description?: string | null;
  duration?: string | null;
  format?: string | null;
  level?: string | null;
  accent?: CourseAccent | null;
  emoji?: string | null;
  thumbnail_url?: string | null;
  hero_image_url?: string | null;
  certificate_included?: boolean;
  status?: CourseStatus;
  display_order?: number;

  why_this_program?: string | null;
  challenges?: CourseChallenge[];
  what_you_learn?: CourseModule[];
  week_journey?: CourseWeek[];
  experience?: string[];
  outcomes?: string[];
  who_its_for?: string[];
  prerequisites?: string | null;
  skills_professional?: string[];
  skills_digital?: string[];
  skills_career?: string[];
  curriculum?: CourseModule[];
  whats_included?: string[];
  pricing?: CoursePricing;
  faqs?: CourseFaq[];
  final_cta?: CourseFinalCta | null;
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
}

export interface PreviousCohortInput {
  course_id: string;
  name: string;
  date_range: string;
  format?: string | null;
  participants?: number | null;
  outcome?: string | null;
  display_order?: number;
}