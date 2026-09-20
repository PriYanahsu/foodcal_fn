import type { MealType } from '../types';

/** The three beats of a scan, shown as a stepper above the page. */
export const SCAN_STEPS = ['Photo', 'Review', 'Log'] as const;

/**
 * Macro tiles on the review panel. `kcalPerG` drives the "% of kcal" caption;
 * colour classes are literal so Tailwind can see them.
 */
export const MACRO_FIELDS = [
  { field: 'proteinG', label: 'Protein', bar: 'bg-protein', kcalPerG: 4 },
  { field: 'carbohydrateG', label: 'Carbs', bar: 'bg-carbs', kcalPerG: 4 },
  { field: 'fatG', label: 'Fat', bar: 'bg-fat', kcalPerG: 9 },
] as const;

export const MEAL_TYPES: readonly { key: MealType; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snack', label: 'Snack' },
];

export const CHIP_POSITIONS = [
  { top: '16%', left: '6%' },
  { top: '26%', right: '5%' },
  { bottom: '30%', left: '8%' },
  { bottom: '20%', right: '7%' },
] as const;

export const DEFAULT_CHIPS = ['Protein source', 'Carbs detected', 'Portion size', 'Fats estimate'];

export const ANALYSIS_STEPS = [
  'Detecting food items…',
  'Identifying ingredients…',
  'Estimating portions…',
  'Calculating macros…',
  'Finalizing prediction…',
] as const;
