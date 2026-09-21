'use client';

import { useState, type ReactNode } from 'react';
import { ChevronRightIcon, FireIcon, SparklesIcon, UserIcon } from '@heroicons/react/24/outline';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { WeighInField } from '@/components/nutrition/WeighInField';
import { useWeightLog } from '@/hooks/useWeightLog';
import type { FitnessDetails } from '@/features/userProfile';
import ProgressChart from './ProgressChart';
import TargetsCard from './TargetsCard';
import CoachCard from './CoachCard';
import BodyStatsCard from './BodyStatsCard';

type Sheet = 'targets' | 'coach' | 'body';

const SHEET_LABELS: Record<Sheet, string> = {
  targets: 'Daily targets',
  coach: 'Coach',
  body: 'Your body',
};

function Stat({ label, value, tone = 'text-fg' }: { label: string; value: string; tone?: string }) {
  return (
    <span className="flex min-w-0 flex-col">
      <span className="truncate text-caption text-muted">{label}</span>
      <span
        className={`truncate font-display text-[19px] font-bold leading-tight tabular-nums ${tone}`}
      >
        {value}
      </span>
    </span>
  );
}

function Tile({
  label,
  icon,
  onOpen,
  children,
}: {
  label: string;
  icon: ReactNode;
  onOpen: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="flex min-h-0 flex-col gap-2 overflow-hidden rounded-3xl border border-line bg-surface-1 p-4 text-left transition-transform duration-150 active:scale-[0.97] short:gap-1.5 short:p-3"
    >
      <span className="flex w-full items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand-ink short:h-6 short:w-6">
          {icon}
        </span>
        <span className="text-sm font-bold text-fg">{label}</span>
        <ChevronRightIcon className="ml-auto h-4 w-4 shrink-0 text-muted" />
      </span>
      {children}
    </button>
  );
}

