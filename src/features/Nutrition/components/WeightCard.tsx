'use client';

import { useId } from 'react';
import Link from 'next/link';
import { WeighInField } from '@/components/nutrition/WeighInField';
import { useWeightLog, type WeightPoint } from '@/hooks/useWeightLog';

interface WeightCardProps {
  userId: string | undefined;
  profileWeight: number;
  targetWeight: number;
  targetDate: string;
  createdAt?: string | null;
}

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

/** Line of the weigh-ins with a dashed goal line. Coordinates are % of the box. */
export function TrendChart({
  points,
  target,
  heightClass = 'h-28',
}: {
  points: WeightPoint[];
  target: number;
  heightClass?: string;
}) {
  const weights = points.map((p) => p.weightKg);
  const min = Math.min(...weights, target || Infinity) - 0.5;
  const max = Math.max(...weights, target || -Infinity) + 0.5;
  const x = (i: number) => (i / (points.length - 1)) * 100;
  const y = (w: number) => ((max - w) / (max - min)) * 100;
  const last = points[points.length - 1];
  const gradientId = `weight-fill-${useId().replace(/:/g, '')}`;

  return (
    <div className={`relative w-full ${heightClass}`} aria-hidden="true">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--fc-brand)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--fc-brand)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`0,100 ${points.map((p, i) => `${x(i)},${y(p.weightKg)}`).join(' ')} 100,100`}
          fill={`url(#${gradientId})`}
        />
        {target > 0 && (
          <line
            x1="0"
            x2="100"
            y1={y(target)}
            y2={y(target)}
            vectorEffect="non-scaling-stroke"
            strokeDasharray="4 4"
            className="stroke-line-strong"
            strokeWidth="1.5"
          />
        )}
        <polyline
          points={points.map((p, i) => `${x(i)},${y(p.weightKg)}`).join(' ')}
          fill="none"
          vectorEffect="non-scaling-stroke"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="stroke-brand"
        />
      </svg>
      {/* End point as HTML so it stays round when the chart stretches. */}
      <span
        className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand ring-4 ring-surface-1"
        style={{ left: '100%', top: `${y(last.weightKg)}%` }}
      />
    </div>
  );
}

export default function WeightCard({
  userId,
  profileWeight,
  targetWeight,
  targetDate,
  createdAt,
}: WeightCardProps) {
  const { points, current, lastLoggedOn, loggedToday, change, progress, logWeight } = useWeightLog(
    userId,
    profileWeight,
    targetWeight,
    createdAt
  );
  const movingTowardGoal =
    change !== null &&
    current !== null &&
    targetWeight > 0 &&
    Math.sign(change) === Math.sign(targetWeight - (current - change));

  return (
    <section
      aria-label="Weight"
      className="flex flex-col gap-4 rounded-3xl border border-line bg-surface-1 p-5 md:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-fg">Weight</h2>
        <Link href="/fitness" className="text-sm font-semibold text-brand-ink hover:underline">
          Full chart
        </Link>
      </div>

      {current === null ? (
        <p className="text-sm text-muted max-md:text-subhead">
          Log your first weigh-in below to start tracking progress toward your goal.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="font-display text-[32px] font-bold leading-none tracking-[-0.02em] text-fg">
              {current}
              <span className="ml-1 font-ui text-base font-semibold text-muted">kg</span>
            </p>
            {change !== null && change !== 0 && lastLoggedOn && (
              <p
                className={`text-sm font-semibold ${movingTowardGoal ? 'text-brand-ink' : 'text-muted'}`}
              >
                {change > 0 ? '+' : '−'}
                {Math.abs(change).toFixed(1)} kg since {shortDate(lastLoggedOn)}
              </p>
            )}
          </div>

          {points.length >= 2 ? (
            <TrendChart points={points} target={targetWeight} />
          ) : (
            <p className="rounded-2xl border border-dashed border-line-strong p-4 text-sm text-muted max-md:text-subhead">
              Log your weight regularly to see your trend here.
            </p>
          )}

          {targetWeight > 0 && (
            <div className="flex items-center justify-between gap-3 text-xs text-muted">
              <span>
                Goal {targetWeight} kg{targetDate ? ` by ${shortDate(targetDate)}` : ''}
              </span>
              {progress !== null && (
                <span className="font-semibold text-fg-2">{progress}% there</span>
              )}
            </div>
          )}
        </>
      )}

      <div className="border-t border-line pt-4">
        <WeighInField
          current={current}
          lastLoggedIso={lastLoggedOn}
          alreadyLoggedToday={loggedToday}
          onSave={logWeight}
        />
      </div>
    </section>
  );
}
