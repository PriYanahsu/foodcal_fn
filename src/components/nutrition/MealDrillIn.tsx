'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/** Slide between a list and one meal, like a native push. */
const SLIDE = {
  initial: (dir: number) => ({ opacity: 0, x: dir * 24 }),
  animate: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -24 }),
};

interface MealDrillInProps {
  /** Show `detail` instead of `children`. */
  showDetail: boolean;
  /** Changes whenever a different list or meal is shown — restarts the slide and scroll. */
  viewKey: string;
  detail: ReactNode;
  children: ReactNode;
}

/**
 * List ↔ meal navigation inside one surface (side panel, card or bottom sheet):
 * the meal slides in over the list, and each new view starts scrolled to the top.
 */
export function MealDrillIn({ showDetail, viewKey, detail, children }: MealDrillInProps) {
  const direction = showDetail ? 1 : -1;
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let el = anchorRef.current?.parentElement;
    while (el && !/(auto|scroll)/.test(getComputedStyle(el).overflowY)) el = el.parentElement;
    el?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [viewKey]);

  return (
    <>
      <span ref={anchorRef} aria-hidden="true" />
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={viewKey}
          custom={direction}
          variants={SLIDE}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {showDetail ? detail : children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
