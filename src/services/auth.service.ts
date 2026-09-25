// ============================================================================
// iQuire — Authentication Service (Phase 7A.3)
// ============================================================================
// Handles: register (member + recruiter), unified login, logout,
// fetch current profile, fetch current roles.
// ============================================================================

import { supabase } from '../integrations/supabase/client';
import type {
  RegisterMemberData,
  RegisterRecruiterData,
  LoginMemberData,
  LoginRecruiterData,
  AuthResponse,
  Profile,
  UserRole,
  AccountType,
} from '../types/auth.types';

// ============================================================================
// Error Mapping
// ============================================================================

const mapAuthError = (message: string): string => {
  const lower = message.toLowerCase();

  if (lower.includes('user already registered') || lower.includes('already exists')) {
    return 'An account with this email already exists. Please login instead.';
  }
  if (lower.includes('invalid login credentials')) {
    return 'Incorrect email/ID or password. Please try again.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please verify your email before logging in. Check your inbox.';
  }
  if (lower.includes('password') && lower.includes('short')) {
    return 'Password must be at least 8 characters.';
  }
  if (lower.includes('rate limit') || lower.includes('too many')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (lower.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }
  if (lower.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }

  return message || 'Something went wrong. Please try again.';
};

// ============================================================================
// Identify identifier type (email vs participant_id)
// ============================================================================

const isEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const looksLikeParticipantId = (value: string): boolean =>
  /^[a-z]+-[a-z]+-\d{4}$/i.test(value.trim());

// ============================================================================
// REGISTER — Member (self-service, guest tier)
// ============================================================================

export const registerMember = async (data: RegisterMemberData): Promise<AuthResponse> => {
  try {
    const { data: result, error } = await supabase.auth.signUp({
      email: data.email.trim().toLowerCase(),
      password: data.password,
      options: {
        data: {
          account_type: 'member',
          tier: 'guest',
          first_name: data.firstName.trim(),
          last_name: data.lastName.trim(),
          phone: data.phone.trim(),
          country: data.country,
          state: data.state,
          lga: data.lga,
          marketing_opt_in: data.marketingOptIn,
        },
      },
    });

    if (error) {
      return { success: false, message: mapAuthError(error.message), error: error.message };
    }

    const requiresEmailVerification = !result.session;

    // Optional: if they picked a course, create enrollment
    if (result.user && data.desiredCourseId) {
      const { error: enrollError } = await supabase.from('enrollments').insert({
        user_id: result.user.id,
        course_id: data.desiredCourseId,
        status: 'applied',
      });

      if (enrollError) {
        console.warn('[registerMember] Enrollment insert failed:', enrollError.message);
        // Non-blocking — account still created
      }
    }

    return {
      success: true,
      message: requiresEmailVerification
        ? 'Account created. Check your email to verify and continue.'
        : 'Welcome to IQuire!',
      userId: result.user?.id,
      requiresEmailVerification,
      redirectTo: '/dashboard',
    };
  } catch (err) {
    return { success: false, message: mapAuthError(String(err)), error: String(err) };
  }
};

// ============================================================================
// REGISTER — Recruiter
// ============================================================================

export const registerRecruiter = async (data: RegisterRecruiterData): Promise<AuthResponse> => {
  try {
    const { data: result, error } = await supabase.auth.signUp({
      email: data.workEmail.trim().toLowerCase(),
      password: data.password,
      options: {
        data: {
          account_type: 'recruiter',
          tier: 'guest',
          first_name: data.firstName.trim(),
          last_name: data.lastName.trim(),
          position: data.position.trim(),
          company_name: data.companyName.trim(),
          industry: data.industry,
          company_website: data.companyWebsite?.trim() || '',
          company_size: data.companySize || '',
          phone: data.phone.trim(),
          marketing_opt_in: data.marketingOptIn,
        },
      },
    });

    if (error) {
      return { success: false, message: mapAuthError(error.message), error: error.message };
    }

    const requiresEmailVerification = !result.session;

    return {
      success: true,
      message: requiresEmailVerification
        ? 'Recruiter account created. Check your work email to verify.'
        : 'Welcome to IQuire!',
      userId: result.user?.id,
      requiresEmailVerification,
      redirectTo: '/recruiter/dashboard',
    };
  } catch (err) {
    return { success: false, message: mapAuthError(String(err)), error: String(err) };
  }
};

// ============================================================================
// LOGIN — Member (email OR participant_id)
// ============================================================================

export const loginMember = async (data: LoginMemberData): Promise<AuthResponse> => {
  try {
    const identifier = data.identifier.trim();
    let email = identifier;

    // If it's NOT an email, assume participant_id and resolve to email
    if (!isEmail(identifier) && looksLikeParticipantId(identifier)) {
      const { data: profile, error: lookupError } = await supabase
        .from('profiles')
        .select('email, account_type')
        .eq('participant_id', identifier.toLowerCase())
        .maybeSingle();

      if (lookupError || !profile) {
        return {
          success: false,
          message: 'No account found with that IQuire ID.',
        };
      }

      if (profile.account_type === 'recruiter') {
        return {
          success: false,
          message: 'This is a recruiter account. Please use the Recruiter login.',
        };
      }

      email = profile.email;
    } else if (!isEmail(identifier)) {
      // Doesn't look like email or participant ID
      return {
        success: false,
        message: 'Enter a valid email or IQuire ID (e.g., swift-panda-1234).',
      };
    }

    // Sign in with the resolved email
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: data.password,
    });

    if (error) {
      return { success: false, message: mapAuthError(error.message), error: error.message };
    }

    // Confirm this is a member account (not recruiter)
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type, tier')
      .eq('id', authData.user.id)
      .single();

    if (profile?.account_type === 'recruiter') {
      await supabase.auth.signOut();
      return {
        success: false,
        message: 'This is a recruiter account. Please use the Recruiter login.',
      };
    }

    if (profile?.account_type === 'admin') {
      await supabase.auth.signOut();
      return {
        success: false,
        message: 'This is an admin account. Please use the Admin login.',
      };
    }

    // Success
    return {
      success: true,
      message: 'Welcome back!',
      userId: authData.user.id,
      redirectTo: '/dashboard',
    };
  } catch (err) {
    return { success: false, message: mapAuthError(String(err)), error: String(err) };
  }
};

