export function deriveGoal(
  weight: number | '',
  targetWeight: number | null | undefined
): string | null {
  if (weight === '' || !targetWeight) return null;
  if (weight > targetWeight) return 'Lose Weight';
  if (weight < targetWeight) return 'Gain Muscle';
  return 'Maintain Weight';
}
