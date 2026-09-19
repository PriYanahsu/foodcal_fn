import type { FoodLog } from '@/features/Nutrition';
import type { History, HistoryStats } from '../type';
import { DATE_LOCALE, EMPTY_HISTORY_STATS } from './Constants';

export function toHistoryDate(dateInput: string | Date) {
  if (dateInput instanceof Date) return dateInput.toLocaleDateString(DATE_LOCALE);
  return decodeURIComponent(String(dateInput)).split('T')[0];
}

export function normalizeStats(stats?: Partial<HistoryStats> | null): HistoryStats {
  return {
    calories: stats?.calories ?? 0,
    proteins: stats?.proteins ?? 0,
    carbohydrates: stats?.carbohydrates ?? 0,
    fats: stats?.fats ?? 0,
  };
}

export function toHistoryList(data: Record<string, HistoryStats> | null | undefined): History[] {
  return Object.entries(data ?? {})
    .map(([date, stats]) => ({
      date,
      stats: normalizeStats(stats),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function sumMealStats(meals: FoodLog[]): HistoryStats {
  return meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      proteins: acc.proteins + (meal.proteinG || 0),
      carbohydrates: acc.carbohydrates + (meal.carbohydrateG || 0),
      fats: acc.fats + (meal.fatG || 0),
    }),
    { ...EMPTY_HISTORY_STATS }
  );
}
