import { fromLocalDate, shiftDate, toLocalDate } from '@/features/Nutrition/utils/toLocalDate';
import type {
  CalendarCell,
  DayStatus,
  History,
  HistoryStats,
  MonthSummary,
  MonthView,
} from '../type';
import { ON_TARGET_TOLERANCE } from './Constants';

export function monthOf(dateStr: string): MonthView {
  const date = fromLocalDate(dateStr);
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function shiftMonth({ year, month }: MonthView, delta: number): MonthView {
  const date = new Date(year, month + delta, 1, 12);
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function isSameMonth(a: MonthView, b: MonthView) {
  return a.year === b.year && a.month === b.month;
}

/** Months since year 0 — for ordering months. */
export function monthIndex({ year, month }: MonthView) {
  return year * 12 + month;
}

/** `YYYY-MM`, matching the prefix of a `YYYY-MM-DD` date. */
export function monthKey({ year, month }: MonthView) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

/** "September 2026" */
export function formatMonthTitle({ year, month }: MonthView, length: 'long' | 'short' = 'long') {
  return new Date(year, month, 1, 12).toLocaleDateString('en-GB', {
    month: length,
    year: 'numeric',
  });
}

/**
 * Monday-first grid for a month: only as many weeks as the month spans (5 or 6),
 * with the neighbouring months' days filling the first and last week.
 */
export function monthCells({ year, month }: MonthView): CalendarCell[] {
  const first = toLocalDate(new Date(year, month, 1, 12));
  const lead = (fromLocalDate(first).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const total = Math.ceil((lead + daysInMonth) / 7) * 7;
  const start = shiftDate(first, -lead);

  return Array.from({ length: total }, (_, i) => {
    const date = shiftDate(start, i);
    return { date, inMonth: i >= lead && i < lead + daysInMonth };
  });
}

/** Within ±10% of the target counts as on target. */
export function dayStatus(calories: number, target: number): DayStatus {
  if (calories <= 0) return 'none';
  const ratio = calories / target;
  if (ratio > 1 + ON_TARGET_TOLERANCE) return 'over';
  if (ratio < 1 - ON_TARGET_TOLERANCE) return 'under';
  return 'on';
}

export function toHistoryMap(history: History[]) {
  return new Map<string, HistoryStats>(history.map((day) => [day.date.split('T')[0], day.stats]));
}

export function monthSummary(
  view: MonthView,
  byDate: Map<string, HistoryStats>,
  target: number,
  today = toLocalDate()
): MonthSummary {
  const days = monthCells(view).filter((cell) => cell.inMonth && cell.date <= today);
  const logged = days
    .map((cell) => byDate.get(cell.date)?.calories ?? 0)
    .filter((calories) => calories > 0);
  const total = logged.reduce((sum, calories) => sum + calories, 0);

  return {
    elapsedDays: days.length,
    loggedDays: logged.length,
    avgCalories: logged.length ? Math.round(total / logged.length) : 0,
    onTargetDays: logged.filter((calories) => dayStatus(calories, target) === 'on').length,
  };
}

/** Consecutive logged days ending today — or yesterday, so the streak survives until tonight. */
export function currentStreak(byDate: Map<string, HistoryStats>, today = toLocalDate()) {
  const logged = (date: string) => (byDate.get(date)?.calories ?? 0) > 0;
  let day = logged(today) ? today : shiftDate(today, -1);
  let streak = 0;
  while (logged(day)) {
    streak++;
    day = shiftDate(day, -1);
  }
  return streak;
}

/** "Wednesday, 16 Sep" */
export function formatPanelDate(dateStr: string) {
  return fromLocalDate(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

/** 1,940 → "1.9k" for the narrow phone cells. */
export function compactKcal(calories: number) {
  return calories >= 1000 ? `${(calories / 1000).toFixed(1)}k` : String(Math.round(calories));
}
