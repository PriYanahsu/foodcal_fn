'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useBackendStatus } from '@/features/backendStatus';

/** A load past this is worth explaining; shorter ones just show the skeleton. */
const SLOW_AFTER_MS = 3_000;

/**
 * Wraps a page-shaped skeleton: announces the load to screen readers, fades in
 * after a beat so quick loads don't flash, and — if the wait drags on with the
 * server already up — says so in one quiet line instead of leaving the user
 * staring at a pulse. A cold server is explained by WakeUpBanner, so this stays
 * quiet then rather than saying the same thing twice.
 */
export function PageSkeleton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className="fc-loader-delay relative">
      <span className="sr-only">{label}</span>
      <SlowLoadNotice />
      {children}
    </div>
  );
}

function SlowLoadNotice() {
  const { status } = useBackendStatus();
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {slow && status === 'ready' && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center px-4"
        >
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-surface-1/90 px-3.5 py-1.5 text-xs font-medium text-fg-2 shadow-sm backdrop-blur-md">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
            </span>
            <span className="truncate">Still loading your data…</span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
