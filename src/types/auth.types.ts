// ============================================================================
// iQuire Auth Types — Phase 11A.2
// ============================================================================

// ============================================================================
// Core Enums
// ============================================================================

export type AccountType = 'member' | 'recruiter' | 'admin';
export type AccountTier = 'guest' | 'verified';
export type UserRole = 'student' | 'alumni' | 'recruiter' | 'admin';
export type LegacyUserRole = 'student' | 'nysc' | 'recruiter' | 'admin';
export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';
export type EnrollmentStatus = 'applied' | 'active' | 'completed' | 'dropped';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type AccountStatus = 'active' | 'suspended' | 'deleted';

// ============================================================================
// Nigerian Geography
// ============================================================================

export interface NigerianState {
  code: string;
  name: string;
  lgas: string[];
}

// ============================================================================
// Profile
// ============================================================================

export interface Profile {
  id: string;
  account_type: AccountType;
  tier: AccountTier;
  role: LegacyUserRole;
  participant_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  gender: Gender | null;
  email: string;
  phone: string | null;
  country: string | null;
  state: string | null;
  lga: string | null;
  avatar_url: string | null;
  profile_completion: number;
  verification_status: VerificationStatus;
  account_status: AccountStatus;
  marketing_opt_in: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// User Roles (additive)
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
// Courses
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
// Cohorts
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
// Enrollments
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
  user: import('@supabase/supabase-js').User | null;
  profile: Profile | null;
  accountType: AccountType | null;
  tier: AccountTier | null;
  roles: UserRole[];
  isAuthenticated: boolean;
  isVerified: boolean;
  isAdmin: boolean;
  isRecruiter: boolean;
  isMember: boolean;
  isStudent: boolean;
  isAlumni: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshRoles: () => Promise<void>;
}

// ============================================================================
// Login form data
// ============================================================================

export interface LoginMemberData {
  identifier: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginRecruiterData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginAdminData {
  email: string;
  password: string;
}

// ============================================================================
// Form errors + responses
// ============================================================================

export interface FormErrors {
  [key: string]: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  userId?: string;
  requiresEmailVerification?: boolean;
  error?: string;
  redirectTo?: string;
}

// ============================================================================
// Dropdown options
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