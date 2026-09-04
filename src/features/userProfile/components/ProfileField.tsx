import { ProfileFieldProps } from '../type';

function ProfileField({ label, value, hint, className = '' }: ProfileFieldProps) {
  return (
    <div
      className={`rounded-xl bg-[var(--input-bg)]/50 border border-[var(--card-border)] px-2.5 py-2 sm:px-4 sm:py-3 min-w-0 ${className}`}
    >
      <p className="text-[9px] sm:text-xs uppercase tracking-wider text-[var(--text-muted)] mb-0.5 sm:mb-1">
        {label}
      </p>
      <p className="text-xs sm:text-base font-medium text-[var(--foreground)] break-words leading-snug">
        {value || '—'}
      </p>
      {hint && (
        <p className="text-[9px] sm:text-xs text-[var(--text-muted)] mt-0.5 sm:mt-1">{hint}</p>
      )}
    </div>
  );
}

export default ProfileField;
