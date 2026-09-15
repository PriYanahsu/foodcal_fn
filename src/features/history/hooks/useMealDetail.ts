'use client';

import { useEffect, useState } from 'react';
import type { FoodLog } from '@/features/Nutrition';
import { getRecentFoodLogs } from '@/features/Nutrition/service/recentFoodLog.api';

export function useMealDetail(date: string, mealId: string) {
  const [meal, setMeal] = useState<FoodLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchMeal = async () => {
      setLoading(true);
      try {
        const logs = await getRecentFoodLogs(date);
        const found = logs.find((log) => String(log.id) === String(mealId)) ?? null;
        if (!cancelled) setMeal(found);
      } catch {
        if (!cancelled) setMeal(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMeal();
    return () => {
      cancelled = true;
    };
  }, [date, mealId]);

  return { meal, loading };
}
