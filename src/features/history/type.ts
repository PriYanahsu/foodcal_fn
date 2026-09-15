export interface HistoryStats {
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
}

export interface History {
  date: string;
  stats: HistoryStats;
}

export interface HistoryOverviewStats {
  totalCalories: number;
  weekCalories: number;
  avgCalories: number;
}

export interface DailyMealListProps {
  date: string;
}

export interface MealDetailViewProps {
  date: string;
  mealId: string;
}

export interface MealMacro {
  label: string;
  value: number;
  color: string;
}
