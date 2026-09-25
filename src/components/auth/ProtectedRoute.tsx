/* eslint-disable react-hooks/set-state-in-effect */
// ============================================================================
// iQuire — Protected Route (Phase 7A.4)
// ============================================================================
// Wraps routes that require authentication and/or a specific account type.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { AccountType } from '../../types/auth.types';
import styles from './ProtectedRoute.module.css';

// ============================================================================
// Types
// ============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * If provided, user's account_type must match.
   * e.g., 'admin' | 'recruiter' | 'member'
   */
  requiredAccountType?: AccountType;
  /**
   * Where to redirect if not authenticated.
   * Defaults to '/admin/login' for admin routes, '/login' otherwise.
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
  requiredAccountType,
  redirectTo,
}) => {
  const { isAuthenticated, isLoading, accountType, signOut } = useAuth();
  const location = useLocation();
  const [accountMismatch, setAccountMismatch] = useState(false);

  // Determine redirect target
  const defaultRedirect =
    requiredAccountType === 'admin' ? '/admin/login' : '/login';
  const finalRedirect = redirectTo ?? defaultRedirect;

  // --------------------------------------------------------------------------
  // Account type mismatch → sign out
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (
      !isLoading &&
      isAuthenticated &&
      requiredAccountType &&
      accountType !== requiredAccountType &&
      !accountMismatch
    ) {
      setAccountMismatch(true);
      signOut().catch(() => {
        // ignore
      });
    }
  }, [
    isLoading,
    isAuthenticated,
    requiredAccountType,
    accountType,
    accountMismatch,
    signOut,
  ]);

  // --------------------------------------------------------------------------
  // 1. Loading
  // --------------------------------------------------------------------------
  if (isLoading) {
    return <LoadingScreen />;
  }

  // --------------------------------------------------------------------------
  // 2. Not authenticated → redirect
  // --------------------------------------------------------------------------
  if (!isAuthenticated) {
    return <Navigate to={finalRedirect} state={{ from: location }} replace />;
  }

  // --------------------------------------------------------------------------
  // 3. Account type required but mismatched → redirect
  // --------------------------------------------------------------------------
  if (requiredAccountType && accountType !== requiredAccountType) {
    if (accountMismatch) {
      return <LoadingScreen />;
    }
    return <Navigate to={finalRedirect} state={{ from: location }} replace />;
  }

  // --------------------------------------------------------------------------
  // 4. Allowed
  // --------------------------------------------------------------------------
  return <>{children}</>;
};