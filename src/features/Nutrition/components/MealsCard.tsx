'use client';

import Link from 'next/link';
import type { ComponentType, SVGProps } from 'react';
import {
  CakeIcon,
  CameraIcon,
  FireIcon,
  MoonIcon,
  PlusIcon,
  SunIcon,
} from '@heroicons/react/24/outline';
import { buttonClass } from '@/components/ui/fc';
import { MACRO_STYLES } from '@/components/nutrition/macros';
import { ROUTES } from '@/constants/routes';
import type { FoodLog } from '../type';
import { MAIN_MEALS } from '../utils/Constants';
import { formatLogTime, logDetailHref } from '../utils/formatLogTime';

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/** Tile colour + icon per meal type, used when a meal has no photo. */
const MEAL_STYLES: Record<string, { tile: string; icon: Icon }> = {
  breakfast: { tile: 'bg-carbs/15 text-carbs', icon: SunIcon },
  lunch: { tile: 'bg-protein/15 text-protein', icon: FireIcon },
  dinner: { tile: 'bg-fat/15 text-fat', icon: MoonIcon },
  snack: { tile: 'bg-brand/15 text-brand-ink', icon: CakeIcon },
};

interface MealsCardProps {
  logs: FoodLog[];
  loading: boolean;
  /** Previous day's meals are showing while the new day loads. */
  refreshing: boolean;
  isToday: boolean;
}

const capitalize = (text: string) => (text ? text[0].toUpperCase() + text.slice(1) : text);

function MealThumb({ log }: { log: FoodLog }) {
  if (log.imagePath) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element -- user photos come from storage URLs */
      <img
        src={log.imagePath}
        alt=""
        loading="lazy"
        className="h-12 w-12 shrink-0 rounded-xl object-cover"
      />
    );
  }
  const style = MEAL_STYLES[log.mealType?.toLowerCase()] ?? MEAL_STYLES.snack;
  const Icon = style.icon;
  return (
    <span
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.tile}`}
    >
      <Icon className="h-6 w-6" />
    </span>
  );
}

export default function MealsCard({ logs, loading, refreshing, isToday }: MealsCardProps) {
  const meals = [...logs].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
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
        <div className="mt-4 flex flex-col gap-3" aria-hidden="true">
          {[0, 1].map((i) => (
            <div key={i} className="h-[76px] animate-pulse rounded-2xl bg-surface-2" />
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
          <p className="max-w-xs text-sm text-muted">
            {isToday
              ? 'Snap your first meal — it takes about 10 seconds.'
              : 'Pick another day, or head to history for the full log.'}
          </p>
          {isToday && (
            <Link href={ROUTES.SCAN} className={buttonClass('primary', 'md', 'mt-1')}>
              Scan a meal
            </Link>
          )}
        </div>
      ) : (
        <ul className="mt-2 flex flex-col">
          {meals.map((meal) => (
            <li key={meal.id} className="border-b border-line last:border-b-0">
              <Link
                href={logDetailHref(meal)}
                className="-mx-2 flex items-center gap-4 rounded-2xl px-2 py-3.5 transition-colors hover:bg-surface-2"
              >
                <MealThumb log={meal} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[13px] text-muted">
                    {capitalize(meal.mealType)} · {formatLogTime(meal.createdAt)}
                  </span>
                  <span className="line-clamp-2 text-base font-semibold leading-snug text-fg">
                    {meal.foodName}
                  </span>
                  <span className="flex gap-3 text-[13px] tabular-nums text-muted">
                    <span>
                      <b className={`font-bold ${MACRO_STYLES.protein.text}`}>P</b>{' '}
                      {Math.round(meal.proteinG)} g
                    </span>
                    <span>
                      <b className={`font-bold ${MACRO_STYLES.carbs.text}`}>C</b>{' '}
                      {Math.round(meal.carbohydrateG)} g
                    </span>
                    <span>
                      <b className={`font-bold ${MACRO_STYLES.fat.text}`}>F</b>{' '}
                      {Math.round(meal.fatG)} g
                    </span>
                  </span>
                </div>
                <span className="shrink-0 text-right">
                  <span className="font-display text-xl font-bold text-fg">
                    {Math.round(meal.calories)}
                  </span>
                  <span className="ml-1 text-xs text-muted">kcal</span>
                </span>
              </Link>
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
              className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong text-sm font-semibold text-fg-2 transition-colors hover:border-brand/50 hover:bg-surface-2 hover:text-fg"
            >
              <PlusIcon className="h-4 w-4" />
              Add {type}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
