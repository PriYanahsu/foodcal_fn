'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRightIcon,
  CameraIcon,
  CheckIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { LogoMark } from '@/components/brand/Logo';
import { buttonClass } from '@/components/ui/fc';
import { MacroBar, MACRO_STYLES, type MacroKey } from '@/components/nutrition/macros';
import { LandingNav } from './LandingNav';
import { HeroVisual } from './HeroVisual';
import { LandingFooter } from './LandingFooter';
import {
  COACH_NOTIFICATIONS,
  COACH_POINTS,
  FEATURES,
  HERO_POINTS,
  MEAL_PHOTO_STYLE,
  SAMPLE_SCAN,
  STEPS,
} from '../landingData';

interface LandingPageProps {
  onSignIn: () => void;
  onGetStarted: () => void;
  /** When set, replaces the hero's product visual (the sign-in / sign-up card). */
  authPanel?: ReactNode;
}

/** Id of the hero's right-hand slot, so callers can scroll the form into view. */
export const AUTH_PANEL_ID = 'auth-panel';

const EASE = [0.22, 1, 0.36, 1] as const;

const CONTAINER = 'mx-auto w-full max-w-[1200px] px-4 md:px-8';
const MACROS: MacroKey[] = ['protein', 'carbs', 'fat'];

function SectionHeading({
  eyebrow,
  title,
  children,
  center = false,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  center?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-3 ${center ? 'items-center text-center' : ''}`}>
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand-ink">{eyebrow}</p>
      <h2 className="font-display text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-fg md:text-[40px]">
        {title}
      </h2>
      {children && <p className="max-w-xl text-base text-muted">{children}</p>}
    </div>
  );
}

/** Small product visuals for the three "How it works" steps. */
function StepVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div
        className="relative flex h-full items-center justify-center rounded-xl"
        style={MEAL_PHOTO_STYLE}
      >
        <div className="relative h-16 w-24">
          <span className="absolute left-0 top-0 h-5 w-5 rounded-tl-lg border-l-2 border-t-2 border-brand" />
          <span className="absolute right-0 top-0 h-5 w-5 rounded-tr-lg border-r-2 border-t-2 border-brand" />
          <span className="absolute bottom-0 left-0 h-5 w-5 rounded-bl-lg border-b-2 border-l-2 border-brand" />
          <span className="absolute bottom-0 right-0 h-5 w-5 rounded-br-lg border-b-2 border-r-2 border-brand" />
          <CameraIcon className="absolute inset-0 m-auto h-7 w-7 text-white/80" />
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="flex h-full flex-col justify-between rounded-xl border border-line bg-surface-2 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-bold text-fg">{SAMPLE_SCAN.name}</span>
          <span className="shrink-0 rounded-full bg-brand/15 px-2 py-0.5 text-xs font-bold text-brand-ink">
            {SAMPLE_SCAN.confidence}%
          </span>
        </div>
        <p className="font-display text-[28px] font-bold leading-none text-fg">
          {SAMPLE_SCAN.kcal}
          <span className="ml-1 font-ui text-sm font-semibold text-muted">kcal</span>
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-fg-2">
          {MACROS.map((key) => (
            <span key={key} className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-[2px] ${MACRO_STYLES[key].dot}`} />
              {MACRO_STYLES[key].label} {SAMPLE_SCAN[key]} g
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-center gap-3 rounded-xl border border-line bg-surface-2 p-3.5">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between text-[13px]">
          <span className="inline-flex items-center gap-1.5 font-bold text-fg-2">
            <span className="h-2 w-2 rounded-[2px] bg-brand" />
            Calories
          </span>
          <span className="tabular-nums text-muted">1,480 / 2,100</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
          <div className="h-full w-[70%] rounded-full bg-brand" />
        </div>
      </div>
      <MacroBar macro="protein" value={96} max={160} unit="g" />
      <p className="flex items-center gap-1.5 text-xs text-muted">
        <LightBulbIcon className="h-3.5 w-3.5 text-brand-ink" />
        64 g of protein to go — dinner can close it.
      </p>
    </div>
  );
}

