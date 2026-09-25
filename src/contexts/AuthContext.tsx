/* eslint-disable react-refresh/only-export-components */
// ============================================================================
// iQuire — Auth Context (Phase 7A.4)
// ============================================================================
// Global authentication state. Tracks user, profile, account type, tier,
// and additive roles. Syncs with Supabase session automatically.
// ============================================================================

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import {
  fetchCurrentProfile,
  fetchCurrentRoles,
} from '../services/auth.service';
import type {
  AuthContextValue,
  Profile,
  UserRole,
  AccountType,
  AccountTier,
} from '../types/auth.types';

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --------------------------------------------------------------------------
  // Fetch profile + roles together
  // --------------------------------------------------------------------------
  const loadUserData = useCallback(async (userId: string) => {
    const [freshProfile, freshRoles] = await Promise.all([
      fetchCurrentProfile(userId),
      fetchCurrentRoles(userId),
    ]);

    return { profile: freshProfile, roles: freshRoles };
  }, []);

  // --------------------------------------------------------------------------
  // Refresh profile (public method)
  // --------------------------------------------------------------------------
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const { profile: freshProfile } = await loadUserData(user.id);
    setProfile(freshProfile);
  }, [user, loadUserData]);

  // --------------------------------------------------------------------------
  // Refresh roles (public method)
  // --------------------------------------------------------------------------
  const refreshRoles = useCallback(async () => {
    if (!user) return;
    const freshRoles = await fetchCurrentRoles(user.id);
    setRoles(freshRoles);
  }, [user]);

  // --------------------------------------------------------------------------
  // Sign out
  // --------------------------------------------------------------------------
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setRoles([]);
  }, []);

  // --------------------------------------------------------------------------
  // Init + subscribe to auth state changes
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          const { profile: p, roles: r } = await loadUserData(session.user.id);
          if (isMounted) {
            setProfile(p);
            setRoles(r);
          }
        } else {
          setUser(null);
          setProfile(null);
          setRoles([]);
        }
      } catch (err) {
        console.error('[AuthContext] initAuth error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    // Subscribe to subsequent changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null);
          setProfile(null);
          setRoles([]);
          return;
        }

        if (
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED' ||
          event === 'USER_UPDATED'
        ) {
          setUser(session.user);
          const { profile: p, roles: r } = await loadUserData(session.user.id);
          if (isMounted) {
            setProfile(p);
            setRoles(r);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  // --------------------------------------------------------------------------
  // Derived values
  // --------------------------------------------------------------------------
  const accountType: AccountType | null = useMemo(
    () => profile?.account_type ?? null,
    [profile]
  );

  const tier: AccountTier | null = useMemo(
    () => profile?.tier ?? null,
    [profile]
  );

  const isAuthenticated = useMemo(() => !!user && !!profile, [user, profile]);
  const isVerified = useMemo(() => tier === 'verified', [tier]);

  const isAdmin = useMemo(() => accountType === 'admin', [accountType]);
  const isRecruiter = useMemo(() => accountType === 'recruiter', [accountType]);
  const isMember = useMemo(() => accountType === 'member', [accountType]);

  const isStudent = useMemo(() => roles.includes('student'), [roles]);
  const isAlumni = useMemo(() => roles.includes('alumni'), [roles]);

  // --------------------------------------------------------------------------
  // Context value
  // --------------------------------------------------------------------------
  const value: AuthContextValue = useMemo(
    () => ({
      user,
      profile,
      accountType,
      tier,
      roles,
      isAuthenticated,
      isVerified,
      isAdmin,
      isRecruiter,
      isMember,
      isStudent,
      isAlumni,
      isLoading,
      signOut,
      refreshProfile,
      refreshRoles,
    }),
    [
      user,
      profile,
      accountType,
      tier,
      roles,
      isAuthenticated,
      isVerified,
      isAdmin,
      isRecruiter,
      isMember,
      isStudent,
      isAlumni,
      isLoading,
      signOut,
      refreshProfile,
      refreshRoles,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================================================
// Hook
// ============================================================================

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
};