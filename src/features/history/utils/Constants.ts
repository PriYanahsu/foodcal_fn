import type { DayStatus, HistoryStats } from '../type';

export const DATE_LOCALE = 'en-CA';

/** Used until the user sets up a plan. */
export const DEFAULT_CALORIE_TARGET = 2200;

/** A day within ±10% of the calorie target counts as on target. */
export const ON_TARGET_TOLERANCE = 0.1;

export const EMPTY_HISTORY_STATS: HistoryStats = {
  calories: 0,
  proteins: 0,
  carbohydrates: 0,
  fats: 0,
};

/** Literal class names so Tailwind can see them. */
export const DAY_STATUS_STYLES: Record<
  Exclude<DayStatus, 'none'>,
  { label: string; bar: string; pill: string; cell: string }
> = {
  on: {
    label: 'On target',
    bar: 'bg-brand',
    pill: 'bg-brand/15 text-brand-ink',
    cell: 'border-brand/30 bg-brand/10',
  },
  over: {
    label: 'Over',
    bar: 'bg-warn',
    pill: 'bg-warn/15 text-warn',
    cell: 'border-warn/30 bg-warn/10',
  },
  under: {
    label: 'Under',
    bar: 'bg-info',
    pill: 'bg-info/15 text-info',
    cell: 'border-info/30 bg-info/10',
  },
};

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
