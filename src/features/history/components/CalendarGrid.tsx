'use client';

import { useRef } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { fromLocalDate } from '@/features/Nutrition/utils/toLocalDate';
import type { HistoryStats, MonthView } from '../type';
import { compactKcal, dayStatus, formatPanelDate, monthCells } from '../utils/calendar';
import { DAY_STATUS_STYLES, WEEKDAY_LABELS } from '../utils/Constants';

interface CalendarGridProps {
  view: MonthView;
  /** +1 / -1: which way the month changed, so the grid slides in from that side. */
  direction: number;
  today: string;
  selectedDate: string;
  byDate: Map<string, HistoryStats>;
  target: number;
  loading: boolean;
  onSelect: (date: string) => void;
  /** Touch-down on a day — warm its data before the tap lands. */
  onPrefetch: (date: string) => void;
  /** Day whose details are loading before the sheet opens. */
  pendingDate: string | null;
  /** Swipe left/right: -1 for the previous month, +1 for the next. */
  onSwipe: (delta: -1 | 1) => void;
}

/** A horizontal drag past this (px) or flicked faster than this (px/s) changes month. */
const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 400;

const SLIDE = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -40 }),
};

export default function CalendarGrid({
  view,
  direction,
  today,
  selectedDate,
  byDate,
  target,
  loading,
  onSelect,
  onPrefetch,
  pendingDate,
  onSwipe,
}: CalendarGridProps) {
  const cells = monthCells(view);
  const weeks = cells.length / 7;
  // A swipe must not also count as a tap on the day under the finger.
  const swipedRef = useRef(false);

  const onPanEnd = (_: PointerEvent, info: PanInfo) => {
    const { x, y } = info.offset;
    if (Math.abs(x) < Math.abs(y)) return;
    if (Math.abs(x) > SWIPE_DISTANCE || Math.abs(info.velocity.x) > SWIPE_VELOCITY) {
      swipedRef.current = true;
      onSwipe(x < 0 ? 1 : -1);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid shrink-0 grid-cols-7 gap-1.5 pb-2 md:gap-2">
        {WEEKDAY_LABELS.map((day) => (
          <span
            key={day}
            className="text-center text-[11px] font-bold uppercase tracking-wider text-muted md:px-2 md:text-left"
          >
            <span className="md:hidden">{day.slice(0, 2)}</span>
            <span className="hidden md:inline">{day}</span>
          </span>
        ))}
      </div>

      {/* `pan-y` keeps vertical page/sheet scrolling native while we read horizontal swipes. */}
      <motion.div
        onPanStart={() => (swipedRef.current = false)}
        onPanEnd={onPanEnd}
        className="relative min-h-0 flex-1 touch-pan-y overflow-hidden"
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={`${view.year}-${view.month}`}
            custom={direction}
            variants={SLIDE}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="grid h-full grid-cols-7 gap-1.5 md:gap-2"
            // Phones: rows share the free height. Larger screens: rows size to the cells.
            style={{ gridTemplateRows: `repeat(${weeks}, minmax(0, 1fr))` }}
          >
            {cells.map(({ date, inMonth }) => {
              const dayNum = fromLocalDate(date).getDate();

              // Neighbouring months: just a faint number.
              if (!inMonth) {
                return (
                  <span
                    key={date}
                    aria-hidden="true"
                    className="pt-1.5 text-center text-xs font-semibold text-muted/35 md:px-2.5 md:pt-2.5 md:text-left md:text-[13px]"
                  >
                    {dayNum}
                  </span>
                );
              }

              const isFuture = date > today;
              const isToday = date === today;
              const isSelected = date === selectedDate;
              const calories = Math.round(byDate.get(date)?.calories ?? 0);
              const status = dayStatus(calories, target);
              const style = status === 'none' ? null : DAY_STATUS_STYLES[status];
              const fill = Math.min(calories / target, 1) * 100;

              const label = `${formatPanelDate(date)}${
                isFuture
                  ? ''
                  : style
                    ? `, ${calories} kcal, ${style.label.toLowerCase()}`
                    : isToday
                      ? ', nothing logged yet'
                      : ', no log'
              }`;

              return (
                <button
                  key={date}
                  type="button"
                  disabled={isFuture}
                  onPointerDown={() => onPrefetch(date)}
                  onClick={() => {
                    if (swipedRef.current) return;
                    onSelect(date);
                  }}
                  aria-label={label}
                  aria-pressed={isSelected}
                  aria-current={isToday ? 'date' : undefined}
                  className={`relative flex min-h-11 select-none flex-col items-center rounded-xl border px-1 py-1.5 transition-[transform,translate,scale] duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 enabled:active:scale-[0.94] md:h-[clamp(68px,10.5dvh,92px)] md:items-stretch md:rounded-2xl md:p-2.5 ${
                    isFuture
                      ? 'border-transparent'
                      : style
                        ? `${style.cell} hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-12px_rgba(0,0,0,0.5)]`
                        : 'border-transparent bg-surface-2/50 hover:bg-surface-2'
                  } ${isSelected ? '!border-blue-600 ring-2 ring-blue-600/35' : ''} ${date === pendingDate ? 'animate-pulse' : ''}`}
                >
                  <span className="flex w-full items-center justify-center gap-1 md:justify-between">
                    <span
                      className={`text-[13px] font-bold tabular-nums ${
                        isToday
                          ? 'flex h-6 min-w-6 items-center justify-center rounded-full bg-brand px-1 text-on-brand'
                          : isFuture
                            ? 'text-muted/50'
                            : style
                              ? 'text-fg'
                              : 'text-fg-2'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className="hidden text-[10px] font-bold uppercase tracking-wider text-brand-ink lg:inline">
                        Today
                      </span>
                    )}
                  </span>

                  {!isFuture && (
                    <span className="mt-auto flex w-full flex-col gap-1 md:gap-1.5">
                      {loading ? (
                        <span className="mx-auto h-3 w-3/4 animate-pulse rounded bg-surface-3 md:mx-0" />
                      ) : style ? (
                        <span className="text-center text-[11px] font-semibold tabular-nums text-fg-2 md:text-left md:text-[13px]">
                          <span className="md:hidden">{compactKcal(calories)}</span>
                          <span className="hidden md:inline">
                            {calories.toLocaleString()}
                            <span className="ml-0.5 hidden text-[11px] font-medium text-muted xl:inline">
                              kcal
                            </span>
                          </span>
                        </span>
                      ) : (
                        <span className="hidden text-xs text-muted md:inline">
                          {isToday ? 'Nothing yet' : 'No log'}
                        </span>
                      )}
                      {/* How far toward the target the day got, coloured by outcome. */}
                      {style && (
                        <span className="h-1 w-full overflow-hidden rounded-full bg-surface-3 md:h-1.5">
                          <span
                            className={`block h-full rounded-full ${style.bar}`}
                            style={{ width: `${fill}%` }}
                          />
                        </span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
