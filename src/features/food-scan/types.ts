export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  name?: string;
}

export interface FoodScanResponse {
  success: boolean;
  data?: NutritionData;
  error?: string;
}
