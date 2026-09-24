'use client';

import Link from 'next/link';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { Spinner } from '@/components/ui/fc';
import { ROUTES } from '@/constants/routes';
import BodyGoalsFields from './BodyGoalsFields';
import PlanTargets from './PlanTargets';
import { BodyGoalsCardProps } from '../type';

export default function BodyGoalsCard({
  fitness,
  goal,
  dirty,
  saving,
  missingCount,
  canConsult,
  highlightConsult,
  onChange,
  onReset,
  onSave,
  onConsult,
}: BodyGoalsCardProps) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-line bg-surface-1 p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-fg">Body and goals</h2>
            {missingCount > 0 && (
              <span className="rounded-full bg-warn/15 px-2 py-0.5 text-caption font-bold text-warn">
                {missingCount} missing
              </span>
            )}
          </div>
          <p className="mt-0.5 text-subhead text-muted">
            Changing these re-runs your coach so targets stay accurate.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {dirty && (
            <button
              type="button"
              onClick={onReset}
              disabled={saving}
              className="h-10 rounded-xl px-4 text-sm font-bold text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-60"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty || saving}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && <Spinner className="h-4 w-4" />}
            Save and update plan
          </button>
        </div>
      </div>

      {missingCount > 0 && !dirty && (
        <div className="flex flex-col gap-3 rounded-2xl border border-brand/30 bg-brand/10 p-4 sm:flex-row sm:items-center">
          <p className="min-w-0 flex-1 text-sm leading-relaxed text-fg-2">
            <span className="font-bold text-fg">Skip the typing.</span> Set up your plan and
            we&apos;ll fill in all of these for you, plus your daily targets. Only your photo is
            left after that.
          </p>
          <Link
            href={ROUTES.PLAN_SETUP}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-brand px-4 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
          >
            Set up my plan
          </Link>
        </div>
      )}

      <BodyGoalsFields fitness={fitness} goal={goal} onChange={onChange} />

      <div className="flex flex-col gap-3 border-t border-line pt-4 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <PlanTargets fitness={fitness} />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onConsult}
            disabled={!canConsult}
            className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors disabled:opacity-60 ${
              highlightConsult
                ? 'bg-brand text-on-brand hover:bg-brand-hover'
                : 'border border-line-strong bg-surface-2 text-fg hover:bg-surface-3'
            }`}
          >
            <SparklesIcon className="h-4 w-4" />
            AI Consult
          </button>
          <Link
            href="/fitness"
            className="inline-flex h-11 items-center rounded-xl px-4 text-sm font-bold text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg"
          >
            Fitness Hub
          </Link>
        </div>
      </div>

      {fitness.aiCoachAdvice && (
        <p className="line-clamp-2 text-subhead text-fg-2">
          <span className="font-bold text-brand-ink">Coach:</span> {fitness.aiCoachAdvice}
        </p>
      )}
    </section>
  );
}
