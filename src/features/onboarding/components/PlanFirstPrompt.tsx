'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { buttonClass } from '@/components/ui/fc';
import { ROUTES } from '@/constants/routes';
import { PHONE_QUERY, useMediaQuery } from '@/hooks/useMediaQuery';
import { useOnboarding } from '../hooks/useOnboarding';
import { START_PARAM } from './OnboardingFlow';

const PERKS = [
  'See how much of your day each meal uses',
  'Daily protein, carbs and fat targets',
  'Coach tips based on what you eat',
];

function PromptBody({ onScanAnyway }: { onScanAnyway: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-on-brand">
          <SparklesIcon className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <h2
            id="plan-first-title"
            className="font-display text-xl font-bold leading-tight text-fg"
          >
            Set up your plan first?
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-fg-2">
            You can scan right away, but without a plan we can&apos;t tell you how this meal fits
            your day. It takes about 2 minutes.
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-2 rounded-2xl border border-line bg-surface-2 p-4">
        {PERKS.map((perk) => (
          <li key={perk} className="flex items-center gap-2.5 text-sm text-fg-2">
            <CheckCircleIcon className="h-5 w-5 shrink-0 text-brand-ink" />
            {perk}
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-1">
        <Link
          href={`${ROUTES.WELCOME}?${START_PARAM}=plan`}
          className={buttonClass('primary', 'lg', 'w-full')}
        >
          Set up my plan · 2 min
        </Link>
        <button
          type="button"
          onClick={onScanAnyway}
          className={buttonClass('ghost', 'md', 'w-full')}
        >
          Scan without a plan
        </button>
      </div>
    </div>
  );
}

/**
 * Shown on the scan page to someone with no plan yet. A suggestion, not a wall:
 * "Scan without a plan" always works, and it's asked at most once a day.
 */
export function PlanFirstPrompt() {
  const { suggestPlanBeforeScan, scanWithoutPlan } = useOnboarding();
  const isPhone = useMediaQuery(PHONE_QUERY);
  // Saving the choice flips `suggestPlanBeforeScan` straight away (local-store notifies readers).
  const open = suggestPlanBeforeScan;
  const scanAnyway = scanWithoutPlan;

  useEffect(() => {
    if (!open || isPhone) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && scanAnyway();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  if (isPhone) {
    return (
      <BottomSheet open={open} onClose={scanAnyway} label="Set up your plan first?">
        <PromptBody onScanAnyway={scanAnyway} />
      </BottomSheet>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={scanAnyway}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--fc-scrim)] p-4 backdrop-blur-sm"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-first-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border border-line bg-surface-1 p-6 font-ui text-fg shadow-[var(--fc-shadow-pop)]"
          >
            <PromptBody onScanAnyway={scanAnyway} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
