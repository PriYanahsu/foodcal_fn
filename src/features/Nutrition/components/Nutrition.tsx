'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, MotionConfig } from 'framer-motion';
import { StepTracker } from '@/features/activity/components/StepTracker';
import { isFeatureEnabled } from '@/config/features';
import { ROUTES } from '@/constants/routes';
import { SuccessToast } from '@/components/ui/SuccessToast';
import {
  GettingStartedCard,
  PlanRequiredDialog,
  PlanRequiredHero,
  START_PARAM,
  useOnboarding,
  usePlanGate,
} from '@/features/onboarding';
import { PHONE_QUERY, useMediaQuery } from '@/hooks/useMediaQuery';
import { useNutrition } from '../hooks/useNutrition';
import NutritionHeader from './NutritionHeader';
import WeekStrip from './WeekStrip';
import CaloriesCard from './CaloriesCard';
import MealsCard from './MealsCard';
import CoachCard from './CoachCard';
import WaterCard from './WaterCard';
import WeightCard from './WeightCard';
import MobileDashboard from './MobileDashboard';
import DashboardSkeleton from './DashboardSkeleton';

/** Cards rise in one after another on first load. */
const REVEAL = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Nutrition() {
  const {
    user,
    fitness,
    selectedDate,
    setSelectedDate,
    stats,
    recentLogs,
    loading,
    refreshing,
    hasPlan,
    goals,
    userName,
    initialReady,
    isToday,
  } = useNutrition();
  const router = useRouter();
  const { needsWelcome, loggingLocked, planJustActivated, clearPlanActivated } = useOnboarding();
  const isPhone = useMediaQuery(PHONE_QUERY);
  const { showPlanWarning: showWarning } = usePlanGate();
  // No plan: phones get the warning as soon as the dashboard opens (desktop shows the big
  // card instead). Tapping a date or a locked tile raises the app-wide one again.
  const [warningDismissed, setWarningDismissed] = useState(false);
  const warningOpen = loggingLocked && isPhone && !warningDismissed;
  const closeWarning = () => setWarningDismissed(true);

  // A first-time user (no plan yet) gets the guided setup instead of an empty dashboard.
  useEffect(() => {
    if (needsWelcome) router.replace(ROUTES.WELCOME);
  }, [needsWelcome, router]);

  if (!initialReady || needsWelcome) {
    return <DashboardSkeleton />;
  }

  const openWizard = () => router.push(`${ROUTES.WELCOME}?${START_PARAM}=plan`);
  const selectDate = (date: string) => (loggingLocked ? showWarning() : setSelectedDate(date));
  const showWeightCard = () =>
    document.getElementById('weight-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    // `hide-page-scrollbar`: this page hides the window scrollbar (still scrolls) — see globals.css.
    <MotionConfig reducedMotion="user">
      {/* Phones: one-screen tile dashboard. */}
      <div className="hide-page-scrollbar bg-canvas md:hidden">
        <MobileDashboard
          userId={user?.id}
          userName={userName}
          fitness={fitness}
          selectedDate={selectedDate}
          onSelectDate={selectDate}
          stats={stats}
          goals={goals}
          hasPlan={hasPlan}
          recentLogs={recentLogs}
          loading={loading}
          refreshing={refreshing}
          isToday={isToday}
          onSetUpPlan={openWizard}
          onLocked={showWarning}
        />
      </div>

      {/* Tablet and desktop: full cards. */}
      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.06 }}
        className="hide-page-scrollbar mx-auto hidden min-h-screen w-full max-w-[1200px] flex-col gap-6 bg-canvas px-8 py-8 font-ui text-fg md:flex"
      >
        <motion.div variants={REVEAL}>
          <NutritionHeader userName={userName} selectedDate={selectedDate} />
        </motion.div>

        <motion.div variants={REVEAL} className="relative z-20">
          <WeekStrip selectedDate={selectedDate} onSelect={selectDate} />
        </motion.div>

        {loggingLocked ? (
          <motion.div variants={REVEAL}>
            <PlanRequiredHero />
          </motion.div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="flex min-w-0 flex-col gap-6">
              <motion.div variants={REVEAL}>
                <CaloriesCard
                  stats={stats}
                  goals={goals}
                  hasPlan={hasPlan}
                  refreshing={refreshing}
                  onSetUpPlan={openWizard}
                />
              </motion.div>
              <motion.div variants={REVEAL}>
                <MealsCard
                  logs={recentLogs}
                  loading={loading}
                  refreshing={refreshing}
                  isToday={isToday}
                  target={hasPlan ? goals.calories : null}
                />
              </motion.div>
            </div>

            <div className="flex flex-col gap-6">
              <GettingStartedCard onWeighIn={showWeightCard} />
              <motion.div variants={REVEAL}>
                <CoachCard
                  hasPlan={hasPlan}
                  objective={fitness.objective}
                  advice={fitness.aiCoachAdvice}
                  onSetUpPlan={openWizard}
                />
              </motion.div>
              <motion.div variants={REVEAL}>
                <WaterCard userId={user?.id} date={selectedDate} />
              </motion.div>
              <motion.div variants={REVEAL} id="weight-card" className="scroll-mt-8">
                <WeightCard
                  userId={user?.id}
                  profileWeight={fitness.weight}
                  targetWeight={fitness.targetWeightKg}
                  targetDate={fitness.targetDate}
                  createdAt={fitness.createdAt}
                />
              </motion.div>
              {isFeatureEnabled('steps') && <StepTracker />}
            </div>
          </div>
        )}
      </motion.div>

      <PlanRequiredDialog open={warningOpen} onClose={closeWarning} />

      {/* Straight from the welcome flow: one confirmation instead of a whole extra screen. */}
      <SuccessToast
        message={planJustActivated ? 'Your plan is live' : null}
        detail="Your targets are set and your profile is filled in. Tap the camera to log your first meal."
        onClose={clearPlanActivated}
        durationMs={6000}
      />
    </MotionConfig>
  );
}
