import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { SCAN_STEPS } from '../utils/constants';

/**
 * Photo → Review → Log. Phones get a single compact pill (there is no room for
 * three labels next to the page title); tablets and up get the full trail.
 */
export const ScanStepper: React.FC<{ current: number }> = ({ current }) => (
  <>
    <p className="flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface-1 py-1.5 pl-1.5 pr-3 text-xs font-bold text-fg md:hidden">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[11px] text-on-brand">
        {current + 1}
      </span>
      {SCAN_STEPS[current]}
      <span className="font-semibold text-muted">of {SCAN_STEPS.length}</span>
    </p>

    <ol aria-label="Scan progress" className="hidden shrink-0 items-center md:flex">
      {SCAN_STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-2">
            {i > 0 && <span className={`mx-3 h-px w-7 ${done ? 'bg-brand/50' : 'bg-line'}`} />}
            <span
              aria-hidden="true"
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                done
                  ? 'bg-brand/15 text-brand-ink'
                  : active
                    ? 'bg-brand text-on-brand'
                    : 'border border-line text-muted'
              }`}
            >
              {done ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span
              aria-current={active ? 'step' : undefined}
              className={`text-[13px] font-semibold ${active ? 'text-fg' : 'text-muted'}`}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  </>
);
