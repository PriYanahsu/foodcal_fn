export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface NutritionData {
  foodName: string;
  quantity: string;
  calories: number;
  proteinG: number;
  fatG: number;
  carbohydrateG: number;
  aiConfidence: number;
  analysisNotes: string;
  imagePath?: string;
  mealType: MealType;
  isManual?: boolean;
}

export interface FoodScanResponse {
  success: boolean;
  data?: NutritionData;
  error?: string;
}
