'use client';

import { LockClosedIcon } from '@heroicons/react/24/outline';
import { CalorieRing, MacroBar } from '@/components/nutrition/macros';
import type { DailyStats, NutritionGoals } from '../type';

interface CaloriesCardProps {
  stats: DailyStats;
  goals: NutritionGoals;
  hasPlan: boolean;
  /** Previous day's numbers are showing while the new day loads. */
  refreshing: boolean;
  onSetUpPlan: () => void;
}

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

function RingLabel({
  eaten,
  left,
  compact,
}: {
  eaten: number;
  left: number | null;
  compact: boolean;
}) {
  const value = left === null ? eaten : Math.abs(left);
  const caption = left === null ? 'kcal eaten' : left >= 0 ? 'kcal left' : 'kcal over';
  return (
    <>
      <span
        className={`font-display font-bold leading-none tracking-[-0.02em] ${
          left !== null && left < 0 ? 'text-warn' : 'text-fg'
        } ${compact ? 'text-[28px]' : 'text-[40px]'}`}
      >
        {fmt(value)}
      </span>
      <span className={`text-muted ${compact ? 'mt-1 text-xs' : 'mt-1.5 text-sm'}`}>{caption}</span>
    </>
  );
}

export default function CaloriesCard({
  stats,
  goals,
  hasPlan,
  refreshing,
  onSetUpPlan,
}: CaloriesCardProps) {
  const eaten = Math.round(stats.calories);
  const goal = hasPlan ? goals.calories : null;
  const left = goal ? goal - eaten : null;

  return (
    <section
      aria-label="Calories and macros"
      aria-busy={refreshing}
      className={`grid items-center gap-6 rounded-3xl border border-line bg-surface-1 p-5 transition-opacity duration-300 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-10 md:p-7 ${
        refreshing ? 'opacity-70' : ''
      }`}
    >
      <div className="flex items-center gap-5">
        {/* Phones: compact ring beside the totals. */}
        <div className="sm:hidden">
          <CalorieRing value={eaten} max={goal ?? 0} size={128} stroke={12}>
            <RingLabel eaten={eaten} left={left} compact />
          </CalorieRing>
        </div>
        <div className="hidden sm:block">
          <CalorieRing value={eaten} max={goal ?? 0} size={176} stroke={16}>
            <RingLabel eaten={eaten} left={left} compact={false} />
          </CalorieRing>
        </div>

        <dl className="flex flex-1 flex-col gap-2.5 sm:hidden">
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-sm text-muted">Eaten</dt>
            <dd className="font-display text-xl font-bold text-fg">{fmt(eaten)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2 border-t border-line pt-2.5">
            <dt className="text-sm text-muted">Goal</dt>
            <dd className="font-display text-xl font-bold text-fg">{goal ? fmt(goal) : '—'}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2 border-t border-line pt-2.5">
            <dt className="text-sm text-muted">{left !== null && left < 0 ? 'Over' : 'Left'}</dt>
            <dd
              className={`font-display text-xl font-bold ${left !== null && left < 0 ? 'text-warn' : 'text-brand-ink'}`}
            >
              {left === null ? '—' : fmt(Math.abs(left))}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        <div className="hidden items-baseline justify-between gap-3 sm:flex">
          <h2 className="text-lg font-bold text-fg">Calories</h2>
          <p className="text-sm text-muted">
            <span className="font-bold text-fg">{fmt(eaten)}</span>
            {goal ? ` eaten of ${fmt(goal)}` : ' kcal eaten'}
          </p>
        </div>

        <MacroBar
          macro="protein"
          size="md"
          unit="g"
          value={Math.round(stats.proteins)}
          max={hasPlan ? goals.proteins : null}
        />
        <MacroBar
          macro="carbs"
          size="md"
          unit="g"
          value={Math.round(stats.carbohydrates)}
          max={hasPlan ? goals.carbohydrates : null}
        />
        <MacroBar
          macro="fat"
          size="md"
          unit="g"
          value={Math.round(stats.fats)}
          max={hasPlan ? goals.fats : null}
        />

        {!hasPlan && (
          <button
            type="button"
            onClick={onSetUpPlan}
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-brand-ink hover:underline"
          >
            <LockClosedIcon className="h-4 w-4" />
            Set up your plan to get daily targets
          </button>
        )}
      </div>
    </section>
  );
}
