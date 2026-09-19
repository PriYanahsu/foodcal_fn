'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getDailyStats, getRecentFoodLogs, queryKeys } from '@/app/service';
import { toApiDate } from '../utils/toLocalDate';
import { EMPTY_STATS } from '../utils/Constants';
import type { DailyStats, FoodLog } from '../type';

export const useDailyStats = (dateInput: string | Date) => {
  const date = toApiDate(dateInput);

  // keepPreviousData: when switching day, the last day's numbers stay on screen
  // (and animate to the new ones) instead of flashing to zero while loading.
  const statsQuery = useQuery({
    queryKey: queryKeys.dailyStats(date),
    queryFn: () => getDailyStats(date),
    placeholderData: keepPreviousData,
  });

  const logsQuery = useQuery({
    queryKey: queryKeys.foodLogs(date),
    queryFn: () => getRecentFoodLogs(date),
    placeholderData: keepPreviousData,
  });

  return {
    stats: (statsQuery.data as DailyStats | undefined) ?? EMPTY_STATS,
    recentLogs: (logsQuery.data as FoodLog[] | undefined) ?? [],
    loading: statsQuery.isLoading || logsQuery.isLoading,
    /** True while showing the previous day's data as a placeholder. */
    refreshing: statsQuery.isPlaceholderData || logsQuery.isPlaceholderData,
  };
};
