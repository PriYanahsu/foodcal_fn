'use client';

import { getLocal, profileKey, setLocal, useLocalValue } from '@/lib/local-store';

export interface WeightPoint {
  weight: number;
  created_at: string;
}

const NO_LOGS: WeightPoint[] = [];

const weightLogKey = (userId: string) => `weight_logs_${userId}`;

/**
 * Weigh-ins for the plan screen. Same device-local log the dashboard's weight
 * card reads (`weight_logs_<userId>`, newest first), so both stay in step.
 */
export function useWeightLog(
  userId: string | undefined,
  profileWeight: number | null,
  targetWeight: number | null
) {
  const logs = useLocalValue<WeightPoint[]>(userId ? weightLogKey(userId) : null, NO_LOGS);

  // Oldest → newest for the chart.
  const points = [...logs].reverse();
  const current = logs[0]?.weight ?? profileWeight ?? null;
  const start = points[0]?.weight ?? profileWeight ?? null;
  const startedOn = points[0]?.created_at ?? null;
  const change = current !== null && start !== null ? current - start : null;
  const toGo = current !== null && targetWeight ? current - targetWeight : null;

  // How far from the starting weight to the target, 0–100.
  let progress: number | null = null;
  if (current !== null && start !== null && targetWeight && start !== targetWeight) {
    progress = Math.round(
      Math.min(Math.max((start - current) / (start - targetWeight), 0), 1) * 100
    );
  }

  const logWeight = (weight: number) => {
    if (!userId || !Number.isFinite(weight)) return;
    const stored = getLocal<WeightPoint[]>(weightLogKey(userId)) ?? [];
    stored.unshift({ weight, created_at: new Date().toISOString() });
    setLocal(weightLogKey(userId), stored);

    const profile = getLocal<Record<string, unknown>>(profileKey(userId)) ?? {};
    setLocal(profileKey(userId), { ...profile, weight });
  };

  return { points, current, start, startedOn, change, toGo, progress, logWeight };
}
