'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { IS_CONFIGURED, IS_LOCAL_BACKEND } from './config';
import { getServerSnapshot, getSnapshot, retryWake, startWake, subscribe } from './wakeService';

/**
 * Reads the shared wake-up state, and starts it on first mount. Safe to call
 * from as many components as you like — the underlying loop runs once.
 */
export function useBackendStatus() {
  const { status, startedAt } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    startWake();
  }, []);

  return {
    status,
    startedAt,
    isLocal: IS_LOCAL_BACKEND,
    isConfigured: IS_CONFIGURED,
    retry: retryWake,
  };
}
