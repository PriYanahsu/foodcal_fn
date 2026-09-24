'use client';

import { useSyncExternalStore } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login as loginApi, signup as signupApi, logout as logoutApi } from '@/app/service';
import { LoginCredentials, SignupCredentials } from '../types';
import { getAuthUserSnapshot, subscribeAuth } from '@/lib/springboot/auth-tokens';

const toError = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);

export const useAuth = () => {
  const queryClient = useQueryClient();
  // Read from localStorage after hydration (null on the server), and kept in
  // sync whenever tokens are saved or cleared — login, logout, session expiry.
  const user = useSyncExternalStore(subscribeAuth, getAuthUserSnapshot, () => null);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await loginApi(credentials);
      if (!response.success || !response.token) {
        throw new Error(response.error || 'Login failed');
      }
      return response;
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
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await logoutApi();
      if (!response.success) throw new Error(response.error || 'Logout failed');
      return response;
    },
    onSuccess: () => {
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
