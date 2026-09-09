import axios from 'axios';
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken } from './auth-tokens';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const axiosInstance = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
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

// let refreshing: Promise<string | null > | null = null;

// axiosInstance.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const originalRequest = error.config;
//     const status = error.response?.status;

//     if (status === 401 && !originalRequest._retry) {
//       return Promise.reject(error);
//     }

//     originalRequest._retry = true;
//     if (!refreshing) {
//       refreshing = (async () => {
//         const refreshToken = getRefreshToken();
//         if (!refreshToken) return null;
//         const { data } = await axios.post(`${BACKEND_URL}/api/auth/refresh`, {
//           refreshToken: refreshToken,
//         });
//         setAccessToken(data.accessToken, data.refreshToken);
//         return data.accessToken as string;
//       })().finally(() => {
//         refreshing = null;
//       });
//     }

//     const newToken = await refreshing;
//     if (!newToken) {
//       clearTokens();
//       if (typeof window !== 'undefined') window.location.href = '/login';
//       return Promise.reject(error);
//     }
//     originalRequest.headers.Authorization = `Bearer ${newToken}`;
//     return axiosInstance(originalRequest);
//   }
// );

export default axiosInstance;
