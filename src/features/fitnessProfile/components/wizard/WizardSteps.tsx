'use client';

import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MinusSmallIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { CalorieRing, MacroBar } from '@/components/nutrition/macros';
import { ACTIVITY_LEVELS } from '../../utils/Constant';
import type { Goals, Stats } from '../../type';

export const CONTROL =
  'h-12 w-full rounded-2xl border border-line bg-surface-2 px-4 text-base text-fg outline-none transition-colors placeholder:text-muted focus:border-brand';
export const LABEL = 'mb-1.5 block text-caption font-semibold uppercase tracking-wide text-muted';

const ACTIVITY_HINTS: Record<string, string> = {
  Sedentary: 'Desk job, little exercise',
  'Lightly Active': 'Light training 1–3 days a week',
  'Moderately Active': 'Training 3–5 days a week',
  'Very Active': 'Hard training 6–7 days a week',
};

const OBJECTIVES = [
  { value: 'Lose Weight', icon: ArrowTrendingDownIcon },
  { value: 'Maintain Weight', icon: MinusSmallIcon },
  { value: 'Gain Muscle', icon: ArrowTrendingUpIcon },
] as const;

/** A tappable option: bordered, brand-tinted when chosen. */
function Option({
  selected,
  disabled = false,
  onClick,
  title,
  className = '',
  children,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-pressed={selected}
      className={`rounded-2xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        selected
          ? 'border-brand bg-brand/10 text-fg'
          : 'border-line bg-surface-2 text-fg-2 hover:border-line-strong hover:text-fg'
      } ${className}`}
    >
      {children}
    </button>
  );
}

