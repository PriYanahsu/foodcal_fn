'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

interface SuccessToastProps {
  message: string | null;
  detail?: string;
  onClose: () => void;
  durationMs?: number;
  actionLabel?: string;
  actionHref?: string;
}

/**
 * Confirmation for something that just succeeded — a logged meal, a saved plan.
 *
 * It sits above the phone's tab bar and in the bottom-right corner on desktop,
 * and deliberately does not cover or blur the app: the work is done, so the
 * screen behind stays usable. It leaves on its own, on a swipe down, on the ×,
 * or when its action is taken, and it holds while the pointer rests on it.
 *
 * Portalled to the body because pages sit inside animated (transformed)
 * ancestors, which would otherwise anchor `fixed` to them.
 */
export function SuccessToast({
  message,
  detail,
  onClose,
  durationMs = 4200,
  actionLabel,
  actionHref,
}: SuccessToastProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  // Held against the message it was paused on, so a new toast is never born paused.
  const [pausedFor, setPausedFor] = useState<string | null>(null);
  // Bumped when the countdown should start over, e.g. after a pointer leaves.
  const [cycle, setCycle] = useState(0);
  const paused = pausedFor !== null && pausedFor === message;
  const hasAction = Boolean(actionLabel && actionHref);

  useEffect(() => {
    if (!message || paused) return;
    const timer = setTimeout(onClose, durationMs);
    return () => clearTimeout(timer);
  }, [message, paused, cycle, durationMs, onClose]);

  const takeAction = () => {
    if (!actionHref) return;
    onClose();
    router.push(actionHref);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {message && (
        <motion.div
          key="success-toast"
          role="status"
          aria-live="polite"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
          transition={{ type: 'spring', damping: 26, stiffness: 340, mass: 0.8 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.6 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 56 || info.velocity.y > 500) onClose();
          }}
          onPointerEnter={() => setPausedFor(message)}
          onPointerLeave={() => {
            setPausedFor(null);
            setCycle((n) => n + 1);
          }}
          className="fixed inset-x-3 bottom-[calc(68px+env(safe-area-inset-bottom)+0.75rem)] z-[200] font-ui md:inset-x-auto md:bottom-6 md:right-6 md:w-[22rem]"
        >
          <div className="overflow-hidden rounded-2xl border border-line bg-surface-1 shadow-[var(--fc-shadow-pop)]">
            <div className="flex items-start gap-3 p-3.5">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand">
                <CheckIcon className="h-5 w-5" strokeWidth={2.5} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold leading-snug text-fg">{message}</p>
                {detail && (
                  <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-muted">
                    {detail}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Dismiss"
                className="-m-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            {hasAction && (
              <button
                type="button"
                onClick={takeAction}
                className="flex w-full items-center justify-between gap-2 border-t border-line px-3.5 py-2.5 text-[13px] font-bold text-brand-ink transition-colors hover:bg-surface-2"
              >
                {actionLabel}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            )}

            {/* How long is left, without a number to read. */}
            <div className="h-0.5 bg-surface-3">
              <motion.div
                key={`${message}-${cycle}`}
                initial={{ scaleX: 1 }}
                animate={{ scaleX: paused ? 1 : 0 }}
                transition={{ duration: paused ? 0 : durationMs / 1000, ease: 'linear' }}
                className="h-full origin-left bg-brand"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
