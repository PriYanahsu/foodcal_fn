'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useBackendStatus } from './useBackendStatus';
import { EXPECTED_WAKE_MS, WAKE_NOTICE_AFTER_MS } from './config';

/** How long the "ready" confirmation stays up before dismissing itself. */
const READY_VISIBLE_MS = 2_500;

/** Tablets and up have room to show the details; phones start as a one-line pill. */
const EXPANDED_BY_DEFAULT_QUERY = '(min-width: 768px)';

type Status = 'waking' | 'ready' | 'failed';

export function WakeUpBanner({ hasTabBar = false }: { hasTabBar?: boolean }) {
  const { status, startedAt, isLocal, isConfigured, retry } = useBackendStatus();
  const reduceMotion = useReducedMotion();

  // All three are keyed to the current attempt's timestamp, so a retry — which
  // stamps a new one — brings the card back without anything resetting them.
  const [revealedFor, setRevealedFor] = useState(-1);
  const [hiddenFor, setHiddenFor] = useState(-1);
  const [dismissedFor, setDismissedFor] = useState(-1);
  const [now, setNow] = useState(0);
  // Never rendered on the server (the card only appears after a timer), so
  // reading the viewport here can't cause a hydration mismatch.
  const [expanded, setExpanded] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(EXPANDED_BY_DEFAULT_QUERY).matches
  );
  const queryClient = useQueryClient();
  const previousStatus = useRef(status);

  // Calls held past GATE_HOLD_MS were released to fail. When a late boot finally
  // answers, rerun whatever errored so the page fills in without a reload.
  useEffect(() => {
    if (previousStatus.current === 'failed' && status === 'ready') {
      void queryClient.refetchQueries({ predicate: (query) => query.state.status === 'error' });
    }
    previousStatus.current = status;
  }, [status, queryClient]);

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
  // instead of every consumer once a second. Keeps counting while "failed",
  // because the loop is still trying.
  useEffect(() => {
    if (status === 'ready' || !visible) return;
    const interval = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(interval);
  }, [status, visible]);

  // Clamped, so a stale tick from the previous attempt can't read as negative.
  const elapsedMs = Math.max(0, now - startedAt);
  // Capped: the ring reassures that something is happening, it can't promise when.
  const progress =
    status === 'waking' ? Math.min(0.95, Math.max(0.04, elapsedMs / EXPECTED_WAKE_MS)) : 1;
  const copy = getCopy({ status, isLocal, isConfigured, elapsedMs });
  const showClock = status !== 'ready' && isConfigured;

  // Phones: float just above the bottom tab bar so navigation stays reachable.
  // Tablets and laptops: a corner card, clear of the sidebar and page content.
  const position = hasTabBar
    ? 'bottom-[calc(68px+env(safe-area-inset-bottom)+12px)]'
    : 'bottom-[calc(env(safe-area-inset-bottom)+16px)]';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="wake-banner"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className={`pointer-events-none fixed inset-x-0 z-185 flex justify-center px-4 ${position} md:inset-x-auto md:bottom-6 md:right-6 md:px-0`}
        >
          <motion.div
            layout={!reduceMotion}
            className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border bg-surface-1/95 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl md:w-92 md:max-w-none ${toneBorder(status)}`}
          >
            <div className="flex items-center gap-1 py-2 pl-2.5 pr-1.5">
              <button
                type="button"
                onClick={() => setExpanded((open) => !open)}
                aria-expanded={expanded}
                aria-controls="wake-banner-details"
                className="flex min-w-0 flex-1 items-center gap-3 rounded-xl py-1 pl-0.5 pr-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
              >
                <ProgressRing status={status} progress={progress} reduceMotion={!!reduceMotion} />

                <span className="min-w-0 flex-1" role="status" aria-live="polite">
                  <span className="block truncate font-display text-[15px] font-semibold leading-tight text-fg">
                    {copy.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs leading-tight text-muted">
                    {copy.subtitle}
                  </span>
                </span>

                {showClock && (
                  <span
                    aria-hidden
                    className="shrink-0 rounded-full bg-surface-3/70 px-2 py-0.5 font-mono text-[11px] tabular-nums text-muted"
                  >
                    {formatClock(elapsedMs)}
                  </span>
                )}

                {status !== 'ready' && (
                  <svg
                    aria-hidden
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`shrink-0 text-muted transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                  >
                    <path d="m18 15-6-6-6 6" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                onClick={() => setDismissedFor(startedAt)}
                aria-label="Hide server status"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-3/70 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
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

            <AnimatePresence initial={false}>
              {expanded && status !== 'ready' && (
                <motion.div
                  id="wake-banner-details"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
                >
                  <div className="border-t border-line/70 px-4 pb-4 pt-3">
                    {status === 'waking' && isConfigured && (
                      <Steps elapsedMs={elapsedMs} isLocal={isLocal} />
                    )}

                    <p className="text-[13px] leading-relaxed text-muted">{copy.detail}</p>

                    {status === 'failed' && isConfigured && (
                      <button
                        type="button"
                        onClick={retry}
                        className="mt-3 w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1"
                      >
                        Check now
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------- pieces --- */

function toneBorder(status: Status) {
  if (status === 'ready') return 'border-brand/40';
  if (status === 'failed') return 'border-warn/40';
  return 'border-line';
}

/** Circular progress with the state icon in its centre — readable at a glance, even collapsed. */
function ProgressRing({
  status,
  progress,
  reduceMotion,
}: {
  status: Status;
  progress: number;
  reduceMotion: boolean;
}) {
  const size = 36;
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = status === 'failed' ? 'text-warn' : 'text-brand';

  return (
    <span className={`relative flex h-9 w-9 shrink-0 items-center justify-center ${color}`}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="opacity-15"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: circumference * (1 - progress) }}
          transition={{ duration: reduceMotion ? 0 : 0.9, ease: 'linear' }}
        />
      </svg>

      <span className="absolute inset-0 flex items-center justify-center">
        {status === 'ready' ? (
          <motion.svg
            initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 24 }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20 6 9 17l-5-5" />
          </motion.svg>
        ) : status === 'failed' ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.75"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M12 7v6M12 17h.01" />
          </svg>
        ) : (
          <span className="relative flex h-2.5 w-2.5">
            {!reduceMotion && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
            )}
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-current" />
          </span>
        )}
      </span>
    </span>
  );
}

