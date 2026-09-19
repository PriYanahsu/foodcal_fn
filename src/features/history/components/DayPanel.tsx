'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CameraIcon } from '@heroicons/react/24/outline';
import { buttonClass } from '@/components/ui/fc';
import { CalorieRing, MACRO_STYLES, type MacroKey } from '@/components/nutrition/macros';
import { MealCard, MealCardSkeleton } from '@/components/nutrition/MealCard';
import MealDetail from '@/components/nutrition/MealDetail';
import { MealDrillIn } from '@/components/nutrition/MealDrillIn';
import { ROUTES } from '@/constants/routes';
import type { FoodLog, NutritionGoals } from '@/features/Nutrition/type';
import { byLogTime } from '@/features/Nutrition/utils/formatLogTime';
import type { HistoryStats } from '../type';
import { dayStatus, formatPanelDate } from '../utils/calendar';
import { DAY_STATUS_STYLES } from '../utils/Constants';

interface DayPanelProps {
  date: string;
  isToday: boolean;
  meals: FoodLog[];
  totals: HistoryStats;
  /** The day's totals from the calendar data — shown instantly while meals load. */
  dayStats?: HistoryStats;
  loading: boolean;
  target: number;
  goals: NutritionGoals;
  openMeal: FoodLog | null;
  mealPending: boolean;
  onSelectMeal: (id: string | null) => void;
}

function MacroRow({ macro, value, goal }: { macro: MacroKey; value: number; goal: number | null }) {
  const style = MACRO_STYLES[macro];
  const over = goal ? value - goal : 0;
  const pct = goal ? Math.min((value / goal) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3 text-[13px] max-md:text-subhead">
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

/** Rough meal count from a day's calories (~550 kcal a meal), for the skeleton. */
const estimateMealCount = (calories: number) =>
  Math.min(4, Math.max(1, Math.round(calories / 550)));

function DayOverview({
  date,
  isToday,
  meals,
  totals,
  dayStats,
  loading,
  target,
  goals,
  onSelectMeal,
}: Omit<DayPanelProps, 'openMeal' | 'mealPending'>) {
  // The calendar already knows the day's totals, so the header and macros show real
  // numbers at once; only the meal list waits for the network. Once meals are in,
  // their own sums take over (they include anything logged since the calendar loaded).
  const stats = !loading && meals.length ? totals : (dayStats ?? totals);
  const calories = Math.round(stats.calories);
  const status = dayStatus(calories, target);
  const style = status === 'none' ? null : DAY_STATUS_STYLES[status];
  const diff = calories - target;
  const hasLog = calories > 0 || meals.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-4">
        <CalorieRing value={calories} max={target} size={68} stroke={7}>
          <span className="font-display text-sm font-bold tabular-nums text-fg">
            {Math.round((calories / target) * 100)}%
          </span>
        </CalorieRing>
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold leading-tight text-fg max-md:text-title">
            {isToday ? 'Today' : formatPanelDate(date)}
          </h2>
          <p className="mt-0.5 text-[13px] text-muted max-md:text-subhead">
            <span className="font-bold tabular-nums text-fg">{calories.toLocaleString()}</span> of{' '}
            {target.toLocaleString()} kcal
          </p>
          {style && (
            <span
              className={`mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold max-md:text-caption ${style.pill}`}
            >
              {status === 'on'
                ? 'On target'
                : `${Math.abs(diff).toLocaleString()} kcal ${status === 'over' ? 'over' : 'under'}`}
            </span>
          )}
        </div>
      </header>

      {!hasLog ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong px-6 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/12 text-brand-ink">
            <CameraIcon className="h-6 w-6" />
          </span>
          <p className="font-bold text-fg">
            {isToday ? 'Nothing logged yet' : 'No meals this day'}
          </p>
          <p className="max-w-[240px] text-sm text-muted max-md:text-subhead">
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
            <MacroRow macro="protein" value={Math.round(stats.proteins)} goal={goals.proteins} />
            <MacroRow
              macro="carbs"
              value={Math.round(stats.carbohydrates)}
              goal={goals.carbohydrates}
            />
            <MacroRow macro="fat" value={Math.round(stats.fats)} goal={goals.fats} />
          </div>

          <div className="flex flex-col gap-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted max-md:text-caption">
              {loading ? 'Meals' : `${meals.length} meal${meals.length === 1 ? '' : 's'}`}
            </p>
            {loading ? (
              <div className="flex flex-col gap-2.5" aria-busy="true" aria-label="Loading meals">
                {Array.from({ length: estimateMealCount(calories) }, (_, i) => (
                  <MealCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-2.5"
              >
                {meals.map((meal) => (
                  <li key={meal.id}>
                    <MealCard meal={meal} onOpen={() => onSelectMeal(String(meal.id))} />
                  </li>
                ))}
              </motion.ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function DayPanel(props: DayPanelProps) {
  const { openMeal, mealPending, onSelectMeal, date, target } = props;
  const meals = [...props.meals].sort(byLogTime);
  const showMeal = !!openMeal || mealPending;

  return (
    <MealDrillIn
      showDetail={showMeal}
      viewKey={showMeal ? `meal-${openMeal?.id ?? 'pending'}` : `day-${date}`}
      detail={
        <MealDetail meal={openMeal} meals={meals} target={target} onSelectMeal={onSelectMeal} />
      }
    >
      <DayOverview {...props} meals={meals} />
    </MealDrillIn>
  );
}
