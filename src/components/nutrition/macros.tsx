import type { ReactNode } from 'react';

/**
 * The single macro colour mapping for the whole app (v1 used four different
 * ones). Class names are literal so Tailwind can see them.
 */
export const MACRO_STYLES = {
  protein: { label: 'Protein', dot: 'bg-protein', text: 'text-protein' },
  carbs: { label: 'Carbs', dot: 'bg-carbs', text: 'text-carbs' },
  fat: { label: 'Fat', dot: 'bg-fat', text: 'text-fat' },
} as const;

export type MacroKey = keyof typeof MACRO_STYLES;

interface CalorieRingProps {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}

export function CalorieRing({ value, max, size = 120, stroke = 12, children }: CalorieRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  // Past the target the ring fills completely and turns amber.
  const over = max > 0 && value > max;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-surface-3"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          className={`transition-[stroke-dashoffset] duration-700 ${over ? 'stroke-warn' : 'stroke-brand'}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}

interface MacroBarProps {
  macro: MacroKey;
  value: number;
  /** No target (e.g. no plan yet): shows the amount with an empty track. */
  max: number | null;
  unit?: string;
  size?: 'sm' | 'md';
}

export function MacroBar({ macro, value, max, unit = '', size = 'sm' }: MacroBarProps) {
  const style = MACRO_STYLES[macro];
  const pct = max ? Math.min((value / max) * 100, 100) : 0;

  if (size === 'md') {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="inline-flex items-center gap-2 font-semibold text-fg">
            <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
            {style.label}
          </span>
          <span className="tabular-nums text-muted">
            <span className="font-bold text-fg">
              {value}
              {unit && ` ${unit}`}
            </span>
            {max ? ` / ${max}${unit ? ` ${unit}` : ''}` : ''}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-3">
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${style.dot}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="inline-flex items-center gap-1.5 font-bold text-fg-2">
          <span className={`h-2 w-2 rounded-[2px] ${style.dot}`} />
          {style.label}
        </span>
        <span className="tabular-nums text-muted">
          {value}
          {max ? ` / ${max}` : ''}
          {unit && ` ${unit}`}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div className={`h-full rounded-full ${style.dot}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
