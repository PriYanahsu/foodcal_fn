import type { FitnessDetails, ProfileData } from '../type';

export const EMPTY_PROFILE: ProfileData = {
  fullName: '',
  email: '',
  gender: '',
  avatar_url: null,
};

export const GENDERS = ['Male', 'Female', 'Other'] as const;

export const GOALS = ['Lose Weight', 'Maintain Weight', 'Gain Muscle'] as const;

export const ACTIVITY_LEVELS = [
  'Sedentary',
  'Lightly Active',
  'Moderately Active',
  'Very Active',
] as const;

export const ACTIVITY_HINTS: Record<string, string> = {
  Sedentary: 'Little or no exercise',
  'Lightly Active': '1–3 days/week',
  'Moderately Active': '3–5 days/week',
  'Very Active': '6–7 days/week',
};

export const MISSING_FIELD_LABELS: Record<string, string> = {
  full_name: 'Full name',
  avatar_url: 'Profile photo',
  gender: 'Gender',
  age: 'Age',
  height: 'Height',
  weight: 'Weight',
  activity_level: 'Activity level',
  goal: 'Fitness goal',
  target_weight: 'Target weight',
  target_date: 'Target date',
};

export const SELECT_CLASS =
  'w-full px-2.5 py-1.5 sm:px-4 sm:py-2.5 text-xs sm:text-base bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] appearance-none';

export const EMPTY_FITNESS_DETAILS: FitnessDetails = {
  id: '',
  age: 0,
  height: 0,
  weight: 0,
  activityLevel: '',
  targetWeightKg: 0,
  targetDate: '',
  dailyCalorieTarget: 0,
  dailyProteinTargetG: 0,
  dailyCarbsTargetG: 0,
  dailyFatTargetG: 0,
  aiCoachAdvice: '',
};
