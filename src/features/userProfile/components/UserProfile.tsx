'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { PHONE_QUERY, useMediaQuery } from '@/hooks/useMediaQuery';
import { calculateProfileCompletion } from '@/utils/profileCompletion';
import FitnessSetupWizard from '@/features/fitnessProfile/components/FitnessSetupWizard';
import MobileProfile from './MobileProfile';
import ProfileDesktop from './ProfileDesktop';
import { useUserProfile } from '../hooks/useUserProfile';
import { useFitnessProfile } from '../hooks/useFitnessProfile';
import { getMissingFields, deriveGoal } from '../utils/helper';
import { ProfileViewProps } from '../type';
import ProfileSkeleton from './ProfileSkeleton';

export const dynamic = 'force-dynamic';

/** Missing-field labels that belong to the identity card, not to body and goals. */
const IDENTITY_FIELDS = ['Full name', 'Profile photo'];

export default function UserProfile() {
  const {
    user,
    logout,
    loading: userLoading,
    saving: userSaving,
    isEditing: nameEditing,
    profile,
    feedback: userFeedback,
    patchProfile,
    startEditing: startNameEdit,
    cancelEditing: cancelNameEdit,
    handleAvatarUpload,
    handleUpdate: saveName,
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

  const router = useRouter();
  const isPhone = useMediaQuery(PHONE_QUERY);
  const [showConsult, setShowConsult] = useState(false);

  // There is no session on the server, so the server always renders the loading state.
  // `mounted` is false during hydration and true afterwards, which keeps the first
  // client paint identical to the server's and avoids a hydration mismatch.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const loading = userLoading || fitnessLoading;
  const feedback = userFeedback ?? fitnessFeedback;

  // The fields edit in place: the first change opens the hook's edit mode, which is
  // also what marks the form as having unsaved changes.
  const editFitness = (patch: Parameters<typeof patchFitness>[0]) => {
    if (!fitnessEditing) startFitnessEdit();
    patchFitness(patch);
  };

  if (!mounted || loading) {
    return <ProfileSkeleton />;
  }

  const missingFields = getMissingFields(profile, fitness);
  const view: ProfileViewProps = {
    uid: user?.id || '',
    profile,
    fitness,
    goal: deriveGoal(fitness.weight, fitness.targetWeightKg),
    completion: calculateProfileCompletion(fitness, profile),
    missingBodyCount: missingFields.filter((field) => !IDENTITY_FIELDS.includes(field)).length,
    nameEditing,
    nameSaving: userSaving,
    fitnessDirty: fitnessEditing,
    fitnessSaving,
    canConsult: !!user,
    highlightConsult: offerConsult && !fitnessEditing,
    onProfileChange: patchProfile,
    onStartNameEdit: startNameEdit,
    onCancelNameEdit: cancelNameEdit,
    onSaveName: saveName,
    onAvatarUpload: handleAvatarUpload,
    onFitnessChange: editFitness,
    onResetFitness: cancelFitnessEdit,
    onSaveFitness: saveFitness,
    onConsult: () => user && setShowConsult(true),
    onLogout: async () => {
      await logout();
      window.location.href = '/login';
    },
    onDelete: () => router.push('/settings?delete=1'),
  };

  return (
    <div className="hide-page-scrollbar bg-canvas">
      {isPhone ? <MobileProfile {...view} /> : <ProfileDesktop {...view} />}

      <AnimatePresence>
        {feedback && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            role="status"
            className={`fixed left-1/2 top-[max(1rem,env(safe-area-inset-top))] z-[120] w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border px-4 py-3 text-subhead font-bold shadow-[var(--fc-shadow-pop)] ${
              feedback.type === 'success'
                ? 'border-brand/40 bg-surface-1 text-brand-ink'
                : 'border-danger/40 bg-surface-1 text-danger'
            }`}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {showConsult && user && (
        <FitnessSetupWizard
          userId={user.id}
          onCancel={() => setShowConsult(false)}
          onComplete={() => {
            setShowConsult(false);
            setOfferConsult(false);
            void fetchFitness(true);
          }}
        />
      )}
    </div>
  );
}
