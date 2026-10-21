/* eslint-disable react-hooks/set-state-in-effect */
// ============================================================================
// iQuire — Recruiter Verification Gate (Phase 12C.4 — fixed)
// ============================================================================
// Allows:
//   - verified recruiters → render children (dashboard)
//   - pending recruiters → /recruiter/pending (but NOT if already there)
//   - rejected recruiters → /recruiter/rejected (but NOT if already there)
//   - suspended recruiters → /recruiter/suspended (but NOT if already there)
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../integrations/supabase/client';
import styles from './RecruiterGate.module.css';

type Status = 'pending' | 'verified' | 'rejected' | 'suspended' | null;

const GATE_ROUTES = {
  pending: '/recruiter/pending',
  rejected: '/recruiter/rejected',
  suspended: '/recruiter/suspended',
};

interface RecruiterGateProps {
  children: React.ReactNode;
}

export const RecruiterGate: React.FC<RecruiterGateProps> = ({ children }) => {
  const { isAuthenticated, accountType, isLoading, profile } = useAuth();
  const location = useLocation();
  const [status, setStatus] = useState<Status>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  // --------------------------------------------------------------------------
  // Fetch verification status
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!profile?.id || accountType !== 'recruiter') {
      setStatusLoading(false);
      return;
    }

    let isMounted = true;

    const load = async () => {
      const { data } = await supabase
        .from('recruiter_profiles')
        .select('verification_status')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (!isMounted) return;

      setStatus((data?.verification_status as Status) ?? 'pending');
      setStatusLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [profile?.id, accountType]);

  // --------------------------------------------------------------------------
  // Loading screen
  // --------------------------------------------------------------------------
  if (isLoading || statusLoading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
        <p>Verifying access…</p>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Not authenticated → login
  // --------------------------------------------------------------------------
  if (!isAuthenticated) {
    return <Navigate to="/login/recruiter" replace />;
  }

  // --------------------------------------------------------------------------
  // Not a recruiter account → home
  // --------------------------------------------------------------------------
  if (accountType !== 'recruiter') {
    return <Navigate to="/" replace />;
  }

  // --------------------------------------------------------------------------
  // Determine target route based on status
  // --------------------------------------------------------------------------
  const targetGateRoute =
    status === 'pending' || status === 'rejected' || status === 'suspended'
      ? GATE_ROUTES[status]
      : null;

  const isOnGateRoute = Object.values(GATE_ROUTES).some((route) =>
    location.pathname.startsWith(route)
  );

  // --------------------------------------------------------------------------
  // Not verified
  //   - If already on the correct gate route → allow the page to render
  //   - If on a different gate route → redirect to the correct one
  //   - If on a dashboard route → redirect to the correct gate route
  // --------------------------------------------------------------------------
  if (targetGateRoute) {
    if (location.pathname === targetGateRoute) {
      // Already on the correct gate route → allow the page to render
      return <>{children}</>;
    }
    // Wrong page → redirect to the correct gate route
    return <Navigate to={targetGateRoute} replace />;
  }

  // --------------------------------------------------------------------------
  // Verified recruiter
  //   - If on a gate route → send to dashboard
  //   - Otherwise → render children
  // --------------------------------------------------------------------------
  if (status === 'verified') {
    if (isOnGateRoute) {
      return <Navigate to="/recruiter/dashboard" replace />;
    }
    return <>{children}</>;
  }

  // --------------------------------------------------------------------------
  // Fallback — unknown status → treat as pending
  // --------------------------------------------------------------------------
  if (location.pathname === GATE_ROUTES.pending) {
    return <>{children}</>;
  }
  return <Navigate to={GATE_ROUTES.pending} replace />;
};