import type { DailyStats } from '../type';

export const DATE_LOCALE = 'en-CA';

export const EMPTY_STATS: DailyStats = {
  calories: 0,
  proteins: 0,
  carbohydrates: 0,
  fats: 0,
};

/** Water tracker: one tap = one glass. */
export const WATER_GLASS_ML = 250;
export const WATER_GOAL_ML = 3000;

/** Main meals in day order; the dashboard offers to add whichever are missing. */
export const MAIN_MEALS = ['breakfast', 'lunch', 'dinner'] as const;
