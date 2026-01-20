export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  food_name: string;
  quantity?: string;
  health_info?: string;
}

export interface FoodScanResponse {
  success: boolean;
  data?: NutritionData;
  error?: string;
}
