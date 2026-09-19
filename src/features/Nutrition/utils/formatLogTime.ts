import type { FoodLog } from '../type';
import { toApiDate } from './toLocalDate';

export function formatLogTime(iso: string | null) {
  if (!iso) return '';
  // "1:25 PM" in 12-hour locales, "13:25" in 24-hour ones — no leading zero.
  return new Date(iso).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** "Lunch · 1:10 PM", or just "Lunch" when the log has no time. */
export function mealTypeAndTime(log: FoodLog) {
  const type = log.mealType ? log.mealType[0].toUpperCase() + log.mealType.slice(1) : '';
  return [type, formatLogTime(log.createdAt)].filter(Boolean).join(' · ');
}

/** Oldest first; logs without a time go last. */
export function byLogTime(a: FoodLog, b: FoodLog) {
  if (!a.createdAt || !b.createdAt) return a.createdAt ? -1 : b.createdAt ? 1 : 0;
  return a.createdAt.localeCompare(b.createdAt);
}

/** Opens the history calendar on the meal's day, with the meal expanded. */
export function logDetailHref(log: FoodLog) {
  return historyHref(toApiDate(log.date), log.id);
}

export function historyHref(date: string, mealId?: string) {
  const params = new URLSearchParams({ date });
  if (mealId) params.set('meal', String(mealId));
  return `/history?${params}`;
}
