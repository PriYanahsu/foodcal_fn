'use client';

import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  CameraIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { buttonClass } from '@/components/ui/fc';
import { CalorieRing, MacroBar } from '@/components/nutrition/macros';

const STEPS = [
  {
    icon: SparklesIcon,
    title: 'Build your plan',
    detail: 'Answer a few questions and get daily calorie and macro targets.',
    badge: '2 min',
  },
  {
    icon: CameraIcon,
    title: 'Snap every meal',
    detail: 'Point the camera at your plate. We count the calories and macros.',
  },
  {
    icon: ArrowTrendingUpIcon,
    title: 'Track and adjust',
    detail: 'Watch your day fill up, log weigh-ins and follow your coach.',
  },
];

const RISE = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

/** Sample day shown beside the steps on large screens, so "targets" means something. */
function PreviewCard() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-5 rounded-3xl border border-line bg-surface-1 p-6 shadow-[var(--fc-shadow-pop)]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-fg">Your day, once the plan is set</span>
        <span className="rounded-full bg-brand/15 px-2 py-0.5 text-xs font-bold text-brand-ink">
          Sample
        </span>
      </div>
      <div className="flex items-center gap-5">
        <CalorieRing value={1240} max={2100} size={128} stroke={12}>
          <span className="font-display text-[26px] font-bold leading-none text-fg">860</span>
          <span className="mt-1 text-xs text-muted">kcal left</span>
        </CalorieRing>
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <MacroBar macro="protein" value={82} max={140} />
          <MacroBar macro="carbs" value={130} max={230} />
          <MacroBar macro="fat" value={38} max={70} />
        </div>
      </div>
      <p className="rounded-2xl border border-brand/30 bg-brand/10 p-3 text-sm leading-relaxed text-fg-2">
        <span className="font-bold text-brand-ink">Coach · </span>
        You&apos;re light on protein. A dal or paneer dinner would close the gap.
      </p>
    </div>
  );
}

interface WelcomeIntroProps {
  firstName: string;
  onStart: () => void;
  onSkip: () => void;
}

/**
 * The first screen a new account sees. Phones: everything on one screen with the
 * buttons pinned to the bottom, no scrolling. Large screens: steps beside a sample day.
 */
export default function WelcomeIntro({ firstName, onStart, onSkip }: WelcomeIntroProps) {
  return (
    <div className="grid min-h-0 flex-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-16">
      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.07 }}
        className="flex h-full min-h-0 flex-col gap-5 short:gap-3 md:h-auto md:gap-7"
      >
        <motion.header variants={RISE} className="shrink-0">
          <p className="text-sm font-bold text-brand-ink">
            Welcome{firstName ? `, ${firstName}` : ''}
          </p>
          <h1 className="mt-1 font-display text-[28px] font-bold leading-tight tracking-[-0.02em] text-fg short:mt-0 short:text-2xl md:text-[40px]">
            Here&apos;s how FoodCal works
          </h1>
          <p className="mt-1.5 text-[15px] text-fg-2 md:text-base">
            Three steps. Only the first one needs a few minutes.
          </p>
        </motion.header>

        <ol className="flex min-h-0 flex-1 flex-col justify-center gap-3 short:gap-2 md:flex-none">
          {STEPS.map(({ icon: Icon, title, detail, badge }, i) => (
            <motion.li
              key={title}
              variants={RISE}
              className={`flex items-center gap-4 rounded-3xl border p-4 short:gap-3 short:rounded-2xl short:p-3 md:p-5 ${
                i === 0 ? 'border-brand/40 bg-brand/10' : 'border-line bg-surface-1'
              }`}
            >
              <span
                className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl short:h-10 short:w-10 ${
                  i === 0 ? 'bg-brand text-on-brand' : 'bg-surface-3 text-fg-2'
                }`}
              >
                <Icon className="h-6 w-6 short:h-5 short:w-5" />
                <span className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-canvas bg-fg text-[11px] font-bold text-canvas">
                  {i + 1}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-base font-bold text-fg">{title}</span>
                  {badge && (
                    <span className="rounded-full bg-brand/20 px-2 py-0.5 text-[11px] font-bold text-brand-ink">
                      {badge}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-muted">{detail}</span>
              </span>
            </motion.li>
          ))}
        </ol>

        <motion.div
          variants={RISE}
          className="flex shrink-0 flex-col gap-1 md:flex-row md:items-center md:gap-3"
        >
          <button
            type="button"
            onClick={onStart}
            className={buttonClass('primary', 'lg', 'w-full short:h-12 md:w-auto')}
          >
            Build my plan <ArrowRightIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onSkip}
            className={buttonClass('ghost', 'md', 'w-full short:h-10 md:w-auto')}
          >
            I&apos;ll look around first
          </button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="hidden justify-center lg:flex"
      >
        <PreviewCard />
      </motion.div>
    </div>
  );
}
