'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { CameraIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { buttonClass } from '@/components/ui/fc';
import { CalorieRing, MACRO_STYLES, type MacroKey } from '@/components/nutrition/macros';
import { MealThumb } from '@/components/nutrition/MealThumb';
import { ROUTES } from '@/constants/routes';
import type { FoodLog, NutritionGoals } from '@/features/Nutrition/type';
import { byLogTime, mealTypeAndTime } from '@/features/Nutrition/utils/formatLogTime';
import type { HistoryStats } from '../type';
import { dayStatus, formatPanelDate } from '../utils/calendar';
import { DAY_STATUS_STYLES } from '../utils/Constants';
import MealDetail from './MealDetail';

interface DayPanelProps {
  date: string;
  isToday: boolean;
  meals: FoodLog[];
  totals: HistoryStats;
  loading: boolean;
  target: number;
  goals: NutritionGoals;
  openMeal: FoodLog | null;
  mealPending: boolean;
  onSelectMeal: (id: string | null) => void;
}

/** Macro and the matching `FoodLog` field, in display order. */
const MACRO_KEYS = [
  ['protein', 'proteinG'],
  ['carbs', 'carbohydrateG'],
  ['fat', 'fatG'],
] as const;

/** Slide between the day overview and a meal, like a native push. */
const SLIDE = {
  initial: (dir: number) => ({ opacity: 0, x: dir * 24 }),
  animate: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -24 }),
};

function MacroRow({ macro, value, goal }: { macro: MacroKey; value: number; goal: number | null }) {
  const style = MACRO_STYLES[macro];
  const over = goal ? value - goal : 0;
  const pct = goal ? Math.min((value / goal) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="inline-flex items-center gap-1.5 font-semibold text-fg">
          <span className={`h-2 w-2 rounded-[3px] ${style.dot}`} />
          {style.label}
        </span>
        <span className={`tabular-nums ${over > 0 ? 'font-semibold text-warn' : 'text-muted'}`}>
          <span className={over > 0 ? '' : 'font-semibold text-fg'}>{value}</span>
          {goal ? ` / ${goal} g` : ' g'}
          {over > 0 && ` · ${over} g over`}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-3">
        <motion.div
          className={`h-full rounded-full ${style.dot}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function DayOverview({
  date,
  isToday,
  meals,
  totals,
  loading,
  target,
  goals,
  onSelectMeal,
}: Omit<DayPanelProps, 'openMeal' | 'mealPending'>) {
  const calories = Math.round(totals.calories);
  const status = dayStatus(calories, target);
  const style = status === 'none' ? null : DAY_STATUS_STYLES[status];
  const diff = calories - target;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-4">
        <CalorieRing value={calories} max={target} size={68} stroke={7}>
          <span className="font-display text-sm font-bold tabular-nums text-fg">
            {Math.round((calories / target) * 100)}%
          </span>
        </CalorieRing>
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold leading-tight text-fg">
            {isToday ? 'Today' : formatPanelDate(date)}
          </h2>
          <p className="mt-0.5 text-[13px] text-muted">
            <span className="font-bold tabular-nums text-fg">{calories.toLocaleString()}</span> of{' '}
            {target.toLocaleString()} kcal
          </p>
          {style && (
            <span
              className={`mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${style.pill}`}
            >
              {status === 'on'
                ? 'On target'
                : `${Math.abs(diff).toLocaleString()} kcal ${status === 'over' ? 'over' : 'under'}`}
            </span>
          )}
        </div>
      </header>

      {/* Skeleton → content cross-fades instead of popping in. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={loading ? 'loading' : 'ready'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex flex-col gap-5"
        >
          {loading ? (
            <div className="flex flex-col gap-3" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-6 animate-pulse rounded-lg bg-surface-2" />
              ))}
              {[0, 1].map((i) => (
                <div key={`m${i}`} className="h-16 animate-pulse rounded-2xl bg-surface-2" />
              ))}
            </div>
          ) : meals.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong px-6 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/12 text-brand-ink">
                <CameraIcon className="h-6 w-6" />
              </span>
              <p className="font-bold text-fg">
                {isToday ? 'Nothing logged yet' : 'No meals this day'}
              </p>
              <p className="max-w-[240px] text-sm text-muted">
                {isToday
                  ? 'Snap your first meal — it takes about 10 seconds.'
                  : 'Days you log show up here with every meal and macro.'}
              </p>
              {isToday && (
                <Link href={ROUTES.SCAN} className={buttonClass('primary', 'sm', 'mt-1')}>
                  Scan a meal
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3.5">
                <MacroRow
                  macro="protein"
                  value={Math.round(totals.proteins)}
                  goal={goals.proteins}
                />
                <MacroRow
                  macro="carbs"
                  value={Math.round(totals.carbohydrates)}
                  goal={goals.carbohydrates}
                />
                <MacroRow macro="fat" value={Math.round(totals.fats)} goal={goals.fats} />
              </div>

              <div className="flex flex-col gap-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  {meals.length} meal{meals.length === 1 ? '' : 's'}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {meals.map((meal) => (
                    <li key={meal.id}>
                      <button
                        type="button"
                        onClick={() => onSelectMeal(String(meal.id))}
                        className="group flex w-full items-center gap-3 rounded-2xl border border-line bg-surface-2 p-2.5 pr-3 text-left transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_10px_24px_-16px_rgba(0,0,0,0.6)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
                      >
                        <MealThumb log={meal} className="h-14 w-14" />
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                            {mealTypeAndTime(meal)}
                          </span>
                          <span className="line-clamp-2 text-[15px] font-semibold leading-snug text-fg">
                            {meal.foodName}
                          </span>
                          <span className="flex gap-2.5 text-xs tabular-nums text-muted">
                            {MACRO_KEYS.map(([key, field]) => (
                              <span key={key} className="inline-flex items-center gap-1">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${MACRO_STYLES[key].dot}`}
                                />
                                {Math.round(meal[field] ?? 0)}g
                              </span>
                            ))}
                          </span>
                        </span>
                        <span className="flex shrink-0 flex-col items-end">
                          <span className="font-display text-lg font-bold leading-none tabular-nums text-fg">
                            {Math.round(meal.calories)}
                          </span>
                          <span className="text-[11px] font-medium text-muted">kcal</span>
                        </span>
                        <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-fg" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function DayPanel(props: DayPanelProps) {
  const { openMeal, mealPending, onSelectMeal, date, target } = props;
  const meals = [...props.meals].sort(byLogTime);
  const showMeal = !!openMeal || mealPending;
  const direction = showMeal ? 1 : -1;

  // Opening another day or meal starts from the top, in the side panel and the phone sheet alike.
  const anchorRef = useRef<HTMLSpanElement>(null);
  const viewKey = showMeal ? `meal-${openMeal?.id}` : `day-${date}`;
  useEffect(() => {
    let el = anchorRef.current?.parentElement;
    while (el && !/(auto|scroll)/.test(getComputedStyle(el).overflowY)) el = el.parentElement;
    el?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [viewKey]);

  return (
    <>
      <span ref={anchorRef} aria-hidden="true" />
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        {showMeal ? (
          <motion.div
            key={`meal-${openMeal?.id ?? 'pending'}`}
            custom={direction}
            variants={SLIDE}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <MealDetail
              meal={openMeal}
              meals={meals}
              date={date}
              target={target}
              onSelectMeal={onSelectMeal}
            />
          </motion.div>
        ) : (
          <motion.div
            key={`day-${date}`}
            custom={direction}
            variants={SLIDE}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <DayOverview {...props} meals={meals} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
