'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useFitnessProfile, useUserProfile } from '@/features/userProfile';
import { useDailyStats } from './useDailyStats';
import { deriveNutritionGoals, hasNutritionPlan } from '../utils/deriveNutritionGoals';
import { isToday as isTodayDate, toLocalDate, toStatsDate } from '../utils/toLocalDate';

export function useNutrition() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { fitness, loading: fitnessLoading } = useFitnessProfile();

  const [selectedDate, setSelectedDate] = useState(toLocalDate());

  const {
    stats,
    recentLogs,
    loading: statsLoading,
    refreshing,
  } = useDailyStats(toStatsDate(selectedDate));

  const hasPlan = hasNutritionPlan(fitness);
  const goals = deriveNutritionGoals(fitness);
  const userName = profile.fullName || user?.name || user?.email?.split('@')[0] || 'there';

  // Only the first load shows the full-page spinner; changing day keeps the layout.
  // Latched during render (not in an effect) so it flips without an extra render pass.
  const [initialReady, setInitialReady] = useState(false);
  if (!initialReady && !profileLoading && !fitnessLoading && !statsLoading) {
    setInitialReady(true);
  }

  return {
    user,
    fitness,
    selectedDate,
    setSelectedDate,
    stats,
    recentLogs,
    loading: statsLoading,
    refreshing,
    hasPlan,
    goals,
    userName,
    initialReady,
    isToday: isTodayDate(selectedDate),
  };
}
