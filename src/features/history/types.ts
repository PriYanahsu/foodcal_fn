export interface MealLog {
  id: string;
  user_id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  confidence?: number;
  meal_type: string;
  image_path: string | null;
  is_manual: boolean;
  created_at: string;
}

export interface DailySummary {
  date: string;
  totalCalories: number;
  mealCount: number;
}
