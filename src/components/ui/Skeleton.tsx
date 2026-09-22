import React from 'react';

/**
 * Placeholder blocks shaped like the content that is on its way. Size them to
 * match the real element (same height, radius and rough width) so nothing
 * jumps when the data lands. The shimmer lives in globals.css (`.fc-skeleton`)
 * and follows the theme and reduced-motion settings on its own.
 */
export function Skeleton({ className = '' }: { className?: string }) {
  // Default corners only when the caller didn't pick their own — two rounded-*
  // classes would be resolved by stylesheet order, not by which one was passed.
  const corners = /(^|\s)rounded(-|\s|$)/.test(className) ? '' : 'rounded-lg';
  return <span aria-hidden="true" className={`fc-skeleton ${corners} ${className}`} />;
}

/** Stacked text lines; the last one is shorter, the way a paragraph ends. */
export function SkeletonText({
  lines = 2,
  className = '',
  lineClassName = 'h-3',
}: {
  lines?: number;
  className?: string;
  lineClassName?: string;
}) {
  return (
    <span aria-hidden="true" className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={`${lineClassName} ${i === lines - 1 && lines > 1 ? 'w-3/5' : 'w-full'}`}
        />
      ))}
    </span>
  );
}

/** The app's standard card shell, for skeletons of whole cards. */
export function SkeletonCard({
  className = '',
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-3xl border border-line bg-surface-1 p-5 ${className}`}
    >
      {children}
    </div>
  );
}
