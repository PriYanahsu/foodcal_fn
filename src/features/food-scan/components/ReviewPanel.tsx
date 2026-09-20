import React from 'react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { buttonClass, Spinner } from '@/components/ui/fc';
import { MealType, NutritionData } from '../types';
import { MACRO_FIELDS, MEAL_TYPES, SERVING_MAX, SERVING_MIN } from '../utils/constants';
import { PanelLabel, PanelSection, ScanPanel } from './ScanPanel';

const round = (n: number) => Math.round(n).toLocaleString('en-US');

/** How much to trust the estimate, in words rather than a bare percentage. */
function confidenceOf(aiConfidence: number) {
  const pct = Math.round((aiConfidence ?? 0) * 100);
  if (pct >= 80) return { pct, label: 'High confidence', tone: 'bg-brand/15 text-brand-ink' };
  if (pct >= 55) return { pct, label: 'Fair confidence', tone: 'bg-carbs/20 text-carbs' };
  return { pct, label: 'Low confidence', tone: 'bg-warn/20 text-warn' };
}

const StepButton: React.FC<{
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}> = ({ onClick, disabled, label, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-1 text-fg transition-transform enabled:active:scale-90 disabled:opacity-40 md:h-9 md:w-9"
  >
    {children}
  </button>
);

interface ReviewPanelProps {
  /** Already scaled to the chosen number of servings. */
  meal: NutritionData;
  /** One serving as the AI described it, e.g. "1 bowl". */
  baseQuantity: string;
  servings: number;
  onIncrement: () => void;
  onDecrement: () => void;
  mealType: MealType;
  onMealType: (meal: MealType) => void;
  onLog: () => void;
  onDiscard: () => void;
  isSaving: boolean;
  error?: string | null;
}

/** Step 2: what the AI found, plus the two things only the user knows — how much, and which meal. */
export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  meal,
  baseQuantity,
  servings,
  onIncrement,
  onDecrement,
  mealType,
  onMealType,
  onLog,
  onDiscard,
  isSaving,
  error,
}) => {
  const confidence = confidenceOf(meal.aiConfidence);
  const mealLabel = MEAL_TYPES.find((m) => m.key === mealType)?.label ?? 'meal';

  return (
    <ScanPanel>
      <PanelSection>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${confidence.tone}`}
        >
          {confidence.label} · {confidence.pct}%
        </span>

        {/* The photo carries the name on phones, so it only shows here from md up. */}
        <h2 className="mt-2 hidden truncate font-display text-2xl font-bold tracking-[-0.02em] text-fg md:block">
          {meal.foodName || 'Your meal'}
        </h2>

        <p className="mt-2 flex items-baseline gap-1.5">
          <span className="font-display text-[32px] font-bold leading-none tracking-[-0.03em] text-fg short:text-[28px] md:text-[42px]">
            {round(meal.calories)}
          </span>
          <span className="text-sm font-semibold text-muted">kcal</span>
          {meal.quantity && (
            <span className="ml-auto min-w-0 truncate text-xs text-muted">{meal.quantity}</span>
          )}
        </p>

        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {MACRO_FIELDS.map((macro) => (
            <div
              key={macro.field}
              className={`rounded-xl border px-2.5 py-1.5 md:py-2 ${macro.tone}`}
            >
              <p className={`text-[11px] font-bold ${macro.accent}`}>{macro.label}</p>
              <p className="font-display text-base font-bold leading-tight tracking-[-0.02em] text-fg md:text-lg">
                {round(meal[macro.field])}
                <span className="ml-0.5 text-xs font-semibold text-muted">g</span>
              </p>
            </div>
          ))}
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-line pt-2.5">
          <div className="min-w-0">
            <PanelLabel>Portion</PanelLabel>
            <p className="truncate text-xs text-muted short:hidden">
              {baseQuantity ? `One serving ≈ ${baseQuantity}` : 'Change it if you ate more or less'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-xl border border-line bg-surface-2 p-1">
            <StepButton onClick={onDecrement} disabled={servings <= SERVING_MIN} label="Less">
              <MinusIcon className="h-4 w-4" strokeWidth={2.5} />
            </StepButton>
            <span className="w-9 text-center font-display text-base font-bold tabular-nums text-fg">
              {servings}×
            </span>
            <StepButton onClick={onIncrement} disabled={servings >= SERVING_MAX} label="More">
              <PlusIcon className="h-4 w-4" strokeWidth={2.5} />
            </StepButton>
          </div>
        </div>
      </PanelSection>

      {/* No card chrome on phones — the segmented control is already a contained shape. */}
      <PanelSection className="max-md:border-0 max-md:bg-transparent max-md:p-0">
        <PanelLabel className="max-md:sr-only">Meal</PanelLabel>
        <div
          role="radiogroup"
          aria-label="Meal"
          className="grid grid-cols-4 gap-1 rounded-xl border border-line bg-surface-2 p-1 md:mt-2"
        >
          {MEAL_TYPES.map((m) => {
            const active = m.key === mealType;
            return (
              <button
                key={m.key}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onMealType(m.key)}
                className={`h-9 rounded-lg text-[13px] font-bold transition-colors ${
                  active ? 'bg-brand text-on-brand' : 'text-muted hover:bg-surface-3 hover:text-fg'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </PanelSection>

      {/* On phones the notes open in a bottom sheet from the photo — no room for them inline. */}
      {meal.analysisNotes && (
        <PanelSection className="hidden md:block">
          <PanelLabel>How we got there</PanelLabel>
          <p className="mt-1.5 text-[13px] leading-relaxed text-fg-2">{meal.analysisNotes}</p>
        </PanelSection>
      )}

      {error && (
        <p className="shrink-0 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-[13px] font-semibold text-danger md:mt-4">
          {error}
        </p>
      )}

      <div className="grid shrink-0 grid-cols-[auto_1fr] gap-2 md:mt-auto md:gap-3 md:pt-6">
        <button
          type="button"
          onClick={onDiscard}
          disabled={isSaving}
          className={buttonClass('secondary', 'md')}
        >
          Discard
        </button>
        <button
          type="button"
          onClick={onLog}
          disabled={isSaving}
          className={buttonClass('primary', 'md')}
        >
          {isSaving ? (
            <>
              <Spinner className="h-4 w-4" />
              Logging…
            </>
          ) : (
            // One text node: `buttonClass` sets `gap-2`, which would space out every child.
            <span>
              Log<span className="hidden sm:inline"> to {mealLabel}</span> · {round(meal.calories)}{' '}
              kcal
            </span>
          )}
        </button>
      </div>
    </ScanPanel>
  );
};
