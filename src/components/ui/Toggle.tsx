'use client';

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Accessible name — the visible text next to the switch lives in the parent. */
  label: string;
  disabled?: boolean;
  busy?: boolean;
}

export function Toggle({ checked, onChange, label, disabled = false, busy = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled || busy}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 ${
        checked ? 'border-brand bg-brand' : 'border-line-strong bg-surface-3'
      }`}
    >
      <span
        className={`absolute top-0.5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        } ${busy ? 'animate-pulse' : ''}`}
        style={{ height: 18, width: 18 }}
      />
    </button>
  );
}
