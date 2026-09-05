'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import AvatarUpload from '@/features/userProfile/components/AvatarUpload';
import Link from 'next/link';
import {
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { calculateProfileCompletion } from '@/utils/profileCompletion';
import FitnessSetupWizard from '@/features/fitnessProfile/components/setup/FitnessSetupWizard';
import UserDetailForm from './UserDetailForm';
import FitnessDetailForm from './FitnessDetailForm';
import ProfileStats from './ProfileStats';
import { useUserProfile } from '../hooks/useUserProfile';
import { useFitnessProfile } from '../hooks/useFitnessProfile';
import { getMissingFields } from '../utils/getMissingFields';
import { deriveGoal } from '../utils/deriveGoal';

export const dynamic = 'force-dynamic';

export default function UserProfile() {
  const {
    user,
    logout,
    loading: userLoading,
    saving: userSaving,
    isEditing: userEditing,
    profile,
    feedback: userFeedback,
    patchProfile,
    startEditing: startUserEdit,
    cancelEditing: cancelUserEdit,
    handleAvatarUpload,
    handleUpdate: saveUser,
  } = useUserProfile();

  const {
    loading: fitnessLoading,
    saving: fitnessSaving,
    isEditing: fitnessEditing,
    fitness,
    feedback: fitnessFeedback,
    offerConsult,
    setOfferConsult,
    fetchFitness,
    patchFitness,
    startEditing: startFitnessEdit,
    cancelEditing: cancelFitnessEdit,
    handleUpdate: saveFitness,
  } = useFitnessProfile();

  const [showReminder, setShowReminder] = useState(false);
  const [showConsult, setShowConsult] = useState(false);

  const loading = userLoading || fitnessLoading;
  const feedback = userFeedback ?? fitnessFeedback;

  const fillMissing = () => {
    const missing = getMissingFields(profile, fitness);
    const userMissing = missing.some((field) =>
      ['Full name', 'Profile photo', 'Gender'].includes(field)
    );
    const fitnessMissing = missing.some(
      (field) => !['Full name', 'Profile photo', 'Gender'].includes(field)
    );
    if (userMissing) startUserEdit();
    if (fitnessMissing) startFitnessEdit();
  };

  const handleConsultComplete = () => {
    setShowConsult(false);
    setOfferConsult(false);
    void fetchFitness(true);
  };

  useEffect(() => {
    if (loading) return;
    setShowReminder(calculateProfileCompletion({ ...profile, fitness_details: fitness }) < 100);
  }, [loading, profile, fitness]);

  if (loading) {
    return (
      <div className="page-container max-w-5xl flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--primary)] border-t-transparent" />
          <p className="text-[var(--text-muted)] text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const completionPercentage = calculateProfileCompletion({
    ...profile,
    fitness_details: fitness,
  });
  const missingFields = getMissingFields(profile, fitness);
  const goal = deriveGoal(fitness.weight, fitness.targetWeightKg);

  return (
    <div className="page-container max-w-5xl pb-8">
      <div className="px-0 sm:px-2">
        <AnimatePresence initial={false}>
          {showReminder && (
            <motion.div
              key="reminder"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[var(--primary)]/20 to-transparent border border-[var(--primary)]/30 p-4 rounded-2xl flex items-center justify-between backdrop-blur-md gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-[var(--primary)]/20 text-[var(--primary)] shrink-0">
                    <SparklesIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm">
                      Profile {completionPercentage}% complete
                    </p>
                    <p className="text-[var(--text-muted)] text-xs">
                      Fill in the missing details below for more accurate AI recommendations.
                    </p>
                  </div>
                </div>
                {!userEditing && !fitnessEditing && (
                  <Button
                    size="sm"
                    onClick={fillMissing}
                    className="shrink-0 hidden sm:inline-flex"
                  >
                    Complete now
                  </Button>
                )}
                <button
                  onClick={() => setShowReminder(false)}
                  className="text-white/40 hover:text-white transition-colors shrink-0"
                  aria-label="Dismiss reminder"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {feedback && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={`overflow-hidden rounded-xl border text-sm font-medium ${
                feedback.type === 'success'
                  ? 'bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              <div className="p-4">{feedback.message}</div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative z-10 shrink-0">
              <AvatarUpload
                uid={user?.id || ''}
                url={profile.avatar_url ?? null}
                isEditing
                onUpload={handleAvatarUpload}
                size={typeof window !== 'undefined' && window.innerWidth < 640 ? 96 : 150}
              />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-3xl font-bold text-[var(--foreground)] truncate leading-tight">
                {profile.fullName || 'Your Name'}
              </h1>
              <p className="text-xs sm:text-base text-[var(--text-muted)] truncate">
                {profile.email}
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                onClick={async () => {
                  await logout();
                  window.location.href = '/login';
                }}
                className="!px-3 !py-2 text-sm text-red-400 border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-red-500/10 whitespace-nowrap"
              >
                Sign Out
              </Button>
            </div>
          </div>

          <div className="flex sm:hidden items-center gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                await logout();
                window.location.href = '/login';
              }}
              className="flex-1 py-2 text-sm text-red-400 border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-red-500/10 whitespace-nowrap"
            >
              Sign Out
            </Button>
          </div>
        </div>

        <ProfileStats
          fitness={fitness}
          goal={goal}
          isEditing={fitnessEditing}
          onEdit={startFitnessEdit}
        />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <UserDetailForm
              profile={profile}
              isEditing={userEditing}
              saving={userSaving}
              onChange={patchProfile}
              onStartEdit={startUserEdit}
              onCancel={cancelUserEdit}
              onSave={saveUser}
            />
            <FitnessDetailForm
              fitness={fitness}
              isEditing={fitnessEditing}
              saving={fitnessSaving}
              canConsult={!!user}
              showConsultCta={offerConsult}
              onChange={patchFitness}
              onStartEdit={startFitnessEdit}
              onCancel={cancelFitnessEdit}
              onSave={saveFitness}
              onConsult={() => setShowConsult(true)}
            />

            <Card className="p-5 bg-gradient-to-br from-[var(--primary)]/10 via-[var(--card-bg)] to-transparent border border-[var(--primary)]/20 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] shrink-0">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold">Need AI calorie targets?</h3>
                  <p className="text-[var(--text-muted)] text-sm mt-0.5">
                    Consult from profile to regenerate macros & coach advice without leaving this
                    page.
                  </p>
                </div>
                <div className="flex w-full sm:w-auto gap-2 shrink-0">
                  <Button
                    onClick={() => user && setShowConsult(true)}
                    disabled={!user}
                    className="flex-1 sm:flex-none shadow-[0_0_14px_rgba(118,185,0,0.28)]"
                  >
                    <span className="inline-flex items-center gap-2">
                      Consult
                      <SparklesIcon className="w-4 h-4" />
                    </span>
                  </Button>
                  <Link href="/fitness" className="flex-1 sm:flex-none">
                    <Button variant="outline" className="w-full whitespace-nowrap">
                      <span className="inline-flex items-center gap-2">
                        Fitness Hub
                        <ArrowRightIcon className="w-4 h-4 shrink-0" />
                      </span>
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl">
              <h4 className="font-bold text-lg mb-4">Profile Completion</h4>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Overall</span>
                  <span className="text-[var(--primary)] font-bold">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-[var(--input-bg)] rounded-full h-2.5">
                  <div
                    className="bg-[var(--primary)] h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>

                {missingFields.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      Still needed
                    </p>
                    <ul className="space-y-1.5">
                      {missingFields.map((field) => (
                        <li
                          key={field}
                          className="flex items-center gap-2 text-sm text-[var(--text-muted)]"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                          {field}
                        </li>
                      ))}
                    </ul>
                    {!userEditing && !fitnessEditing && (
                      <Button size="sm" onClick={fillMissing} className="w-full mt-3">
                        Fill missing fields
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-[var(--primary)]">
                    <CheckCircleIcon className="w-5 h-5 shrink-0" />
                    Profile fully complete
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-[var(--input-bg)] to-[var(--card-bg)] border border-[var(--card-border)] shadow-xl">
              <h4 className="font-bold text-lg mb-2 text-purple-400">Pro Tip</h4>
              <p className="text-sm text-[var(--text-muted)]">
                Update weight or goals here, then hit{' '}
                <span className="text-[var(--primary)] font-semibold">Consult</span> to refresh AI
                macros without leaving Profile.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {showConsult && user && (
        <FitnessSetupWizard
          userId={user.id}
          onCancel={() => setShowConsult(false)}
          onComplete={handleConsultComplete}
        />
      )}
    </div>
  );
}