/** Step 1 — body stats. */
export function AboutYouStep({
  stats,
  setStats,
  prefillLoading,
}: {
  stats: Stats;
  setStats: (next: Stats) => void;
  prefillLoading: boolean;
}) {
  if (prefillLoading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="h-12 animate-pulse rounded-2xl bg-surface-2" />
        <div className="h-24 animate-pulse rounded-2xl bg-surface-2" />
        <div className="h-40 animate-pulse rounded-2xl bg-surface-2" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <span className={LABEL}>Gender</span>
        <div className="grid grid-cols-3 gap-2">
          {['Male', 'Female', 'Other'].map((g) => (
            <Option
              key={g}
              selected={stats.gender === g}
              onClick={() => setStats({ ...stats, gender: g })}
              className="text-center text-sm font-bold"
            >
              {g}
            </Option>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label>
          <span className={LABEL}>Age</span>
          <input
            type="number"
            inputMode="numeric"
            value={stats.age}
            placeholder="28"
            onChange={(e) =>
              setStats({ ...stats, age: e.target.value === '' ? '' : parseInt(e.target.value) })
            }
            className={CONTROL}
          />
        </label>
        <label>
          <span className={LABEL}>Height · cm</span>
          <input
            type="number"
            inputMode="numeric"
            value={stats.height}
            placeholder="175"
            onChange={(e) =>
              setStats({ ...stats, height: e.target.value === '' ? '' : parseInt(e.target.value) })
            }
            className={CONTROL}
          />
        </label>
        <label className="col-span-2">
          <span className={LABEL}>Current weight · kg</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={stats.weight}
            placeholder="72"
            onChange={(e) =>
              setStats({
                ...stats,
                weight: e.target.value === '' ? '' : parseFloat(e.target.value),
              })
            }
            className={CONTROL}
          />
        </label>
      </div>

      <div>
        <span className={LABEL}>How active are you?</span>
        <div className="flex flex-col gap-2">
          {ACTIVITY_LEVELS.map((level) => {
            const selected = stats.activity_level === level;
            return (
              <Option
                key={level}
                selected={selected}
                onClick={() => setStats({ ...stats, activity_level: level })}
                className="flex items-center gap-3"
              >
                <span
                  aria-hidden="true"
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    selected ? 'border-brand' : 'border-line-strong'
                  }`}
                >
                  {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-fg">{level}</span>
                  <span className="block text-caption text-muted">{ACTIVITY_HINTS[level]}</span>
                </span>
              </Option>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Weeks between today and the target date, floored at one. */
function weeksUntil(date: string) {
  if (!date) return null;
  const ms = new Date(date).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  return Math.max(1, Math.round(ms / (7 * 24 * 60 * 60 * 1000)));
}

/** Step 2 — objective, target weight and date, with a plain-words summary. */
export function GoalStep({
  stats,
  goals,
  setGoals,
  setTargetWeight,
  isObjectiveAllowed,
  derivedObjective,
}: {
  stats: Stats;
  goals: Goals;
  setGoals: (next: Goals) => void;
  setTargetWeight: (value: number | '') => void;
  isObjectiveAllowed: (objective: string) => boolean;
  derivedObjective: string | null;
}) {
  const weeks = weeksUntil(goals.target_date);
  const delta =
    stats.weight !== '' && goals.target_weight !== ''
      ? Number(goals.target_weight) - Number(stats.weight)
      : null;
  const perWeek = delta !== null && weeks ? Math.abs(delta) / weeks : null;
  const fast = perWeek !== null && perWeek > 1;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <span className={LABEL}>Objective</span>
        <div className="grid grid-cols-3 gap-2">
          {OBJECTIVES.map(({ value, icon: Icon }) => {
            const allowed = isObjectiveAllowed(value);
            return (
              <Option
                key={value}
                selected={goals.objective === value}
                disabled={!allowed}
                onClick={() => allowed && setGoals({ ...goals, objective: value })}
                title={
                  !allowed && derivedObjective
                    ? `Set by your weights — your goal is ${derivedObjective}`
                    : undefined
                }
                className="flex flex-col items-center gap-1.5 text-center"
              >
                <Icon className="h-5 w-5" />
                <span className="text-caption font-bold leading-tight">{value}</span>
              </Option>
            );
          })}
        </div>
        {derivedObjective && (
          <p className="mt-2 text-caption text-muted">
            Set automatically from your current and target weight.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label>
          <span className={LABEL}>Target weight · kg</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={goals.target_weight}
            placeholder="68"
            onChange={(e) =>
              setTargetWeight(e.target.value === '' ? '' : parseFloat(e.target.value))
            }
            className={CONTROL}
          />
        </label>
        <label>
          <span className={LABEL}>Target date</span>
          <input
            type="date"
            value={goals.target_date}
            onChange={(e) => setGoals({ ...goals, target_date: e.target.value })}
            className={CONTROL}
          />
        </label>
      </div>

      {delta !== null && weeks && (
        <div
          className={`rounded-2xl border p-4 ${
            fast ? 'border-warn/40 bg-warn/10' : 'border-line bg-surface-2'
          }`}
        >
          <p className="text-sm font-bold text-fg">
            {delta === 0
              ? `Hold ${stats.weight} kg for ${weeks} weeks`
              : `${delta < 0 ? 'Lose' : 'Gain'} ${Math.abs(delta).toFixed(1)} kg over ${weeks} weeks`}
          </p>
          <p className="mt-0.5 text-caption text-muted">
            {perWeek === null || delta === 0
              ? 'Your coach will set targets that hold this weight.'
              : `About ${perWeek.toFixed(2)} kg a week.${
                  fast ? ' That is fast — your coach may suggest a later date.' : ''
                }`}
          </p>
        </div>
      )}
    </div>
  );
}

/** Step 3 — what is about to be sent, and what comes back. */
export function ConsultStep({ stats, goals }: { stats: Stats; goals: Goals }) {
  const chips = [
    stats.gender,
    stats.age !== '' ? `${stats.age} yrs` : null,
    stats.height !== '' ? `${stats.height} cm` : null,
    stats.weight !== '' ? `${stats.weight} kg` : null,
    stats.activity_level,
    goals.objective,
    goals.target_weight !== '' ? `Target ${goals.target_weight} kg` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-brand/30 bg-brand/10 p-6 text-center">
        <span className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-brand/20" />
          <span className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-brand bg-surface-1">
            <SparklesIcon className="h-7 w-7 text-brand-ink" />
          </span>
        </span>
        <div>
          <h3 className="text-lg font-bold text-fg">Ready when you are</h3>
          <p className="mt-0.5 text-footnote text-fg-2">
            Your coach reads these details and writes your daily targets.
          </p>
        </div>
      </div>

      <div>
        <span className={LABEL}>What your coach sees</span>
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-line bg-surface-2 px-3 py-1.5 text-caption font-semibold text-fg-2"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      <div>
        <span className={LABEL}>What you get back</span>
        <ul className="flex flex-col gap-2.5">
          {[
            ['Daily calorie target', 'how much to eat for this goal'],
            ['Protein, carbs and fat', 'macro targets to hit each day'],
            ['Coach advice', 'short tips written for your plan'],
          ].map(([title, detail]) => (
            <li key={title} className="flex gap-2.5 text-footnote text-fg-2">
              <CheckCircleIcon className="h-5 w-5 shrink-0 text-brand-ink" />
              <span>
                <span className="font-bold text-fg">{title}</span> — {detail}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export interface AiPlan {
  status: string;
  reasoning: string;
  advice: string;
  targets: { calories: number; protein: number; carbs: number; fats: number };
}

/** Step 4 — the plan, drawn with the same ring and bars as the dashboard. */
export function PlanStep({ aiResult }: { aiResult: AiPlan }) {
  if (aiResult.status !== 'approved') {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-warn/40 bg-warn/10 p-6 text-center">
          <ExclamationTriangleIcon className="h-9 w-9 text-warn" />
          <div>
            <h3 className="text-lg font-bold text-fg">Let&apos;s adjust the goal</h3>
            <p className="mt-1 text-footnote leading-relaxed text-fg-2">{aiResult.reasoning}</p>
          </div>
        </div>
        <p className="text-center text-footnote text-muted">
          Move the target date out, or pick a gentler target weight.
        </p>
      </div>
    );
  }

  const { calories, protein, carbs, fats } = aiResult.targets;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-line bg-surface-2 p-5 sm:flex-row">
        <CalorieRing value={calories} max={calories} size={112} stroke={11}>
          <span className="font-display text-[26px] font-bold leading-none text-fg">
            {calories.toLocaleString('en-US')}
          </span>
          <span className="mt-0.5 text-caption text-muted">kcal / day</span>
        </CalorieRing>

        <div className="flex w-full min-w-0 flex-col gap-3">
          <MacroBar macro="protein" value={protein} max={protein} unit="g" size="md" />
          <MacroBar macro="carbs" value={carbs} max={carbs} unit="g" size="md" />
          <MacroBar macro="fat" value={fats} max={fats} unit="g" size="md" />
        </div>
      </div>

      <div className="rounded-2xl border border-brand/30 bg-brand/10 p-4">
        <h4 className="flex items-center gap-1.5 text-footnote font-bold text-brand-ink">
          <SparklesIcon className="h-4 w-4" /> Coach advice
        </h4>
        <p className="mt-1.5 text-footnote leading-relaxed text-fg-2">{aiResult.advice}</p>
      </div>

      <p className="text-caption leading-relaxed text-muted">{aiResult.reasoning}</p>
    </div>
  );
}
