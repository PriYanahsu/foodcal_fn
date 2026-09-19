'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRecentFoodLogs, queryKeys } from '@/app/service';
import type { FoodLog } from '@/features/Nutrition';
import { sumMealStats } from '../utils/helper';
import { toApiDate } from '@/features/Nutrition/utils/toLocalDate';

const NO_MEALS: FoodLog[] = [];

/** Shared by the query and by prefetching, so both hit the same cache entry. */
export function dailyMealsQuery(date: string) {
  const apiDate = toApiDate(date);
  return {
    queryKey: queryKeys.foodLogs(apiDate),
    queryFn: () => getRecentFoodLogs(apiDate),
  };
}

export function useDailyMeals(date: string) {
  const { data, isLoading } = useQuery(dailyMealsQuery(date));

  const meals = data ?? NO_MEALS;
  const totals = useMemo(() => sumMealStats(meals), [meals]);

  return { meals, loading: isLoading, totals };
}
