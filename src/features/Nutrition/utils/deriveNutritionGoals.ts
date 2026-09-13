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

export function hasNutritionPlan(fitness: FitnessDetails) {
  return !!fitness.objective;
}
