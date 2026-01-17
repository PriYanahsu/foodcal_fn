'use client';
import { useState } from 'react';
import { login as loginApi, signup as signupApi, logout as logoutApi } from '../services/auth.api';
import { LoginCredentials, SignupCredentials } from '../types';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        // Token is handled by cookie via supabase client
        // Show info message if email confirmation is required
        if (response.error && response.error.includes('email')) {
          // This is actually an info message, not an error
          setError(response.error);
        }
        return { success: true, message: response.error };
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
    login,
    signup,
    logout,
    isLoading,
    error,
  };
};
