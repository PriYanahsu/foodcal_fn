'use client';

import { useState, useEffect } from 'react';
import { login as loginApi, signup as signupApi, logout as logoutApi } from '../services/auth.api';
import { AuthUser, LoginCredentials, SignupCredentials } from '../types';
import { getAccessToken, getAuthUser } from '@/lib/springboot/auth-tokens';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (getAccessToken()) setUser(getAuthUser());
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginApi(credentials);
      if (response.success && response.token) {
        setUser(response.user ?? getAuthUser());
        return { success: true };
      }
      setError(response.error || 'Login failed');
      return { success: false, error: response.error };
    } catch {
      setError('An unexpected error occurred');
      return { success: false, error: 'An unexpected error occurred' };
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
        if (response.token) {
          setUser(response.user ?? getAuthUser());
          return { success: true, authenticated: true };
        }
        return {
          success: true,
          authenticated: false,
          message: response.error || 'Account created. Please sign in.',
        };
      }
      setError(response.error || 'Signup failed');
      return { success: false, error: response.error };
    } catch {
      setError('An unexpected error occurred');
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutApi();
      setUser(null);
      return { success: true };
    } catch {
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return { user, login, signup, logout, isLoading, error };
};
