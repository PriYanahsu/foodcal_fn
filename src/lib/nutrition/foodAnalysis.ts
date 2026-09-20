/**
 * Post-processing for the food-photo estimate.
 *
 * The model is trusted to recognise the dish and judge portion size; it is not
 * trusted with arithmetic. The component breakdown is re-added here and the
 * energy is reconciled against the Atwater factors (4 kcal/g protein and
 * carbohydrate, 9 kcal/g fat), so the calorie ring and the macro bars in the
 * app can never disagree with each other.
 */

export interface FoodItem {
  name: string;
  portion?: string;
  grams: number;
  calories: number;
  proteinG: number;
  carbohydrateG: number;
  fatG: number;
}

export interface FoodAnalysis {
  isFood: boolean;
  foodName: string;
  quantity: string;
  scaleReference?: string;
  usedNutritionLabel?: boolean;
  items?: FoodItem[];
  calories: number;
  proteinG: number;
  carbohydrateG: number;
  fatG: number;
  aiConfidence: number;
  analysisNotes: string;
}

export const toPositiveNumber = (value: unknown, fallback = 0): number => {
  const n = typeof value === 'string' ? Number(value.replace(/[^\d.-]/g, '')) : (value as number);
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : fallback;
};

const round1 = (value: number) => Math.round(value * 10) / 10;

/**
 * Trusts the model for recognition and portion estimation, but not for arithmetic:
 * re-adds the per-item values and reconciles the energy against the Atwater
 * factors (4/4/9) so the ring and the macro bars always agree.
 */
export function reconcile(analysis: FoodAnalysis): {
  nutrition: {
    foodName: string;
    quantity: string;
    calories: number;
    proteinG: number;
    carbohydrateG: number;
    fatG: number;
    aiConfidence: number;
    analysisNotes: string;
  };
  items: FoodItem[];
  adjustments: string[];
} {
  const adjustments: string[] = [];

  const items = (analysis.items ?? [])
    .map((item) => ({
      name: String(item?.name ?? '').trim() || 'Component',
      portion: item?.portion ? String(item.portion) : undefined,
      grams: round1(toPositiveNumber(item?.grams)),
      calories: Math.round(toPositiveNumber(item?.calories)),
      proteinG: round1(toPositiveNumber(item?.proteinG)),
      carbohydrateG: round1(toPositiveNumber(item?.carbohydrateG)),
      fatG: round1(toPositiveNumber(item?.fatG)),
    }))
    .filter((item) => item.calories > 0 || item.grams > 0);

  let calories = toPositiveNumber(analysis.calories);
  let proteinG = toPositiveNumber(analysis.proteinG);
  let carbohydrateG = toPositiveNumber(analysis.carbohydrateG);
  let fatG = toPositiveNumber(analysis.fatG);

  // The component breakdown is the more considered number; prefer it when the
  // stated totals drifted away from it.
  if (items.length > 1) {
    const sum = items.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        proteinG: acc.proteinG + item.proteinG,
        carbohydrateG: acc.carbohydrateG + item.carbohydrateG,
        fatG: acc.fatG + item.fatG,
      }),
      { calories: 0, proteinG: 0, carbohydrateG: 0, fatG: 0 }
    );

    if (sum.calories > 0 && Math.abs(sum.calories - calories) / sum.calories > 0.15) {
      ({ calories, proteinG, carbohydrateG, fatG } = sum);
      adjustments.push('totals recomputed from the component breakdown');
    }
  }

  // Atwater check: macros are estimated from portion sizes, so they win over a
  // stated calorie figure that does not follow from them.
  const derived = proteinG * 4 + carbohydrateG * 4 + fatG * 9;
  if (derived > 0 && Math.abs(derived - calories) / derived > 0.12) {
    calories = derived;
    adjustments.push('calories re-derived from macros (4/4/9)');
  }

  const totalGrams = items.reduce((acc, item) => acc + item.grams, 0);

  return {
    nutrition: {
      foodName: String(analysis.foodName ?? '').trim() || 'Meal',
      quantity:
        String(analysis.quantity ?? '').trim() ||
        (totalGrams > 0 ? `1 serving (~${Math.round(totalGrams)} g)` : '1 serving'),
      calories: Math.min(Math.round(calories), 5000),
      proteinG: Math.min(round1(proteinG), 500),
      carbohydrateG: Math.min(round1(carbohydrateG), 800),
      fatG: Math.min(round1(fatG), 400),
      aiConfidence: Math.min(Math.max(toPositiveNumber(analysis.aiConfidence), 0), 1),
      analysisNotes: String(analysis.analysisNotes ?? '').trim(),
    },
    items,
    adjustments,
  };
}
