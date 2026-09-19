'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Goals, Stats } from '../type';
import { EMPTY_GOALS, EMPTY_STATS } from '../utils/Constant';
import { FitnessDetails } from '@/features/userProfile';
import { fitnessConsultantApi, getFitness, queryKeys, updateFitness } from '@/app/service';
import { useRouter } from 'next/navigation';

export const useFitnessSetup = (userId: string, onComplete: () => void) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [aiResult, setAiResult] = useState<any>(null);
  const [toast, setToast] = useState<{
    message: string;
    detail?: string;
    actionLabel?: string;
    actionHref?: string;
  } | null>(null);
  const prefillApplied = useRef(false);

  const clearToast = useCallback(() => setToast(null), []);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [goals, setGoals] = useState<Goals>(EMPTY_GOALS);

  const { data: existingFitness, isLoading: prefillLoading } = useQuery({
    queryKey: queryKeys.fitness(userId),
    queryFn: getFitness,
    enabled: !!userId,
  });

  useEffect(() => {
    if (!existingFitness || prefillApplied.current) return;
    prefillApplied.current = true;

    const data: FitnessDetails = existingFitness;
    const weight = data.weight ?? '';
    const targetWeight = data.targetWeightKg ?? '';
    let objective = data.objective || '';
    if (weight !== 0 && targetWeight !== 0) {
      if (weight > targetWeight) objective = 'Lose Weight';
      else if (weight < targetWeight) objective = 'Gain Muscle';
      else objective = 'Maintain Weight';
    }
    setStats({
      gender: data.gender ?? '',
      age: data.age ?? '',
      height: data.height ?? '',
      weight,
      activity_level: data.activityLevel || '',
    });
    setGoals({
      objective,
      target_weight: targetWeight,
      target_date: data.targetDate || '',
    });
  }, [existingFitness]);

  const canProceedStep1 =
    !!stats.gender &&
    stats.age !== '' &&
    stats.height !== '' &&
    stats.weight !== '' &&
    !!stats.activity_level;

  const canProceedStep2 = !!goals.objective && goals.target_weight !== '' && !!goals.target_date;

  const derivedObjective = ((): string | null => {
    if (stats.weight === '' || goals.target_weight === '') return null;
    if (stats.weight > goals.target_weight) return 'Lose Weight';
    if (stats.weight < goals.target_weight) return 'Gain Muscle';
    return 'Maintain Weight';
  })();

  const isObjectiveAllowed = (o: string) => !derivedObjective || o === derivedObjective;

  const setTargetWeight = (value: number | '') => {
    const next = {
      ...goals,
      target_weight: value,
    };
    if (stats.weight !== '' && value !== '') {
      if (stats.weight > value) next.objective = 'Lose Weight';
      else if (stats.weight < value) next.objective = 'Gain Muscle';
      else next.objective = 'Maintain Weight';
    }
    setGoals(next);
  };

  const nextStep = () => {
    if (step === 1 && stats.weight !== '' && goals.target_weight !== '') {
      const obj =
        stats.weight > goals.target_weight
          ? 'Lose Weight'
          : stats.weight < goals.target_weight
            ? 'Gain Muscle'
            : 'Maintain Weight';
      if (goals.objective !== obj) setGoals((g) => ({ ...g, objective: obj }));
    }
    setStep((s) => s + 1);
  };
  const prevStep = () => setStep((s) => s - 1);

  const consultMutation = useMutation({
    mutationFn: () => fitnessConsultantApi(stats, goals),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      updateFitness({
        ...stats,
        ...goals,
        ...aiResult,
      } as FitnessDetails),
    onSuccess: async ({ data, status }) => {
      if (status !== 200 || !data) return;
      await queryClient.invalidateQueries({ queryKey: queryKeys.fitness(userId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.history });
      setToast({
        message: 'Plan saved to Fitness Hub!',
        detail:
          'Your calorie, protein, carbs & fat targets are live. Check Fitness Hub & dashboard to track them.',
        actionLabel: 'Open Fitness Hub',
        actionHref: '/fitness',
      });
      onComplete();
      router.refresh();
    },
  });

  const handleConsultAI = async () => {
    try {
      const result = await consultMutation.mutateAsync();
      setAiResult(result.data);
      setStep(4);
    } catch (error: any) {
      console.error('AI Consultation failed:', error);
      alert(`AI Consultation Error: ${error.message}`);
    }
  };

  const handleSavePlan = async () => {
    try {
      await saveMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to save plan:', error);
    }
  };

  return {
    step,
    setStep,
    loading: consultMutation.isPending || saveMutation.isPending,
    prefillLoading,
    aiResult,
    toast,
    clearToast,
    stats,
    goals,
    setStats,
    setGoals,
    nextStep,
    prevStep,
    canProceedStep1,
    canProceedStep2,
    isObjectiveAllowed,
    derivedObjective,
    setTargetWeight,
    handleConsultAI,
    handleSavePlan,
  };
};
