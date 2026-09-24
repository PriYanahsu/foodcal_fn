'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRightIcon,
  BeakerIcon,
  CameraIcon,
  LockClosedIcon,
  ScaleIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { buttonClass } from '@/components/ui/fc';
import { ROUTES } from '@/constants/routes';
import { PHONE_QUERY, useMediaQuery } from '@/hooks/useMediaQuery';

/** What the plan unlocks. */
const UNLOCKS = [
  { icon: UserCircleIcon, title: 'Your profile', detail: 'Age, height, weight, activity and goal' },
  { icon: CameraIcon, title: 'Meal scans', detail: 'Measured against your daily targets' },
  { icon: BeakerIcon, title: 'Water', detail: 'Glasses toward your daily goal' },
  { icon: ScaleIcon, title: 'Weigh-ins', detail: 'Progress toward your target weight' },
];

const WHY =
  'FoodCal measures every meal, glass of water and weigh-in against your own targets. Your plan works those out from a few questions (about 2 minutes) and saves your answers to your profile, so your fitness details are complete and everything switches on at once.';

const RISE = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

/**
 * The shared "plan first" explanation: why, what it unlocks, one action. There is no
 * skip: nothing can be logged until the plan exists.
 */
function PlanRequiredBody({
  title = 'First, set up your plan',
  size = 'md',
  titleId,
}: {
  title?: string;
  /** `lg` is the desktop dashboard's hero card. */
  size?: 'md' | 'lg';
  titleId?: string;
}) {
  const lg = size === 'lg';
  return (
    <motion.div
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.07 }}
      className={`flex min-h-0 flex-1 flex-col gap-5 short:gap-3 ${lg ? 'md:gap-7' : ''}`}
    >
      <motion.header variants={RISE} className="flex shrink-0 flex-col items-start gap-3">
        <span
          className={`flex items-center justify-center rounded-2xl bg-brand text-on-brand short:h-10 short:w-10 ${
            lg ? 'h-14 w-14' : 'h-12 w-12'
          }`}
        >
          <LockClosedIcon className={lg ? 'h-7 w-7' : 'h-6 w-6 short:h-5 short:w-5'} />
        </span>
        <div>
          <h2
            id={titleId}
            className={`font-display font-bold leading-tight tracking-[-0.02em] text-fg short:text-[21px] ${
              lg ? 'text-[28px] md:text-[34px]' : 'text-[24px] md:text-[28px]'
            }`}
          >
            {title}
          </h2>
          <p
            className={`mt-1.5 leading-relaxed text-fg-2 ${
              lg ? 'max-w-2xl text-[15px] md:text-base' : 'text-sm md:text-[15px]'
            }`}
          >
            {WHY}
          </p>
        </div>
      </motion.header>

      <motion.ul
        variants={RISE}
        aria-label="What your plan unlocks"
        className={`grid min-h-0 shrink-0 grid-cols-2 gap-2 md:gap-3 ${lg ? 'lg:grid-cols-4' : ''}`}
      >
        {UNLOCKS.map(({ icon: Icon, title: unlock, detail }) => (
          <li
            key={unlock}
            className="flex flex-col gap-2 rounded-2xl border border-line bg-surface-2 p-3 short:gap-1.5 short:p-2.5 md:p-4"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand-ink">
              <Icon className="h-4.5 w-4.5" />
            </span>
            <span>
              <span className="block text-sm font-bold leading-tight text-fg">{unlock}</span>
              <span className="mt-0.5 block text-xs leading-snug text-muted short:hidden">
                {detail}
              </span>
            </span>
          </li>
        ))}
      </motion.ul>

      <motion.div variants={RISE} className="mt-auto shrink-0 md:mt-0">
        <Link
          href={ROUTES.PLAN_SETUP}
          className={buttonClass('primary', 'lg', `w-full short:h-12 ${lg ? 'md:w-auto' : ''}`)}
        >
          Set up my plan <ArrowRightIcon className="h-5 w-5" />
        </Link>
      </motion.div>
    </motion.div>
  );
}

/**
 * Takes over a whole screen that can't work without a plan (scan, My plan). Single
 * controls elsewhere are locked in place with `PlanLock` instead.
 */
export function PlanRequired({
  what,
  title,
}: {
  /** Finishes "Set up your plan to log …", e.g. "water" or "your weight". */
  what: string;
  /** Replaces the default "Set up your plan to log …" heading. */
  title?: string;
}) {
  return (
    // Same one-screen sizing as the scanner it replaces (see FoodScanPage).
    <div className="mx-auto flex h-[calc(100dvh-4rem-68px-2.25rem-env(safe-area-inset-bottom))] min-h-[440px] w-full flex-col bg-canvas px-4 py-3 font-ui text-fg md:h-dvh md:items-center md:justify-center md:px-8 md:py-8">
      <div className="flex min-h-0 w-full flex-1 flex-col md:max-w-lg md:flex-none md:rounded-3xl md:border md:border-line md:bg-surface-1 md:p-8 md:shadow-[var(--fc-shadow-pop)]">
        <PlanRequiredBody title={title ?? `Set up your plan to log ${what}`} />
      </div>
    </div>
  );
}

/** Desktop dashboard without a plan: one big card in place of every tracking card. */
export function PlanRequiredHero() {
  return (
    <section
      aria-label="Set up your plan"
      className="rounded-3xl border border-brand/35 bg-linear-160 from-brand/15 to-surface-1 to-60% p-6 md:p-10"
    >
      <PlanRequiredBody title="Set up your plan to start using FoodCal" size="lg" />
    </section>
  );
}

/**
 * The "plan first" warning, opened when someone without a plan lands on the dashboard
 * or taps something locked (a date, a tile). Phones: bottom sheet. Larger: dialog.
 */
export function PlanRequiredDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const isPhone = useMediaQuery(PHONE_QUERY);

  useEffect(() => {
    if (!open || isPhone) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, isPhone, onClose]);

  if (isPhone) {
    return (
      <BottomSheet open={open} onClose={onClose} label="Set up your plan first">
        <div className="flex flex-col pb-2">
          <PlanRequiredBody />
        </div>
      </BottomSheet>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--fc-scrim)] p-4 backdrop-blur-sm"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-required-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl border border-line bg-surface-1 p-7 font-ui text-fg shadow-[var(--fc-shadow-pop)]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <PlanRequiredBody titleId="plan-required-title" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
