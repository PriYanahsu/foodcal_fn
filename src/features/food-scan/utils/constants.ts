import type { MealType } from '../types';

/** The three beats of a scan, shown as a stepper above the page. */
export const SCAN_STEPS = ['Photo', 'Review', 'Log'] as const;

/** Macro tiles on the review panel — one literal class set each, so Tailwind sees them. */
export const MACRO_FIELDS = [
    { field: 'proteinG', label: 'Protein', tone: 'border-protein/25 bg-protein/10', accent: 'text-protein' },
    { field: 'carbohydrateG', label: 'Carbs', tone: 'border-carbs/25 bg-carbs/10', accent: 'text-carbs' },
    { field: 'fatG', label: 'Fat', tone: 'border-fat/25 bg-fat/10', accent: 'text-fat' },
] as const;

export const MEAL_TYPES: readonly { key: MealType; label: string }[] = [
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'dinner', label: 'Dinner' },
    { key: 'snack', label: 'Snack' },
];

/** The AI estimates one serving; the user nudges that up or down before logging. */
export const SERVING_STEP = 0.5;
export const SERVING_MIN = 0.5;
export const SERVING_MAX = 10;

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
