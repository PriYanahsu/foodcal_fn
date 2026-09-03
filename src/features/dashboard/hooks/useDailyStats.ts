import { useEffect, useState } from 'react';
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

export const useDailyStats = (_dateInput: string | Date = new Date()) => {
  const { user } = useAuth();
  const [stats] = useState<DailyStats>({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [recentLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [user]);

  return { stats, recentLogs, loading };
};
