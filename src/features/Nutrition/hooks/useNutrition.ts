'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useFitnessProfile, useUserProfile } from '@/features/userProfile';
import { useDailyStats } from './useDailyStats';
import { deriveNutritionGoals, hasNutritionPlan } from '../utils/deriveNutritionGoals';
import { isToday as isTodayDate, shiftDate, toLocalDate, toStatsDate } from '../utils/toLocalDate';

export function useNutrition() {
  const { user } = useAuth();
  const { profile, loading: profileLoading, handleAvatarUpload } = useUserProfile();
  const { fitness, loading: fitnessLoading } = useFitnessProfile();

  const [selectedDate, setSelectedDate] = useState(toLocalDate());
  const [mounted, setMounted] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showNoPlanModal, setShowNoPlanModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { stats, recentLogs, loading: statsLoading } = useDailyStats(toStatsDate(selectedDate));

  const hasPlan = hasNutritionPlan(fitness);
  const goals = deriveNutritionGoals(fitness);
  const userName = profile.fullName || user?.name || user?.email?.split('@')[0] || 'User';

  const [initialReady, setInitialReady] = useState(false);
  useEffect(() => {
    if (!profileLoading && !fitnessLoading && !statsLoading) setInitialReady(true);
  }, [profileLoading, fitnessLoading, statsLoading]);

  const dailyLogRef = useRef<HTMLDivElement>(null);
  const [logScrollable, setLogScrollable] = useState(false);

  useLayoutEffect(() => {
    const el = dailyLogRef.current;
    if (!el) return;

    const update = () => {
      setLogScrollable(el.scrollHeight > el.clientHeight + 1);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [recentLogs, statsLoading, selectedDate, initialReady]);

  const handleDateChange = (days: number) => {
    setSelectedDate((prev) => shiftDate(prev, days));
  };

  const handleStartConsultation = () => {
    setShowNoPlanModal(false);
    setShowWizard(true);
  };

  return {
    user,
    profile,
    fitness,
    handleAvatarUpload,
    selectedDate,
    setSelectedDate,
    mounted,
    showWizard,
    setShowWizard,
    showNoPlanModal,
    setShowNoPlanModal,
    stats,
    recentLogs,
    loading: statsLoading,
    hasPlan,
    goals,
    userName,
    initialReady,
    dailyLogRef,
    logScrollable,
    isToday: isTodayDate(selectedDate),
    handleDateChange,
    handleStartConsultation,
  };
}
