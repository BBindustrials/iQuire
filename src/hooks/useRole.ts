// ============================================================================
// iQuire — Role Hooks
// ============================================================================
// Convenience hooks for role checks across the app.
// ============================================================================

import { useAuth } from '../contexts/AuthContext';

export const useIsAdmin = (): boolean => {
  const { role } = useAuth();
  return role === 'admin';
};

export const useIsStudent = (): boolean => {
  const { role } = useAuth();
  return role === 'student';
};

export const useIsNysc = (): boolean => {
  const { role } = useAuth();
  return role === 'nysc';
};

export const useIsRecruiter = (): boolean => {
  const { role } = useAuth();
  return role === 'recruiter';
};

/**
 * Check if user has any of the given roles
 */
export const useHasRole = (...roles: string[]): boolean => {
  const { role } = useAuth();
  return !!role && roles.includes(role);
};

/**
 * Get display name for the current user
 */
export const useUserDisplayName = (): string => {
  const { profile } = useAuth();
  if (!profile) return '';
  return `${profile.first_name} ${profile.last_name}`.trim();
};