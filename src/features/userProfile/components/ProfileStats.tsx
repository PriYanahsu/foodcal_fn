import { Card } from '@/components/ui/Card';
import { FitnessDetails } from '../type';

const GOAL_SHORT: Record<string, string> = {
  'Lose Weight': 'Lose',
  'Maintain Weight': 'Maintain',
  'Gain Muscle': 'Gain',
};

export default function ProfileStats({
  fitness,
  goal,
  isEditing,
  onEdit,
}: {
  fitness: FitnessDetails;
  goal: string | null;
  isEditing: boolean;
  onEdit: () => void;
}) {
  const items = [
    { label: 'Age', value: fitness.age, unit: 'yrs', wide: false },
    { label: 'Height', value: fitness.height, unit: 'cm', wide: false },
    { label: 'Weight', value: fitness.weight, unit: 'kg', wide: false },
    { label: 'Goal', value: goal, unit: '', wide: true },
  ];

  return (
    <div className="flex gap-1.5 sm:gap-3 mb-6 sm:mb-8">
      {items.map(({ label, value, unit, wide }) => {
        const hasValue = value !== null && value !== undefined && value !== '' && value !== 0;
        const shortGoal = typeof value === 'string' ? (GOAL_SHORT[value] ?? value) : value;

        return (
          <button
            key={label}
            type="button"
            onClick={() => !isEditing && onEdit()}
            className={`text-left min-w-0 ${wide ? 'flex-[1.4]' : 'flex-1'}`}
            title={String(hasValue ? value : 'Tap to edit')}
          >
            <Card className="px-1.5 py-2 sm:p-4 bg-[var(--card-bg)] border border-[var(--card-border)] text-center shadow-lg h-full hover:border-[var(--primary)]/40 transition-colors">
              <p className="text-[var(--text-muted)] text-[9px] sm:text-xs uppercase tracking-wider mb-0.5 sm:mb-1">
                {label}
              </p>
              <p
                className={`font-bold text-[var(--foreground)] leading-tight ${
                  wide ? 'text-[11px] sm:text-lg' : 'text-xs sm:text-xl truncate'
                }`}
              >
                {wide ? (
                  <>
                    <span className="sm:hidden">{shortGoal || '—'}</span>
                    <span className="hidden sm:inline">{hasValue ? value : '—'}</span>
                  </>
                ) : hasValue ? (
                  <>
                    {value}
                    {unit && (
                      <span className="text-[9px] sm:text-sm text-[var(--text-muted)] font-normal ml-0.5 sm:ml-1">
                        {unit}
                      </span>
                    )}
                  </>
                ) : (
                  '—'
                )}
              </p>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
