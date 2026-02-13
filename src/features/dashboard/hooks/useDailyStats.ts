import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';

export interface DailyStats {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface FoodLog {
  id: string;
  food_name: string;
  calories: number;
  created_at: string;
  meal_type: string;
  image_path: string | null;
  protein: number;
  carbs: number;
  fats: number;
}

export const useDailyStats = (dateInput: string | Date = new Date()) => {
  // Accept string or Date
  const supabase = createClient();
  const [stats, setStats] = useState<DailyStats>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  const [recentLogs, setRecentLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Create a stable key for dependency array to prevent infinite loops
  // We normalize to the start of the day in local time (or consistent interpretation)
  const dateObj = new Date(dateInput);

  const startOfDay = new Date(dateObj);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(dateObj);
  endOfDay.setHours(23, 59, 59, 999);

  // This key will only change if the day changes, preventing object-ref-based re-renders
  const dateKey = startOfDay.toISOString();

  useEffect(() => {
    if (!user) return;

    const fetchDailyStats = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching daily stats:', error);
        setLoading(false);
        return;
      }

      // 3. Aggregate totals from the fetched logs
      const totals = data.reduce(
        (acc: DailyStats, log: FoodLog) => ({
          calories: acc.calories + (log.calories || 0),
          protein: acc.protein + (log.protein || 0),
          carbs: acc.carbs + (log.carbs || 0),
          fats: acc.fats + (log.fats || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      );

      setStats(totals);
      setRecentLogs(data);
      setLoading(false);
    };

    fetchDailyStats();

    const channel = supabase
      .channel('daily_stats_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'food_logs', filter: `user_id=eq.${user.id}` },
        () => {
          fetchDailyStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // Use dateKey instead of date/dateInput to avoid infinite loops from unstable object references
  }, [user, dateKey]);

  return { stats, recentLogs, loading };
};
