'use client';

import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { AuthView } from '../authView';

const HEADINGS: Partial<Record<AuthView, { title: string; subtitle: string }>> = {
  login: { title: 'Welcome back', subtitle: 'Good to see you again.' },
  signup: { title: 'Create your account', subtitle: 'Takes 30 seconds. Your plan comes next.' },
};

const EASE = [0.22, 1, 0.36, 1] as const;

interface AuthPanelProps {
  view: AuthView;
  onClose: () => void;
  /** `card`: the hero card (tablet/desktop). `screen`: inside the phone's full-screen view, which has its own close. */
  variant?: 'card' | 'screen';
  children: ReactNode;
}

/** The sign-in / sign-up card that takes the hero visual's place on the landing page. */
export function AuthPanel({ view, onClose, variant = 'card', children }: AuthPanelProps) {
  const heading = HEADINGS[view];
  const isCard = variant === 'card';

  return (
    <section
      aria-label={heading?.title ?? 'Account created'}
      className={
        isCard
          ? 'relative mx-auto w-full max-w-[440px] rounded-[28px] border border-line bg-surface-1 p-6 shadow-[var(--fc-shadow-pop)] sm:p-8'
          : 'relative w-full'
      }
    >
      {isCard && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}

      {/* Sign in ↔ sign up swap inside the card: heading and form slide together. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0, transition: { duration: 0.28, ease: EASE } }}
          exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
        >
          {heading && (
            <div className={`mb-7 flex flex-col gap-1.5 ${isCard ? 'pr-10' : ''}`}>
              <h2 className="font-display text-[28px] font-bold leading-tight tracking-[-0.02em] text-fg max-md:text-large-title">
                {heading.title}
              </h2>
              <p className="text-base text-muted max-md:text-subhead">{heading.subtitle}</p>
            </div>
          )}
          {children}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
