'use client';

import { useQuery } from '@tanstack/react-query';
import { getRecentFoodLogs, queryKeys } from '@/app/service';
import type { FoodLog } from '@/features/Nutrition';
import { toApiDate } from '@/features/Nutrition/utils/toLocalDate';

export function useMealDetail(date: string, mealId: string) {
  const apiDate = toApiDate(date);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.foodLogs(apiDate),
    queryFn: () => getRecentFoodLogs(apiDate),
  });

  const meal: FoodLog | null = data?.find((log) => String(log.id) === String(mealId)) ?? null;

  return { meal, loading: isLoading };
}
