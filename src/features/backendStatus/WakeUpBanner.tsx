'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useBackendStatus } from './useBackendStatus';
import { EXPECTED_WAKE_MS, WAKE_NOTICE_AFTER_MS } from './config';

/** How long the "ready" confirmation stays up before dismissing itself. */
const READY_VISIBLE_MS = 3_500;

export function WakeUpBanner() {
  const { status, startedAt, isLocal, isConfigured, retry } = useBackendStatus();

  // All three are keyed to the current attempt's timestamp, so a retry — which
  // stamps a new one — brings the card back without anything resetting them.
  const [revealedFor, setRevealedFor] = useState(-1);
  const [hiddenFor, setHiddenFor] = useState(-1);
  const [dismissedFor, setDismissedFor] = useState(-1);
  const [now, setNow] = useState(0);

  // A warm server answers well inside WAKE_NOTICE_AFTER_MS, so the card never flashes
  // for it — and "ready" is only worth announcing if the user saw us waiting.
  const revealed = startedAt > 0 && revealedFor === startedAt;

  useEffect(() => {
    if (status !== 'waking') return;
    const timer = setTimeout(() => setRevealedFor(startedAt), WAKE_NOTICE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [status, startedAt]);

  useEffect(() => {
    if (status !== 'ready' || !revealed) return;
    const timer = setTimeout(() => setHiddenFor(startedAt), READY_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [status, startedAt, revealed]);

  const visible =
    dismissedFor === startedAt
      ? false
      : status === 'failed'
        ? true
        : status === 'waking'
          ? revealed
          : revealed && hiddenFor !== startedAt;

  // Ticked here rather than in the store, so the clock re-renders this one card
  // instead of every consumer once a second.
  useEffect(() => {
    if (status !== 'waking' || !visible) return;
    const interval = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(interval);
  }, [status, visible]);

  // Clamped, so a stale tick from the previous attempt can't read as negative.
  const elapsedMs = Math.max(0, now - startedAt);
  const seconds = Math.floor(elapsedMs / 1000);
  // Capped: the bar reassures that something is happening, it can't promise when.
  const progress = Math.min(95, (elapsedMs / EXPECTED_WAKE_MS) * 100);
  const copy = getCopy({ status, isLocal, isConfigured });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.22 }}
          className="fixed bottom-4 left-4 right-4 z-[185] md:left-1/2 md:right-auto md:w-[min(26rem,calc(100vw-2rem))] md:-translate-x-1/2"
        >
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)]/95 px-4 py-3.5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <StatusIcon status={status} />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-snug text-[var(--foreground)]">
                  {copy.title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">
                  {copy.detail}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDismissedFor(startedAt)}
                aria-label="Dismiss"
                className="-mr-1 -mt-1 shrink-0 rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {status === 'waking' && (
              <div className="mt-3 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-strong)]">
                  <motion.div
                    className="h-full rounded-full bg-[var(--primary)]"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.9, ease: 'linear' }}
                  />
                </div>
                <span className="shrink-0 font-mono text-[11px] tabular-nums text-[var(--text-muted)]">
                  {seconds}s
                </span>
              </div>
            )}

            {status === 'failed' && (
              <button
                type="button"
                onClick={retry}
                className="mt-3 w-full rounded-xl bg-[var(--btn-primary)] py-2 text-xs font-bold text-black transition-colors hover:bg-[var(--btn-primary-hover)]"
              >
                Try again
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function getCopy({
  status,
  isLocal,
  isConfigured,
}: {
  status: string;
  isLocal: boolean;
  isConfigured: boolean;
}) {
  if (!isConfigured) {
    return {
      title: 'API address missing',
      detail: 'NEXT_PUBLIC_BACKEND_URL is not set for this build, so there is nothing to call.',
    };
  }

  if (status === 'waking') {
    return isLocal
      ? { title: 'Connecting to local API', detail: 'Waiting for Spring Boot on port 8080.' }
      : {
          title: 'Starting the server',
          detail:
            'It sleeps when nobody is using it and takes about a minute to wake. Keep browsing — anything you submit is sent the moment it is up.',
        };
  }

  if (status === 'failed') {
    return isLocal
      ? {
          title: 'Local API not reachable',
          detail: 'Start the Spring Boot backend, then try again.',
        }
      : {
          title: 'Server is taking longer than usual',
          detail: 'It is still booting. Try again, or reload in a minute.',
        };
  }

  return {
    title: "You're connected",
    detail: 'The server is awake and your data will load normally.',
  };
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'ready') {
    return (
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/15 text-[var(--primary)]">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
    );
  }

  if (status === 'failed') {
    return (
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-400">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d="M12 8v5M12 17h.01" />
        </svg>
      </span>
    );
  }

  return (
    <span className="relative mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
      <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-[var(--primary)] opacity-70" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
    </span>
  );
}
