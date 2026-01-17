'use client';
import { useState } from 'react';
import { login as loginApi, signup as signupApi } from '../services/auth.api';
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
        // Store token in localStorage or cookie
        localStorage.setItem('authToken', response.token);
        console.log("token", response.token);
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          console.log("user", JSON.stringify(response.user));
        }
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
        // Store token if available (may not be if email confirmation is required)
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
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

  return {
    login,
    signup,
    isLoading,
    error,
  };
};
