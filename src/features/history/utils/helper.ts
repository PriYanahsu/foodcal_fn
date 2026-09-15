import type { FoodLog } from '@/features/Nutrition';
import type { History, HistoryOverviewStats, HistoryStats, MealMacro } from '../type';
import { DATE_LOCALE, EMPTY_HISTORY_STATS, MEAL_MACRO_COLORS } from './Constants';

export function toHistoryDate(dateInput: string | Date) {
  if (dateInput instanceof Date) return dateInput.toLocaleDateString(DATE_LOCALE);
  return decodeURIComponent(String(dateInput)).split('T')[0];
}

export function isHistoryToday(dateStr: string) {
  return toHistoryDate(dateStr) === new Date().toLocaleDateString(DATE_LOCALE);
}

export function isWithinLastDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  return d >= cutoff;
}

export function formatHistoryDate(dateStr: string, options: Intl.DateTimeFormatOptions) {
  return new Date(`${toHistoryDate(dateStr)}T12:00:00`).toLocaleDateString(undefined, options);
}

export function formatDayLabel(dateStr: string) {
  return formatHistoryDate(dateStr, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDayLabelLong(dateStr: string) {
  return formatHistoryDate(dateStr, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function calorieProgress(calories: number, target: number) {
  return Math.min(100, Math.round((calories / target) * 100));
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

export function getHistoryOverview(history: History[]): HistoryOverviewStats {
  const totalCalories = history.reduce((sum, day) => sum + day.stats.calories, 0);
  const weekCalories = history
    .filter((day) => isWithinLastDays(day.date, 7))
    .reduce((sum, day) => sum + day.stats.calories, 0);
  const avgCalories = history.length ? Math.round(totalCalories / history.length) : 0;

  return { totalCalories, weekCalories, avgCalories };
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

export function mealMacros(stats: Pick<HistoryStats, 'proteins' | 'carbohydrates' | 'fats'>): MealMacro[] {
  return [
    { label: 'Protein', value: stats.proteins, color: MEAL_MACRO_COLORS.protein },
    { label: 'Carbs', value: stats.carbohydrates, color: MEAL_MACRO_COLORS.carbs },
    { label: 'Fats', value: stats.fats, color: MEAL_MACRO_COLORS.fats },
  ];
}
