'use client';

import { ChevronRightIcon } from '@heroicons/react/24/outline';
import type { FoodLog } from '@/features/Nutrition/type';
import { mealTypeAndTime } from '@/features/Nutrition/utils/formatLogTime';
import { MACRO_STYLES } from './macros';
import { MealThumb } from './MealThumb';

/** Macro and the matching `FoodLog` field, in display order. */
const MACRO_KEYS = [
  ['protein', 'proteinG'],
  ['carbs', 'carbohydrateG'],
  ['fat', 'fatG'],
] as const;

/** One logged meal as a tappable card: photo, type · time, name, P/C/F and kcal. */
export function MealCard({ meal, onOpen }: { meal: FoodLog; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full items-center gap-3 rounded-2xl border border-line bg-surface-2 p-2.5 pr-3 text-left transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_10px_24px_-16px_rgba(0,0,0,0.6)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 active:scale-[0.98]"
    >
      <MealThumb log={meal} className="h-14 w-14" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted max-md:text-caption">
          {mealTypeAndTime(meal)}
        </span>
        <span className="line-clamp-2 text-[15px] font-semibold leading-snug text-fg max-md:text-body">
          {meal.foodName}
        </span>
        <span className="flex gap-2.5 text-xs tabular-nums text-muted">
          {MACRO_KEYS.map(([key, field]) => (
            <span key={key} className="inline-flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${MACRO_STYLES[key].dot}`} />
              {Math.round(meal[field] ?? 0)}g
            </span>
          ))}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end">
        <span className="font-display text-lg font-bold leading-none tabular-nums text-fg">
          {Math.round(meal.calories)}
        </span>
        <span className="text-[11px] font-medium text-muted max-md:text-caption">kcal</span>
      </span>
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-fg" />
    </button>
  );
}

/** A skeleton card the exact size of a `MealCard`, so the list doesn't jump when meals arrive. */
export function MealCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2 p-2.5 pr-3">
      <span className="h-14 w-14 shrink-0 fc-skeleton rounded-xl" />
      <span className="flex flex-1 flex-col gap-2">
        <span className="h-2.5 w-20 fc-skeleton rounded" />
        <span className="h-3.5 w-3/4 fc-skeleton rounded" />
        <span className="h-2.5 w-24 fc-skeleton rounded" />
      </span>
      <span className="h-5 w-10 fc-skeleton rounded" />
    </div>
  );
}
