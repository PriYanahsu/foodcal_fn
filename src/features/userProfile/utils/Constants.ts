import type { FitnessDetails, ProfileData } from '../type';

export const EMPTY_PROFILE: ProfileData = {
  fullName: '',
  email: '',
  avatar_url: null,
};

export const GENDERS = ['Male', 'Female', 'Other'] as const;

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

/** Short forms for the phone tiles, where the full label truncates. */
export const ACTIVITY_SHORT: Record<string, string> = {
  Sedentary: 'Sedentary',
  'Lightly Active': 'Light',
  'Moderately Active': 'Moderate',
  'Very Active': 'Very active',
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

export const EMPTY_FITNESS_DETAILS: FitnessDetails = {
  id: '',
  gender: '',
  age: 0,
  height: 0,
  weight: 0,
  activityLevel: '',
  targetWeightKg: 0,
  objective: '',
  targetDate: '',
  dailyCalorieTarget: 0,
  dailyProteinTargetG: 0,
  dailyCarbsTargetG: 0,
  dailyFatTargetG: 0,
  aiCoachAdvice: '',
};
