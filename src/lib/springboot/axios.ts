import axios from 'axios';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  SESSION_EXPIRED_PARAM,
} from './auth-tokens';
import { markBackendAlive, waitForBackend } from '@/features/backendStatus/wakeService';
import { COLD_START_STATUSES } from '@/features/backendStatus/config';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '');

const axiosInstance = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  // Holds the call while the free-tier instance cold starts, instead of
  // firing it into a 502. Resolves immediately once the server is awake.
  await waitForBackend();
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  const method = (config.method || 'get').toLowerCase();
  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
  if (isFormData || method === 'get' || method === 'head' || method === 'options') {
    if (config.headers) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

// Login/signup/refresh answer 401 for bad credentials, not an expired session.
const isAuthEndpoint = (url?: string) => Boolean(url?.includes('/v1/auth/'));

/** Both tokens are dead: drop them and send the user to sign in with a notice. */
const endSession = () => {
  clearTokens();
  if (typeof window === 'undefined' || window.location.pathname === '/login') return;
  window.location.href = `/login?view=login&${SESSION_EXPIRED_PARAM}=1`;
};

axiosInstance.interceptors.response.use(
  (res) => {
    markBackendAlive();
    return res;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // A real error response (400, 401, 500…) still proves the JVM is serving.
    if (status && !COLD_START_STATUSES.includes(status)) markBackendAlive();

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshing) {
      refreshing = (async () => {
        const refreshToken = getRefreshToken();
        if (!refreshToken) return null;
        try {
          const { data } = await axios.post(`${BACKEND_URL}/api/v1/auth/refresh-token`, {
            refreshToken,
          });
          if (!data?.accessToken) return null;
          setAccessToken(data.accessToken, data.refreshToken);
          return data.accessToken as string;
        } catch {
          // Refresh token expired or was rejected — the session is over.
          return null;
        }
      })().finally(() => {
        refreshing = null;
      });
    }

    const newToken = await refreshing;
    if (!newToken) {
      endSession();
      return Promise.reject(error);
    }
    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return axiosInstance(originalRequest);
  }
);

export default axiosInstance;
