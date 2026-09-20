'use client';

import { useCallback, useMemo, useState } from 'react';
import { MealType, NutritionData } from '../types';
import { SERVING_MAX, SERVING_MIN, SERVING_STEP } from '../utils/constants';

/** The meal the clock suggests, so the picker is usually already right. */
export function mealTypeForNow(now = new Date()): MealType {
  const hour = now.getHours();
  if (hour < 4) return 'snack';
  if (hour < 11) return 'breakfast';
  if (hour < 16) return 'lunch';
  if (hour < 22) return 'dinner';
  return 'snack';
}

/**
 * What the user gets to change about a prediction before logging it: how much
 * they actually ate, and which meal it belongs to. The AI estimates a single
 * serving, so every number on the review panel is scaled from that — and the
 * meal type is set here because the scan API never returns one.
 *
 * `restart()` is called when a scan begins, so each prediction is reviewed from
 * one serving and the current time of day.
 */
export const useScanDraft = (data: NutritionData | null) => {
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState<MealType>(mealTypeForNow);

  const restart = useCallback(() => {
    setServings(1);
    setMealType(mealTypeForNow());
  }, []);

  const step = useCallback((delta: number) => {
    setServings((n) =>
      Math.min(SERVING_MAX, Math.max(SERVING_MIN, Number((n + delta).toFixed(2))))
    );
  }, []);

  const increment = useCallback(() => step(SERVING_STEP), [step]);
  const decrement = useCallback(() => step(-SERVING_STEP), [step]);

  const meal = useMemo<NutritionData | null>(() => {
    if (!data) return null;
    return {
      ...data,
      mealType,
      calories: data.calories * servings,
      proteinG: data.proteinG * servings,
      carbohydrateG: data.carbohydrateG * servings,
      fatG: data.fatG * servings,
      quantity: servings === 1 || !data.quantity ? data.quantity : `${servings} × ${data.quantity}`,
    };
  }, [data, servings, mealType]);

  return { servings, mealType, setMealType, increment, decrement, restart, meal };
};