// ============================================================================
// LOGIN — Recruiter (work email)
// ============================================================================

export const loginRecruiter = async (data: LoginRecruiterData): Promise<AuthResponse> => {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email.trim().toLowerCase(),
      password: data.password,
    });

    if (error) {
      return { success: false, message: mapAuthError(error.message), error: error.message };
    }

    // Verify recruiter account
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('id', authData.user.id)
      .single();

    if (profile?.account_type !== 'recruiter') {
      await supabase.auth.signOut();
      return {
        success: false,
        message: 'This is not a recruiter account.',
      };
    }

    return {
      success: true,
      message: 'Welcome back!',
      userId: authData.user.id,
      redirectTo: '/recruiter/dashboard',
    };
  } catch (err) {
    return { success: false, message: mapAuthError(String(err)), error: String(err) };
  }
};

// ============================================================================
// LOGIN — Admin (email)
// ============================================================================

export const loginAdmin = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return { success: false, message: mapAuthError(error.message), error: error.message };
    }

    // Verify admin account
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('id', authData.user.id)
      .single();

    if (profile?.account_type !== 'admin') {
      await supabase.auth.signOut();
      return {
        success: false,
        message: 'Access denied. This account is not an administrator.',
      };
    }

    return {
      success: true,
      message: 'Welcome back, Admin.',
      userId: authData.user.id,
      redirectTo: '/admin/dashboard',
    };
  } catch (err) {
    return { success: false, message: mapAuthError(String(err)), error: String(err) };
  }
};

// ============================================================================
// FETCH — Current Profile
// ============================================================================

export const fetchCurrentProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[fetchCurrentProfile] Error:', error.message);
    return null;
  }
  return data as Profile;
};

// ============================================================================
// FETCH — Current Roles (from user_roles)
// ============================================================================

export const fetchCurrentRoles = async (userId: string): Promise<UserRole[]> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .is('revoked_at', null);

  if (error) {
    console.error('[fetchCurrentRoles] Error:', error.message);
    return [];
  }

  // Deduplicate (a user could have multiple student roles for different courses)
  const uniqueRoles = Array.from(new Set((data ?? []).map((r) => r.role)));
  return uniqueRoles as UserRole[];
};

// ============================================================================
// LOGOUT
// ============================================================================

export const logout = async (): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.auth.signOut();
  if (error) return { success: false, error: error.message };
  return { success: true };
};

// ============================================================================
// RESEND VERIFICATION
// ============================================================================

export const resendVerificationEmail = async (email: string): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
    });

    if (error) return { success: false, message: mapAuthError(error.message) };

    return {
      success: true,
      message: 'Verification email resent. Please check your inbox.',
    };
  } catch (err) {
    return { success: false, message: mapAuthError(String(err)) };
  }
};

// ============================================================================
// FETCH — All published courses (used in register flow)
// ============================================================================

export const fetchPublishedCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select('id, slug, title, description')
    .eq('status', 'published')
    .order('title');

  if (error) {
    console.error('[fetchPublishedCourses] Error:', error.message);
    return [];
  }
  return data ?? [];
};

// ============================================================================
// HELPERS (exported for use in AuthContext)
// ============================================================================

export const getAccountTypeRedirect = (accountType: AccountType | null): string => {
  switch (accountType) {
    case 'admin':
      return '/admin/dashboard';
    case 'recruiter':
      return '/recruiter/dashboard';
    case 'member':
    default:
      return '/dashboard';
  }
};