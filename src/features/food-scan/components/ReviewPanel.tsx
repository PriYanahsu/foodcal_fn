import React from 'react';
import { CheckIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { buttonClass, Spinner } from '@/components/ui/fc';
import { CalorieRing } from '@/components/nutrition/macros';
import { EditableField, MealType, NutritionData } from '../types';
import { MACRO_FIELDS, MEAL_TYPES } from '../utils/constants';

const round = (n: number) => Math.round(n).toLocaleString('en-US');

/** A number the user can correct, styled to sit where the read-only figure was. */
const ValueInput: React.FC<{
  value: number;
  label: string;
  onChange: (value: number) => void;
  className?: string;
}> = ({ value, label, onChange, className = '' }) => (
  <input
    type="number"
    min={0}
    inputMode="numeric"
    aria-label={label}
    value={Math.round(value)}
    onChange={(e) => onChange(e.target.valueAsNumber)}
    className={`w-full min-w-0 rounded-lg border border-line-strong bg-surface-2 px-2 py-1 font-display font-bold tabular-nums text-fg outline-none focus:border-brand [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none ${className}`}
  />
);

interface ReviewPanelProps {
  meal: NutritionData;
  mealType: MealType;
  onMealType: (meal: MealType) => void;
  isEditing: boolean;
  onToggleEdit: () => void;
  onField: (field: EditableField, value: number) => void;
  isEdited: boolean;
  onLog: () => void;
  onDiscard: () => void;
  isSaving: boolean;
  error?: string | null;
}

/** Step 2: what the AI read off the photo, corrected by the person who ate it. */
export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  meal,
  mealType,
  onMealType,
  isEditing,
  onToggleEdit,
  onField,
  isEdited,
  onLog,
  onDiscard,
  isSaving,
  error,
}) => {
  const confidencePct = Math.round((meal.aiConfidence ?? 0) * 100);
  const mealLabel = MEAL_TYPES.find((m) => m.key === mealType)?.label ?? 'meal';

  return (
    // Phones: one card lifted over the photo. From md up it is the side panel.
    <div className="custom-scrollbar relative z-10 flex shrink-0 flex-col gap-3 rounded-3xl border border-line bg-surface-1 p-4 max-md:-mt-7 short:gap-2 short:p-3 md:z-0 md:h-full md:min-h-0 md:gap-4 md:overflow-y-auto md:p-6">
      {/* Identity + confidence */}
      <div className="flex shrink-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold leading-tight tracking-[-0.02em] text-fg short:text-lg md:text-2xl">
            {meal.foodName || 'Your meal'}
          </h2>
          {meal.quantity && (
            <p className="mt-1 truncate text-[13px] text-muted short:hidden">{meal.quantity}</p>
          )}
        </div>
        <div className="shrink-0 text-center">
          <CalorieRing value={confidencePct} max={100} size={60} stroke={6}>
            <span className="font-display text-sm font-bold leading-none text-fg">
              {confidencePct}%
            </span>
          </CalorieRing>
          <p className="mt-1 text-[11px] text-muted short:hidden">Confidence</p>
        </div>
      </div>

      {/* Calories */}
      <div className="shrink-0 border-t border-line pt-3 short:pt-2">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Calories</p>
            {isEditing ? (
              <ValueInput
                value={meal.calories}
                label="Calories"
                onChange={(v) => onField('calories', v)}
                className="mt-1 max-w-[9rem] text-2xl"
              />
            ) : (
              <p className="mt-0.5 flex items-baseline gap-1">
                <span className="font-display text-[40px] font-bold leading-none tracking-[-0.03em] text-fg short:text-[32px] md:text-[44px]">
                  {round(meal.calories)}
                </span>
                <span className="text-sm font-semibold text-muted">kcal</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onToggleEdit}
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-1 py-1 text-[13px] font-bold text-brand-ink transition-colors hover:text-brand"
          >
            {isEditing ? (
              <>
                <CheckIcon className="h-4 w-4" />
                Done
              </>
            ) : (
              <>
                <PencilSquareIcon className="h-4 w-4" />
                Edit values
              </>
            )}
          </button>
        </div>
      </div>

      {/* Macros */}
      <div className="grid shrink-0 grid-cols-3 gap-2">
        {MACRO_FIELDS.map((macro) => {
          const grams = meal[macro.field];
          const share = meal.calories > 0 ? (grams * macro.kcalPerG) / meal.calories : 0;
          return (
            <div
              key={macro.field}
              className="min-w-0 rounded-2xl border border-line bg-surface-2 p-2.5 short:p-2"
            >
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-fg-2">
                <span className={`h-2 w-2 shrink-0 rounded-[3px] ${macro.bar}`} />
                {macro.label}
              </p>
              {isEditing ? (
                <ValueInput
                  value={grams}
                  label={`${macro.label} in grams`}
                  onChange={(v) => onField(macro.field, v)}
                  className="mt-1.5 text-base"
                />
              ) : (
                <p className="mt-1 font-display text-[22px] font-bold leading-none tracking-[-0.02em] text-fg short:text-lg">
                  {round(grams)}
                  <span className="ml-0.5 text-xs font-semibold text-muted">g</span>
                </p>
              )}
              <span className="mt-2 block h-1 overflow-hidden rounded-full bg-surface-3 short:hidden">
                <span
                  className={`block h-full rounded-full ${macro.bar}`}
                  style={{ width: `${Math.min(share * 100, 100)}%` }}
                />
              </span>
              <p className="mt-1.5 text-[11px] text-muted short:hidden">
                {Math.round(share * 100)}% of kcal
              </p>
            </div>
          );
        })}
      </div>

      {/* Meal type */}
      <div className="shrink-0">
        <p className="text-[13px] font-bold text-fg short:sr-only">Meal type</p>
        <div
          role="radiogroup"
          aria-label="Meal type"
          className="mt-1.5 grid grid-cols-4 gap-1 rounded-xl border border-line bg-surface-2 p-1 short:mt-0"
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
                  active
                    ? 'bg-surface-1 text-fg ring-1 ring-line-strong'
                    : 'text-muted hover:text-fg'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop has the room to explain the estimate; phones open it from the photo. */}
      {meal.analysisNotes && !isEdited && (
        <div className="hidden shrink-0 border-t border-line pt-4 md:block">
          <p className="text-[13px] font-bold text-fg">How we got there</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-fg-2">{meal.analysisNotes}</p>
        </div>
      )}

      {error && (
        <p className="shrink-0 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-[13px] font-semibold text-danger">
          {error}
        </p>
      )}

      <div className="grid shrink-0 grid-cols-[auto_1fr] gap-2 md:mt-auto md:gap-3 md:pt-4">
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
    </div>
  );
};
