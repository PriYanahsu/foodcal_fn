'use client';

import { useCallback, useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { buttonClass } from '@/components/ui/fc';
import { useHistoryCalendar } from '../hooks/useHistoryCalendar';
import { DAY_STATUS_STYLES } from '../utils/Constants';
import type { HistoryCalendarProps } from '../type';
import CalendarGrid from './CalendarGrid';
import DayPanel from './DayPanel';
import MonthPicker from './MonthPicker';

/** Longest we hold the sheet back waiting for a day's meals before opening with a skeleton. */
const SHEET_WAIT_MS = 600;
/** Shortest gap between the tap and the sheet, so the selected day's border shows first. */
const SHEET_MIN_DELAY_MS = 180;

/** At this width the day panel sits beside the calendar; below it, it opens as a sheet. */
const DESKTOP_QUERY = '(min-width: 1024px)';
const isDesktop = () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches;

const REVEAL = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

const NAV_BUTTON =
  'flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface-1 text-fg-2 transition-all hover:bg-surface-2 hover:text-fg active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-surface-1 disabled:active:scale-100 md:h-10 md:w-10';

interface Stat {
  label: string;
  shortLabel: string;
  value: string;
  unit: string;
}

/** Tablet and desktop: one card per figure. */
function SummaryTile({ stat, loading }: { stat: Stat; loading: boolean }) {
  return (
    <div className="min-w-0 rounded-3xl border border-line bg-surface-1 px-5 py-4">
      <p className="truncate text-[13px] font-semibold text-muted">{stat.label}</p>
      {loading ? (
        <div className="mt-1.5 h-8 w-20 fc-skeleton rounded-lg" />
      ) : (
        <p className="mt-0.5 truncate font-display text-[28px] font-bold leading-tight tabular-nums text-fg">
          {stat.value}
          <span className="ml-1 font-ui text-sm font-medium text-muted">{stat.unit}</span>
        </p>
      )}
    </div>
  );
}

/** Phones: the four figures share one compact strip so the calendar keeps the room. */
function SummaryStrip({ stats, loading }: { stats: Stat[]; loading: boolean }) {
  return (
    <div className="grid select-none grid-cols-4 divide-x divide-line rounded-2xl border border-line bg-surface-1 py-2.5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex min-w-0 flex-col items-center gap-0.5 px-1 text-center"
        >
          {loading ? (
            <span className="my-0.5 h-5 w-9 fc-skeleton rounded-md" />
          ) : (
            <span className="font-display text-[19px] font-bold leading-tight tabular-nums text-fg">
              {stat.value}
            </span>
          )}
          <span className="w-full truncate text-caption font-medium text-muted">
            {stat.shortLabel}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function HistoryCalendar(props: HistoryCalendarProps) {
  const cal = useHistoryCalendar(props);
  // A shared link (`?date=`) opens straight into the day on phones too.
  const [sheetOpen, setSheetOpen] = useState(() => !!props.initialDate && !isDesktop());
  // Stable, so the sheet's focus/scroll-lock effect doesn't re-run on every render.
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  // The day being loaded before its sheet opens — its cell pulses meanwhile.
  const [pendingDate, setPendingDate] = useState<string | null>(null);

  const onSelectDate = async (date: string) => {
    cal.selectDate(date);
    if (isDesktop()) return;
    // Open once the meals are in, so the sheet slides up once at its final height
    // instead of growing from a skeleton mid-animation.
    setPendingDate(date);
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    await Promise.all([
      Promise.race([cal.loadDay(date), wait(SHEET_WAIT_MS)]),
      wait(SHEET_MIN_DELAY_MS),
    ]);
    setPendingDate((current) => (current === date ? null : current));
    setSheetOpen(true);
  };

  const panel = (
    <DayPanel
      date={cal.selectedDate}
      isToday={cal.selectedDate === cal.today}
      meals={cal.meals}
      totals={cal.totals}
      dayStats={cal.byDate.get(cal.selectedDate)}
      loading={cal.mealsLoading}
      target={cal.target}
      goals={cal.goals}
      openMeal={cal.openMeal}
      mealPending={cal.mealPending}
      onSelectMeal={cal.selectMeal}
    />
  );

  const { summary } = cal;
  const viewingToday = !cal.canGoNext && cal.selectedDate === cal.today;
  const days = (n: number) => (n === 1 ? 'day' : 'days');
  const stats: Stat[] = [
    {
      label: 'Days logged',
      shortLabel: `of ${summary.elapsedDays} logged`,
      value: String(summary.loggedDays),
      unit: `of ${summary.elapsedDays}`,
    },
    {
      label: 'Average per logged day',
      shortLabel: 'avg kcal',
      value: summary.avgCalories.toLocaleString(),
      unit: 'kcal',
    },
    {
      label: 'Within 10% of target',
      shortLabel: 'on target',
      value: String(summary.onTargetDays),
      unit: days(summary.onTargetDays),
    },
    {
      label: 'Logging streak',
      shortLabel: `${days(cal.streak)} streak`,
      value: String(cal.streak),
      unit: days(cal.streak),
    },
  ];

  return (
    <MotionConfig reducedMotion="user">
      {/* Phones: exactly one screen — the viewport minus the top bar (64px), the tab bar
          (68px + inset) and the 36px its camera button overhangs — with the calendar taking
          whatever height is left. Larger screens scroll normally. */}
      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.06 }}
        className="mx-auto flex h-[calc(100dvh-4rem-68px-2.25rem-env(safe-area-inset-bottom))] min-h-[440px] w-full max-w-[1240px] flex-col gap-3 bg-canvas px-4 py-3 font-ui text-fg md:h-auto md:min-h-0 md:gap-5 md:px-8 md:py-8"
      >
        <motion.header
          variants={REVEAL}
          className="relative z-30 flex shrink-0 items-end justify-between gap-2"
        >
          <div className="min-w-0">
            <p className="mb-1.5 hidden text-[13px] font-semibold text-muted md:block">History</p>
            <MonthPicker
              view={cal.view}
              maxMonth={cal.currentMonth}
              minYear={cal.firstLoggedYear}
              loggedMonths={cal.loggedMonths}
              onSelect={cal.goToMonth}
              onToday={viewingToday ? undefined : cal.goToToday}
            />
          </div>
          {/* Kept left of the floating notification bell on desktop. */}
          <div className="flex shrink-0 items-center gap-2 md:mr-14">
            {!viewingToday && (
              <button
                type="button"
                onClick={cal.goToToday}
                className={buttonClass('secondary', 'sm', 'hidden md:inline-flex')}
              >
                Today
              </button>
            )}
            <button
              type="button"
              onClick={cal.prevMonth}
              aria-label="Previous month"
              className={NAV_BUTTON}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={cal.nextMonth}
              disabled={!cal.canGoNext}
              aria-label="Next month"
              className={NAV_BUTTON}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </motion.header>

        <motion.div variants={REVEAL} className="shrink-0">
          <div className="md:hidden">
            <SummaryStrip stats={stats} loading={cal.historyLoading} />
          </div>
          <div className="hidden grid-cols-4 gap-4 md:grid">
            {stats.map((stat) => (
              <SummaryTile key={stat.label} stat={stat} loading={cal.historyLoading} />
            ))}
          </div>
        </motion.div>

        <div className="flex min-h-0 flex-1 flex-col gap-5 md:flex-none lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(340px,400px)]">
          <motion.section
            variants={REVEAL}
            aria-label="Calendar"
            className="flex min-h-0 flex-1 flex-col rounded-3xl border border-line bg-surface-1 p-2.5 md:flex-none md:self-start md:p-5 lg:w-full"
          >
            <CalendarGrid
              view={cal.view}
              direction={cal.direction}
              today={cal.today}
              selectedDate={cal.selectedDate}
              byDate={cal.byDate}
              target={cal.target}
              loading={cal.historyLoading}
              onSelect={onSelectDate}
              onPrefetch={cal.prefetchDay}
              pendingDate={pendingDate}
              onSwipe={(delta) => (delta < 0 ? cal.prevMonth() : cal.nextMonth())}
            />

            <div className="mt-2.5 flex shrink-0 flex-wrap items-center gap-x-3.5 gap-y-1 px-1 text-xs text-muted md:mt-4 md:gap-x-4">
              {Object.values(DAY_STATUS_STYLES).map((style) => (
                <span key={style.label} className="inline-flex items-center gap-1.5">
                  <span className={`h-1.5 w-3 rounded-full ${style.bar}`} />
                  {style.label === 'On target' ? 'Within 10%' : style.label}
                </span>
              ))}
              <span className="ml-auto tabular-nums">
                {cal.target.toLocaleString()} kcal{cal.hasPlan ? '' : ' (default)'}
              </span>
            </div>
          </motion.section>

          {/* Always exactly the calendar's height — the content scrolls inside, so the
              panel looks the same with one meal or ten. */}
          <motion.aside
            variants={REVEAL}
            aria-label="Day details"
            className="relative hidden overflow-hidden rounded-3xl border border-line bg-surface-1 lg:block"
          >
            <div className="custom-scrollbar absolute inset-0 overflow-y-auto overscroll-contain p-6">
              {panel}
            </div>
          </motion.aside>
        </div>
      </motion.div>

      <BottomSheet open={sheetOpen} onClose={closeSheet} label="Day details">
        {panel}
      </BottomSheet>
    </MotionConfig>
  );
}
