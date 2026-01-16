import axiosInstance from '@/lib/axios';
import { LoginCredentials, SignupCredentials, AuthResponse } from '../types';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Login failed. Please try again.',
    };
  }
};

export const signup = async (credentials: SignupCredentials): Promise<AuthResponse> => {
  try {
    const { confirmPassword, ...signupData } = credentials;
    const response = await axiosInstance.post<AuthResponse>('/auth/signup', signupData);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Signup failed. Please try again.',
    };
  }
};
