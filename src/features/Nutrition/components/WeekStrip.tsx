'use client';

import { useCallback, useState } from 'react';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useLoggedDays } from '../hooks/useLoggedDays';
import { fromLocalDate, shiftDate, toLocalDate, weekOf } from '../utils/toLocalDate';
import CalendarPopover from './CalendarPopover';

interface WeekStripProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  /** Phones: just the seven days (the calendar button lives in the header). */
  compact?: boolean;
}

const ICON_BUTTON =
  'flex h-10 w-10 items-center justify-center rounded-xl text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent';

/**
 * Month label with week navigation and a themed calendar, above the seven days
 * of the selected week. A dot marks days with meals logged; future days are disabled.
 */
export default function WeekStrip({ selectedDate, onSelect, compact = false }: WeekStripProps) {
  const today = toLocalDate();
  const days = weekOf(selectedDate);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const closeCalendar = useCallback(() => setCalendarOpen(false), []);
  const loggedDays = useLoggedDays();

  const isThisWeek = days.includes(today);
  const monthLabel = fromLocalDate(selectedDate).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  // Moving by a week keeps the same weekday, but never past today.
  const goWeek = (delta: number) => {
    const next = shiftDate(selectedDate, delta * 7);
    onSelect(next > today ? today : next);
  };

  return (
    <section aria-label="Choose a day" className="flex flex-col gap-3">
      <div className={`items-center justify-between gap-2 ${compact ? 'hidden' : 'flex'}`}>
        <p className="text-[15px] font-bold text-fg">{monthLabel}</p>
        <div className="relative flex items-center gap-1">
          {!isThisWeek && (
            <button
              type="button"
              onClick={() => onSelect(today)}
              className="mr-1 h-9 rounded-full border border-line-strong px-3.5 text-sm font-semibold text-fg transition-colors hover:bg-surface-2"
            >
              Today
            </button>
          )}
          <button
            type="button"
            onClick={() => goWeek(-1)}
            aria-label="Previous week"
            className={ICON_BUTTON}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goWeek(1)}
            disabled={isThisWeek}
            aria-label="Next week"
            className={ICON_BUTTON}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setCalendarOpen((open) => !open)}
            aria-label="Open calendar"
            aria-expanded={calendarOpen}
            aria-haspopup="dialog"
            className={`${ICON_BUTTON} ${calendarOpen ? 'bg-surface-2 text-fg' : ''}`}
          >
            <CalendarDaysIcon className="h-5 w-5" />
          </button>
          <CalendarPopover
            open={calendarOpen}
            selectedDate={selectedDate}
            loggedDays={loggedDays}
            onSelect={onSelect}
            onClose={closeCalendar}
          />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day) => {
          const date = fromLocalDate(day);
          const isSelected = day === selectedDate;
          const isFuture = day > today;
          const isTodayTile = day === today;
          const hasLogs = loggedDays.has(day);

          return (
            <button
              key={day}
              type="button"
              disabled={isFuture}
              onClick={() => onSelect(day)}
              aria-pressed={isSelected}
              aria-label={`${date.toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}${isTodayTile ? ', today' : ''}${hasLogs ? ', meals logged' : ''}`}
              className={`flex flex-col items-center justify-center rounded-2xl border transition-all duration-200 ${
                compact ? 'h-14 gap-0.5 short:h-12' : 'h-[72px] gap-1'
              } ${
                isSelected
                  ? 'border-brand bg-brand text-on-brand shadow-[0_8px_24px_-10px_rgb(var(--fc-brand-rgb)/0.7)]'
                  : isFuture
                    ? 'cursor-not-allowed border-transparent text-muted/40'
                    : 'border-line bg-surface-1 text-fg hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-2'
              }`}
            >
              <span
                className={`text-xs font-medium ${isSelected ? 'text-on-brand/70' : isTodayTile ? 'text-brand-ink' : 'text-muted'}`}
              >
                {isTodayTile ? 'Today' : date.toLocaleDateString('en-GB', { weekday: 'short' })}
              </span>
              <span className="font-display text-lg font-bold leading-none">{date.getDate()}</span>
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${
                  hasLogs ? (isSelected ? 'bg-on-brand' : 'bg-brand-ink') : 'bg-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
