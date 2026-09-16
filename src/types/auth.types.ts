// ============================================================================
// iQuire Auth Types
// ============================================================================

export type UserRole = 'student' | 'nysc' | 'recruiter' | 'admin';

export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

// ----------------------------------------------------------------------------
// Signup Form Data
// ----------------------------------------------------------------------------

export interface BaseSignupData {
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: Gender | '';
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  state: string;
  lga: string;
  agreeToTerms: boolean;
  marketingOptIn: boolean;
}

export interface StudentSignupData extends BaseSignupData {
  userType: 'student';
}

export interface NyscSignupData extends BaseSignupData {
  userType: 'nysc';
  yearOfDeployment: string;
  stateOfDeployment: string;
  cohortBatch: string;
  cohortStream: string;
}

export interface RecruiterSignupData {
  userType: 'recruiter';
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

export type SignupData = StudentSignupData | NyscSignupData | RecruiterSignupData;

// ----------------------------------------------------------------------------
// Login Form Data
// ----------------------------------------------------------------------------

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// ----------------------------------------------------------------------------
// Form Errors
// ----------------------------------------------------------------------------

export interface FormErrors {
  [key: string]: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  userId?: string;
  requiresVerification?: boolean;
  error?: string;
}

// ----------------------------------------------------------------------------
// Location Types
// ----------------------------------------------------------------------------

export interface NigerianState {
  code: string;
  name: string;
  lgas: string[];
}

// ----------------------------------------------------------------------------
// Dropdown Options
// ----------------------------------------------------------------------------

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
];// ============================================================================
// Profile (matches public.profiles table)
// ============================================================================

export interface Profile {
  id: string;
  role: UserRole;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say' | null;
  email: string;
  phone: string | null;
  country: string | null;
  state: string | null;
  lga: string | null;
  avatar_url: string | null;
  profile_completion: number;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  account_status: 'active' | 'suspended' | 'deleted';
  marketing_opt_in: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Auth Context Value
// ============================================================================

export interface AuthContextValue {
  user: import('@supabase/supabase-js').User | null;
  profile: Profile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}


