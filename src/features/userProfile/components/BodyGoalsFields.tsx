'use client';

import { ACTIVITY_HINTS, ACTIVITY_LEVELS, GENDERS } from '../utils/Constants';
import { parseOptionalNumber } from '../utils/helper';
import { DateField } from '@/components/ui/DateField';
import { shiftDate, toLocalDate } from '@/features/Nutrition/utils/toLocalDate';

/** A goal date has to be in the future. */
const tomorrow = () => shiftDate(toLocalDate(), 1);
import { BodyGoalsFieldsProps } from '../type';

const CONTROL =
  'h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-base text-fg outline-none transition-colors placeholder:text-muted focus:border-brand short:h-10';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-caption font-semibold text-muted">{label}</span>
      {children}
    </label>
  );
}

/** The editable body + goal fields — shared by the desktop card and the phone sheet. */
export default function BodyGoalsFields({ fitness, goal, onChange }: BodyGoalsFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Field label="Gender">
        <select
          value={fitness.gender}
          onChange={(e) => onChange({ gender: e.target.value })}
          className={CONTROL}
        >
          <option value="">Select</option>
          {GENDERS.map((gender) => (
            <option key={gender} value={gender}>
              {gender}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Age">
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={120}
          value={fitness.age || ''}
          onChange={(e) => onChange({ age: parseOptionalNumber(e.target.value) || 0 })}
          placeholder="28"
          className={CONTROL}
        />
      </Field>

      <Field label="Height (cm)">
        <input
          type="number"
          inputMode="numeric"
          min={50}
          max={300}
          value={fitness.height || ''}
          onChange={(e) => onChange({ height: parseOptionalNumber(e.target.value) || 0 })}
          placeholder="175"
          className={CONTROL}
        />
      </Field>

      <Field label="Activity level">
        <select
          value={fitness.activityLevel}
          onChange={(e) => onChange({ activityLevel: e.target.value })}
          className={CONTROL}
        >
          <option value="">Select</option>
          {ACTIVITY_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Current weight (kg)">
        <input
          type="number"
          inputMode="decimal"
          min={20}
          max={400}
          step="0.1"
          value={fitness.weight || ''}
          onChange={(e) => onChange({ weight: parseOptionalNumber(e.target.value) || 0 })}
          placeholder="72"
          className={CONTROL}
        />
      </Field>

      <Field label="Target weight (kg)">
        <input
          type="number"
          inputMode="decimal"
          min={20}
          max={400}
          step="0.1"
          value={fitness.targetWeightKg || ''}
          onChange={(e) => onChange({ targetWeightKg: parseOptionalNumber(e.target.value) || 0 })}
          placeholder="68"
          className={CONTROL}
        />
      </Field>

      <Field label="Target date">
        <DateField
          value={fitness.targetDate?.slice(0, 10) || ''}
          onChange={(date) => onChange({ targetDate: date })}
          min={tomorrow()}
          label="Target date"
          className={CONTROL}
        />
      </Field>

      <Field label="Goal">
        <span
          title="Set automatically from current weight vs target weight"
          className="flex h-11 items-center rounded-xl border border-dashed border-line-strong px-3 text-base text-muted short:h-10"
        >
          <span className={`truncate ${goal ? 'text-fg' : ''}`}>{goal ?? 'Set weights'}</span>
        </span>
      </Field>

      {fitness.activityLevel && (
        <p className="col-span-2 -mt-1 text-caption text-muted md:col-span-4">
          {ACTIVITY_HINTS[fitness.activityLevel]}
        </p>
      )}
    </div>
  );
}
