import React from 'react';
import { LogoMark } from '@/components/brand/Logo';

/**
 * Route-level loader (app/loading.tsx). Deliberately light: a thin brand bar
 * across the top, where people expect navigation progress, and the logo mark
 * breathing inside a ring in the content area. It sits on the page's own
 * canvas instead of blurring it, and fades in after a beat so fast
 * navigations never flash it.
 */
export const PageLoader = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fc-loader-delay flex min-h-[60vh] flex-1 items-center justify-center bg-canvas"
    >
      <span className="fixed inset-x-0 top-0 z-[200] h-0.5 overflow-hidden bg-brand/15">
        <span className="fc-progress-bar block h-full w-2/5 rounded-full bg-brand" />
      </span>

      <span className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-brand/15 border-t-brand [animation-duration:1.1s] motion-reduce:animate-none" />
        <LogoMark className="h-9 w-9 animate-[fc-skeleton-breathe_2s_ease-in-out_infinite]" />
      </span>
      <span className="sr-only">Loading…</span>
    </div>
  );
};
