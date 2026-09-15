import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { DailyStats, FoodLog } from '../type';
import { EMPTY_STATS } from '../utils/Constants';
import { getDailyStats, getRecentFoodLogs } from '@/app/service';

export const useDailyStats = (dateInput: string | Date) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DailyStats>(EMPTY_STATS);
  const [recentLogs, setRecentLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentLogs();
  }, [dateInput]);

  const fetchStats = async () => {
    setLoading(true);
    const stats = await getDailyStats(dateInput);
    setStats(stats);
    setLoading(false);
  };

  const fetchRecentLogs = async () => {
    setLoading(true);
    const recentLogs = await getRecentFoodLogs(dateInput);
    setRecentLogs(recentLogs);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(false);
  }, [user]);

  return { stats, recentLogs, loading };
};

