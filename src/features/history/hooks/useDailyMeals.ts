'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FoodLog } from '@/features/Nutrition';
import { getRecentFoodLogs } from '@/features/Nutrition/service/recentFoodLog.api';
import { formatDayLabelLong, sumMealStats } from '../utils/helper';
import { EMPTY_HISTORY_STATS } from '../utils/Constants';

export function useDailyMeals(date: string) {
  const [meals, setMeals] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchMeals = async () => {
      setLoading(true);
      try {
        const logs = await getRecentFoodLogs(date);
        if (!cancelled) setMeals(logs ?? []);
      } catch {
        if (!cancelled) setMeals([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMeals();
    return () => {
      cancelled = true;
    };
  }, [date]);

  const totals = useMemo(() => sumMealStats(meals), [meals]);
  const formattedDate = formatDayLabelLong(date);

  return {
    meals,
    loading,
    totals: meals.length ? totals : EMPTY_HISTORY_STATS,
    formattedDate,
  };
}
