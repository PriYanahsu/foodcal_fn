'use client';

import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { buttonClass } from '@/components/ui/fc';

const PERKS = [
  'Daily calorie, protein, carbs and fat targets',
  'Your profile filled in: age, height, weight, activity and goal',
  'Coach tips based on what you eat',
];

/**
 * Stands in for the calories card until there's a plan: one clear next step, no empty
 * ring or macro bars. `compact` is the phone tile, which must fit the one-screen grid.
 */
export default function PlanSetupCard({
  onSetUpPlan,
  compact = false,
}: {
  onSetUpPlan: () => void;
  compact?: boolean;
}) {
  if (compact) {
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

  return (
    <section
      aria-label="Set up your plan"
      className="grid items-center gap-6 rounded-3xl border border-brand/35 bg-linear-160 from-brand/15 to-surface-1 to-70% p-6 md:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-10"
    >
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-on-brand">
            <SparklesIcon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold leading-tight text-fg">
              Set up your plan to start tracking
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-fg-2">
              Answer a few questions (about 2 minutes). Your answers set your daily targets and
              complete your profile, so there&apos;s nothing to fill in twice. Only your photo is
              left to add in Profile.
            </p>
          </div>
        </div>
        <ul className="flex flex-col gap-2">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-2.5 text-sm text-fg-2">
              <CheckCircleIcon className="h-5 w-5 shrink-0 text-brand-ink" />
              {perk}
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        onClick={onSetUpPlan}
        className={buttonClass('primary', 'lg', 'w-full lg:w-auto')}
      >
        Set up my plan
      </button>
    </section>
  );
}
