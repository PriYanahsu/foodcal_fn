'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface SuccessToastProps {
  message: string | null;
  detail?: string;
  onClose: () => void;
  durationMs?: number;
  actionLabel?: string;
  actionHref?: string;
}

export function SuccessToast({
  message,
  detail,
  onClose,
  durationMs = 4200,
  actionLabel,
  actionHref,
}: SuccessToastProps) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, durationMs);
    return () => clearTimeout(t);
  }, [message, durationMs, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: 'spring', damping: 24, stiffness: 320 }}
          className="fixed bottom-24 md:bottom-8 left-4 right-4 md:left-auto md:right-8 z-[200] md:max-w-sm"
          role="status"
        >
          <div className="rounded-2xl border border-[var(--primary)]/30 bg-[var(--background)] shadow-2xl p-4">
            <div className="flex gap-3 items-start">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-bold text-white leading-snug">{message}</p>
                {detail && (
                  <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{detail}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Dismiss"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            {actionLabel && actionHref && (
              <Link
                href={actionHref}
                onClick={onClose}
                className="mt-3 w-full inline-flex items-center justify-center gap-1.5 btn-primary py-2.5 text-xs font-bold rounded-xl"
              >
                {actionLabel}
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
