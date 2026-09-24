import { AuthUser } from '@/features/auth/types';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'auth_user';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

/** Query param on /login that shows the "session expired" notice. */
export const SESSION_EXPIRED_PARAM = 'sessionExpired';

const setCookie = (name: string, value: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`;
};

const clearCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Max-Age=0`;
};

export const getAccessToken = () =>
  typeof window === 'undefined' ? null : localStorage.getItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = () =>
  typeof window === 'undefined' ? null : localStorage.getItem(REFRESH_TOKEN_KEY);

export const getAuthUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

export const getUserId = (): string | null => {
  const stored = getAuthUser()?.id;
  if (stored) return stored;
  const token = getAccessToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const id = payload.id ?? payload.sub;
    return typeof id === 'string' && id ? id : null;
  } catch {
    return null;
  }
};

const AUTH_CHANGE_EVENT = 'auth-change';

const notifyAuthChange = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

/** Calls `onChange` when tokens change in this tab or another one. */
export const subscribeAuth = (onChange: () => void) => {
  window.addEventListener(AUTH_CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
};

let cachedUser: AuthUser | null = null;

/**
 * Signed-in user for useSyncExternalStore. Returns the same object while the
 * user is unchanged, so a token refresh does not re-render every consumer.
 */
export const getAuthUserSnapshot = (): AuthUser | null => {
  const stored = getAuthUser();
  let next: AuthUser | null = null;
  if (stored?.id) next = stored;
  else {
    const id = getUserId();
    if (id) next = { id, name: '', email: '' };
  }
  if (
    next?.id !== cachedUser?.id ||
    next?.name !== cachedUser?.name ||
    next?.email !== cachedUser?.email
  ) {
    cachedUser = next;
  }
  return cachedUser;
};

export const setAuthUser = (user: AuthUser) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyAuthChange();
};

export const setAccessToken = (accessToken: string, refreshToken?: string, user?: AuthUser) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  setCookie(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    setCookie(REFRESH_TOKEN_KEY, refreshToken);
  }
  if (user) setAuthUser(user);
  else notifyAuthChange();
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  clearCookie(ACCESS_TOKEN_KEY);
  clearCookie(REFRESH_TOKEN_KEY);
  notifyAuthChange();
};
