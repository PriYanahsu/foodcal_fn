import { ChoiceChipsProps } from '../type';

export default function ChoiceChips({
  options,
  value,
  onChange,
  accent = 'primary',
}: ChoiceChipsProps) {
  const activeBorder =
    accent === 'accent'
      ? 'border-[var(--accent)] bg-[var(--accent)]/10'
      : 'border-[var(--primary)] bg-[var(--primary)]/10';

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {options.map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border sm:border-2 text-[11px] sm:text-sm transition-all ${
              selected
                ? `${activeBorder} text-white`
                : 'border-[var(--card-border)] text-[var(--text-muted)] hover:border-white/30 hover:text-white'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
