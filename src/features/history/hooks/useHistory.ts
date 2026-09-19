'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getHistory, queryKeys } from '@/app/service';
import type { History } from '../type';
import { DEFAULT_CALORIE_TARGET } from '../utils/Constants';
import { getHistoryOverview } from '../utils/helper';

export function useHistory() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.history,
    queryFn: getHistory,
  });

  const history: History[] = data ?? [];
  const stats = useMemo(() => getHistoryOverview(history), [history]);

  return {
    history,
    loading: isLoading,
    stats,
    target: DEFAULT_CALORIE_TARGET,
  };
}
