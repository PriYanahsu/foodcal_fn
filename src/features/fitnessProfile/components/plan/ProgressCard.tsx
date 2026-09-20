'use client';

import { useState } from 'react';
import { WeighInField } from '@/components/nutrition/WeighInField';
import { useWeightLog } from '@/hooks/useWeightLog';
import ProgressChart from './ProgressChart';

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

function Stat({ label, value, tone = 'text-fg' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="min-w-0 text-left sm:text-right">
      <p className="truncate text-caption font-medium text-muted">{label}</p>
      <p className={`font-display text-[22px] font-bold leading-tight tabular-nums ${tone}`}>
        {value}
      </p>
    </div>
  );
}

/** Weigh-ins, the trend toward the goal, and today's entry — the tracking hub. */
export default function ProgressCard({
  userId,
  profileWeight,
  targetWeight,
  targetDate,
  onLogged,
}: {
  userId: string | undefined;
  profileWeight: number | null;
  targetWeight: number | null;
  targetDate: string | null;
  onLogged?: () => void;
}) {
  const { points, current, start, startedOn, change, progress, logWeight } = useWeightLog(
    userId,
    profileWeight,
    targetWeight
  );
  // Read the clock once per mount rather than on every render.
  const [now] = useState(() => Date.now());

  const weeksLeft = targetDate
    ? Math.max(0, Math.ceil((new Date(targetDate).getTime() - now) / (7 * 86400000)))
    : null;
  const losing = targetWeight !== null && current !== null && targetWeight < current;
  const movedLabel = losing ? 'Lost' : 'Gained';
  const moved = change === null ? null : losing ? -change : change;

  const save = (weight: number) => {
    logWeight(weight);
    onLogged?.();
  };

  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-line bg-surface-1 p-5 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-fg">Progress</h2>
          <p className="mt-0.5 text-footnote text-muted">
            {start !== null && startedOn
              ? `${start.toFixed(1)} kg on ${longDate(startedOn)}`
              : 'No weigh-ins yet'}
            {targetWeight ? ` → ${targetWeight.toFixed(1)} kg goal` : ''}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:flex sm:gap-6">
          <Stat label="Now" value={current !== null ? `${current} kg` : '—'} />
          <Stat
            label={movedLabel}
            value={moved === null || moved === 0 ? '—' : `${Math.abs(moved).toFixed(1)} kg`}
            tone={moved !== null && moved > 0 ? 'text-brand-ink' : 'text-fg'}
          />
          <Stat label="Weeks left" value={weeksLeft !== null ? String(weeksLeft) : '—'} />
        </div>
      </div>

      {points.length >= 2 ? (
        <ProgressChart points={points} target={targetWeight} />
      ) : (
        <div className="rounded-2xl border border-dashed border-line-strong p-6 text-center">
          <p className="text-sm font-semibold text-fg">Your trend starts with two weigh-ins</p>
          <p className="mt-1 text-footnote text-muted">
            Log today&apos;s weight below, then again in a few days.
          </p>
        </div>
      )}

      {progress !== null && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between text-caption">
            <span className="text-muted">Toward your goal</span>
            <span className="font-bold text-brand-ink">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-brand transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="border-t border-line pt-4">
        <WeighInField current={current} lastLoggedIso={startedOn} onSave={save} />
      </div>
    </section>
  );
}
