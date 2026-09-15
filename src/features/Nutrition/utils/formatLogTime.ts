import type { FoodLog } from '../type';
import { toApiDate } from './toLocalDate';

export function formatLogTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function logDetailHref(log: FoodLog) {
  return `/history/${toApiDate(log.date)}/${log.id}`;
}
