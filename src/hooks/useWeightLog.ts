'use client';

import { queryKeys } from '@/app/service';
import { getWeights, logWeight as logWeightApi, type WeightPoint } from '@/app/service/weight.api';
import { toLocalDate } from '@/features/Nutrition/utils/toLocalDate';
import { usePlanGate } from '@/features/onboarding/context/PlanGateContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type { WeightPoint };

function asDate(iso: string | null | undefined): string {
  if (!iso) return toLocalDate();
  return iso.slice(0, 10);
}

export function useWeightLog(
  userId: string | undefined,
  rawProfileWeight: number | null,
  rawTargetWeight: number | null,
  createdAt?: string | null
) {
  const queryClient = useQueryClient();
  const { canLog } = usePlanGate();
  // A new account's fitness row is zero-filled: 0 kg means "not set", never a reading.
  const profileWeight = rawProfileWeight || null;
  const targetWeight = rawTargetWeight || null;

  const { data: raw = [] } = useQuery({
    queryKey: queryKeys.weights(userId ?? ''),
    queryFn: () => getWeights(userId!),
    enabled: !!userId,
  });

  const logs = [...raw].sort((a, b) => a.loggedOn.localeCompare(b.loggedOn));
  const start = profileWeight ?? logs[0]?.weightKg ?? null;
  const current = logs.at(-1)?.weightKg ?? profileWeight ?? null;
  const startPoint: WeightPoint | null =
    profileWeight != null ? { weightKg: profileWeight, loggedOn: asDate(createdAt) } : null;
  const points = startPoint ? [startPoint, ...logs] : logs;
  const lastLoggedOn = logs.at(-1)?.loggedOn ?? null;
  const startedOn = startPoint?.loggedOn ?? logs[0]?.loggedOn ?? null;
  const loggedToday = (lastLoggedOn?.slice(0, 10) ?? '') === toLocalDate();
  const change = current !== null && start !== null ? current - start : null;
  const toGo = current !== null && targetWeight ? current - targetWeight : null;

  let progress: number | null = null;
  if (current !== null && start !== null && targetWeight && start !== targetWeight) {
    progress = Math.round(
      Math.min(Math.max((start - current) / (start - targetWeight), 0), 1) * 100
    );
  }

  const logWeightMutation = useMutation({
    mutationFn: (weightKg: number) => logWeightApi(weightKg),
    onSuccess: () => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.weights(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.fitness(userId) });
    },
  });

  const logWeight = (weight: number) => {
    // Weigh-ins track progress toward the plan's target, so none are saved without one.
    if (!Number.isFinite(weight) || !canLog) return;
    logWeightMutation.mutate(weight);
  };

  return {
    startPoint,
    points,
    current,
    start,
    startedOn,
    lastLoggedOn,
    loggedToday,
    change,
    toGo,
    progress,
    logWeight,
  };
}
