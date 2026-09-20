/**
 * Deterministic calorie / macro engine.
 *
 * Language models are unreliable arithmetic engines, so every number a user is
 * held to (TDEE, calories, macros, feasibility) is computed here in TypeScript.
 * The model is only asked to explain and coach on top of these numbers.
 *
 * Formulas / guard rails:
 * - BMR: Mifflin-St Jeor (the most accurate general predictive equation).
 * - TDEE: BMR x activity factor (1.2 - 1.9).
 * - Body-mass energy: ~7700 kcal per kg of tissue.
 * - Safe loss: <= ~0.75%/week of body weight, hard-capped at 1 kg/week.
 * - Safe gain: <= ~0.35%/week of body weight, hard-capped at 0.5 kg/week.
 * - Deficit capped at 25% of TDEE, surplus at 20% of TDEE (max 500 kcal).
 * - Calorie floors: 1500 kcal (male) / 1200 kcal (female) and never < 80% BMR.
 * - Protein 1.6-2.0 g/kg of goal weight, fat 25-27% of energy (>= 0.6 g/kg),
 *   carbohydrate takes the remainder with a 50 g/day floor.
 */

export const KCAL_PER_KG_BODY_MASS = 7700;

export interface PlanInput {
  gender: string;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: string;
  objective: string;
  targetWeightKg: number;
  targetDate: string;
}

export interface PlanTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface PlanMetrics {
  bmr: number;
  tdee: number;
  activityFactor: number;
  bmi: number;
  targetBmi: number;
  weeksAvailable: number;
  totalChangeKg: number;
  requiredWeeklyKg: number;
  plannedWeeklyKg: number;
  safeWeeklyLimitKg: number;
  dailyDeltaKcal: number;
  projectedWeeks: number | null;
  projectedDate: string | null;
  proteinPerKg: number;
}

export interface ComputedPlan {
  status: 'approved' | 'rejected';
  direction: 'lose' | 'gain' | 'maintain';
  targets: PlanTargets;
  metrics: PlanMetrics;
  /** Machine-readable facts handed to the coach model so its copy matches the math. */
  flags: string[];
}

export type PlanInputError = { field: string; message: string };

const ACTIVITY_FACTORS: Array<{ match: RegExp; factor: number }> = [
  { match: /sedentary|no exercise|desk/, factor: 1.2 },
  { match: /light/, factor: 1.375 },
  { match: /moderate/, factor: 1.55 },
  { match: /very|heavy/, factor: 1.725 },
  { match: /extra|athlete|extreme/, factor: 1.9 },
];

const toNumber = (value: unknown): number | null => {
  const n = typeof value === 'string' ? Number(value.trim()) : (value as number);
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
};

const round = (value: number, step = 1) => Math.round(value / step) * step;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function activityFactorFor(activityLevel: string): number {
  const level = (activityLevel || '').toLowerCase();
  return ACTIVITY_FACTORS.find(({ match }) => match.test(level))?.factor ?? 1.2;
}

/** Mifflin-St Jeor. "Other" / unspecified sits midway between the male and female constants. */
export function basalMetabolicRate(input: {
  gender: string;
  age: number;
  heightCm: number;
  weightKg: number;
}): number {
  const gender = (input.gender || '').toLowerCase();
  const constant = gender.startsWith('m') ? 5 : gender.startsWith('f') ? -161 : -78;
  return 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age + constant;
}

