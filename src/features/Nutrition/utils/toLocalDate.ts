import { DATE_LOCALE } from './Constants';

export function toLocalDate(date: Date = new Date()) {
  return date.toLocaleDateString(DATE_LOCALE);
}

export function toApiDate(dateInput: string | Date) {
  if (dateInput instanceof Date) return toLocalDate(dateInput);
  return decodeURIComponent(String(dateInput)).split('T')[0];
}

export function shiftDate(dateStr: string, days: number) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return toLocalDate(date);
}

export function isToday(dateStr: string) {
  return dateStr === toLocalDate();
}

export function toStatsDate(dateStr: string) {
  return `${dateStr}T00:00:00`;
}
