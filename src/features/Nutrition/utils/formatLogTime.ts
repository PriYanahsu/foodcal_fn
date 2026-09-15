import type { FoodLog } from '../type';
import { DATE_LOCALE } from './Constants';

export function formatLogTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function logDetailHref(log: FoodLog) {
  return `/history/${log.date}/${log.id}`;
}
