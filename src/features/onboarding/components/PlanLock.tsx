'use client';

import type { ReactNode } from 'react';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { usePlanGate } from '../context/PlanGateContext';

/**
 * Locks a logging control until there's a plan. The control stays visible (so people
 * can see what the plan unlocks) but is greyed out and `inert`: it can't be clicked,
 * focused or typed into. A tap anywhere on it explains why and links to plan setup.
 */
export function PlanLock({
  label,
  compact = false,
  className = '',
  children,
}: {
  /** What the control does, for screen readers: "Add a glass of water". */
  label: string;
  /** Small spaces (a tile's button): the chip just says "Locked". */
  compact?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const { canLog, showPlanWarning } = usePlanGate();
  if (canLog) return <>{children}</>;

  return (
    <div className={`relative ${className}`}>
      <div
        inert
        aria-hidden="true"
        className="pointer-events-none select-none opacity-35 grayscale"
      >
        {children}
      </div>
      <button
        type="button"
        onClick={showPlanWarning}
        aria-label={`${label}: set up your plan to unlock`}
        className="absolute inset-0 flex items-center justify-center rounded-2xl transition-colors hover:bg-surface-2/40"
      >
        <span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full border border-line-strong bg-surface-1 px-3 py-1.5 text-xs font-bold text-fg shadow-sm">
          <LockClosedIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
          {compact ? 'Locked' : 'Set up your plan to unlock'}
        </span>
      </button>
    </div>
  );
}
