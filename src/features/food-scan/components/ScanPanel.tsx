import React from 'react';

/**
 * The column beside the photo. On phones it reads as a stack of small cards so
 * each block stays legible at a glance; from `md` up the cards dissolve into
 * one panel with hairline dividers.
 */
export const ScanPanel: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = '',
  children,
}) => (
  <div
    className={`custom-scrollbar flex shrink-0 flex-col gap-2.5 short:gap-2 md:h-full md:min-h-0 md:gap-0 md:overflow-y-auto md:rounded-3xl md:border md:border-line md:bg-surface-1 md:p-6 ${className}`}
  >
    {children}
  </div>
);

export const PanelSection: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = '',
  children,
}) => (
  <section
    className={`rounded-2xl border border-line bg-surface-1 p-3 short:p-2.5 md:rounded-none md:border-0 md:border-t md:border-line md:bg-transparent md:p-0 md:pt-5 md:first:border-t-0 md:first:pt-0 ${className}`}
  >
    {children}
  </section>
);

/** Small bold heading used at the top of a panel section. */
export const PanelLabel: React.FC<{
  className?: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ className = '', hint, children }) => (
  <p className={`text-sm font-bold text-fg ${className}`}>
    {children}
    {hint && <span className="ml-1.5 font-semibold text-muted">{hint}</span>}
  </p>
);
