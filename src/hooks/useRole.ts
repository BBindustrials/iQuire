// ============================================================================
// iQuire — Role Hooks (Phase 7A.4)
// ============================================================================
// Convenience hooks for role checks across the app.
// ============================================================================

import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types/auth.types';

export const useIsAdmin = (): boolean => {
  const { isAdmin } = useAuth();
  return isAdmin;
};

export const useIsRecruiter = (): boolean => {
  const { isRecruiter } = useAuth();
  return isRecruiter;
};

export const useIsMember = (): boolean => {
  const { isMember } = useAuth();
  return isMember;
};

export const useIsStudent = (): boolean => {
  const { isStudent } = useAuth();
  return isStudent;
};

export const useIsAlumni = (): boolean => {
  const { isAlumni } = useAuth();
  return isAlumni;
};

export const useIsVerified = (): boolean => {
  const { isVerified } = useAuth();
  return isVerified;
};

/**
 * Check if user has ANY of the given roles
 */
export const useHasRole = (...checkRoles: UserRole[]): boolean => {
  const { roles } = useAuth();
  return checkRoles.some((role) => roles.includes(role));
};

/**
 * Get display name for current user
 */
export const useUserDisplayName = (): string => {
  const { profile } = useAuth();
  if (!profile) return '';
  return `${profile.first_name} ${profile.last_name}`.trim();
};