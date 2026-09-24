'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  BeakerIcon,
  CameraIcon,
  LockClosedIcon,
  ScaleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { buttonClass } from '@/components/ui/fc';
import { ROUTES } from '@/constants/routes';

/** What the plan unlocks, shown on the full-screen gate. */
const UNLOCKS = [
  { icon: CameraIcon, title: 'Meal scans', detail: 'Measured against your daily targets' },
  { icon: BeakerIcon, title: 'Water', detail: 'Glasses toward your daily goal' },
  { icon: ScaleIcon, title: 'Weigh-ins', detail: 'Progress toward your target weight' },
  { icon: UserCircleIcon, title: 'Your profile', detail: 'Filled in from your answers' },
];

const RISE = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

/**
 * Logging is locked until there's a plan: a meal, a glass of water or a weigh-in only
 * means something against a target. `inline` sits inside a card in place of its controls;
 * `page` takes over a whole screen (the scan page).
 */
export function PlanRequired({
  what,
  variant = 'inline',
}: {
  /** Finishes "Set up your plan to log …", e.g. "water" or "your weight". */
  what: string;
  variant?: 'inline' | 'page';
}) {
  if (variant === 'inline') {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-line-strong bg-surface-2 p-4 sm:flex-row sm:items-center">
        <span className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-3 text-muted">
            <LockClosedIcon className="h-4.5 w-4.5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-fg">Set up your plan to log {what}</span>
            <span className="block text-xs text-muted">
              About 2 minutes, then everything unlocks
            </span>
          </span>
        </span>
        <Link href={ROUTES.PLAN_SETUP} className={buttonClass('primary', 'sm', 'shrink-0')}>
          Set up my plan
        </Link>
      </div>
    );
  }

  return (
    // Same one-screen sizing as the scanner it replaces (see FoodScanPage).
    <div className="mx-auto flex h-[calc(100dvh-4rem-68px-2.25rem-env(safe-area-inset-bottom))] min-h-[440px] w-full flex-col bg-canvas px-4 py-3 font-ui text-fg md:h-dvh md:items-center md:justify-center md:px-8 md:py-8">
      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.07 }}
        className="flex min-h-0 w-full flex-1 flex-col gap-5 short:gap-3 md:max-w-lg md:flex-none md:rounded-3xl md:border md:border-line md:bg-surface-1 md:p-8 md:shadow-[var(--fc-shadow-pop)]"
      >
        <motion.header variants={RISE} className="flex shrink-0 flex-col items-start gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-on-brand short:h-10 short:w-10">
            <LockClosedIcon className="h-6 w-6 short:h-5 short:w-5" />
          </span>
          <div>
            <h1 className="font-display text-[24px] font-bold leading-tight tracking-[-0.02em] text-fg short:text-[21px] md:text-[28px]">
              First, set up your plan
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-fg-2 md:text-[15px]">
              Logging {what} starts once you have daily targets to log against. Answer a few
              questions (about 2 minutes) and we&apos;ll build your plan and fill in your profile.
            </p>
          </div>
        </motion.header>

        <motion.ul
          variants={RISE}
          aria-label="What your plan unlocks"
          className="grid min-h-0 shrink-0 grid-cols-2 gap-2 md:gap-3"
        >
          {UNLOCKS.map(({ icon: Icon, title, detail }) => (
            <li
              key={title}
              className="flex flex-col gap-2 rounded-2xl border border-line bg-surface-1 p-3 short:gap-1.5 short:p-2.5 md:bg-surface-2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand-ink">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span>
                <span className="block text-sm font-bold leading-tight text-fg">{title}</span>
                <span className="mt-0.5 block text-xs leading-snug text-muted short:hidden">
                  {detail}
                </span>
              </span>
            </li>
          ))}
        </motion.ul>

        <motion.div variants={RISE} className="mt-auto flex shrink-0 flex-col gap-1 md:mt-2">
          <Link
            href={ROUTES.PLAN_SETUP}
            className={buttonClass('primary', 'lg', 'w-full short:h-12')}
          >
            Set up my plan <ArrowRightIcon className="h-5 w-5" />
          </Link>
          <Link href={ROUTES.HOME} className={buttonClass('ghost', 'md', 'w-full short:h-10')}>
            Back to dashboard
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
