'use client';

import { getLocal, setLocal, useLocalValue } from '@/lib/local-store';
import { usePlanGate } from '@/features/onboarding/context/PlanGateContext';
import { WATER_GLASS_ML, WATER_GOAL_ML } from '../utils/Constants';

const waterKey = (userId: string, date: string) => `water_${userId}_${date}`;

/**
 * Water drunk on `date`, in ml. Stored on this device only — there is no
 * backend endpoint for water yet, so it doesn't sync across devices.
 */
export function useWaterIntake(userId: string | undefined, date: string) {
  const key = userId ? waterKey(userId, date) : null;
  const ml = useLocalValue<number>(key, 0);
  const { canLog } = usePlanGate();

  const change = (deltaMl: number) => {
    // Water is logged against the plan's goal, so nothing is saved without one.
    if (!key || !canLog) return;
    // Read the stored value, not the render's, so fast repeat taps all count.
    const current = getLocal<number>(key) ?? 0;
    setLocal(key, Math.max(0, current + deltaMl));
  };

  return {
    ml,
    canLog,
    goalMl: WATER_GOAL_ML,
    addGlass: () => change(WATER_GLASS_ML),
    removeGlass: () => change(-WATER_GLASS_ML),
  };
}
