'use client';

import IdentityCard from './IdentityCard';
import BodyGoalsCard from './BodyGoalsCard';
import AppearanceCard from './AppearanceCard';
import RemindersCard from './RemindersCard';
import AccountCard from './AccountCard';
import { isFeatureEnabled } from '@/config';
import { ProfileViewProps } from '../type';

/** Tablet and desktop: the whole profile as full cards, no sheets. */
export default function ProfileDesktop({
  uid,
  profile,
  fitness,
  goal,
  completion,
  missingBodyCount,
  nameEditing,
  nameSaving,
  fitnessDirty,
  fitnessSaving,
  canConsult,
  highlightConsult,
  onProfileChange,
  onStartNameEdit,
  onCancelNameEdit,
  onSaveName,
  onAvatarUpload,
  onFitnessChange,
  onResetFitness,
  onSaveFitness,
  onConsult,
  onLogout,
  onDelete,
}: ProfileViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 bg-canvas px-4 py-6 font-ui text-fg md:px-8 md:py-8">
      <header className="min-w-0">
        <h1 className="font-display text-large-title font-bold tracking-[-0.02em] text-fg">
          Profile
        </h1>
        <p className="mt-1 text-subhead text-muted">
          Your details, goals and preferences — all in one place.
        </p>
      </header>

      <IdentityCard
        uid={uid}
        profile={profile}
        isEditing={nameEditing}
        saving={nameSaving}
        completion={completion}
        onChange={onProfileChange}
        onStartEdit={onStartNameEdit}
        onCancel={onCancelNameEdit}
        onSave={onSaveName}
        onAvatarUpload={onAvatarUpload}
      />

      <BodyGoalsCard
        fitness={fitness}
        goal={goal}
        dirty={fitnessDirty}
        saving={fitnessSaving}
        missingCount={missingBodyCount}
        canConsult={canConsult}
        highlightConsult={highlightConsult}
        onChange={onFitnessChange}
        onReset={onResetFitness}
        onSave={onSaveFitness}
        onConsult={onConsult}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <AppearanceCard />
        {isFeatureEnabled('notifications') && <RemindersCard />}
      </div>

      <AccountCard onLogout={onLogout} onDelete={onDelete} />
    </div>
  );
}
