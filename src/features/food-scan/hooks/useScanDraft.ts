'use client';

import { useCallback, useMemo, useState } from 'react';
import { EditableField, MealType, NutritionData } from '../types';

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
 * What the user gets to change about a prediction before logging it: the
 * numbers themselves, when the estimate is off, and which meal it belongs to —
 * the scan API never returns a meal type, so it is chosen here.
 *
 * `restart()` runs when a scan begins, so each prediction is reviewed fresh.
 */
export const useScanDraft = (data: NutritionData | null) => {
  const [mealType, setMealType] = useState<MealType>(mealTypeForNow);
  const [edits, setEdits] = useState<Partial<Record<EditableField, number>>>({});
  const [isEditing, setIsEditing] = useState(false);

  const restart = useCallback(() => {
    setEdits({});
    setIsEditing(false);
    setMealType(mealTypeForNow());
  }, []);

  const toggleEdit = useCallback(() => setIsEditing((on) => !on), []);

  const setField = useCallback((field: EditableField, value: number) => {
    // A cleared input reads as NaN; keep the last good number rather than store it.
    if (!Number.isFinite(value)) return;
    setEdits((current) => ({ ...current, [field]: Math.max(0, value) }));
  }, []);

  const meal = useMemo<NutritionData | null>(
    () => (data ? { ...data, ...edits, mealType } : null),
    [data, edits, mealType]
  );

  const isEdited = Object.keys(edits).length > 0;

  return { meal, mealType, setMealType, isEditing, toggleEdit, setField, isEdited, restart };
};
