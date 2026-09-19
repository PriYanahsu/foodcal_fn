'use client';

import Link from 'next/link';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { buttonClass } from '@/components/ui/fc';

interface CoachCardProps {
  hasPlan: boolean;
  objective: string;
  advice: string;
  onSetUpPlan: () => void;
}

export default function CoachCard({ hasPlan, objective, advice, onSetUpPlan }: CoachCardProps) {
  return (
    <section
      aria-label="Coach"
      className="flex flex-col gap-4 rounded-3xl border border-brand/35 bg-[linear-gradient(160deg,rgb(118_185_0/0.18),rgb(118_185_0/0.04)_65%)] p-5 md:p-6"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand">
          <SparklesIcon className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold leading-tight text-fg">
            {hasPlan ? 'Coach' : 'Set up your plan'}
          </h2>
          <p className="truncate text-xs text-muted">
            {hasPlan ? `Plan active · ${objective.toLowerCase()}` : 'Takes under 2 minutes'}
          </p>
        </div>
      </div>

      <p className="text-[15px] leading-relaxed text-fg-2">
        {hasPlan
          ? advice || 'Log a few meals and your coach will start suggesting what to eat next.'
          : 'Answer a few questions and get daily calorie, protein, carbs and fat targets built for your body.'}
      </p>

      {hasPlan ? (
        <Link href="/fitness" className={buttonClass('primary', 'sm', 'w-fit')}>
          View plan
        </Link>
      ) : (
        <button
          type="button"
          onClick={onSetUpPlan}
          className={buttonClass('primary', 'sm', 'w-fit')}
        >
          Set up my plan
        </button>
      )}
    </section>
  );
}
