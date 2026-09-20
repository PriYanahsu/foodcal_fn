import { FitnessDetails } from '../type';

const TARGETS = [
  { key: 'dailyCalorieTarget', label: 'Calories', unit: 'kcal', tone: 'text-brand-ink' },
  { key: 'dailyProteinTargetG', label: 'Protein', unit: 'g', tone: 'text-protein' },
  { key: 'dailyCarbsTargetG', label: 'Carbs', unit: 'g', tone: 'text-carbs' },
  { key: 'dailyFatTargetG', label: 'Fat', unit: 'g', tone: 'text-fat' },
] as const;

/**
 * The AI plan's daily targets — read-only everywhere, only Consult changes them.
 * Built from spans so it can also sit inside a tappable tile button.
 */
export default function PlanTargets({ fitness }: { fitness: FitnessDetails }) {
  return (
    <span className="grid grid-cols-4 divide-x divide-line rounded-2xl border border-line bg-surface-2 py-2">
      {TARGETS.map(({ key, label, unit, tone }) => {
        const value = fitness[key];
        return (
          <span key={key} className="flex min-w-0 flex-col items-center gap-0.5 px-1 text-center">
            <span
              className={`font-display text-[18px] font-bold leading-tight tabular-nums ${
                value ? tone : 'text-muted'
              }`}
            >
              {value ? value.toLocaleString('en-US') : '—'}
            </span>
            <span className="w-full truncate text-caption font-medium text-muted">
              {value ? `${label} · ${unit}` : label}
            </span>
          </span>
        );
      })}
    </span>
  );
}
