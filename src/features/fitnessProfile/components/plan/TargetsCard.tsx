'use client';

import { SparklesIcon } from '@heroicons/react/24/outline';
import { CalorieRing, MacroBar } from '@/components/nutrition/macros';
import type { FitnessDetails } from '@/features/userProfile';

/** The daily numbers the coach set — the plan itself. */
export default function TargetsCard({
  fitness,
  onUpdatePlan,
}: {
  fitness: FitnessDetails | null;
  onUpdatePlan: () => void;
}) {
  const calories = fitness?.dailyCalorieTarget ?? 0;
  const protein = fitness?.dailyProteinTargetG ?? 0;
  const carbs = fitness?.dailyCarbsTargetG ?? 0;
  const fat = fitness?.dailyFatTargetG ?? 0;

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-line bg-surface-1 p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-fg">Daily targets</h2>
          <p className="mt-0.5 text-footnote text-muted">
            {calories ? 'What to eat each day to stay on plan.' : 'No plan yet.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onUpdatePlan}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-line-strong bg-surface-2 px-4 text-sm font-bold text-fg transition-colors hover:bg-surface-3"
        >
          <SparklesIcon className="h-4 w-4" />
          {calories ? 'Update' : 'Create'}
        </button>
      </div>

      {calories ? (
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <CalorieRing value={calories} max={calories} size={124} stroke={12}>
            <span className="font-display text-[28px] font-bold leading-none text-fg">
              {calories.toLocaleString('en-US')}
            </span>
            <span className="mt-0.5 text-caption text-muted">kcal / day</span>
          </CalorieRing>
          <div className="flex w-full min-w-0 flex-col gap-3">
            <MacroBar macro="protein" value={protein} max={protein} unit="g" size="md" />
            <MacroBar macro="carbs" value={carbs} max={carbs} unit="g" size="md" />
            <MacroBar macro="fat" value={fat} max={fat} unit="g" size="md" />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line-strong p-6 text-center">
          <p className="text-sm font-semibold text-fg">Run one consultation</p>
          <p className="mt-1 text-footnote text-muted">
            Your coach turns your body and goal into daily calorie and macro targets.
          </p>
          <button
            type="button"
            onClick={onUpdatePlan}
            className="mt-4 inline-flex h-12 items-center gap-2 rounded-2xl bg-brand px-6 text-base font-bold text-on-brand transition-colors hover:bg-brand-hover"
          >
            <SparklesIcon className="h-5 w-5" />
            Create my plan
          </button>
        </div>
      )}
    </section>
  );
}
