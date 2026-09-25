// ============================================================================
// iQuire Auth Types — Phase 7A.2
// ============================================================================

// ============================================================================
// Core Enums (mirror Supabase enums)
// ============================================================================

/** Top-level account kind — determines login portal + dashboard */
export type AccountType = 'member' | 'recruiter' | 'admin';

/** Access tier — guest can use limited features; verified has full access */
export type AccountTier = 'guest' | 'verified';

/** Additive roles — a user can have multiple simultaneously */
export type UserRole = 'student' | 'alumni' | 'recruiter' | 'admin';

/** Legacy enum (kept for backward compatibility in DB) */
export type LegacyUserRole = 'student' | 'nysc' | 'recruiter' | 'admin';

/** Gender */
export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

/** Enrollment status */
export type EnrollmentStatus = 'applied' | 'active' | 'completed' | 'dropped';

/** Verification status (legacy — kept for compatibility) */
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

/** Account status */
export type AccountStatus = 'active' | 'suspended' | 'deleted';

// ============================================================================
// Nigerian Geography
// ============================================================================

/** A Nigerian state with its Local Government Areas. */
export interface NigerianState {
  /** 2-letter state code, e.g. 'LA' for Lagos, 'FC' for FCT */
  code: string;
  /** Full state name, e.g. 'Lagos', 'FCT - Abuja' */
  name: string;
  /** Local Government Areas within the state */
  lgas: string[];
}

// ============================================================================
// Profile (matches public.profiles table — updated)
// ============================================================================

export interface Profile {
  id: string;

  // Top-level account classification
  account_type: AccountType;
  tier: AccountTier;

  // Legacy role field (kept for backward compat with old code)
  role: LegacyUserRole;

  // Public identifier
  participant_id: string;

  // Personal
  first_name: string;
  middle_name: string | null;
  last_name: string;
  gender: Gender | null;

  // Contact
  email: string;
  phone: string | null;

  // Location
  country: string | null;
  state: string | null;
  lga: string | null;

  // Media
  avatar_url: string | null;

  // Progress & status
  profile_completion: number;
  verification_status: VerificationStatus;
  account_status: AccountStatus;
  marketing_opt_in: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================================================
// User Roles (additive) — matches public.user_roles table
// ============================================================================

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  course_id: string | null;
  cohort_id: string | null;
  granted_at: string;
  granted_by: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
}

// ============================================================================
// Courses — matches public.courses table
// ============================================================================

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Cohorts — matches public.cohorts table
// ============================================================================

export interface Cohort {
  id: string;
  course_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  capacity: number | null;
  status: 'open' | 'closed' | 'completed';
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Enrollments — matches public.enrollments table
// ============================================================================

export interface Enrollment {
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
}

// ============================================================================
// Auth Context Value
// ============================================================================

export interface AuthContextValue {
  // Supabase user
  user: import('@supabase/supabase-js').User | null;

  // Full profile
  profile: Profile | null;

  // Derived shortcuts
  accountType: AccountType | null;
  tier: AccountTier | null;
  roles: UserRole[];

  // Convenience flags
  isAuthenticated: boolean;
  isVerified: boolean;
  isAdmin: boolean;
  isRecruiter: boolean;
  isMember: boolean;
  isStudent: boolean;
  isAlumni: boolean;

  // State
  isLoading: boolean;

  // Methods
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshRoles: () => Promise<void>;
}

// ============================================================================
// Form Data — Register (Member)
// ============================================================================

export interface RegisterMemberData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  country: string;
  state: string;
  lga: string;
  agreeToTerms: boolean;
  marketingOptIn: boolean;
  // Optional
  desiredCourseId?: string; // if they want to register for a course
  wantsAiCounselor?: boolean; // if they want AI access
}

// ============================================================================
// Form Data — Register (Recruiter)
// ============================================================================

export interface RegisterRecruiterData {
  firstName: string;
  lastName: string;
  position: string;
  companyName: string;
  industry: string;
  companyWebsite: string;
  companySize: string;
  workEmail: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  marketingOptIn: boolean;
}

// ============================================================================
// Form Data — Login (Member)
// ============================================================================

export interface LoginMemberData {
  identifier: string; // email OR participant_id
  password: string;
  rememberMe?: boolean;
}

// ============================================================================
// Form Data — Login (Recruiter)
// ============================================================================

export interface LoginRecruiterData {
  email: string; // work email
  password: string;
  rememberMe?: boolean;
}

// ============================================================================
// Form Data — Admin Login
// ============================================================================

export interface LoginAdminData {
  email: string;
  password: string;
}

// ============================================================================
// Form Errors
// ============================================================================

export interface FormErrors {
  [key: string]: string;
}

// ============================================================================
// Service Responses
// ============================================================================

export interface AuthResponse {
  success: boolean;
  message: string;
  userId?: string;
  requiresEmailVerification?: boolean;
  error?: string;
  redirectTo?: string; // suggested redirect based on account type
}

// ============================================================================
// Dropdown Options (unchanged)
// ============================================================================

export interface SelectOption {
  label: string;
  value: string;
}

export const GENDER_OPTIONS: SelectOption[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer-not-to-say' },
];

export const COMPANY_SIZE_OPTIONS: SelectOption[] = [
  { label: '1 - 10 employees', value: '1-10' },
  { label: '11 - 50 employees', value: '11-50' },
  { label: '51 - 200 employees', value: '51-200' },
  { label: '201 - 500 employees', value: '201-500' },
  { label: '501 - 1000 employees', value: '501-1000' },
  { label: '1000+ employees', value: '1000-plus' },
];

export const INDUSTRY_OPTIONS: SelectOption[] = [
  { label: 'Technology & Software', value: 'technology' },
  { label: 'Finance & Banking', value: 'finance' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Education', value: 'education' },
  { label: 'Consulting', value: 'consulting' },
  { label: 'Manufacturing', value: 'manufacturing' },
  { label: 'Oil & Gas', value: 'oil-gas' },
  { label: 'Telecommunications', value: 'telecom' },
  { label: 'Retail & E-commerce', value: 'retail' },
  { label: 'Media & Entertainment', value: 'media' },
  { label: 'Government & Public Sector', value: 'government' },
  { label: 'Non-profit / NGO', value: 'nonprofit' },
  { label: 'Agriculture', value: 'agriculture' },
  { label: 'Real Estate', value: 'real-estate' },
  { label: 'Logistics & Transportation', value: 'logistics' },
  { label: 'Other', value: 'other' },
];

// ============================================================================
// Legacy dropdowns (kept for backward compatibility; remove later)
// ============================================================================

export const YEAR_OF_DEPLOYMENT_OPTIONS: SelectOption[] = [
  { label: '2024', value: '2024' },
  { label: '2025', value: '2025' },
  { label: '2026', value: '2026' },
  { label: '2027', value: '2027' },
];

export const COHORT_BATCH_OPTIONS: SelectOption[] = [
  { label: 'Batch A', value: 'batch-a' },
  { label: 'Batch B', value: 'batch-b' },
  { label: 'Batch C', value: 'batch-c' },
];

export const COHORT_STREAM_OPTIONS: SelectOption[] = [
  { label: 'Stream 1', value: 'stream-1' },
  { label: 'Stream 2', value: 'stream-2' },
];