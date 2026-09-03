import axiosInstance from '@/lib/springboot/axios';
import { LoginCredentials, SignupCredentials, AuthResponse } from '../types';
import { clearTokens, setAccessToken } from '@/lib/springboot/auth-tokens';

const extractTokens = (data: any) => {
  const payload = data?.data ?? data;
  const accessToken =
    payload?.accessToken ??
    payload?.access_token ??
    payload?.token ??
    payload?.jwt ??
    payload?.tokens?.accessToken;
  const refreshToken =
    payload?.refreshToken ?? payload?.refresh_token ?? payload?.tokens?.refreshToken;

  return { payload, accessToken, refreshToken };
};

const extractError = (error: any, fallback: string) => {
  const payload = error?.response?.data;
  if (!payload) return error?.message || fallback;
  if (typeof payload === 'string') return payload;
  if (payload.message) return payload.message;
  if (payload.detail) return payload.detail;
  if (payload.error) return payload.error;
  const fieldErrors = Object.values(payload).flat().filter(Boolean);
  if (fieldErrors.length) return String(fieldErrors[0]);
  return fallback;
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const { email, password } = credentials;

    const { data, status } = await axiosInstance.post('/v1/auth/login', {
      email,
      password,
    });

    if (status !== 200) {
      return {
        success: false,
        error: data?.message || data?.detail || 'Login failed. Please try again.',
      };
    }

    const { payload, accessToken, refreshToken } = extractTokens(data);
    if (!accessToken) {
      return {
        success: false,
        error: 'Login succeeded but no access token was returned.',
      };
    }

    const user = {
      id: String(payload?.userId ?? payload?.id ?? payload?.user?.id ?? ''),
      name: payload?.fullName ?? payload?.userName ?? payload?.user?.name ?? '',
      email: payload?.email ?? payload?.user?.email ?? email,
    };
    setAccessToken(accessToken, refreshToken, user);

    return {
      success: true,
      user,
      token: accessToken,
    };
  } catch (error: any) {
    return {
      success: false,
      error: extractError(error, 'Login failed. Please try again.'),
    };
  }
};

export const signup = async (credentials: SignupCredentials): Promise<AuthResponse> => {
  try {
    const { userName, fullName, email, password, gender } = credentials;

    const { data, status } = await axiosInstance.post('/v1/auth/signup', {
      userName,
      fullName,
      email,
      password,
      gender,
    });

    if (status !== 201 && status !== 200) {
      return {
        success: false,
        error: data?.message || 'Signup failed. Please try again.',
      };
    }

    const { payload, accessToken, refreshToken } = extractTokens(data);
    const user = {
      id: String(payload?.userId ?? payload?.id ?? payload?.user?.id ?? ''),
      name: payload?.fullName ?? fullName,
      email: payload?.email ?? email,
    };
    if (accessToken) {
      setAccessToken(accessToken, refreshToken, user);
    }

    return {
      success: true,
      user,
      token: accessToken,
    };
  } catch (error: any) {
    return {
      success: false,
      error: extractError(error, 'Signup failed. Please try again.'),
    };
  }
};

export const logout = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    clearTokens();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Logout failed' };
  }
};
