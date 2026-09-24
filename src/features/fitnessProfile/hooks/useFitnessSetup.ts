'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AiPlan, Goals, Stats } from '../type';
import { EMPTY_GOALS, EMPTY_STATS } from '../utils/Constant';
import { FitnessDetails } from '@/features/userProfile';
import { fitnessConsultantApi, getFitness, queryKeys, updateFitness } from '@/app/service';
import { useRouter } from 'next/navigation';

export const useFitnessSetup = (userId: string, onComplete: () => void) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [aiResult, setAiResult] = useState<AiPlan | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    detail?: string;
    actionLabel?: string;
    actionHref?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    // A new account's fitness row comes back zero-filled; `||` turns those zeros into
    // empty fields, so typing "3" gives 3 instead of "03".
    const weight = data.weight || '';
    const targetWeight = data.targetWeightKg || '';
    let objective = data.objective || '';
    if (weight !== '' && targetWeight !== '') {
      if (weight > targetWeight) objective = 'Lose Weight';
      else if (weight < targetWeight) objective = 'Gain Muscle';
      else objective = 'Maintain Weight';
    }
    setStats({
      gender: data.gender ?? '',
      age: data.age || '',
      height: data.height || '',
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
    setError(null);
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
  const prevStep = () => {
    setError(null);
    setStep((s) => s - 1);
  };

  const consultMutation = useMutation({
    mutationFn: () => fitnessConsultantApi(stats, goals),
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      // The API speaks camelCase FitnessDetails while the wizard state is
      // snake_case and the coach nests its numbers under `targets`, so the
      // fields are mapped by hand: a spread here silently drops every target.
      const targets = aiResult?.targets;
      return updateFitness({
        gender: stats.gender,
        age: Number(stats.age),
        height: Number(stats.height),
        weight: Number(stats.weight),
        activityLevel: stats.activity_level,
        objective: goals.objective,
        targetWeightKg: Number(goals.target_weight),
        targetDate: goals.target_date,
        dailyCalorieTarget: targets?.calories,
        dailyProteinTargetG: targets?.protein,
        dailyCarbsTargetG: targets?.carbs,
        dailyFatTargetG: targets?.fats,
        aiCoachAdvice: aiResult?.advice,
      } as FitnessDetails);
    },
    onSuccess: async ({ data, status }) => {
      if (status !== 200 || !data) {
        setError('Your plan couldn’t be saved. Please try again.');
        return;
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.fitness(userId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.history });
      setToast({
        message: 'Your plan is live',
        detail:
          'Your calorie, protein, carbs and fat targets now show on the dashboard and in My plan.',
        actionLabel: 'Open My plan',
        actionHref: '/fitness',
      });
      onComplete();
      router.refresh();
    },
  });

  const handleConsultAI = async () => {
    setError(null);
    try {
      const result = await consultMutation.mutateAsync();
      setAiResult(result.data);
      setStep(4);
    } catch (err) {
      console.error('AI Consultation failed:', err);
      setError('Your coach couldn’t be reached. Check your connection and try again.');
    }
  };

  const handleSavePlan = async () => {
    setError(null);
    try {
      await saveMutation.mutateAsync();
    } catch (err) {
      console.error('Failed to save plan:', err);
      setError('Your plan couldn’t be saved. Please try again.');
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
    error,
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
