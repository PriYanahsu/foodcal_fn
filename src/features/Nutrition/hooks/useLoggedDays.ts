'use client';

import { useMemo } from 'react';
import { useHistory } from '@/features/history/hooks/useHistory';
import { toHistoryDate } from '@/features/history/utils/helper';

/** `YYYY-MM-DD` dates that have at least one meal logged — drives the dots on day pickers. */
export function useLoggedDays() {
  const { history } = useHistory();
  return useMemo(
    () =>
      new Set(
        history.filter((day) => day.stats.calories > 0).map((day) => toHistoryDate(day.date))
      ),
    [history]
  );
}
