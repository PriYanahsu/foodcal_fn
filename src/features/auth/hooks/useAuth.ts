'use client';

import { useState, useEffect } from 'react';
import { login as loginApi, signup as signupApi, logout as logoutApi } from '../services/auth.api';
import { LoginCredentials, SignupCredentials } from '../types';
import { createClient } from '@/lib/supabase/client';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginApi(credentials);
      if (response.success && response.token) {
        // Token is handled by cookie via supabase client
        return { success: true };
      } else {
        setError(response.error || 'Login failed');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await signupApi(credentials);
      if (response.success) {
        // Session cookie is set by supabase signUp when email confirm is off
        if (response.token) {
          return { success: true, authenticated: true };
        }
        // Email confirmation required — no session yet
        return {
          success: true,
          authenticated: false,
          message: response.error || 'Please check your email to confirm your account.',
        };
      } else {
        setError(response.error || 'Signup failed');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutApi();
      // Clear any local state if needed (though cookies handle mostly everything)
      return { success: true };
    } catch (error) {
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    login,
    signup,
    logout,
    isLoading,
    error,
  };
};
