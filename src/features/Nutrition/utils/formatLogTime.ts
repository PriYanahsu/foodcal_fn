import type { FoodLog } from '../type';
import { toApiDate } from './toLocalDate';

export function formatLogTime(iso: string) {
  // "1:25 PM" in 12-hour locales, "13:25" in 24-hour ones — no leading zero.
  return new Date(iso).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function logDetailHref(log: FoodLog) {
  return `/history/${toApiDate(log.date)}/${log.id}`;
}
