'use client';

import { useCallback, useState, type ReactNode } from 'react';
import {
  BeakerIcon,
  CalendarDaysIcon,
  CameraIcon,
  FireIcon,
  PlusIcon,
  ScaleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { CalorieRing, MacroBar } from '@/components/nutrition/macros';
import type { FitnessDetails } from '@/features/userProfile';
import type { DailyStats, FoodLog, NutritionGoals } from '../type';
import { useLoggedDays } from '../hooks/useLoggedDays';
import { useWaterIntake } from '../hooks/useWaterIntake';
import { useWeightTrend } from '../hooks/useWeightTrend';
import { WATER_GLASS_ML } from '../utils/Constants';
import { formatLongDate, greetingFor } from '../utils/toLocalDate';
import { byLogTime } from '../utils/formatLogTime';
import WeekStrip from './WeekStrip';
import CalendarPopover from './CalendarPopover';
import CaloriesCard from './CaloriesCard';
import MealsCard from './MealsCard';
import CoachCard from './CoachCard';
import WaterCard from './WaterCard';
import WeightCard, { TrendChart } from './WeightCard';

type Panel = 'calories' | 'meals' | 'coach' | 'water' | 'weight';

const PANEL_LABELS: Record<Panel, string> = {
  calories: 'Calories and macros',
  meals: 'Meals',
  coach: 'Coach',
  water: 'Water',
  weight: 'Weight',
};

/** Each tile gets its own tint so the grid scans at a glance. Literal classes for Tailwind. */
const TONES = {
  neutral: { card: 'border-line from-surface-1', chip: 'bg-brand/15 text-brand-ink' },
  meals: { card: 'border-carbs/25 from-carbs/15', chip: 'bg-carbs/20 text-carbs' },
  coach: { card: 'border-brand/35 from-brand/20', chip: 'bg-brand text-on-brand' },
  water: { card: 'border-info/25 from-info/15', chip: 'bg-info/20 text-info' },
  weight: { card: 'border-fat/25 from-fat/15', chip: 'bg-fat/20 text-fat' },
};

interface MobileDashboardProps {
  userId: string | undefined;
  userName: string;
  fitness: FitnessDetails;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  stats: DailyStats;
  goals: NutritionGoals;
  hasPlan: boolean;
  recentLogs: FoodLog[];
  loading: boolean;
  refreshing: boolean;
  isToday: boolean;
  onSetUpPlan: () => void;
}

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

/**
 * A tappable summary tile. The body opens the full card in a bottom sheet;
 * an optional `footer` holds a quick action that works without opening it.
 */
function Tile({
  label,
  icon,
  tone,
  onOpen,
  footer,
  hideLabelWhenShort = false,
  className = '',
  children,
}: {
  label: string;
  icon: ReactNode;
  tone: keyof typeof TONES;
  onOpen: () => void;
  footer?: ReactNode;
  /** On short phones, drop the label row to save height (content must still read on its own). */
  hideLabelWhenShort?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const t = TONES[tone];
  return (
    <div
      className={`flex min-h-0 flex-col overflow-hidden rounded-3xl border bg-linear-160 to-surface-1 to-70% transition-transform duration-150 has-[>button:active]:scale-[0.97] ${t.card} ${className}`}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        className="flex min-h-0 flex-1 select-none flex-col gap-2 p-4 text-left short:gap-1.5 short:p-3"
      >
        <span
          className={`flex w-full items-center gap-2 ${hideLabelWhenShort ? 'short:hidden' : ''}`}
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg short:h-6 short:w-6 ${t.chip}`}
          >
            {icon}
          </span>
          <span className="text-sm font-bold text-fg">{label}</span>
        </span>
        {children}
      </button>
      {footer && <div className="px-3 pb-3 short:px-2.5 short:pb-2.5">{footer}</div>}
    </div>
  );
}

/** Big number + unit, the same size on every tile. */
function Figure({ value, unit }: { value: ReactNode; unit: string }) {
  return (
    <span className="font-display text-[26px] font-bold leading-none tracking-[-0.02em] text-fg">
      {value}
      <span className="ml-1 font-ui text-sm font-semibold tracking-normal text-muted">{unit}</span>
    </span>
  );
}

/**
 * Phone dashboard: everything fits one screen — a calories tile and a 2×2
 * grid of tiles. Tapping a tile opens the full card in a bottom sheet.
 */
export default function MobileDashboard({
  userId,
  userName,
  fitness,
  selectedDate,
  onSelectDate,
  stats,
  goals,
  hasPlan,
  recentLogs,
  loading,
  refreshing,
  isToday,
  onSetUpPlan,
}: MobileDashboardProps) {
  const [panel, setPanel] = useState<Panel | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const closePanel = useCallback(() => setPanel(null), []);
  const closeCalendar = useCallback(() => setCalendarOpen(false), []);
  const loggedDays = useLoggedDays();
  const water = useWaterIntake(userId, selectedDate);
  const weight = useWeightTrend(userId, fitness.weight, fitness.targetWeightKg);

  const eaten = Math.round(stats.calories);
  const goal = hasPlan ? goals.calories : null;
  const left = goal ? goal - eaten : null;
  const meals = [...recentLogs].sort(byLogTime);
  const lastMeal = meals[meals.length - 1];
  const glasses = water.goalMl / WATER_GLASS_ML;
  const filledGlasses = Math.min(Math.round(water.ml / WATER_GLASS_ML), glasses);
  const litres = Number((water.ml / 1000).toFixed(2));

  return (
    // Exactly one screen: viewport minus the top bar (64px) and tab bar (68px + inset).
    <div className="flex h-[calc(100dvh-4rem-68px-env(safe-area-inset-bottom))] min-h-[500px] flex-col gap-3 px-4 py-3 font-ui text-fg short:gap-2.5 short:py-2.5">
      <header className="relative flex shrink-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted short:hidden">{formatLongDate(selectedDate)}</p>
          <h1 className="truncate font-display text-[22px] font-bold leading-tight tracking-[-0.02em]">
            {greetingFor()}, {userName.split(' ')[0]}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setCalendarOpen((open) => !open)}
          aria-label="Open calendar"
          aria-expanded={calendarOpen}
          aria-haspopup="dialog"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line text-fg-2 transition-colors active:scale-95 ${
            calendarOpen ? 'bg-surface-2 text-fg' : 'bg-surface-1'
          }`}
        >
          <CalendarDaysIcon className="h-5 w-5" />
        </button>
        <CalendarPopover
          open={calendarOpen}
          selectedDate={selectedDate}
          loggedDays={loggedDays}
          onSelect={onSelectDate}
          onClose={closeCalendar}
        />
      </header>

      <div className="shrink-0">
        <WeekStrip selectedDate={selectedDate} onSelect={onSelectDate} compact />
      </div>

      <div
        className={`flex min-h-0 flex-1 flex-col gap-3 transition-opacity duration-300 short:gap-2.5 ${
          refreshing ? 'opacity-70' : ''
        }`}
      >
        <Tile
          label="Calories"
          tone="neutral"
          icon={<FireIcon className="h-4 w-4" />}
          onOpen={() => setPanel('calories')}
          hideLabelWhenShort
          className="shrink-0"
        >
          <span className="flex w-full items-center gap-4">
            <span className="short:hidden">
              <CalorieRing value={eaten} max={goal ?? 0} size={96} stroke={10}>
                <RingText eaten={eaten} left={left} />
              </CalorieRing>
            </span>
            <span className="hidden short:block">
              <CalorieRing value={eaten} max={goal ?? 0} size={78} stroke={8}>
                <RingText eaten={eaten} left={left} />
              </CalorieRing>
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-2 short:gap-1">
              <MacroBar
                macro="protein"
                value={Math.round(stats.proteins)}
                max={hasPlan ? goals.proteins : null}
              />
              <MacroBar
                macro="carbs"
                value={Math.round(stats.carbohydrates)}
                max={hasPlan ? goals.carbohydrates : null}
              />
              <MacroBar
                macro="fat"
                value={Math.round(stats.fats)}
                max={hasPlan ? goals.fats : null}
              />
            </span>
          </span>
        </Tile>

        <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-3 short:gap-2.5">
          <Tile
            label="Meals"
            tone="meals"
            icon={<CameraIcon className="h-4 w-4" />}
            onOpen={() => setPanel('meals')}
          >
            <span className="mt-auto flex min-w-0 flex-col gap-1">
              <Figure
                value={loading ? '–' : meals.length}
                unit={meals.length === 1 ? 'meal' : 'meals'}
              />
              <span className="truncate text-xs text-muted">
                {lastMeal
                  ? `${fmt(eaten)} kcal · ${lastMeal.foodName}`
                  : isToday
                    ? 'Tap the camera to log one'
                    : 'Nothing logged'}
              </span>
            </span>
          </Tile>

          <Tile
            label="Coach"
            tone="coach"
            icon={<SparklesIcon className="h-4 w-4" />}
            onOpen={() => setPanel('coach')}
          >
            <span className="mt-auto line-clamp-4 text-[13px] leading-snug text-fg-2 short:line-clamp-3">
              {hasPlan
                ? fitness.aiCoachAdvice || 'Log a few meals to get tips.'
                : 'Set up your plan to get daily targets.'}
            </span>
          </Tile>

          <Tile
            label="Water"
            tone="water"
            icon={<BeakerIcon className="h-4 w-4" />}
            onOpen={() => setPanel('water')}
            footer={
              <button
                type="button"
                onClick={water.addGlass}
                aria-label={`Add a glass of water (${WATER_GLASS_ML} ml)`}
                className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-info text-sm font-bold text-canvas transition-transform active:scale-95 short:h-9"
              >
                <PlusIcon className="h-4 w-4" strokeWidth={2.5} />
                {WATER_GLASS_ML} ml
              </button>
            }
          >
            {/* Centered reading: litres, glasses bar */}
            <span className="flex flex-1 flex-col items-center justify-center gap-2 text-center short:gap-1.5">
              <Figure value={litres} unit={`/ ${water.goalMl / 1000} L`} />
              <span aria-hidden="true" className="flex h-1.5 w-full gap-0.5 short:hidden">
                {Array.from({ length: glasses }, (_, i) => (
                  <span
                    key={i}
                    className={`flex-1 rounded-full transition-colors duration-300 ${
                      i < filledGlasses ? 'bg-info' : 'bg-surface-3'
                    }`}
                  />
                ))}
              </span>
            </span>
          </Tile>

          <Tile
            label="Weight"
            tone="weight"
            icon={<ScaleIcon className="h-4 w-4" />}
            onOpen={() => setPanel('weight')}
          >
            <span className="mt-auto flex min-w-0 flex-col gap-1.5">
              {weight.points.length >= 2 && (
                <span className="short:hidden">
                  <TrendChart
                    points={weight.points}
                    target={fitness.targetWeightKg}
                    heightClass="h-8"
                  />
                </span>
              )}
              <Figure value={weight.current ?? '–'} unit="kg" />
              <span className="truncate text-xs text-muted">
                {weight.progress !== null ? `${weight.progress}% to goal` : 'Add your weight'}
              </span>
            </span>
          </Tile>
        </div>
      </div>

      <BottomSheet
        open={panel !== null}
        onClose={closePanel}
        label={panel ? PANEL_LABELS[panel] : ''}
      >
        {panel === 'calories' && (
          <CaloriesCard
            stats={stats}
            goals={goals}
            hasPlan={hasPlan}
            refreshing={refreshing}
            onSetUpPlan={() => {
              closePanel();
              onSetUpPlan();
            }}
          />
        )}
        {panel === 'meals' && (
          <MealsCard
            logs={recentLogs}
            loading={loading}
            refreshing={refreshing}
            isToday={isToday}
          />
        )}
        {panel === 'coach' && (
          <CoachCard
            hasPlan={hasPlan}
            objective={fitness.objective}
            advice={fitness.aiCoachAdvice}
            onSetUpPlan={() => {
              closePanel();
              onSetUpPlan();
            }}
          />
        )}
        {panel === 'water' && <WaterCard userId={userId} date={selectedDate} />}
        {panel === 'weight' && (
          <WeightCard
            userId={userId}
            profileWeight={fitness.weight}
            targetWeight={fitness.targetWeightKg}
            targetDate={fitness.targetDate}
          />
        )}
      </BottomSheet>
    </div>
  );
}

function RingText({ eaten, left }: { eaten: number; left: number | null }) {
  return (
    <>
      <span
        className={`font-display text-xl font-bold leading-none ${left !== null && left < 0 ? 'text-warn' : 'text-fg'}`}
      >
        {fmt(left === null ? eaten : Math.abs(left))}
      </span>
      <span className="mt-0.5 text-xs text-muted">
        {left === null ? 'eaten' : left >= 0 ? 'left' : 'over'}
      </span>
    </>
  );
}
