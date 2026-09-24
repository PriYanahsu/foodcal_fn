'use client';

import Link from 'next/link';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PlanRequired, PlanRequiredHero, useOnboarding } from '@/features/onboarding';
import { PHONE_QUERY, useMediaQuery } from '@/hooks/useMediaQuery';
import FitnessSetupWizard from './FitnessSetupWizard';
import MobilePlan from './plan/MobilePlan';
import ProgressCard from './plan/ProgressCard';
import TargetsCard from './plan/TargetsCard';
import CoachCard from './plan/CoachCard';
import BodyStatsCard from './plan/BodyStatsCard';
import { useFitnessHub } from '../hooks/useFitnessHub';
import PlanSkeleton from './PlanSkeleton';

export default function MyPlan() {
  const { user } = useAuth();
  const isPhone = useMediaQuery(PHONE_QUERY);
  const { loggingLocked } = useOnboarding();
  const {
    fitnessProfile,
    showWizard,
    setShowWizard,
    loading,
    showReminder,
    completionPercentage,
    bmi,
    daysLeft,
    weightDelta,
    fetchFitnessProfile,
  } = useFitnessHub(user);

  if (loading) {
    return <PlanSkeleton />;
  }

  // No plan: nothing here (weigh-ins, targets, coach) works yet, so the page is one message.
  if (loggingLocked) {
    if (isPhone) {
      return <PlanRequired what="your weight" title="Your plan starts here" />;
    }
    return (
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 bg-canvas px-8 py-8 font-ui text-fg">
        <h1 className="font-display text-large-title font-bold tracking-[-0.02em] text-fg">
          My plan
        </h1>
        <PlanRequiredHero />
      </div>
    );
  }

  const weeksLeft = daysLeft !== null ? Math.max(0, Math.ceil(daysLeft / 7)) : null;
  const summary = [
    fitnessProfile?.objective,
    weightDelta && Number(weightDelta) !== 0 ? `${Math.abs(Number(weightDelta))} kg to go` : null,
    daysLeft !== null && daysLeft > 0 ? `${daysLeft} days left` : null,
  ].filter(Boolean) as string[];

  const wizard = showWizard && user && (
    <FitnessSetupWizard
      userId={user.id}
      onCancel={() => setShowWizard(false)}
      onComplete={() => {
        setShowWizard(false);
        void fetchFitnessProfile();
      }}
    />
  );

  // Phones get the one-screen layout; everything else gets the full cards.
  if (isPhone) {
    return (
      <div className="bg-canvas">
        <MobilePlan
          userId={user?.id}
          fitness={fitnessProfile}
          bmi={bmi}
          summary={summary.length ? summary.join(' · ') : 'Set a goal to get targets'}
          weeksLeft={weeksLeft}
          onUpdatePlan={() => setShowWizard(true)}
          onLogged={fetchFitnessProfile}
        />
        {wizard}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-4 bg-canvas px-4 py-4 pb-8 font-ui text-fg md:gap-5 md:px-8 md:py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-large-title font-bold tracking-[-0.02em] text-fg">
            My plan
          </h1>
          <p className="mt-1 text-subhead text-muted">
            {summary.length ? summary.join(' · ') : 'Set a goal and your coach builds the targets.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowWizard(true)}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
        >
          <SparklesIcon className="h-4 w-4" />
          {fitnessProfile?.objective ? 'Update plan' : 'Create plan'}
        </button>
      </header>

      {showReminder && (
        <Link
          href="/profile"
          className="flex items-center justify-between gap-3 rounded-2xl border border-warn/40 bg-warn/10 px-4 py-3 transition-colors hover:bg-warn/15"
        >
          <span className="min-w-0">
            <span className="block text-sm font-bold text-fg">
              Profile {completionPercentage}% complete
            </span>
            <span className="block truncate text-caption text-muted">
              Fill in the rest so your targets stay accurate.
            </span>
          </span>
          <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted" />
        </Link>
      )}

      <div className="grid gap-4 md:gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-4 md:gap-5">
          <ProgressCard
            userId={user?.id}
            profileWeight={fitnessProfile?.weight ?? null}
            targetWeight={fitnessProfile?.targetWeightKg ?? null}
            targetDate={fitnessProfile?.targetDate ?? null}
            createdAt={fitnessProfile?.createdAt ?? null}
            onLogged={fetchFitnessProfile}
          />
          <TargetsCard fitness={fitnessProfile} onUpdatePlan={() => setShowWizard(true)} />
        </div>

        <div className="flex flex-col gap-4 md:gap-5">
          <CoachCard fitness={fitnessProfile} onConsult={() => setShowWizard(true)} />
          <BodyStatsCard fitness={fitnessProfile} bmi={bmi} />
        </div>
      </div>

      {wizard}
    </div>
  );
}
