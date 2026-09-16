// ============================================================================
// iQuire — Authentication Service
// ============================================================================
// Centralizes all Supabase auth operations.
// All signup/login forms call into this file.
// ============================================================================

import { supabase } from '../integrations/supabase/client';
import type {
  StudentSignupData,
  NyscSignupData,
  RecruiterSignupData,
  LoginData,
} from '../types/auth.types';

// ============================================================================
// Response Types
// ============================================================================

export interface AuthResponse {
  success: boolean;
  message: string;
  userId?: string;
  requiresEmailVerification?: boolean;
  error?: string;
}

// ============================================================================
// Error Mapping — turn Supabase errors into user-friendly messages
// ============================================================================

const mapAuthError = (message: string): string => {
  const lower = message.toLowerCase();

  if (lower.includes('user already registered') || lower.includes('already exists')) {
    return 'An account with this email already exists. Please login instead.';
  }
  if (lower.includes('invalid login credentials')) {
    return 'Incorrect email or password. Please try again.';
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
// SIGNUP — Student
// ============================================================================

export const signupStudent = async (data: StudentSignupData): Promise<AuthResponse> => {
  try {
    const { data: result, error } = await supabase.auth.signUp({
      email: data.email.trim().toLowerCase(),
      password: data.password,
      options: {
        data: {
          role: 'student',
          first_name: data.firstName.trim(),
          middle_name: data.middleName?.trim() || '',
          last_name: data.lastName.trim(),
          gender: data.gender,
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

    // If Supabase requires email confirmation, session will be null
    const requiresEmailVerification = !result.session;

    return {
      success: true,
      message: requiresEmailVerification
        ? 'Account created. Please check your email to verify your account.'
        : 'Account created successfully.',
      userId: result.user?.id,
      requiresEmailVerification,
    };
  } catch (err) {
    return {
      success: false,
      message: mapAuthError(String(err)),
      error: String(err),
    };
  }
};

// ============================================================================
// SIGNUP — NYSC
// ============================================================================

export const signupNysc = async (data: NyscSignupData): Promise<AuthResponse> => {
  try {
    const { data: result, error } = await supabase.auth.signUp({
      email: data.email.trim().toLowerCase(),
      password: data.password,
      options: {
        data: {
          role: 'nysc',
          first_name: data.firstName.trim(),
          middle_name: data.middleName?.trim() || '',
          last_name: data.lastName.trim(),
          gender: data.gender,
          phone: data.phone.trim(),
          country: data.country,
          state: data.state,
          lga: data.lga,
          marketing_opt_in: data.marketingOptIn,
          year_of_deployment: data.yearOfDeployment,
          state_of_deployment: data.stateOfDeployment,
          cohort_batch: data.cohortBatch,
          cohort_stream: data.cohortStream,
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
        ? 'Account created. Please check your email to verify your account.'
        : 'Account created successfully.',
      userId: result.user?.id,
      requiresEmailVerification,
    };
  } catch (err) {
    return {
      success: false,
      message: mapAuthError(String(err)),
      error: String(err),
    };
  }
};

// ============================================================================
// SIGNUP — Recruiter
// ============================================================================

export const signupRecruiter = async (data: RecruiterSignupData): Promise<AuthResponse> => {
  try {
    const { data: result, error } = await supabase.auth.signUp({
      email: data.workEmail.trim().toLowerCase(),
      password: data.password,
      options: {
        data: {
          role: 'recruiter',
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
        ? 'Recruiter account created. Please check your work email to verify your account.'
        : 'Recruiter account created successfully.',
      userId: result.user?.id,
      requiresEmailVerification,
    };
  } catch (err) {
    return {
      success: false,
      message: mapAuthError(String(err)),
      error: String(err),
    };
  }
};

// ============================================================================
// LOGIN (shared — works for both student and recruiter)
// ============================================================================

export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const { data: result, error } = await supabase.auth.signInWithPassword({
      email: data.email.trim().toLowerCase(),
      password: data.password,
    });

    if (error) {
      return { success: false, message: mapAuthError(error.message), error: error.message };
    }

    return {
      success: true,
      message: 'Login successful.',
      userId: result.user?.id,
    };
  } catch (err) {
    return {
      success: false,
      message: mapAuthError(String(err)),
      error: String(err),
    };
  }
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
// RESEND VERIFICATION EMAIL
// ============================================================================

export const resendVerificationEmail = async (email: string): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
    });

    if (error) {
      return { success: false, message: mapAuthError(error.message) };
    }

    return {
      success: true,
      message: 'Verification email resent. Please check your inbox.',
    };
  } catch (err) {
    return { success: false, message: mapAuthError(String(err)) };
  }
};

// ============================================================================
// FETCH CURRENT USER PROFILE
// ============================================================================

export const getCurrentProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return null;
  return data;
};