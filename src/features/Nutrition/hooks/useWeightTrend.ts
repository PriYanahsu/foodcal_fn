'use client';

import { useLocalValue } from '@/lib/local-store';

export interface WeightPoint {
  weight: number;
  created_at: string;
}

const NO_LOGS: WeightPoint[] = [];

/**
 * Weight history for the dashboard card. Reads the same device-local log the
 * Plan page writes to (`weight_logs_<userId>`, newest first), falling back to
 * the profile weight when nothing has been logged yet.
 */
export function useWeightTrend(
  userId: string | undefined,
  profileWeight: number,
  targetWeight: number
) {
  const logs = useLocalValue<WeightPoint[]>(userId ? `weight_logs_${userId}` : null, NO_LOGS);

  // Oldest → newest for the chart.
  const points = [...logs].reverse();
  const current = logs[0]?.weight ?? (profileWeight || null);
  const start = points[0]?.weight ?? current;
  const since = points[0]?.created_at ?? null;
  const change = current !== null && start !== null ? current - start : null;

  // How far from the starting weight to the target, 0–100.
  let progress: number | null = null;
  if (current !== null && start !== null && targetWeight && start !== targetWeight) {
    progress = Math.round(
      Math.min(Math.max((start - current) / (start - targetWeight), 0), 1) * 100
    );
  }

  return { points, current, change, since, progress };
}
