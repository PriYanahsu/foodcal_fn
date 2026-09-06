import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { DailyStats, FoodLog } from '../type';
import { EMPTY_STATS } from '../utils/Constants';

export const useDailyStats = (_dateInput: string | Date = new Date()) => {
  const { user } = useAuth();
  const [stats] = useState<DailyStats>(EMPTY_STATS);
  const [recentLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [user]);

  return { stats, recentLogs, loading };
};
