'use client';

import { Card } from '@/components/ui/Card';
import { ScaleIcon, SparklesIcon } from '@heroicons/react/16/solid';
import { Input } from '@/components/ui/Input';
import ProfileField from './ProfileField';
import { Button } from '@/components/ui/Button';
import ChoiceChips from './ChoiceChips';
import { ACTIVITY_HINTS, ACTIVITY_LEVELS, GOALS, SELECT_CLASS } from '../utils/Constants';
import { FitnessDetailFormProps } from '../type';
import { parseOptionalNumber } from '../utils/parseOptionalNumber';
import { deriveGoal } from '../utils/deriveGoal';
import { formatDate } from '../utils/formatDate';

export default function FitnessDetailForm({
  fitness,
  isEditing,
  saving,
  canConsult,
  showConsultCta,
  onChange,
  onStartEdit,
  onCancel,
  onSave,
  onConsult,
}: FitnessDetailFormProps) {
  const goal = deriveGoal(fitness.weight, fitness.targetWeightKg);

  return (
    <Card className="p-4 sm:p-6 md:p-8 bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl">
      <div className="flex items-start justify-between gap-3 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-xl font-bold flex items-center gap-2">
          <span className="w-1 h-5 sm:h-6 bg-[var(--primary)] rounded-full" />
          <ScaleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
          Fitness Details
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          {isEditing ? (
            <>
              <Button size="sm" variant="outline" onClick={onCancel} disabled={saving}>
                Cancel
              </Button>
              <Button size="sm" onClick={onSave} disabled={saving} isLoading={saving}>
                {saving ? 'Updating...' : 'Update'}
              </Button>
            </>
          ) : (
            <button
              type="button"
              onClick={onStartEdit}
              className="text-sm text-[var(--primary)] hover:underline"
            >
              Edit
            </button>
          )}
          {canConsult && !isEditing && (
            <button
              type="button"
              onClick={onConsult}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg bg-[var(--primary)] text-black shadow-[0_0_14px_rgba(0,255,136,0.3)] hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <SparklesIcon className="w-3.5 h-3.5" />
              Consult
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3 sm:space-y-5">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <Input
              label="Age"
              type="number"
              min={1}
              max={120}
              value={fitness.age || ''}
              onChange={(e) => onChange({ age: parseOptionalNumber(e.target.value) || 0 })}
              placeholder="e.g. 28"
            />
            <Input
              label="Height (cm)"
              type="number"
              min={50}
              max={300}
              value={fitness.height || ''}
              onChange={(e) => onChange({ height: parseOptionalNumber(e.target.value) || 0 })}
              placeholder="e.g. 175"
            />
            <Input
              label="Weight (kg)"
              type="number"
              min={20}
              max={400}
              step="0.1"
              value={fitness.weight || ''}
              onChange={(e) => {
                const w = parseOptionalNumber(e.target.value);
                onChange({ weight: w || 0 });
              }}
              placeholder="e.g. 70"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1.5 sm:mb-2">
              Activity Level
            </label>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              {ACTIVITY_LEVELS.map((level) => {
                const selected = fitness.activityLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onChange({ activityLevel: level })}
                    className={`text-left px-2.5 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border sm:border-2 transition-all ${
                      selected
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                        : 'border-[var(--card-border)] hover:border-white/30'
                    }`}
                  >
                    <p
                      className={`text-[11px] sm:text-sm font-semibold leading-tight ${
                        selected ? 'text-white' : 'text-[var(--foreground)]'
                      }`}
                    >
                      {level}
                    </p>
                    <p className="text-[9px] sm:text-xs text-[var(--text-muted)] mt-0.5 leading-tight">
                      {ACTIVITY_HINTS[level]}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <ProfileField label="Age" value={fitness.age ? `${fitness.age} years` : ''} />
          <ProfileField label="Height" value={fitness.height ? `${fitness.height} cm` : ''} />
          <ProfileField label="Weight" value={fitness.weight ? `${fitness.weight} kg` : ''} />
          <ProfileField
            label="Activity Level"
            value={fitness.activityLevel}
            hint={
              fitness.activityLevel
                ? ACTIVITY_HINTS[fitness.activityLevel]
                : 'Helps calculate calorie needs'
            }
          />
        </div>
      )}

      {isEditing ? (
        <div className="space-y-3 sm:space-y-5 mt-3 sm:mt-5">
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)]">
                Objective
              </label>
              {goal && (
                <span className="text-[9px] sm:text-[10px] text-[var(--primary)] font-semibold">
                  Auto-set from weight vs target
                </span>
              )}
            </div>
            <ChoiceChips
              options={GOALS}
              value={goal ?? ''}
              onChange={() => undefined}
              accent="accent"
            />
            {goal && (
              <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-1 sm:mt-1.5">
                Current <span className="text-white font-medium">{fitness.weight} kg</span> → Target{' '}
                <span className="text-white font-medium">{fitness.targetWeightKg} kg</span> — goal
                auto-corrected to{' '}
                <span className="text-[var(--primary)] font-semibold">{goal}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <Input
              label="Target Weight (kg)"
              type="number"
              min={20}
              max={400}
              step="0.1"
              value={fitness.targetWeightKg || ''}
              onChange={(e) => {
                const next = parseOptionalNumber(e.target.value);
                onChange({ targetWeightKg: next || 0 });
              }}
              placeholder="e.g. 65"
            />
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-0.5 sm:mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={fitness.targetDate}
                onChange={(e) => onChange({ targetDate: e.target.value })}
                className={SELECT_CLASS}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-2 sm:mt-4">
          <ProfileField label="Objective" value={goal ?? ''} className="col-span-2 sm:col-span-1" />
          <ProfileField
            label="Target Weight"
            value={fitness.targetWeightKg ? `${fitness.targetWeightKg} kg` : ''}
          />
          <ProfileField label="Target Date" value={formatDate(fitness.targetDate)} />
        </div>
      )}

      {showConsultCta && !isEditing && canConsult && (
        <div className="mt-5 p-3.5 rounded-xl border border-[var(--primary)]/25 bg-[var(--primary)]/8 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Goals saved</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Run AI Consult here — no need to open Fitness Hub.
            </p>
          </div>
          <Button
            onClick={onConsult}
            className="w-full sm:w-auto shrink-0 shadow-[0_0_16px_rgba(118,185,0,0.3)]"
          >
            <span className="inline-flex items-center gap-2">
              <SparklesIcon className="w-4 h-4" />
              Consult AI Plan
            </span>
          </Button>
        </div>
      )}
    </Card>
  );
}
