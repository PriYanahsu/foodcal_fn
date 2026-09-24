import type { FitnessDetails } from '@/features/userProfile';
import type { NutritionGoals } from '../type';

export function deriveNutritionGoals(fitness: FitnessDetails): NutritionGoals {
  return {
    calories: fitness.dailyCalorieTarget || null,
    proteins: fitness.dailyProteinTargetG || null,
    carbohydrates: fitness.dailyCarbsTargetG || null,
    fats: fitness.dailyFatTargetG || null,
  };
}

/**
 * The one test for "has a plan": the AI coach has written daily calorie targets.
 * A goal on its own isn't enough: saving body details on the Profile page sets
 * `objective` from the weights without ever running the coach.
 */
export function hasNutritionPlan(fitness: FitnessDetails | null | undefined) {
  return (fitness?.dailyCalorieTarget ?? 0) > 0;
}
