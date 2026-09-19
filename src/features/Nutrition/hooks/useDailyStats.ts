'use client';

import { useQuery } from '@tanstack/react-query';
import { getDailyStats, getRecentFoodLogs, queryKeys } from '@/app/service';
import { toApiDate } from '../utils/toLocalDate';
import { EMPTY_STATS } from '../utils/Constants';
import type { DailyStats, FoodLog } from '../type';

export const useDailyStats = (dateInput: string | Date) => {
  const date = toApiDate(dateInput);

  const statsQuery = useQuery({
    queryKey: queryKeys.dailyStats(date),
    queryFn: () => getDailyStats(date),
  });

  const logsQuery = useQuery({
    queryKey: queryKeys.foodLogs(date),
    queryFn: () => getRecentFoodLogs(date),
  });

  return {
    stats: (statsQuery.data as DailyStats | undefined) ?? EMPTY_STATS,
    recentLogs: (logsQuery.data as FoodLog[] | undefined) ?? [],
    loading: statsQuery.isLoading || logsQuery.isLoading,
  };
};
