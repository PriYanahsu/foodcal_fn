'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRecentFoodLogs, queryKeys } from '@/app/service';
import type { FoodLog } from '@/features/Nutrition';
import { formatDayLabelLong, sumMealStats } from '../utils/helper';
import { EMPTY_HISTORY_STATS } from '../utils/Constants';
import { toApiDate } from '@/features/Nutrition/utils/toLocalDate';

export function useDailyMeals(date: string) {
  const apiDate = toApiDate(date);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.foodLogs(apiDate),
    queryFn: () => getRecentFoodLogs(apiDate),
  });

  const meals: FoodLog[] = data ?? [];
  const totals = useMemo(() => sumMealStats(meals), [meals]);
  const formattedDate = formatDayLabelLong(date);

  return {
    meals,
    loading: isLoading,
    totals: meals.length ? totals : EMPTY_HISTORY_STATS,
    formattedDate,
  };
}
