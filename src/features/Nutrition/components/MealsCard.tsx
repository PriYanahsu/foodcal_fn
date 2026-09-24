'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CameraIcon, PlusIcon } from '@heroicons/react/24/outline';
import { buttonClass } from '@/components/ui/fc';
import { MealCard, MealCardSkeleton } from '@/components/nutrition/MealCard';
import MealDetail from '@/components/nutrition/MealDetail';
import { MealDrillIn } from '@/components/nutrition/MealDrillIn';
import { ROUTES } from '@/constants/routes';
import { usePlanGate } from '@/features/onboarding';
import type { FoodLog } from '../type';
import { MAIN_MEALS } from '../utils/Constants';
import { byLogTime } from '../utils/formatLogTime';

interface MealsCardProps {
  logs: FoodLog[];
  loading: boolean;
  /** Previous day's meals are showing while the new day loads. */
  refreshing: boolean;
  isToday: boolean;
  /** Daily calorie target for the meal's "% of target"; null without a plan. */
  target: number | null;
}

export default function MealsCard({ logs, loading, refreshing, isToday, target }: MealsCardProps) {
  const { requirePlan } = usePlanGate();
  const meals = [...logs].sort(byLogTime);
  // Tapping a meal opens it right here (same view as History) — no page change.
  const [openId, setOpenId] = useState<string | null>(null);
  // Falls back to the list when the day changes and the meal isn't in it.
  const openMeal = meals.find((meal) => String(meal.id) === openId) ?? null;

  const loggedTypes = new Set(meals.map((meal) => meal.mealType?.toLowerCase()));
  // Offer the next main meal not yet logged, plus a snack.
  const nextMeal = MAIN_MEALS.find((type) => !loggedTypes.has(type));
  const suggestions = [nextMeal, 'snack'].filter(Boolean) as string[];

  return (
    <section
      aria-label="Meals"
      aria-busy={loading || refreshing}
      className={`flex flex-col rounded-3xl border border-line bg-surface-1 p-5 transition-opacity duration-300 md:p-7 ${
        refreshing ? 'opacity-70' : ''
      }`}
    >
      <MealDrillIn
        showDetail={!!openMeal}
        viewKey={openMeal ? `meal-${openMeal.id}` : 'list'}
        detail={
          <MealDetail meal={openMeal} meals={meals} target={target} onSelectMeal={setOpenId} />
        }
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-fg">{isToday ? 'Today’s meals' : 'Meals'}</h2>
          <Link
            href={ROUTES.HISTORY}
            className="text-sm font-semibold text-brand-ink hover:underline"
          >
            See history
          </Link>
        </div>

        {loading ? (
          <div className="mt-4 flex flex-col gap-2.5" aria-hidden="true">
            {[0, 1].map((i) => (
              <MealCardSkeleton key={i} />
            ))}
          </div>
        ) : meals.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong px-6 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/12 text-brand-ink">
              <CameraIcon className="h-7 w-7" />
            </span>
            <p className="text-base font-bold text-fg">
              No meals logged {isToday ? 'yet' : 'this day'}
            </p>
            <p className="max-w-xs text-sm text-muted max-md:text-subhead">
              {isToday
                ? 'Snap your first meal — it takes about 10 seconds.'
                : 'Pick another day, or head to history for the full log.'}
            </p>
            {isToday && (
              <Link
                href={ROUTES.SCAN}
                onClick={requirePlan}
                className={buttonClass('primary', 'md', 'mt-1')}
              >
                Scan a meal
              </Link>
            )}
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-2.5">
            {meals.map((meal) => (
              <li key={meal.id}>
                <MealCard meal={meal} onOpen={() => setOpenId(String(meal.id))} />
              </li>
            ))}
          </ul>
        )}

        {isToday && meals.length > 0 && !loading && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {suggestions.map((type) => (
              <Link
                key={type}
                href={ROUTES.SCAN}
                onClick={requirePlan}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong text-sm font-semibold text-fg-2 transition-colors hover:border-brand/50 hover:bg-surface-2 hover:text-fg"
              >
                <PlusIcon className="h-4 w-4" />
                Add {type}
              </Link>
            ))}
          </div>
        )}
      </MealDrillIn>
    </section>
  );
}
