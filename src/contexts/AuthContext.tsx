// ============================================================================
// iQuire — Auth Context
// ============================================================================
// Global authentication state provider.
// Wraps the entire app and syncs with Supabase session.
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
import type { AuthContextValue, Profile, UserRole } from '../types/auth.types';

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
  const [isLoading, setIsLoading] = useState(true);

  // --------------------------------------------------------------------------
  // Fetch profile from public.profiles for a given user id
  // --------------------------------------------------------------------------
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[AuthContext] Failed to fetch profile:', error.message);
      return null;
    }
    return data as Profile;
  }, []);

  // --------------------------------------------------------------------------
  // Refresh profile manually (used after profile updates)
  // --------------------------------------------------------------------------
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const freshProfile = await fetchProfile(user.id);
    setProfile(freshProfile);
  }, [user, fetchProfile]);

  // --------------------------------------------------------------------------
  // Sign out
  // --------------------------------------------------------------------------
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  // --------------------------------------------------------------------------
  // Initialize + subscribe to auth state changes
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    // Bootstrap: check current session on mount
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          const p = await fetchProfile(session.user.id);
          if (isMounted) setProfile(p);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('[AuthContext] initAuth error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    // Subscribe to subsequent auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null);
          setProfile(null);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          setUser(session.user);
          const p = await fetchProfile(session.user.id);
          if (isMounted) setProfile(p);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // --------------------------------------------------------------------------
  // Derived values
  // --------------------------------------------------------------------------
  const role: UserRole | null = useMemo(() => profile?.role ?? null, [profile]);
  const isAuthenticated = useMemo(() => !!user && !!profile, [user, profile]);

  // --------------------------------------------------------------------------
  // Context value
  // --------------------------------------------------------------------------
  const value: AuthContextValue = useMemo(
    () => ({
      user,
      profile,
      role,
      isAuthenticated,
      isLoading,
      signOut,
      refreshProfile,
    }),
    [user, profile, role, isAuthenticated, isLoading, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================================================
// Hook
// ============================================================================

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
};