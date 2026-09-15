import type { HistoryStats } from '../type';

export const DATE_LOCALE = 'en-CA';

export const DEFAULT_CALORIE_TARGET = 2200;

export const EMPTY_HISTORY_STATS: HistoryStats = {
  calories: 0,
  proteins: 0,
  carbohydrates: 0,
  fats: 0,
};

export const MEAL_MACRO_COLORS = {
  protein: 'var(--accent)',
  carbs: '#d4a017',
  fats: '#e85d75',
} as const;
