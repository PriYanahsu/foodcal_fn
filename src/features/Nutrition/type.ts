export interface DailyStats {
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
}

export interface FoodLog {
  id: string;
  date: string;
  foodName: string;
  calories: number;
  mealType: string;
  imagePath: string | null;
  proteinG: number;
  carbohydrateG: number;
  fatG: number;
  createdAt: string;
  isManual: boolean;
  confidenceLevel: number;
}

export interface NutritionGoals {
  calories: number | null;
  proteins: number | null;
  carbohydrates: number | null;
  fats: number | null;
}

export type MacroKey = keyof DailyStats;