/** Phones: the plan on one screen — the chart stays put, details open in sheets. */
export default function MobilePlan({
  userId,
  fitness,
  bmi,
  summary,
  weeksLeft,
  onUpdatePlan,
  onLogged,
}: {
  userId: string | undefined;
  fitness: FitnessDetails | null;
  bmi: string;
  summary: string;
  weeksLeft: number | null;
  onUpdatePlan: () => void;
  onLogged?: () => void;
}) {
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const targetWeight = fitness?.targetWeightKg ?? null;
  const { startPoint, points, current, start, lastLoggedOn, loggedToday, change, logWeight } = useWeightLog(
    userId,
    fitness?.weight ?? null,
    targetWeight,
    fitness?.createdAt ?? null
  );

  const losing = targetWeight !== null && current !== null && targetWeight < current;
  const moved = change === null ? null : losing ? -change : change;
  const calories = fitness?.dailyCalorieTarget ?? 0;

  const save = (weight: number) => {
    logWeight(weight);
    onLogged?.();
  };

  return (
    <div className="flex h-[calc(100dvh-4rem-68px-2.25rem-env(safe-area-inset-bottom))] min-h-[440px] flex-col gap-3 px-4 py-3 font-ui text-fg short:gap-2.5 short:py-2.5">
      <header className="flex shrink-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate font-display text-[22px] font-bold leading-tight tracking-[-0.02em]">
            My plan
          </h1>
          <p className="truncate text-caption text-muted">{summary}</p>
        </div>
        <button
          type="button"
          onClick={onUpdatePlan}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-brand px-4 text-sm font-bold text-on-brand transition-transform active:scale-95"
        >
          <SparklesIcon className="h-4 w-4" />
          {fitness?.objective ? 'Update' : 'Create'}
        </button>
      </header>

      <section className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden rounded-3xl border border-line bg-surface-1 p-4 short:gap-2.5 short:p-3">
        <div className="flex shrink-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-fg">Progress</h2>
            <p className="truncate text-caption text-muted">
              {start !== null && targetWeight
                ? `${start.toFixed(1)} → ${targetWeight.toFixed(1)} kg goal`
                : 'Set a target weight in your plan'}
            </p>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-3 gap-2">
          <Stat label="Now" value={current !== null ? `${current} kg` : '—'} />
          <Stat
            label={losing ? 'Lost' : 'Gained'}
            value={moved === null || moved === 0 ? '—' : `${Math.abs(moved).toFixed(1)} kg`}
            tone={moved !== null && moved > 0 ? 'text-brand-ink' : 'text-fg'}
          />
          <Stat label="Weeks left" value={weeksLeft !== null ? String(weeksLeft) : '—'} />
        </div>

        {points.length >= 2 ? (
          <div className="min-h-0 flex-1">
            <ProgressChart startPoint={startPoint} points={points} target={targetWeight} className="h-full w-full" />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong p-4 text-center">
            <p className="text-sm font-semibold text-fg">Two weigh-ins draws your trend</p>
            <p className="mt-1 text-caption text-muted">Save today&apos;s weight below.</p>
          </div>
        )}

        <div className="shrink-0 border-t border-line pt-3">
          <WeighInField
            current={current}
            lastLoggedIso={lastLoggedOn}
            alreadyLoggedToday={loggedToday}
            onSave={save}
            showHeading={false}
          />
        </div>
      </section>

      <div className="grid shrink-0 grid-cols-2 gap-3 short:gap-2.5">
        <Tile
          label="Targets"
          icon={<FireIcon className="h-4 w-4" />}
          onOpen={() => setSheet('targets')}
        >
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-display text-[19px] font-bold leading-tight tabular-nums text-fg">
              {calories ? calories.toLocaleString('en-US') : '—'}
              {calories ? (
                <span className="ml-1 font-ui text-caption font-normal text-muted">kcal</span>
              ) : null}
            </span>
            <span className="truncate text-caption text-muted">
              {calories
                ? `${fitness?.dailyProteinTargetG ?? 0}p · ${fitness?.dailyCarbsTargetG ?? 0}c · ${fitness?.dailyFatTargetG ?? 0}f`
                : 'No plan yet'}
            </span>
          </span>
        </Tile>

        <Tile
          label="Coach"
          icon={<SparklesIcon className="h-4 w-4" />}
          onOpen={() => setSheet('coach')}
        >
          <span className="line-clamp-2 text-caption leading-snug text-fg-2">
            {fitness?.aiCoachAdvice || 'Run a consultation for advice.'}
          </span>
        </Tile>
      </div>

      <button
        type="button"
        onClick={() => setSheet('body')}
        aria-haspopup="dialog"
        className="flex shrink-0 items-center gap-2.5 rounded-2xl border border-line bg-surface-1 px-4 py-2.5 text-left transition-transform active:scale-[0.98] short:py-2"
      >
        <UserIcon className="h-4 w-4 shrink-0 text-brand-ink" />
        <span className="min-w-0 flex-1 truncate text-sm font-bold text-fg">Your body</span>
        <span className="shrink-0 truncate text-caption text-muted">
          {fitness?.height ? `${fitness.height} cm` : '—'} · BMI {bmi}
        </span>
        <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted" />
      </button>

      <BottomSheet
        open={sheet !== null}
        onClose={() => setSheet(null)}
        label={sheet ? SHEET_LABELS[sheet] : ''}
      >
        {sheet === 'targets' && (
          <TargetsCard
            fitness={fitness}
            onUpdatePlan={() => {
              setSheet(null);
              onUpdatePlan();
            }}
          />
        )}
        {sheet === 'coach' && (
          <CoachCard
            fitness={fitness}
            onConsult={() => {
              setSheet(null);
              onUpdatePlan();
            }}
          />
        )}
        {sheet === 'body' && <BodyStatsCard fitness={fitness} bmi={bmi} />}
      </BottomSheet>
    </div>
  );
}
