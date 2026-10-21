// ============================================================================
// iQuire — Content Types (Phase 12D.2)
// ============================================================================
// Types for contact_messages, scholarships, jobs.
// ============================================================================

// ============================================================================
// Enums (mirror DB enums)
// ============================================================================

export type ContactMessageStatus = 'new' | 'read' | 'replied' | 'archived';

export type ScholarshipStatus = 'draft' | 'published' | 'closed' | 'archived';

export type JobStatus = 'draft' | 'published' | 'closed' | 'archived';

export type JobWorkMode = 'remote' | 'hybrid' | 'on-site';

export type JobOpportunityType =
  | 'full-time'
  | 'part-time'
  | 'internship'
  | 'paid-internship'
  | 'unpaid-internship'
  | 'freelance'
  | 'contract'
  | 'volunteer'
  | 'graduate-trainee'
  | 'apprenticeship';

export type JobExperienceLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'any';

// ============================================================================
// Contact Messages
// ============================================================================

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  admin_notes: string | null;
  read_at: string | null;
  replied_at: string | null;
  replied_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactMessageInput {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}

// ============================================================================
// Scholarships
// ============================================================================

export interface Scholarship {
  id: string;
  title: string;
  slug: string;
  description: string;
  eligibility: string | null;
  coverage: string | null;
  deadline: string | null;      // ISO date
  apply_url: string | null;
  course_id: string | null;
  status: ScholarshipStatus;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ScholarshipWithCourse extends Scholarship {
  course?: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

export interface ScholarshipInput {
  title: string;
  slug: string;
  description: string;
  eligibility?: string | null;
  coverage?: string | null;
  deadline?: string | null;
  apply_url?: string | null;
  course_id?: string | null;
  status?: ScholarshipStatus;
  display_order?: number;
}

// ============================================================================
// Jobs
// ============================================================================

export interface Job {
  id: string;
  title: string;
  slug: string;
  company: string;
  company_logo_url: string | null;
  description: string;
  location: string | null;
  work_mode: JobWorkMode;
  opportunity_type: JobOpportunityType;
  experience_level: JobExperienceLevel;
  salary_range: string | null;
  required_skills: string[];
  apply_url: string | null;
  deadline: string | null;      // ISO date
  course_id: string | null;
  submitted_by_recruiter: string | null;
  admin_approved: boolean;
  status: JobStatus;
  featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface JobWithCourse extends Job {
  course?: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

export interface JobInput {
  title: string;
  slug: string;
  company: string;
  company_logo_url?: string | null;
  description: string;
  location?: string | null;
  work_mode?: JobWorkMode;
  opportunity_type?: JobOpportunityType;
  experience_level?: JobExperienceLevel;
  salary_range?: string | null;
  required_skills?: string[];
  apply_url?: string | null;
  deadline?: string | null;
  course_id?: string | null;
  status?: JobStatus;
  featured?: boolean;
  display_order?: number;
}

export interface JobFilters {
  search?: string;
  workMode?: JobWorkMode | 'all';
  opportunityType?: JobOpportunityType | 'all';
  experienceLevel?: JobExperienceLevel | 'all';
  featuredOnly?: boolean;
}

// ============================================================================
// Dropdown options
// ============================================================================

export interface ContentSelectOption {
  label: string;
  value: string;
}

export const JOB_WORK_MODE_OPTIONS: ContentSelectOption[] = [
  { label: 'Remote', value: 'remote' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'On-site', value: 'on-site' },
];

export const JOB_OPPORTUNITY_TYPE_OPTIONS: ContentSelectOption[] = [
  { label: 'Full-time', value: 'full-time' },
  { label: 'Part-time', value: 'part-time' },
  { label: 'Internship', value: 'internship' },
  { label: 'Paid Internship', value: 'paid-internship' },
  { label: 'Unpaid Internship', value: 'unpaid-internship' },
  { label: 'Freelance', value: 'freelance' },
  { label: 'Contract', value: 'contract' },
  { label: 'Volunteer', value: 'volunteer' },
  { label: 'Graduate Trainee', value: 'graduate-trainee' },
  { label: 'Apprenticeship', value: 'apprenticeship' },
];

export const JOB_EXPERIENCE_LEVEL_OPTIONS: ContentSelectOption[] = [
  { label: 'Entry level', value: 'entry' },
  { label: 'Junior', value: 'junior' },
  { label: 'Mid level', value: 'mid' },
  { label: 'Senior', value: 'senior' },
  { label: 'Any level', value: 'any' },
];

export const SCHOLARSHIP_STATUS_OPTIONS: ContentSelectOption[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Closed', value: 'closed' },
  { label: 'Archived', value: 'archived' },
];

export const JOB_STATUS_OPTIONS: ContentSelectOption[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Closed', value: 'closed' },
  { label: 'Archived', value: 'archived' },
];

// ============================================================================
// Helpers (label formatting)
// ============================================================================

export const formatOpportunityType = (type: JobOpportunityType): string => {
  const map: Record<JobOpportunityType, string> = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    'internship': 'Internship',
    'paid-internship': 'Paid Internship',
    'unpaid-internship': 'Unpaid Internship',
    'freelance': 'Freelance',
    'contract': 'Contract',
    'volunteer': 'Volunteer',
    'graduate-trainee': 'Graduate Trainee',
    'apprenticeship': 'Apprenticeship',
  };
  return map[type] ?? type;
};

export const formatWorkMode = (mode: JobWorkMode): string => {
  const map: Record<JobWorkMode, string> = {
    'remote': 'Remote',
    'hybrid': 'Hybrid',
    'on-site': 'On-site',
  };
  return map[mode] ?? mode;
};

export const formatExperienceLevel = (level: JobExperienceLevel): string => {
  const map: Record<JobExperienceLevel, string> = {
    'entry': 'Entry level',
    'junior': 'Junior',
    'mid': 'Mid level',
    'senior': 'Senior',
    'any': 'Any level',
  };
  return map[level] ?? level;
};


// ============================================================================
// Impact Metrics (Phase 14.1)
// ============================================================================

export type ImpactAccent = 'blue' | 'green' | 'gold' | 'purple';

export interface ImpactMetric {
  id: string;
  emoji: string;
  value: string;
  label: string;
  description: string | null;
  accent: ImpactAccent;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ImpactMetricInput {
  emoji: string;
  value: string;
  label: string;
  description?: string | null;
  accent?: ImpactAccent;
  display_order?: number;
  published?: boolean;
}

export const IMPACT_ACCENT_OPTIONS: ContentSelectOption[] = [
  { label: 'Blue', value: 'blue' },
  { label: 'Green', value: 'green' },
  { label: 'Gold', value: 'gold' },
  { label: 'Purple', value: 'purple' },
];

// ============================================================================
// FAQs (Phase 14.1)
// ============================================================================

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface FaqInput {
  question: string;
  answer: string;
  category?: string;
  display_order?: number;
  published?: boolean;
}

/** Well-known FAQ categories (future categories can be added freely) */
export const FAQ_CATEGORIES: ContentSelectOption[] = [
  { label: 'Homepage', value: 'homepage' },
  { label: 'Hire From Us', value: 'hire-from-us' },
  { label: 'AI Career Counselor', value: 'ai-counselor' },
  { label: 'Scholarships', value: 'scholarships' },
  { label: 'Contact', value: 'contact' },
  { label: 'General', value: 'general' },
];

export const formatFaqCategory = (category: string): string => {
  const found = FAQ_CATEGORIES.find((c) => c.value === category);
  if (found) return found.label;
  // Fallback: capitalize and replace hyphens with spaces
  return category
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};