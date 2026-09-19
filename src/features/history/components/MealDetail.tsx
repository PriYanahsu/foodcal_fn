'use client';

import type { ReactNode } from 'react';
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { MACRO_STYLES, type MacroKey } from '@/components/nutrition/macros';
import { MealThumb } from '@/components/nutrition/MealThumb';
import type { FoodLog } from '@/features/Nutrition/type';
import { formatLogTime, mealTypeAndTime } from '@/features/Nutrition/utils/formatLogTime';
import { formatPanelDate } from '../utils/calendar';

interface MealDetailProps {
  /** Null while the meal from the URL is still loading. */
  meal: FoodLog | null;
  /** The day's meals in time order — drives the previous/next arrows. */
  meals: FoodLog[];
  date: string;
  target: number;
  onSelectMeal: (id: string | null) => void;
}

const KCAL_PER_GRAM: Record<MacroKey, number> = { protein: 4, carbs: 4, fat: 9 };

const ICON_BUTTON =
  'flex h-9 w-9 items-center justify-center rounded-xl border border-line text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent';

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-right font-semibold text-fg">{children}</span>
    </div>
  );
}

/** A meal opened inside the day panel — replaces the old `/history/[date]/[mealId]` page. */
export default function MealDetail({ meal, meals, date, target, onSelectMeal }: MealDetailProps) {
  const index = meal ? meals.findIndex((m) => m.id === meal.id) : -1;
  const prev = index > 0 ? meals[index - 1] : null;
  const next = index >= 0 && index < meals.length - 1 ? meals[index + 1] : null;

  const toolbar = (
    <div className="flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={() => onSelectMeal(null)}
        className="-ml-2 inline-flex h-9 items-center gap-1.5 rounded-xl px-2 text-sm font-semibold text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        All meals
      </button>
      {meals.length > 1 && index >= 0 && (
        <div className="flex items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold tabular-nums text-muted">
            {index + 1} of {meals.length}
          </span>
          <button
            type="button"
            disabled={!prev}
            onClick={() => prev && onSelectMeal(String(prev.id))}
            aria-label="Previous meal"
            className={ICON_BUTTON}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!next}
            onClick={() => next && onSelectMeal(String(next.id))}
            aria-label="Next meal"
            className={ICON_BUTTON}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );

  if (!meal) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        {toolbar}
        <div className="aspect-[4/3] animate-pulse rounded-2xl bg-surface-2" />
        <div className="h-7 w-2/3 animate-pulse rounded-lg bg-surface-2" />
        <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />
      </div>
    );
  }

  const calories = Math.round(meal.calories);
  const macros = (
    [
      ['protein', meal.proteinG],
      ['carbs', meal.carbohydrateG],
      ['fat', meal.fatG],
    ] as const
  ).map(([key, grams]) => ({
    key,
    grams: Math.round(grams ?? 0),
    kcal: Math.round((grams ?? 0) * KCAL_PER_GRAM[key]),
  }));
  const macroKcal = macros.reduce((sum, m) => sum + m.kcal, 0);
  const shareOfTarget = Math.round((calories / target) * 100);
  const confidence = meal.confidenceLevel ? Math.round(meal.confidenceLevel * 100) : null;

  return (
    <div className="flex flex-col gap-5">
      {toolbar}

      {/* The whole photo, never cropped — a blurred copy fills the frame behind it. */}
      {meal.imagePath ? (
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- user photos come from storage URLs */}
          <img
            src={meal.imagePath}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- user photos come from storage URLs */}
          <img
            src={meal.imagePath}
            alt={meal.foodName}
            className="relative h-full w-full object-contain"
          />
        </div>
      ) : (
        <MealThumb log={meal} className="aspect-[4/3] h-auto w-full !rounded-2xl" />
      )}

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          {mealTypeAndTime(meal)}
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold leading-tight text-fg">
          {meal.foodName}
        </h2>
      </div>

      <div className="flex items-end justify-between gap-4 rounded-2xl bg-surface-2 px-4 py-3.5">
        <p>
          <span className="font-display text-4xl font-bold leading-none tabular-nums text-fg">
            {calories.toLocaleString()}
          </span>
          <span className="ml-1.5 text-sm font-semibold text-muted">kcal</span>
        </p>
        <p className="text-right text-xs text-muted">
          <span className="block font-display text-lg font-bold tabular-nums text-fg">
            {shareOfTarget}%
          </span>
          of your daily target
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Macros</p>
        {/* Where the calories come from — one bar split by macro. */}
        {macroKcal > 0 && (
          <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
            {macros.map((m) =>
              m.kcal > 0 ? (
                <span
                  key={m.key}
                  className={MACRO_STYLES[m.key].dot}
                  style={{ width: `${(m.kcal / macroKcal) * 100}%` }}
                />
              ) : null
            )}
          </div>
        )}
        <ul className="flex flex-col divide-y divide-line">
          {macros.map((m) => (
            <li key={m.key} className="flex items-center gap-3 py-2.5 text-sm">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-[3px] ${MACRO_STYLES[m.key].dot}`} />
              <span className="flex-1 font-semibold text-fg">{MACRO_STYLES[m.key].label}</span>
              <span className="w-16 text-right tabular-nums text-muted">{m.kcal} kcal</span>
              <span className="w-12 text-right tabular-nums text-muted">
                {macroKcal ? Math.round((m.kcal / macroKcal) * 100) : 0}%
              </span>
              <span className="w-12 text-right font-bold tabular-nums text-fg">{m.grams} g</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Details</p>
        <div className="flex flex-col divide-y divide-line">
          <DetailRow label="Logged">
            {formatPanelDate(date)}
            {meal.createdAt && ` · ${formatLogTime(meal.createdAt)}`}
          </DetailRow>
          <DetailRow label="Meal">
            <span className="capitalize">{meal.mealType || '—'}</span>
          </DetailRow>
          <DetailRow label="Source">
            <span className="inline-flex items-center gap-1.5">
              {meal.isManual ? (
                <>
                  <PencilSquareIcon className="h-4 w-4 text-muted" /> Added manually
                </>
              ) : (
                <>
                  <SparklesIcon className="h-4 w-4 text-brand-ink" /> AI photo scan
                </>
              )}
            </span>
          </DetailRow>
          {!meal.isManual && confidence !== null && (
            <DetailRow label="AI confidence">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-3">
                  <span
                    className="block h-full rounded-full bg-brand"
                    style={{ width: `${confidence}%` }}
                  />
                </span>
                <span className="tabular-nums">{confidence}%</span>
              </span>
            </DetailRow>
          )}
        </div>
      </div>
    </div>
  );
}
