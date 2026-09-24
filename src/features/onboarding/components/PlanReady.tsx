'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BeakerIcon,
  CameraIcon,
  CheckIcon,
  ChevronRightIcon,
  ScaleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { buttonClass } from '@/components/ui/fc';
import { CalorieRing, MacroBar } from '@/components/nutrition/macros';
import { ROUTES } from '@/constants/routes';
import type { FitnessDetails } from '@/features/userProfile';

const HABITS = [
  { icon: CameraIcon, title: 'Snap each meal', detail: 'Camera button, bottom of the screen' },
  { icon: BeakerIcon, title: 'Tap + for water', detail: 'One tap per glass' },
  { icon: ScaleIcon, title: 'Weigh in weekly', detail: 'Same day, same time' },
];

const RISE = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

const fmt = (n: number | null | undefined) => (n ? Math.round(n).toLocaleString('en-US') : '–');

/** Shown once the plan is saved: the targets, the daily habits, and the first action. */
export default function PlanReady({
  fitness,
  hasPhoto,
}: {
  fitness: FitnessDetails | null;
  /** The plan fills in every profile field except the photo. */
  hasPhoto: boolean;
}) {
  const calories = fitness?.dailyCalorieTarget ?? 0;
  const protein = fitness?.dailyProteinTargetG ?? 0;
  const carbs = fitness?.dailyCarbsTargetG ?? 0;
  const fats = fitness?.dailyFatTargetG ?? 0;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.08 }}
      className="mx-auto flex h-full min-h-0 w-full max-w-xl flex-1 flex-col gap-5 short:gap-3 md:h-auto md:flex-none md:gap-6"
    >
      <motion.header variants={RISE} className="flex shrink-0 items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-on-brand short:h-10 short:w-10">
          <CheckIcon className="h-6 w-6" strokeWidth={2.5} />
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-fg short:text-[22px] md:text-[32px]">
            Your plan is live
          </h1>
          <p className="truncate text-sm text-muted">
            {fitness?.objective ? `${fitness.objective} · ` : ''}these are your daily targets
          </p>
        </div>
      </motion.header>

      <motion.section
        variants={RISE}
        aria-label="Daily targets"
        className="flex shrink-0 items-center gap-5 rounded-3xl border border-line bg-surface-1 p-4 short:gap-4 short:p-3 md:p-6"
      >
        <CalorieRing value={calories} max={calories} size={104} stroke={11}>
          <span className="font-display text-[22px] font-bold leading-none text-fg">
            {fmt(calories)}
          </span>
          <span className="mt-0.5 text-xs text-muted">kcal / day</span>
        </CalorieRing>
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <MacroBar macro="protein" value={protein} max={protein} unit="g" />
          <MacroBar macro="carbs" value={carbs} max={carbs} unit="g" />
          <MacroBar macro="fat" value={fats} max={fats} unit="g" />
        </div>
      </motion.section>

      <motion.div variants={RISE} className="shrink-0">
        <Link
          href={ROUTES.PROFILE}
          className="flex items-center gap-3 rounded-2xl border border-line bg-surface-1 p-3 transition-colors hover:bg-surface-2 short:p-2.5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand-ink short:h-8 short:w-8">
            <UserCircleIcon className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold leading-tight text-fg">
              {hasPhoto ? 'Your profile is complete' : 'Your profile is filled in'}
            </span>
            <span className="block truncate text-xs text-muted">
              {hasPhoto
                ? 'Edit your details any time in Profile'
                : 'Add a photo in Profile to finish'}
            </span>
          </span>
          <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted" />
        </Link>
      </motion.div>

      <motion.div variants={RISE} className="flex shrink-0 flex-col gap-2">
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted">Every day</h2>
        <ul className="grid grid-cols-3 gap-2 md:gap-3">
          {HABITS.map(({ icon: Icon, title, detail }) => (
            <li
              key={title}
              className="flex flex-col items-start gap-2 rounded-2xl border border-line bg-surface-1 p-3 short:gap-1.5 short:p-2.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-3 text-fg-2 short:h-8 short:w-8">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold leading-tight text-fg">{title}</span>
                <span className="mt-0.5 block text-xs leading-snug text-muted max-md:hidden">
                  {detail}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        variants={RISE}
        className="mt-auto flex shrink-0 flex-col gap-1 md:mt-0 md:flex-row md:gap-3"
      >
        <Link
          href={ROUTES.SCAN}
          className={buttonClass('primary', 'lg', 'w-full short:h-12 md:flex-1')}
        >
          <CameraIcon className="h-5 w-5" /> Scan my first meal
        </Link>
        <Link
          href={ROUTES.HOME}
          className={buttonClass('ghost', 'md', 'w-full short:h-10 md:h-14 md:w-auto')}
        >
          Go to my dashboard
        </Link>
      </motion.div>
    </motion.div>
  );
}