/** Validates and coerces the wizard payload. Returns typed errors instead of throwing. */
export function normalizePlanInput(
  stats: Record<string, unknown> | undefined,
  goals: Record<string, unknown> | undefined
): { input: PlanInput; errors: PlanInputError[] } {
  const errors: PlanInputError[] = [];

  const age = toNumber(stats?.age);
  const heightCm = toNumber(stats?.height);
  const weightKg = toNumber(stats?.weight);
  const targetWeightKg = toNumber(goals?.target_weight ?? goals?.targetWeight);
  const targetDate = String(goals?.target_date ?? goals?.targetDate ?? '');

  if (age === null || age < 13 || age > 100) {
    errors.push({ field: 'age', message: 'Age must be between 13 and 100.' });
  }
  if (heightCm === null || heightCm < 100 || heightCm > 250) {
    errors.push({ field: 'height', message: 'Height must be between 100 and 250 cm.' });
  }
  if (weightKg === null || weightKg < 30 || weightKg > 350) {
    errors.push({ field: 'weight', message: 'Weight must be between 30 and 350 kg.' });
  }
  if (targetWeightKg === null || targetWeightKg < 30 || targetWeightKg > 350) {
    errors.push({
      field: 'target_weight',
      message: 'Target weight must be between 30 and 350 kg.',
    });
  }
  if (!targetDate || Number.isNaN(Date.parse(targetDate))) {
    errors.push({ field: 'target_date', message: 'A valid target date is required.' });
  }

  return {
    input: {
      gender: String(stats?.gender ?? ''),
      age: age ?? 0,
      heightCm: heightCm ?? 0,
      weightKg: weightKg ?? 0,
      activityLevel: String(stats?.activity_level ?? stats?.activityLevel ?? ''),
      objective: String(goals?.objective ?? ''),
      targetWeightKg: targetWeightKg ?? 0,
      targetDate,
    },
    errors,
  };
}

function weeksUntil(targetDate: string, from = new Date()): number {
  const target = new Date(targetDate);
  const start = new Date(from);
  target.setHours(12, 0, 0, 0);
  start.setHours(12, 0, 0, 0);
  const days = (target.getTime() - start.getTime()) / 86_400_000;
  return days / 7;
}

function addWeeks(weeks: number, from = new Date()): string {
  const date = new Date(from);
  date.setDate(date.getDate() + Math.ceil(weeks * 7));
  return date.toISOString().slice(0, 10);
}

/**
 * Splits an energy target into macros, then re-derives calories from the rounded
 * grams so the ring and the macro bars on the dashboard can never disagree.
 */
function splitMacros(
  calories: number,
  goalWeightKg: number,
  direction: ComputedPlan['direction']
): { targets: PlanTargets; proteinPerKg: number } {
  const proteinPerKg = direction === 'lose' ? 2.0 : direction === 'gain' ? 1.8 : 1.6;
  const fatShare = direction === 'lose' ? 0.25 : 0.27;

  let protein = Math.max(60, goalWeightKg * proteinPerKg);
  // Protein above ~40% of energy crowds out the fuel needed to train.
  protein = Math.min(protein, (calories * 0.4) / 4);

  let fat = Math.max((calories * fatShare) / 9, goalWeightKg * 0.6);
  let carbs = (calories - protein * 4 - fat * 9) / 4;

  // Carbohydrate floor (~brain glucose demand): claw energy back from fat first,
  // then from protein, before letting carbs fall below 50 g.
  if (carbs < 50) {
    const minFat = goalWeightKg * 0.6;
    fat = Math.max(minFat, (calories - protein * 4 - 50 * 4) / 9);
    carbs = (calories - protein * 4 - fat * 9) / 4;
  }
  if (carbs < 50) {
    protein = Math.max(goalWeightKg * 1.4, (calories - fat * 9 - 50 * 4) / 4);
    carbs = (calories - protein * 4 - fat * 9) / 4;
  }

  const rounded = {
    protein: Math.round(protein),
    fats: Math.round(fat),
    carbs: Math.max(30, Math.round(carbs)),
  };

  return {
    targets: {
      // Anchor calories to the rounded macros: 4/4/9 always reconciles exactly.
      calories: rounded.protein * 4 + rounded.carbs * 4 + rounded.fats * 9,
      protein: rounded.protein,
      carbs: rounded.carbs,
      fats: rounded.fats,
    },
    proteinPerKg: Math.round((rounded.protein / goalWeightKg) * 100) / 100,
  };
}

