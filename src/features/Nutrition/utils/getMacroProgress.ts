export function getMacroProgress(value: number, goal: number | null) {
  if (!goal) return undefined;
  return Math.min((value / goal) * 100, 100);
}

export function formatMacroValue(hasPlan: boolean, value: number) {
  return hasPlan ? Math.round(value) : '--';
}

export function formatMacroUnit(hasPlan: boolean, goal: number | null, unit: string) {
  if (!hasPlan || !goal) return '';
  return unit ? `/ ${goal}${unit}` : `/ ${goal}`;
}
