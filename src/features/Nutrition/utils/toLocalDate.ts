import { DATE_LOCALE } from './Constants';

export function toLocalDate(date: Date = new Date()) {
  return date.toLocaleDateString(DATE_LOCALE);
}

export function toApiDate(dateInput: string | Date) {
  if (dateInput instanceof Date) return toLocalDate(dateInput);
  return decodeURIComponent(String(dateInput)).split('T')[0];
}

/** Parses a `YYYY-MM-DD` string as a local date (at noon, so DST never shifts the day). */
export function fromLocalDate(dateStr: string) {
  return new Date(`${dateStr}T12:00:00`);
}

export function shiftDate(dateStr: string, days: number) {
  const date = fromLocalDate(dateStr);
  date.setDate(date.getDate() + days);
  return toLocalDate(date);
}

export function isToday(dateStr: string) {
  return dateStr === toLocalDate();
}

export function toStatsDate(dateStr: string) {
  return `${dateStr}T00:00:00`;
}

/** The Monday–Sunday week containing `dateStr`, as `YYYY-MM-DD` strings. */
export function weekOf(dateStr: string) {
  const date = fromLocalDate(dateStr);
  const mondayOffset = (date.getDay() + 6) % 7;
  const monday = shiftDate(dateStr, -mondayOffset);
  return Array.from({ length: 7 }, (_, i) => shiftDate(monday, i));
}

/** "Friday, 18 September" */
export function formatLongDate(dateStr: string) {
  return fromLocalDate(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function greetingFor(date: Date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
