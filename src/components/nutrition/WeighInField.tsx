'use client';

import { useEffect, useState } from 'react';
import { CheckCircleIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

interface WeighInFieldProps {
  current: number | null;
  lastLoggedIso?: string | null;
  alreadyLoggedToday?: boolean;
  onSave: (weight: number) => void;
  showHeading?: boolean;
}

export function WeighInField({
  current,
  lastLoggedIso = null,
  alreadyLoggedToday = false,
  onSave,
  showHeading = true,
}: WeighInFieldProps) {
  const [typed, setTyped] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState<number | null>(null);

  const draft = typed ?? (current !== null ? String(current) : '');
  const parsed = parseFloat(draft);
  const valid = Number.isFinite(parsed) && parsed >= 20 && parsed <= 400;
  const outOfRange = draft.trim() !== '' && Number.isFinite(parsed) && !valid;

  useEffect(() => {
    if (justSaved === null) return;
    const timer = setTimeout(() => setJustSaved(null), 4000);
    return () => clearTimeout(timer);
  }, [justSaved]);

  const nudge = (by: number) => {
    const base = Number.isFinite(parsed) ? parsed : (current ?? 70);
    setTyped((Math.round((base + by) * 10) / 10).toFixed(1));
  };

  const save = () => {
    if (!valid || alreadyLoggedToday) return;
    onSave(parsed);
    setTyped(null);
    setJustSaved(parsed);
  };

  return (
    <div className="flex flex-col gap-3">
      {showHeading && (
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <div className="min-w-0">
            <label htmlFor="weigh-in" className="block text-sm font-bold text-fg">
              Log today&apos;s weight
            </label>
            <p className="mt-0.5 text-caption text-muted">One weigh-in per day.</p>
          </div>
          <p className="text-caption text-muted">
            {lastLoggedIso ? `Last logged ${longDate(lastLoggedIso)}` : 'No weigh-ins yet'}
          </p>
        </div>
      )}

      <div className="flex w-full items-center gap-2">
        <button
          type="button"
          onClick={() => nudge(-0.1)}
          aria-label="Lower by 0.1 kg"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-line-strong bg-surface-2 text-fg-2 transition-colors hover:text-fg active:scale-95"
        >
          <MinusIcon className="h-5 w-5" />
        </button>

        <div className="relative min-w-0 flex-1 max-w-40">
          <input
            id="weigh-in"
            type="number"
            disabled={alreadyLoggedToday}
            inputMode="decimal"
            step="0.1"
            value={draft}
            onChange={(e) => setTyped(e.target.value)}
            onFocus={(e) => e.currentTarget.select()}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            placeholder="72.4"
            aria-describedby="weigh-in-hint"
            className={`h-12 w-full rounded-2xl border-2 bg-surface-2 pl-4 pr-11 text-center font-display text-[22px] font-bold tabular-nums text-fg outline-none transition-colors placeholder:font-ui placeholder:text-base placeholder:font-normal placeholder:text-muted disabled:opacity-60 ${
              outOfRange ? 'border-danger' : 'border-line-strong focus:border-brand'
            }`}
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-caption font-bold text-muted">
            kg
          </span>
        </div>

        <button
          type="button"
          onClick={() => nudge(0.1)}
          aria-label="Raise by 0.1 kg"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-line-strong bg-surface-2 text-fg-2 transition-colors hover:text-fg active:scale-95"
        >
          <PlusIcon className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={save}
          disabled={!valid || alreadyLoggedToday}
          className="h-12 shrink-0 rounded-2xl bg-brand px-4 text-base font-bold text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
        >
          Save
        </button>
      </div>

      <p
        id="weigh-in-hint"
        className={`text-caption ${
          outOfRange || alreadyLoggedToday
            ? 'text-danger'
            : justSaved !== null
              ? 'text-brand-ink'
              : 'text-muted'
        }`}
      >
        {outOfRange ? (
          'Enter a weight between 20 and 400 kg.'
        ) : alreadyLoggedToday ? (
          'You already logged today. Log another weight tomorrow.'
        ) : justSaved !== null ? (
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <CheckCircleIcon className="h-4 w-4" />
            Saved {justSaved} kg — your chart is updated.
          </span>
        ) : (
          'Weigh in at the same time each day for a steadier trend.'
        )}
      </p>
    </div>
  );
}
