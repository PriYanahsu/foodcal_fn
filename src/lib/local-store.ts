import { useSyncExternalStore } from 'react';

/** Fired on this tab whenever `setLocal` writes, so `useLocalValue` readers update. */
const LOCAL_STORE_EVENT = 'foodcal:local-store';

export const getLocal = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

export const setLocal = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(LOCAL_STORE_EVENT));
};

export const profileKey = (userId: string) => `profile_${userId}`;

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange); // other tabs
  window.addEventListener(LOCAL_STORE_EVENT, onChange); // this tab
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(LOCAL_STORE_EVENT, onChange);
  };
}

/**
 * Reads a JSON value from localStorage and re-renders when it changes. Renders
 * `fallback` on the server and during hydration, so SSR output always matches.
 * Pass `null` as the key to skip reading (e.g. before the user is known).
 */
export function useLocalValue<T>(key: string | null, fallback: T): T {
  const raw = useSyncExternalStore(
    subscribe,
    () => (key ? localStorage.getItem(key) : null),
    () => null
  );
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
