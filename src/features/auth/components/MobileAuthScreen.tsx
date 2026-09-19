'use client';

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Logo } from '@/components/brand/Logo';

interface MobileAuthScreenProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the screen. */
  label: string;
  children: ReactNode;
}

/** Same spring as the app's bottom sheet: quick to settle, no wobble. */
const SPRING = { type: 'spring' as const, damping: 34, stiffness: 380, mass: 0.9 };

/**
 * Phones: sign in / sign up as a full-screen view that slides up over the
 * landing page, like a native modal — instead of a card halfway down the page.
 */
export function MobileAuthScreen({ open, onClose, label, children }: MobileAuthScreenProps) {
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="auth-screen"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          initial={{ y: '100%' }}
          animate={{ y: 0, transition: SPRING }}
          exit={{ y: '100%', transition: { type: 'tween', duration: 0.24, ease: [0.4, 0, 1, 1] } }}
          className="fixed inset-0 z-[120] flex flex-col bg-canvas font-ui text-fg"
        >
          <header className="shrink-0 border-b border-line pt-[env(safe-area-inset-top)]">
            <div className="relative flex h-14 items-center justify-center px-2">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute left-2 flex h-11 w-11 items-center justify-center rounded-xl text-fg-2 transition-colors hover:text-fg active:scale-95 active:bg-surface-2"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <Logo />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-7">
            <div className="mx-auto w-full max-w-[440px]">{children}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
