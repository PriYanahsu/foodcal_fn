export interface HistoryStats {
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
}

export interface History {
  date: string;
  stats: HistoryStats;
}

/** Month shown in the calendar; `month` is 0-based like `Date`. */
export interface MonthView {
  year: number;
  month: number;
}

export interface CalendarCell {
  date: string;
  inMonth: boolean;
}

/** `on` = within 10% of the calorie target. */
export type DayStatus = 'on' | 'over' | 'under' | 'none';

export interface MonthSummary {
  elapsedDays: number;
  loggedDays: number;
  avgCalories: number;
  onTargetDays: number;
}

export interface HistoryCalendarProps {
  /** `YYYY-MM-DD` from `?date=` — the day to open on. */
  initialDate?: string;
  /** Meal id from `?meal=` — opened in the day panel. */
  initialMealId?: string;
}
