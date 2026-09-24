'use client';

import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { fromLocalDate, toLocalDate } from '@/features/Nutrition/utils/toLocalDate';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/** Month grid cells (Monday-first), with leading/trailing days as null. */
function monthCells(year: number, month: number) {
  const first = new Date(year, month, 1, 12);
  const lead = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toLocalDate(new Date(year, month, day, 12)));
  }
  while (cells.length % 7) cells.push(null);
  return cells;
}

const monthOf = (iso: string) => {
  const d = fromLocalDate(iso);
  return { year: d.getFullYear(), month: d.getMonth() };
};
const monthNumber = ({ year, month }: { year: number; month: number }) => year * 12 + month;

/**
 * The app's month calendar: the dashboard's date picker and every date field share it,
 * so picking a date looks the same everywhere. Dates are `YYYY-MM-DD`; days outside
 * `min`/`max` are disabled and months wholly outside them can't be reached.
 */
export function MonthCalendar({
  value,
  onSelect,
  min,
  max,
  marked,
}: {
  /** Selected day, or '' for none (the calendar then opens on `min`, or today). */
  value: string;
  onSelect: (date: string) => void;
  min?: string;
  max?: string;
  /** Days that get a dot (e.g. days with meals logged). */
  marked?: Set<string>;
}) {
  const today = toLocalDate();
  const [view, setView] = useState(() => monthOf(value || (min && min > today ? min : today)));

  const canPrev = !min || monthNumber(view) > monthNumber(monthOf(min));
  const canNext = !max || monthNumber(view) < monthNumber(monthOf(max));
  const shiftMonth = (delta: number) =>
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const title = new Date(view.year, view.month, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
  const navButton =
    'flex h-9 w-9 items-center justify-center rounded-xl text-fg-2 hover:bg-surface-2 hover:text-fg disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent';

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          disabled={!canPrev}
          aria-label="Previous month"
          className={navButton}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <p className="text-[15px] font-bold text-fg" aria-live="polite">
          {title}
        </p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          disabled={!canNext}
          aria-label="Next month"
          className={navButton}
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => (
          <span key={day} className="pb-1 text-xs font-semibold text-muted">
            {day}
          </span>
        ))}
        {monthCells(view.year, view.month).map((day, i) => {
          if (!day) return <span key={`empty-${i}`} />;
          const disabled = (!!min && day < min) || (!!max && day > max);
          const isSelected = day === value;
          const isTodayCell = day === today;
          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(day)}
              aria-pressed={isSelected}
              aria-current={isTodayCell ? 'date' : undefined}
              aria-label={fromLocalDate(day).toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              className={`relative flex h-10 flex-col items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                isSelected
                  ? 'bg-brand text-on-brand'
                  : disabled
                    ? 'cursor-not-allowed text-muted/40'
                    : `text-fg hover:bg-surface-2 ${isTodayCell ? 'ring-1 ring-inset ring-brand/60' : ''}`
              }`}
            >
              {fromLocalDate(day).getDate()}
              {marked?.has(day) && (
                <span
                  aria-hidden="true"
                  className={`absolute bottom-1.5 h-1 w-1 rounded-full ${isSelected ? 'bg-on-brand' : 'bg-brand-ink'}`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
