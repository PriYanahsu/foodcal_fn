'use client';

import { motion, MotionConfig } from 'framer-motion';
import FitnessSetupWizard from '@/features/fitnessProfile/components/FitnessSetupWizard';
import { StepTracker } from '@/features/activity/components/StepTracker';
import { isFeatureEnabled } from '@/config/features';
import { Spinner } from '@/components/ui/fc';
import { useNutrition } from '../hooks/useNutrition';
import NutritionHeader from './NutritionHeader';
import WeekStrip from './WeekStrip';
import CaloriesCard from './CaloriesCard';
import MealsCard from './MealsCard';
import CoachCard from './CoachCard';
import WaterCard from './WaterCard';
import WeightCard from './WeightCard';
import MobileDashboard from './MobileDashboard';

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
    showWizard,
    setShowWizard,
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

  if (!initialReady) {
    return (
      <div
        className="flex min-h-[70vh] items-center justify-center bg-canvas text-brand"
        role="status"
      >
        <Spinner className="h-10 w-10" />
        <span className="sr-only">Loading your day…</span>
      </div>
    );
  }

  const openWizard = () => setShowWizard(true);

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
          onSelectDate={setSelectedDate}
          stats={stats}
          goals={goals}
          hasPlan={hasPlan}
          recentLogs={recentLogs}
          loading={loading}
          refreshing={refreshing}
          isToday={isToday}
          onSetUpPlan={openWizard}
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
          <WeekStrip selectedDate={selectedDate} onSelect={setSelectedDate} />
        </motion.div>

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
              />
            </motion.div>
          </div>

          <div className="flex flex-col gap-6">
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
            <motion.div variants={REVEAL}>
              <WeightCard
                userId={user?.id}
                profileWeight={fitness.weight}
                targetWeight={fitness.targetWeightKg}
                targetDate={fitness.targetDate}
              />
            </motion.div>
            {isFeatureEnabled('steps') && <StepTracker />}
          </div>
        </div>
      </motion.div>

      {showWizard && user && (
        <FitnessSetupWizard
          userId={user.id}
          onCancel={() => setShowWizard(false)}
          onComplete={() => {
            setShowWizard(false);
            window.location.reload();
          }}
        />
      )}
    </MotionConfig>
  );
}
