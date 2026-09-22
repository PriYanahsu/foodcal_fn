'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { fromLocalDate, toLocalDate } from '../utils/toLocalDate';

interface CalendarPopoverProps {
  open: boolean;
  selectedDate: string;
  loggedDays: Set<string>;
  onSelect: (date: string) => void;
  onClose: () => void;
}

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

/** Themed month picker that drops down from the week strip. Future days are disabled. */
export default function CalendarPopover({
  open,
  selectedDate,
  loggedDays,
  onSelect,
  onClose,
}: CalendarPopoverProps) {
  const today = toLocalDate();
  const panelRef = useRef<HTMLDivElement>(null);
  const selected = fromLocalDate(selectedDate);
  const [view, setView] = useState({ year: selected.getFullYear(), month: selected.getMonth() });

  // Reopening jumps back to the selected day's month.
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setView({ year: selected.getFullYear(), month: selected.getMonth() });
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const onPointer = (e: PointerEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    // Deferred so the click that opened the popover doesn't immediately close it.
    const timer = window.setTimeout(() => document.addEventListener('pointerdown', onPointer), 0);
    panelRef.current
      ?.querySelector<HTMLButtonElement>('[aria-current="date"], [aria-pressed="true"]')
      ?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      window.clearTimeout(timer);
    };
  }, [open, onClose]);

  const todayDate = new Date();
  const isCurrentMonth =
    view.year === todayDate.getFullYear() && view.month === todayDate.getMonth();
  const shiftMonth = (delta: number) =>
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const title = new Date(view.year, view.month, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-label="Choose a date"
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-0 top-full z-50 mt-2 w-[min(320px,calc(100vw-2rem))] origin-top-right rounded-3xl border border-line-strong bg-surface-1 p-4 shadow-[var(--fc-shadow-pop)]"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-fg-2 hover:bg-surface-2 hover:text-fg"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <p className="text-[15px] font-bold text-fg" aria-live="polite">
              {title}
            </p>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              disabled={isCurrentMonth}
              aria-label="Next month"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-fg-2 hover:bg-surface-2 hover:text-fg disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
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
              const isFuture = day > today;
              const isSelected = day === selectedDate;
              const isTodayCell = day === today;
              return (
                <button
                  key={day}
                  type="button"
                  disabled={isFuture}
                  onClick={() => {
                    onSelect(day);
                    onClose();
                  }}
                  aria-pressed={isSelected}
                  aria-current={isTodayCell ? 'date' : undefined}
                  aria-label={fromLocalDate(day).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                  className={`relative flex h-10 flex-col items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                    isSelected
                      ? 'bg-brand text-on-brand'
                      : isFuture
                        ? 'cursor-not-allowed text-muted/40'
                        : `text-fg hover:bg-surface-2 ${isTodayCell ? 'ring-1 ring-inset ring-brand/60' : ''}`
                  }`}
                >
                  {fromLocalDate(day).getDate()}
                  {loggedDays.has(day) && (
                    <span
                      aria-hidden="true"
                      className={`absolute bottom-1.5 h-1 w-1 rounded-full ${isSelected ? 'bg-on-brand' : 'bg-brand-ink'}`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {selectedDate !== today && (
            <button
              type="button"
              onClick={() => {
                onSelect(today);
                onClose();
              }}
              className="mt-3 h-10 w-full rounded-xl border border-line-strong text-sm font-semibold text-fg transition-colors hover:bg-surface-2"
            >
              Jump to today
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