export function computePlan(input: PlanInput, now = new Date()): ComputedPlan {
  const flags: string[] = [];

  const activityFactor = activityFactorFor(input.activityLevel);
  if (!input.activityLevel) {
    flags.push('activity_level_missing_assumed_sedentary');
  }

  const bmr = basalMetabolicRate(input);
  const tdee = bmr * activityFactor;
  const heightM = input.heightCm / 100;
  const bmi = input.weightKg / (heightM * heightM);
  const targetBmi = input.targetWeightKg / (heightM * heightM);

  const totalChangeKg = input.targetWeightKg - input.weightKg;
  const direction: ComputedPlan['direction'] =
    Math.abs(totalChangeKg) < 0.5 ? 'maintain' : totalChangeKg < 0 ? 'lose' : 'gain';

  const weeksAvailable = Math.max(0, weeksUntil(input.targetDate, now));
  const safeLossPerWeek = clamp(input.weightKg * 0.0075, 0.25, 1.0);
  const safeGainPerWeek = clamp(input.weightKg * 0.0035, 0.12, 0.5);
  const safeWeeklyLimitKg = direction === 'gain' ? safeGainPerWeek : safeLossPerWeek;

  const requiredWeeklyKg = weeksAvailable > 0 ? totalChangeKg / weeksAvailable : Infinity;
  const plannedWeeklyKg =
    direction === 'maintain' ? 0 : clamp(requiredWeeklyKg, -safeLossPerWeek, safeGainPerWeek);

  // Energy delta from the planned rate, then the safety caps on top.
  let dailyDeltaKcal = (plannedWeeklyKg * KCAL_PER_KG_BODY_MASS) / 7;
  const maxDeficit = tdee * 0.25;
  const maxSurplus = Math.min(tdee * 0.2, 500);
  dailyDeltaKcal = clamp(dailyDeltaKcal, -maxDeficit, maxSurplus);

  const genderFloor = (input.gender || '').toLowerCase().startsWith('m')
    ? 1500
    : (input.gender || '').toLowerCase().startsWith('f')
      ? 1200
      : 1300;
  const calorieFloor = Math.max(genderFloor, bmr * 0.8);

  let calories = tdee + dailyDeltaKcal;
  if (calories < calorieFloor) {
    calories = calorieFloor;
    flags.push('calorie_floor_applied');
  }

  const goalWeightKg = Math.min(input.weightKg, input.targetWeightKg);
  const { targets, proteinPerKg } = splitMacros(round(calories, 10), goalWeightKg, direction);

  // Re-derive the rate the final calorie number actually delivers.
  const effectiveDailyDelta = targets.calories - tdee;
  const effectiveWeeklyKg = (effectiveDailyDelta * 7) / KCAL_PER_KG_BODY_MASS;
  const projectedWeeks =
    direction === 'maintain' || Math.abs(effectiveWeeklyKg) < 0.01
      ? null
      : Math.abs(totalChangeKg / effectiveWeeklyKg);
  const projectedDate = projectedWeeks === null ? null : addWeeks(projectedWeeks, now);

  let status: ComputedPlan['status'] = 'approved';

  if (weeksAvailable < 1 && direction !== 'maintain') {
    status = 'rejected';
    flags.push('target_date_too_soon');
  }
  if (direction !== 'maintain' && Math.abs(requiredWeeklyKg) > safeWeeklyLimitKg * 1.05) {
    status = 'rejected';
    flags.push(direction === 'lose' ? 'rate_too_aggressive_loss' : 'rate_too_aggressive_gain');
  }
  if (targetBmi < 17.5) {
    status = 'rejected';
    flags.push('target_weight_below_healthy_bmi');
  }
  if (direction === 'gain' && targetBmi > 32) {
    status = 'rejected';
    flags.push('target_weight_above_healthy_bmi');
  }
  if (input.age < 18) {
    flags.push('minor_requires_clinician_guidance');
  }
  if (bmi >= 30) {
    flags.push('starting_bmi_obese_range');
  }

  return {
    status,
    direction,
    targets,
    metrics: {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      activityFactor,
      bmi: Math.round(bmi * 10) / 10,
      targetBmi: Math.round(targetBmi * 10) / 10,
      weeksAvailable: Math.round(weeksAvailable * 10) / 10,
      totalChangeKg: Math.round(totalChangeKg * 10) / 10,
      requiredWeeklyKg: Number.isFinite(requiredWeeklyKg)
        ? Math.round(requiredWeeklyKg * 100) / 100
        : 0,
      plannedWeeklyKg: Math.round(plannedWeeklyKg * 100) / 100,
      safeWeeklyLimitKg: Math.round(safeWeeklyLimitKg * 100) / 100,
      dailyDeltaKcal: Math.round(effectiveDailyDelta),
      projectedWeeks: projectedWeeks === null ? null : Math.round(projectedWeeks * 10) / 10,
      projectedDate,
      proteinPerKg,
    },
    flags,
  };
}
