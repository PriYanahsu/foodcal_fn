import { FitnessDetails, ProfileData } from '../type';
import { MISSING_FIELD_LABELS } from './Constants';

function isBlank(value: unknown) {
  return value === null || value === undefined || value === '' || value === 0;
}

export function getMissingFields(profile: ProfileData, fitness: FitnessDetails): string[] {
  const checks: [string, unknown][] = [
    ['full_name', profile.fullName],
    ['avatar_url', profile.avatar_url],
    ['gender', profile.gender],
    ['age', fitness.age],
    ['height', fitness.height],
    ['weight', fitness.weight],
    ['activity_level', fitness.activity_level],
    ['target_weight', fitness.target_weight_kg],
    ['target_date', fitness.target_date],
  ];

  return checks
    .filter(([, value]) => isBlank(value))
    .map(([key]) => MISSING_FIELD_LABELS[key] ?? key);
}
