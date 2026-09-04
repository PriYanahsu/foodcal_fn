export function parseOptionalNumber(value: string): number | '' {
  if (value === '') return '';
  const n = Number(value);
  return Number.isFinite(n) ? n : '';
}
