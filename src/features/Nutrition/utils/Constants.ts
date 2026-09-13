import type { DailyHabit, DailyStats, LockedMacroPreview, MacroCardConfig } from '../type';

export const DATE_LOCALE = 'en-CA';

export const EMPTY_STATS: DailyStats = {
  calories: 0,
  proteins: 0,
  carbohydrates: 0,
  fats: 0,
};

export const MACRO_CARDS: MacroCardConfig[] = [
  { key: 'calories', label: 'Calories', icon: '🔥', color: '#ff4757', unit: '', delay: 0.1 },
  { key: 'proteins', label: 'Proteins', icon: '🥩', color: '#00ff88', unit: 'g', delay: 0.2 },
  { key: 'carbohydrates', label: 'Carbohydrates', icon: '🍞', color: '#2f81f7', unit: 'g', delay: 0.3 },
  { key: 'fats', label: 'Fats', icon: '🥑', color: '#bd34fe', unit: 'g', delay: 0.4 },
];

export const LOCKED_MACRO_PREVIEW: LockedMacroPreview[] = [
  { label: 'Cal', icon: '🔥' },
  { label: 'Protein', icon: '🥩' },
  { label: 'Carbs', icon: '🍞' },
  { label: 'Fats', icon: '🥑' },
];

export const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const DAILY_HABITS: DailyHabit[] = [
  { key: 'hydration', label: 'Hydration', icon: '🌊', value: '1.5 / 3 L', barClass: 'w-1/2' },
  { key: 'sleep', label: 'Sleep', icon: '💤', value: '6 / 8 hrs', barClass: 'w-3/4' },
];