/**
 * Rough phases of a cold start, advanced by elapsed time. They set expectations
 * for a wait we can't measure from outside — the real signal is the ping landing.
 */
const PHASES = [
  { label: 'Reaching the server', until: 15_000 },
  { label: 'Starting the app', until: 70_000 },
  { label: 'Connecting to your data', until: Infinity },
];

function Steps({ elapsedMs, isLocal }: { elapsedMs: number; isLocal: boolean }) {
  if (isLocal) return null;
  const current = PHASES.findIndex((phase) => elapsedMs < phase.until);

  return (
    <ol className="mb-3 space-y-2" aria-label="Startup progress">
      {PHASES.map((phase, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={phase.label} className="flex items-center gap-2.5 text-[13px]">
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                done ? 'bg-brand text-on-brand' : active ? 'border-2 border-brand' : 'border-2 border-line-strong'
              }`}
            >
              {done && (
                <svg
                  width="9"
                  height="9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </span>
            <span className={done ? 'text-muted' : active ? 'font-medium text-fg' : 'text-muted/70'}>
              {phase.label}
              {active && <span className="sr-only"> (in progress)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function formatClock(ms: number) {
  const total = Math.floor(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function getCopy({
  status,
  isLocal,
  isConfigured,
  elapsedMs,
}: {
  status: Status;
  isLocal: boolean;
  isConfigured: boolean;
  elapsedMs: number;
}) {
  if (!isConfigured) {
    return {
      title: 'API address missing',
      subtitle: 'This build has no backend URL',
      detail: 'NEXT_PUBLIC_BACKEND_URL is not set for this build, so there is nothing to call.',
    };
  }

  if (status === 'waking') {
    if (isLocal) {
      return {
        title: 'Connecting to local API',
        subtitle: 'Waiting for Spring Boot on :8080',
        detail: 'Start the backend if it is not running — this connects on its own once it is up.',
      };
    }
    return {
      title: elapsedMs < 60_000 ? 'Waking up the server' : 'Almost there',
      subtitle: 'Usually takes 1–2 min',
      detail:
        'The server sleeps when nobody is using it. You can keep using the app — anything you save is sent the moment it is ready.',
    };
  }

  if (status === 'failed') {
    return isLocal
      ? {
          title: 'Local API not reachable',
          subtitle: 'Still checking in the background',
          detail: 'Start the Spring Boot backend — this reconnects automatically once it answers.',
        }
      : {
          title: 'Taking longer than usual',
          subtitle: 'Still trying in the background',
          detail:
            'The server is still starting. We keep checking and will connect on our own — no need to reload.',
        };
  }

  return {
    title: "You're connected",
    subtitle: 'Everything is loading normally',
    detail: '',
  };
}
