'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the sheet. */
  label: string;
  children: ReactNode;
}

/** Native-feeling spring: quick to settle, no wobble. */
const SHEET_SPRING = { type: 'spring' as const, damping: 34, stiffness: 380, mass: 0.9 };

/**
 * Phone bottom sheet: slides up, closes on swipe down (from the handle), Esc,
 * the × or a tap outside, and locks page scroll while open. Rendered in a
 * portal so animated (transformed) ancestors can't break its fixed positioning.
 *
 * Content that is a card (`<section>` with its own border/background/padding)
 * is shown without that chrome, so the sheet reads as one surface.
 */
export function BottomSheet({ open, onClose, label, children }: BottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Only the handle starts a swipe, so scrolling the content never drags the sheet.
  const dragControls = useDragControls();

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      root.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-[2px]"
          />
          <motion.div
            key="sheet"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            initial={{ y: '100%' }}
            animate={{ y: 0, transition: SHEET_SPRING }}
            exit={{
              y: '100%',
              transition: { type: 'tween', duration: 0.22, ease: [0.4, 0, 1, 1] },
            }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 450) onClose();
            }}
            className="fixed inset-x-0 bottom-0 z-[110] flex max-h-[88dvh] flex-col rounded-t-[28px] border-t border-line-strong bg-surface-1 pb-[max(1rem,env(safe-area-inset-bottom))] font-ui text-fg shadow-[0_-24px_64px_rgba(0,0,0,0.5)] outline-none"
          >
            {/* Grabber row — swipe down from here to close. */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="relative flex h-11 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
            >
              <span aria-hidden="true" className="h-1.5 w-10 rounded-full bg-line-strong" />
              <button
                type="button"
                onClick={onClose}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label="Close"
                className="absolute right-2 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-fg-2 transition-colors hover:text-fg active:scale-95"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-2 [&>section]:rounded-none [&>section]:border-0 [&>section]:bg-none [&>section]:bg-transparent [&>section]:p-0 [&>section]:opacity-100 [&>section]:shadow-none">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
