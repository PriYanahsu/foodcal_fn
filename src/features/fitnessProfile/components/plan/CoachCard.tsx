'use client';

import { SparklesIcon } from '@heroicons/react/24/outline';
import type { FitnessDetails } from '@/features/userProfile';

/** The coach's written advice for the active plan. */
export default function CoachCard({
  fitness,
  onConsult,
}: {
  fitness: FitnessDetails | null;
  onConsult: () => void;
}) {
  const advice = fitness?.aiCoachAdvice;

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-line bg-surface-1 p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand-ink">
          <SparklesIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold leading-tight text-fg">Coach</h2>
          <p className="truncate text-caption text-muted">
            {fitness?.objective ? fitness.objective : 'No goal set yet'}
          </p>
        </div>
      </div>

      <p className="text-footnote leading-relaxed text-fg-2">
        {advice || 'Run a consultation and your coach will write advice for your plan here.'}
      </p>

      <button
        type="button"
        onClick={onConsult}
        className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface-2 text-sm font-bold text-fg transition-colors hover:bg-surface-3"
      >
        {advice ? 'Re-run consultation' : 'Start consultation'}
      </button>
    </section>
  );
}
