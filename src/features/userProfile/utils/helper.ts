import { FitnessDetails, ProfileData } from '../type';
import { MISSING_FIELD_LABELS } from './Constants';

function isBlank(value: unknown) {
  return value === null || value === undefined || value === '' || value === 0;
}

export function getMissingFields(profile: ProfileData, fitness: FitnessDetails): string[] {
  const checks: [string, unknown][] = [
    ['full_name', profile.fullName],
    ['avatar_url', profile.avatar_url],
    ['gender', fitness.gender],
    ['age', fitness.age],
    ['height', fitness.height],
    ['weight', fitness.weight],
    ['activity_level', fitness.activityLevel],
    ['target_weight', fitness.targetWeightKg],
    ['target_date', fitness.targetDate],
  ];

  return checks
    .filter(([, value]) => isBlank(value))
    .map(([key]) => MISSING_FIELD_LABELS[key] ?? key);
}

export function parseOptionalNumber(value: string): number | '' {
  if (value === '') return '';
  const n = Number(value);
  return Number.isFinite(n) ? n : '';
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function deriveGoal(
  weight: number | '',
  targetWeight: number | null | undefined
): string | null {
  if (weight === '' || !targetWeight) return null;
  if (weight > targetWeight) return 'Lose Weight';
  if (weight < targetWeight) return 'Gain Muscle';
  return 'Maintain Weight';
}

export function getInitials(fullName: string, email: string) {
  const name = fullName.trim();
  if (name) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }
  const local = email.trim().split('@')[0] ?? '';
  return local.slice(0, 2).toUpperCase();
}
