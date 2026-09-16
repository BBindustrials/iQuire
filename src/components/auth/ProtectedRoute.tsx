/* eslint-disable react-hooks/set-state-in-effect */
// ============================================================================
// iQuire — Protected Route
// ============================================================================
// Wraps routes that require authentication and/or a specific role.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types/auth.types';
import styles from './ProtectedRoute.module.css';

// ============================================================================
// Types
// ============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * If provided, the authenticated user must have this role.
   * If not provided, any authenticated user is allowed.
   */
  requiredRole?: UserRole;
  /**
   * Where to redirect if not authenticated.
   * Defaults to '/admin/login' for admin routes, '/login/student' otherwise.
   */
  redirectTo?: string;
}

// ============================================================================
// Loading Screen
// ============================================================================

const LoadingScreen: React.FC = () => (
  <div className={styles.loadingScreen}>
    <div className={styles.spinner}></div>
    <p className={styles.loadingText}>Verifying access...</p>
  </div>
);

// ============================================================================
// Component
// ============================================================================

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo,
}) => {
  const { isAuthenticated, isLoading, role, signOut } = useAuth();
  const location = useLocation();
  const [roleMismatch, setRoleMismatch] = useState(false);

  // Determine redirect target
  const defaultRedirect =
    requiredRole === 'admin' ? '/admin/login' : '/login/student';
  const finalRedirect = redirectTo ?? defaultRedirect;

  // --------------------------------------------------------------------------
  // Role mismatch handling — sign out non-admins trying to access admin routes
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (
      !isLoading &&
      isAuthenticated &&
      requiredRole &&
      role !== requiredRole &&
      !roleMismatch
    ) {
      setRoleMismatch(true);
      // Sign out silently, then let the redirect happen
      signOut().catch(() => {
        // ignore errors — signOut will clear state regardless
      });
    }
  }, [isLoading, isAuthenticated, requiredRole, role, roleMismatch, signOut]);

  // --------------------------------------------------------------------------
  // 1. Still loading initial session
  // --------------------------------------------------------------------------
  if (isLoading) {
    return <LoadingScreen />;
  }

  // --------------------------------------------------------------------------
  // 2. Not authenticated → redirect to login
  // --------------------------------------------------------------------------
  if (!isAuthenticated) {
    return <Navigate to={finalRedirect} state={{ from: location }} replace />;
  }

  // --------------------------------------------------------------------------
  // 3. Role required but user has different role → redirect (after signOut)
  // --------------------------------------------------------------------------
  if (requiredRole && role !== requiredRole) {
    // If signOut is in flight, keep showing loading to avoid flash
    if (roleMismatch) {
      return <LoadingScreen />;
    }
    return <Navigate to={finalRedirect} state={{ from: location }} replace />;
  }

  // --------------------------------------------------------------------------
  // 4. Allowed → render children
  // --------------------------------------------------------------------------
  return <>{children}</>;
};