export function LandingPage({ onSignIn, onGetStarted, authPanel }: LandingPageProps) {
  return (
    <div id="top" className="min-h-screen">
      <LandingNav onSignIn={onSignIn} onGetStarted={onGetStarted} />

      <main>
        {/* Hero */}
        {/* Fills the first screen exactly: viewport height minus the sticky nav (64px / 72px). */}
        <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden border-b border-line md:min-h-[calc(100svh-4.5rem)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_0%,rgb(var(--fc-brand-rgb)/0.14),transparent_70%),radial-gradient(45%_55%_at_85%_60%,rgb(var(--fc-brand-rgb)/0.08),transparent_70%)]"
          />
          <div
            className={`${CONTAINER} relative grid items-center gap-12 py-10 md:py-14 lg:grid-cols-[1.25fr_1fr] lg:gap-10`}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-start gap-6 md:items-center md:text-center lg:items-start lg:text-left"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/35 bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand-ink">
                <SparklesIcon className="h-3.5 w-3.5" />
                AI calorie &amp; macro tracker
              </span>
              <h1 className="font-display text-[40px] font-bold leading-[1.02] tracking-[-0.035em] text-fg sm:text-[52px] md:text-[64px]">
                <span className="block sm:whitespace-nowrap">Snap your meal.</span>
                <span className="block text-brand-ink sm:whitespace-nowrap">Know your macros.</span>
              </h1>
              <p className="max-w-[520px] text-lg leading-relaxed text-fg-2">
                Take a photo and FoodCal estimates calories, protein, carbs and fat in seconds —
                then keeps you on track with a plan built for your body.
              </p>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <button
                  type="button"
                  onClick={onGetStarted}
                  className={buttonClass('primary', 'lg')}
                >
                  Get started — it’s free
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
                <button type="button" onClick={onSignIn} className={buttonClass('secondary', 'lg')}>
                  Sign in
                </button>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-muted sm:flex-row sm:flex-wrap sm:gap-x-5">
                {HERO_POINTS.map((point) => (
                  <li key={point} className="inline-flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-brand-ink" />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>

            <div id={AUTH_PANEL_ID} className="scroll-mt-24">
              <AnimatePresence mode="wait">
                {authPanel ? (
                  <motion.div
                    key="auth"
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { duration: 0.35, ease: EASE },
                    }}
                    exit={{ opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.15 } }}
                  >
                    {authPanel}
                  </motion.div>
                ) : (
                  <motion.div
                    key="visual"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } }}
                    exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
                  >
                    <HeroVisual />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 border-b border-line py-16 md:py-24">
          <div className={CONTAINER}>
            <SectionHeading eyebrow="How it works" title="From plate to plan in three steps" center>
              No weighing, no searching food databases. One photo does most of the work.
            </SectionHeading>

            <ol className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-5">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="flex flex-col gap-4 rounded-3xl border border-line bg-surface-1 p-4 md:p-5"
                >
                  <div className="h-[150px]">
                    <StepVisual index={index} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/15 font-display text-sm font-bold text-brand-ink">
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-bold text-fg">{step.title}</h3>
                  </div>
                  <p className="text-[15px] leading-relaxed text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 border-b border-line py-16 md:py-24">
          <div className={CONTAINER}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading eyebrow="Features" title="Built around the photo you already take" />
              <p className="max-w-sm text-base text-muted">
                Everything from your first plan to your hundredth meal, in one app that works on
                your phone and your laptop.
              </p>
            </div>

            <ul className="mt-10 grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
              {FEATURES.map(({ title, body, icon: Icon }) => (
                <li
                  key={title}
                  className="flex gap-4 rounded-2xl border border-line bg-surface-1 p-4 sm:flex-col sm:p-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand-ink">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-base font-bold text-fg">{title}</h3>
                    <p className="text-sm leading-relaxed text-muted">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* AI coach */}
        <section className="py-16 md:py-24">
          <div className={`${CONTAINER} grid items-center gap-10 lg:grid-cols-2 lg:gap-16`}>
            <div className="flex flex-col gap-8">
              <SectionHeading eyebrow="AI coach" title="A coach that notices">
                FoodCal compares what you’ve logged with your plan and speaks up only when it helps.
              </SectionHeading>
              <ul className="flex flex-col gap-5">
                {COACH_POINTS.map(({ title, body, icon: Icon }) => (
                  <li key={title} className="flex gap-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand-ink">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-fg">{title}</h3>
                      <p className="text-sm text-muted">{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 rounded-3xl border border-line bg-surface-1 p-4 md:p-5">
              {COACH_NOTIFICATIONS.map(({ title, body, suggestion, time, icon: Icon }) => (
                <article
                  key={title}
                  className="flex gap-3 rounded-2xl border border-line bg-surface-2 p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand-ink">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-[15px] font-bold text-fg">{title}</h3>
                      <span className="shrink-0 text-xs text-muted">{time}</span>
                    </div>
                    <p className="text-sm text-fg-2">{body}</p>
                    {suggestion && (
                      <p className="mt-1.5 flex gap-1.5 rounded-xl border border-brand/20 bg-brand/10 px-2.5 py-2 text-[13px] leading-snug text-brand-ink">
                        <LightBulbIcon className="h-4 w-4 shrink-0" />
                        {suggestion}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy strip */}
        <section className={CONTAINER}>
          <div className="flex flex-col gap-4 rounded-3xl border border-line bg-surface-1 p-5 md:flex-row md:items-center md:justify-between md:p-6">
            <div className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand-ink">
                <ShieldCheckIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-fg">Your data stays yours</h2>
                <p className="text-sm text-muted">
                  Delete your account and every log, photo and weight entry anytime from Settings.
                </p>
              </div>
            </div>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-fg hover:text-brand-ink"
            >
              Read the privacy policy
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Final CTA */}
        <section className={`${CONTAINER} py-16 md:py-24`}>
          <div className="flex flex-col items-center gap-5 rounded-[28px] border border-brand/35 bg-[linear-gradient(160deg,rgb(var(--fc-brand-rgb)/0.16),rgb(var(--fc-brand-rgb)/0.04)_60%)] px-5 py-14 text-center md:py-20">
            <LogoMark className="h-11 w-11 text-brand" />
            <h2 className="font-display text-[32px] font-bold leading-tight tracking-[-0.02em] text-fg md:text-[44px]">
              Start with one photo.
            </h2>
            <p className="max-w-md text-base text-fg-2">
              Create an account, snap your next meal and see what’s on your plate. Your plan comes
              right after.
            </p>
            <button
              type="button"
              onClick={onGetStarted}
              className={buttonClass('primary', 'lg', 'mt-1')}
            >
              Get started — it’s free
              <ArrowRightIcon className="h-5 w-5" />
            </button>
            <p className="text-sm text-muted">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSignIn}
                className="font-bold text-fg hover:text-brand-ink"
              >
                Sign in
              </button>
            </p>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
