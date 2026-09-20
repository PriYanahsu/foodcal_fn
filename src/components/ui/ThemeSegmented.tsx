'use client';

import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTheme, type Theme } from '@/features/theme/context/ThemeContext';

const OPTIONS: { value: Theme; label: string; icon: typeof SunIcon }[] = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
];

/** Segmented light/dark switch — used by the profile, the plan tiles and settings. */
export function ThemeSegmented({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex rounded-xl border border-line bg-surface-2 p-1">
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          aria-pressed={theme === value}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg font-bold transition-colors ${
            compact ? 'px-2 py-1.5 text-caption' : 'px-3 py-2 text-sm'
          } ${theme === value ? 'bg-surface-1 text-fg shadow-sm' : 'text-muted hover:text-fg'}`}
        >
          <Icon className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
          {label}
        </button>
      ))}
    </div>
  );
}
