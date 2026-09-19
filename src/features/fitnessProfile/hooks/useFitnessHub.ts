'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuthUser } from '@/features/auth';
import { FitnessDetails, ProfileData } from '@/features/userProfile';
import { getFitness, getUser, queryKeys } from '@/app/service';
import { calculateProfileCompletion } from '@/utils/profileCompletion';

export const useFitnessHub = (user: AuthUser | null) => {
  const userId = user?.id;
  const [showWizard, setShowWizard] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  const fitnessQuery = useQuery({
    queryKey: queryKeys.fitness(userId ?? ''),
    queryFn: getFitness,
    enabled: !!userId,
  });

  const userQuery = useQuery({
    queryKey: queryKeys.user(userId ?? ''),
    queryFn: () => getUser(userId!),
    enabled: !!userId,
  });

  const fitnessProfile: FitnessDetails | null = fitnessQuery.data ?? null;
  const userProfile: ProfileData | null = userQuery.data ?? null;
  const loading = !!userId && (fitnessQuery.isLoading || userQuery.isLoading);

  useEffect(() => {
    if (fitnessQuery.isLoading || userQuery.isLoading) return;
    if (!fitnessProfile || !userProfile) return;
    setShowReminder(calculateProfileCompletion(fitnessProfile, userProfile) < 100);
  }, [
    fitnessQuery.dataUpdatedAt,
    userQuery.dataUpdatedAt,
    fitnessQuery.isLoading,
    userQuery.isLoading,
    fitnessProfile,
    userProfile,
  ]);

  const fetchFitnessProfile = async () => {
    if (!userId) return;
    const [fitness, profile] = await Promise.all([fitnessQuery.refetch(), userQuery.refetch()]);
    setShowReminder(calculateProfileCompletion(fitness.data ?? null, profile.data ?? null) < 100);
  };

  const completionPercentage = calculateProfileCompletion(fitnessProfile, userProfile);
  const bmi = calcBmi(fitnessProfile?.weight ?? null, fitnessProfile?.height ?? null);
  const daysLeft = daysUntilTarget(fitnessProfile?.targetDate ?? null);
  const weightDelta =
    fitnessProfile?.weight && fitnessProfile?.targetWeightKg
      ? (fitnessProfile.weight - fitnessProfile.targetWeightKg).toFixed(1)
      : null;

  return {
    fitnessProfile,
    showWizard,
    setShowWizard,
    loading,
    showReminder,
    setShowReminder,
    completionPercentage,
    bmi,
    daysLeft,
    weightDelta,
    fetchFitnessProfile,
  };
};

function calcBmi(weight: number | null, height: number | null): string {
  if (!weight || !height) return '--';
  return (weight / Math.pow(height / 100, 2)).toFixed(1);
}

function daysUntilTarget(date: string | null): number | null {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
