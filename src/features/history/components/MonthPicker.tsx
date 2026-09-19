'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { MonthView } from '../type';
import { formatMonthTitle, monthKey } from '../utils/calendar';

interface MonthPickerProps {
  view: MonthView;
  /** Latest month that can be picked (the current one). */
  maxMonth: MonthView;
  /** Earliest year offered — the first year with a log. */
  minYear: number;
  /** `YYYY-MM` keys of months with at least one logged day. */
  loggedMonths: Set<string>;
  onSelect: (view: MonthView) => void;
  /** Shown as "Jump to today" when set — i.e. when today isn't already in view. */
  onToday?: () => void;
}

const MONTHS = Array.from({ length: 12 }, (_, m) =>
  new Date(2000, m, 1, 12).toLocaleDateString('en-GB', { month: 'short' })
);

/** The month title, which opens a year + month grid to jump anywhere in one tap. */
export default function MonthPicker({
  view,
  maxMonth,
  minYear,
  loggedMonths,
  onSelect,
  onToday,
}: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(view.year);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    rootRef.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  const toggle = () => {
    // Opening always starts on the year being viewed.
    if (!open) setYear(view.year);
    setOpen(!open);
  };

  const firstYear = Math.min(minYear, view.year);

  return (
    <div ref={rootRef} className="relative">
      {/* Styled as a select field so it reads as "tap to change month". */}
      <h1 className="font-display text-xl font-bold leading-tight tracking-tight text-fg md:text-3xl">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-haspopup="dialog"
          className={`inline-flex h-11 select-none items-center gap-3 rounded-2xl border bg-surface-1 pl-3.5 pr-1.5 md:h-auto md:gap-4 md:py-2 md:pl-4 md:pr-2.5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.25)] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 ${
            open
              ? 'border-brand ring-4 ring-brand/15'
              : 'border-line-strong hover:border-brand/60 hover:bg-surface-2'
          }`}
        >
          {/* Never wraps: short month on phones ("Sep 2026"), full name from `sm` up. */}
          <span aria-live="polite" className="whitespace-nowrap">
            <span className="sm:hidden">{formatMonthTitle(view, 'short')}</span>
            <span className="hidden sm:inline">{formatMonthTitle(view)}</span>
          </span>
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
              open ? 'bg-brand text-on-brand' : 'bg-surface-2 text-fg-2'
            }`}
          >
            <ChevronDownIcon
              className={`h-4 w-4 stroke-2 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          </span>
        </button>
      </h1>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Choose month and year"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-full z-50 mt-2 w-[min(320px,calc(100vw-2rem))] origin-top-left rounded-3xl border border-line-strong bg-surface-1 p-4 shadow-[0_24px_64px_rgba(0,0,0,0.45)]"
          >
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setYear((y) => y - 1)}
                disabled={year <= firstYear}
                aria-label="Previous year"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-fg-2 hover:bg-surface-2 hover:text-fg disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <p className="font-display text-lg font-bold tabular-nums text-fg" aria-live="polite">
                {year}
              </p>
              <button
                type="button"
                onClick={() => setYear((y) => y + 1)}
                disabled={year >= maxMonth.year}
                aria-label="Next year"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-fg-2 hover:bg-surface-2 hover:text-fg disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((name, month) => {
                const isFuture =
                  year > maxMonth.year || (year === maxMonth.year && month > maxMonth.month);
                const isSelected = year === view.year && month === view.month;
                const isCurrent = year === maxMonth.year && month === maxMonth.month;
                const hasLogs = loggedMonths.has(monthKey({ year, month }));
                return (
                  <button
                    key={name}
                    type="button"
                    disabled={isFuture}
                    aria-pressed={isSelected}
                    onClick={() => {
                      onSelect({ year, month });
                      setOpen(false);
                    }}
                    className={`relative flex h-12 items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                      isSelected
                        ? 'bg-brand text-on-brand'
                        : isFuture
                          ? 'cursor-not-allowed text-muted/40'
                          : `bg-surface-2 text-fg hover:bg-surface-3 ${isCurrent ? 'ring-1 ring-inset ring-brand/60' : ''}`
                    }`}
                  >
                    {name}
                    {hasLogs && (
                      <span
                        aria-hidden="true"
                        className={`absolute bottom-1.5 h-1 w-1 rounded-full ${isSelected ? 'bg-on-brand' : 'bg-brand-ink'}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
              <span className="h-1 w-1 rounded-full bg-brand-ink" /> Months with logged meals
            </p>

            {onToday && (
              <button
                type="button"
                onClick={() => {
                  onToday();
                  setOpen(false);
                }}
                className="mt-3 h-11 w-full rounded-xl border border-line-strong text-sm font-semibold text-fg transition-colors hover:bg-surface-2 active:scale-[0.98]"
              >
                Jump to today
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
