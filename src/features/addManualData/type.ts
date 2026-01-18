export interface ManualMealData {
    food_name: string;
    calories: number | '';
    protein?: number | '';
    carbs?: number | '';
    fats?: number | '';
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    image_path?: string;
}
