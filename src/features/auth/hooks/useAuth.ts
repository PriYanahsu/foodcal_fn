'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login as loginApi, signup as signupApi, logout as logoutApi } from '@/app/service';
import { AuthUser, LoginCredentials, SignupCredentials } from '../types';
import { getAuthUser, getUserId } from '@/lib/springboot/auth-tokens';

const toError = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);

export const useAuth = () => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = getAuthUser();
    if (stored?.id) {
      setUser(stored);
      return;
    }
    const id = getUserId();
    if (id) setUser({ id, name: '', email: '' });
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await loginApi(credentials);
      if (!response.success || !response.token) {
        throw new Error(response.error || 'Login failed');
      }
      return response;
    },
    onSuccess: (response) => {
      setUser(response.user ?? getAuthUser());
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (credentials: SignupCredentials) => {
      const response = await signupApi(credentials);
      if (!response.success) {
        throw new Error(response.error || 'Signup failed');
      }
      return response;
    },
    onSuccess: (response) => {
      if (response.token) setUser(response.user ?? getAuthUser());
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await logoutApi();
      if (!response.success) throw new Error(response.error || 'Logout failed');
      return response;
    },
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
    },
  });

  const login = async (credentials: LoginCredentials) => {
    signupMutation.reset();
    try {
      await loginMutation.mutateAsync(credentials);
      return { success: true as const };
    } catch (err) {
      return { success: false as const, error: toError(err, 'An unexpected error occurred') };
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    loginMutation.reset();
    try {
      const response = await signupMutation.mutateAsync(credentials);
      if (response.token) {
        return { success: true as const, authenticated: true as const };
      }
      return {
        success: true as const,
        authenticated: false as const,
        message: response.error || 'Account created. Please sign in.',
      };
    } catch (err) {
      return { success: false as const, error: toError(err, 'An unexpected error occurred') };
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      return { success: true as const };
    } catch {
      return { success: false as const };
    }
  };

  const mutationError = loginMutation.error ?? signupMutation.error;

  return {
    user,
    login,
    signup,
    logout,
    isLoading: loginMutation.isPending || signupMutation.isPending || logoutMutation.isPending,
    error: mutationError ? toError(mutationError, 'An unexpected error occurred') : null,
  };
};
