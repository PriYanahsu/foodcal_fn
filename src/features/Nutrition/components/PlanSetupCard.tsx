'use client';

import { SparklesIcon } from '@heroicons/react/24/outline';
import { buttonClass } from '@/components/ui/fc';

/**
 * Phones: stands in for the calories tile until there's a plan, sized to fit the
 * one-screen grid. (Desktop shows the full PlanRequiredHero instead.)
 */
export default function PlanSetupCard({ onSetUpPlan }: { onSetUpPlan: () => void }) {
  return (
    <section
      aria-label="Set up your plan"
      className="flex shrink-0 flex-col gap-3 rounded-3xl border border-brand/35 bg-linear-160 from-brand/20 to-surface-1 to-70% p-4 short:gap-2.5 short:p-3"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand">
          <SparklesIcon className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-base font-bold leading-tight text-fg">
            Get your daily targets
          </span>
          <span className="block truncate text-xs text-muted">
            About 2 min · also fills in your profile
          </span>
        </span>
      </span>
      <button
        type="button"
        onClick={onSetUpPlan}
        className={buttonClass('primary', 'md', 'w-full short:h-11')}
      >
        Set up my plan
      </button>
    </section>
  );
}
