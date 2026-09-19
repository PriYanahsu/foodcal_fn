'use client';

import { useQuery } from '@tanstack/react-query';
import { getHistory, queryKeys } from '@/app/service';
import type { History } from '../type';

export function useHistory() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.history,
    queryFn: getHistory,
  });

  const history: History[] = data ?? [];

  return { history, loading: isLoading };
}
