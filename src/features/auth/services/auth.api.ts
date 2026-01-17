import axiosInstance from '@/lib/axios';
import { LoginCredentials, SignupCredentials, AuthResponse } from '../types';
import { supabase } from '@/lib/supabaseClient';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const { email, password } = credentials;
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      return {
        success: false,
        error: loginError.message || 'Login failed. Please try again.',
      };
    }

    if (data?.session) {
      return {
        success: true,
        user: {
          id: data.user?.id || '',
          name: data.user?.user_metadata?.name || '',
          email: data.user?.email || email,
        },
        token: data.session.access_token,
      };
    }

    return {
      success: false,
      error: 'Login failed. Please try again.',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Login failed. Please try again.',
    };
  }
};

export const signup = async (credentials: SignupCredentials): Promise<AuthResponse> => {
  try {
    const { confirmPassword, name, email, password } = credentials;

    const { data, error: signupError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (signupError) {
      return {
        success: false,
        error: signupError.message || 'Signup failed. Please try again.',
      };
    }

    // Supabase may not return a session if email confirmation is required
    // In that case, data.user exists but data.session is null
    if (data?.user) {
      // If email confirmation is required, session will be null
      // User needs to confirm email before they can sign in
      if (data.session) {
        // Email confirmation is disabled or auto-confirmed
        return {
          success: true,
          user: {
            id: data.user.id,
            name: name,
            email: data.user.email || email,
          },
          token: data.session.access_token,
        };
      } else {
        // Email confirmation is required
        return {
          success: true,
          user: {
            id: data.user.id,
            name: name,
            email: data.user.email || email,
          },
          error: 'Please check your email to confirm your account before signing in.',
        };
      }
    }

    return {
      success: false,
      error: 'Signup failed. Please try again.',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Signup failed. Please try again.',
    };
  }
};


export const logout = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Logout failed' };
  }
};
