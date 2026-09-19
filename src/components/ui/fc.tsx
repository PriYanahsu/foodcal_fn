'use client';

import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/features/theme/context/ThemeContext';

/**
 * FoodCal v2 primitives (redesign). One primary action per view; everything
 * else is secondary or ghost — v1 styled every button as filled green.
 */
type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-60';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-on-brand shadow-[0_6px_20px_-8px_rgb(118_185_0/0.6)] hover:bg-brand-hover',
  secondary: 'border border-line-strong bg-surface-2 text-fg hover:bg-surface-3',
  ghost: 'text-fg-2 hover:bg-surface-2 hover:text-fg',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'h-10 rounded-xl px-4 text-sm',
  md: 'h-12 rounded-xl px-5 text-base',
  lg: 'h-14 rounded-2xl px-6 text-[17px]',
};

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra = '') {
  return `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${extra}`;
}

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block animate-spin rounded-full border-[2.5px] border-current border-r-transparent ${className}`}
    />
  );
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface-2 text-fg-2 transition-colors hover:text-fg ${className}`}
    >
      {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  );
}
