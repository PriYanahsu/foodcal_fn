'use client';

import { motion } from 'framer-motion';
import FitnessSetupWizard from '@/features/fitnessProfile/components/setup/FitnessSetupWizard';
import { StepTracker } from '@/features/activity/components/StepTracker';
import { isFeatureEnabled } from '@/config/features';
import { useNutrition } from '../hooks/useNutrition';
import { CONTAINER_VARIANTS, ITEM_VARIANTS } from '../utils/Constants';
import NutritionHero from './NutritionHero';
import DailyNutrition from './DailyNutrition';
import FitnessHub from './FitnessHub';
import DailyHabits from './DailyHabits';
import NoPlanModal from './NoPlanModal';

export default function Nutrition() {
  const {
    user,
    profile,
    fitness,
    handleAvatarUpload,
    selectedDate,
    setSelectedDate,
    mounted,
    showWizard,
    setShowWizard,
    showNoPlanModal,
    setShowNoPlanModal,
    stats,
    recentLogs,
    loading,
    hasPlan,
    goals,
    userName,
    initialReady,
    dailyLogRef,
    logScrollable,
    isToday,
    handleDateChange,
    handleStartConsultation,
  } = useNutrition();

  if (!initialReady) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]" />
      </div>
    );
  }

  const subtitle = loading
    ? 'Crunching the numbers...'
    : fitness.objective
      ? `Target: ${fitness.objective}`
      : "Let's hit your macro goals today.";

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={CONTAINER_VARIANTS}
      className="page-container max-w-7xl space-y-4 sm:space-y-6 lg:space-y-8 min-h-screen relative"
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[var(--primary)]/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <NutritionHero
        uid={user?.id || ''}
        avatarUrl={profile.avatar_url}
        userName={userName}
        subtitle={subtitle}
        selectedDate={selectedDate}
        isToday={isToday}
        onAvatarUpload={handleAvatarUpload}
        onDateChange={handleDateChange}
        onDateSelect={setSelectedDate}
      />

      <DailyNutrition
        stats={stats}
        goals={goals}
        hasPlan={hasPlan}
        recentLogs={recentLogs}
        loading={loading}
        mounted={mounted}
        isToday={isToday}
        dailyLogRef={dailyLogRef}
        logScrollable={logScrollable}
        onUnlock={() => setShowNoPlanModal(true)}
      >
        <motion.div variants={ITEM_VARIANTS} className="space-y-4 sm:space-y-6">
          <FitnessHub
            hasPlan={hasPlan}
            aiCoachAdvice={fitness.aiCoachAdvice}
            targetWeightKg={fitness.targetWeightKg}
          />
          {isFeatureEnabled('steps') && <StepTracker />}
          <DailyHabits />
        </motion.div>
      </DailyNutrition>

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

      <NoPlanModal
        open={showNoPlanModal}
        onClose={() => setShowNoPlanModal(false)}
        onStart={handleStartConsultation}
      />
    </motion.div>
  );
}
