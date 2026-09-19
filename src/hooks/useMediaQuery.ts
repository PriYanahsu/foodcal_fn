'use client';

import { useSyncExternalStore } from 'react';

/**
 * Live `matchMedia` result. Always `false` on the server and during hydration,
 * so markup matches; it updates right after on the client.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** Phones: below Tailwind's `md` breakpoint. */
export const PHONE_QUERY = '(max-width: 767px)';
