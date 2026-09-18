'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { IS_CONFIGURED, IS_LOCAL_BACKEND, WAKE_NOTICE_AFTER_MS } from './config';
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

  // Every page load starts in 'waking' until the first ping lands, even when the
  // server is already up. Keyed to the attempt's timestamp so a retry resets it.
  const [slowFor, setSlowFor] = useState(-1);

  useEffect(() => {
    if (status !== 'waking' || startedAt === 0) return;
    const remaining = Math.max(0, WAKE_NOTICE_AFTER_MS - (Date.now() - startedAt));
    const timer = setTimeout(() => setSlowFor(startedAt), remaining);
    return () => clearTimeout(timer);
  }, [status, startedAt]);

  return {
    status,
    startedAt,
    /** True only once the current wake has outlasted a warm server's reply — use this for UI copy. */
    isWakingSlowly: status === 'waking' && startedAt > 0 && slowFor === startedAt,
    isLocal: IS_LOCAL_BACKEND,
    isConfigured: IS_CONFIGURED,
    retry: retryWake,
  };
}
