'use client';

import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { PlanRequired } from '@/features/onboarding/components/PlanRequired';
import { useOnboarding } from '@/features/onboarding/hooks/useOnboarding';
import { useWaterIntake } from '../hooks/useWaterIntake';
import { WATER_GLASS_ML } from '../utils/Constants';

interface WaterCardProps {
  userId: string | undefined;
  date: string;
}

const litres = (ml: number) => `${Number((ml / 1000).toFixed(2))} L`;

export default function WaterCard({ userId, date }: WaterCardProps) {
  const { ml, goalMl, addGlass, removeGlass } = useWaterIntake(userId, date);
  const { loggingLocked } = useOnboarding();
  const glasses = goalMl / WATER_GLASS_ML;
  const filled = Math.min(Math.round(ml / WATER_GLASS_ML), glasses);

  if (loggingLocked) {
    return (
      <section
        aria-label="Water"
        className="flex flex-col gap-4 rounded-3xl border border-line bg-surface-1 p-5 md:p-6"
      >
        <h2 className="text-lg font-bold text-fg">Water</h2>
        <PlanRequired what="water" />
      </section>
    );
  }

  return (
    <section
      aria-label="Water"
      className="flex flex-col gap-4 rounded-3xl border border-line bg-surface-1 p-5 md:p-6"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-bold text-fg">Water</h2>
        <p className="text-sm text-muted max-md:text-subhead" aria-live="polite">
          <span className="font-bold text-fg">{litres(ml)}</span> of {litres(goalMl)}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={removeGlass}
          disabled={ml === 0}
          aria-label={`Remove a glass (${WATER_GLASS_ML} ml)`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line-strong bg-surface-2 text-fg transition-colors hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <MinusIcon className="h-5 w-5" />
        </button>

        <div aria-hidden="true" className="flex h-9 flex-1 gap-1">
          {Array.from({ length: glasses }, (_, i) => (
            <span
              key={i}
              className={`flex-1 rounded-md transition-colors duration-300 ${i < filled ? 'bg-info' : 'bg-surface-3'}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addGlass}
          aria-label={`Add a glass (${WATER_GLASS_ML} ml)`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand transition-colors hover:bg-brand-hover"
        >
          <PlusIcon className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>

      <p className="text-xs text-muted">
        {filled} of {glasses} glasses · {WATER_GLASS_ML} ml each
      </p>
    </section>
  );
}
