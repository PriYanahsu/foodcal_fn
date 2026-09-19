'use client';

import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useFitnessProfile } from '@/features/userProfile';
import { deriveNutritionGoals } from '@/features/Nutrition/utils/deriveNutritionGoals';
import { toLocalDate } from '@/features/Nutrition/utils/toLocalDate';
import { useHistory } from './useHistory';
import { dailyMealsQuery, useDailyMeals } from './useDailyMeals';
import {
  currentStreak,
  isSameMonth,
  monthIndex,
  monthOf,
  monthSummary,
  shiftMonth,
  toHistoryMap,
} from '../utils/calendar';
import { DEFAULT_CALORIE_TARGET } from '../utils/Constants';
import type { HistoryCalendarProps, MonthView } from '../type';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Mirrors the open day/meal into the address bar without a navigation, so the
 * view survives a refresh and can be shared, but the page never reloads.
 */
function syncUrl(date: string, mealId: string | null) {
  const params = new URLSearchParams({ date });
  if (mealId) params.set('meal', mealId);
  window.history.replaceState(null, '', `?${params}`);
}

export function useHistoryCalendar({ initialDate, initialMealId }: HistoryCalendarProps) {
  const today = toLocalDate();
  const startDate =
    initialDate && DATE_PATTERN.test(initialDate) && initialDate <= today ? initialDate : today;

  const [selectedDate, setSelectedDate] = useState(startDate);
  const [mealId, setMealId] = useState<string | null>(initialMealId ?? null);
  const [view, setView] = useState(() => monthOf(startDate));
  // +1 when moving to a later month, -1 to an earlier one — the grid slides that way.
  const [direction, setDirection] = useState(0);

  const queryClient = useQueryClient();
  const { history, loading: historyLoading } = useHistory();
  const { fitness } = useFitnessProfile();
  const goals = deriveNutritionGoals(fitness);
  const target = goals.calories ?? DEFAULT_CALORIE_TARGET;

  const byDate = useMemo(() => toHistoryMap(history), [history]);
  const summary = useMemo(() => monthSummary(view, byDate, target), [view, byDate, target]);
  const streak = useMemo(() => currentStreak(byDate), [byDate]);
  // `YYYY-MM` of every month with a log — the dots in the month picker.
  const loggedMonths = useMemo(
    () =>
      new Set(
        [...byDate].filter(([, stats]) => stats.calories > 0).map(([date]) => date.slice(0, 7))
      ),
    [byDate]
  );
  const firstLoggedYear = useMemo(
    () => Math.min(...[...loggedMonths].map((key) => Number(key.slice(0, 4))), monthOf(today).year),
    [loggedMonths, today]
  );

  const { meals, loading: mealsLoading, totals } = useDailyMeals(selectedDate);
  const openMeal = meals.find((meal) => String(meal.id) === mealId) ?? null;

  const currentMonth = monthOf(today);

  const goToMonth = (next: MonthView) => {
    // Never past the current month — swipes, arrows and the picker all land here.
    if (isSameMonth(next, view) || monthIndex(next) > monthIndex(currentMonth)) return;
    setDirection(monthIndex(next) > monthIndex(view) ? 1 : -1);
    setView(next);
  };

  const selectDate = (date: string) => {
    if (date > today) return;
    setSelectedDate(date);
    setMealId(null);
    goToMonth(monthOf(date));
    syncUrl(date, null);
  };

  const selectMeal = (id: string | null) => {
    setMealId(id);
    syncUrl(selectedDate, id);
  };

  return {
    today,
    view,
    direction,
    prevMonth: () => goToMonth(shiftMonth(view, -1)),
    nextMonth: () => goToMonth(shiftMonth(view, 1)),
    goToMonth,
    currentMonth,
    loggedMonths,
    firstLoggedYear,
    canGoNext: !isSameMonth(view, currentMonth),
    goToToday: () => selectDate(today),
    byDate,
    target,
    goals,
    hasPlan: goals.calories !== null,
    summary,
    streak,
    historyLoading,
    selectedDate,
    selectDate,
    // Starts loading a day's meals on touch-down, before the tap completes and the sheet opens.
    prefetchDay: (date: string) => {
      if (date <= today) queryClient.prefetchQuery(dailyMealsQuery(date));
    },
    /** Resolves once the day's meals are cached (or the load failed — the panel shows that). */
    loadDay: (date: string) =>
      queryClient.ensureQueryData(dailyMealsQuery(date)).catch(() => undefined),
    meals,
    mealsLoading,
    totals,
    openMeal,
    // Still resolving the meal from the URL — keep the detail view rather than flashing the list.
    mealPending: !!mealId && mealsLoading,
    selectMeal,
  };
}
