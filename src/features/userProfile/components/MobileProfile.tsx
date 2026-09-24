'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  BellIcon,
  ChevronRightIcon,
  PencilIcon,
  ScaleIcon,
  SparklesIcon,
  SwatchIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Spinner } from '@/components/ui/fc';
import AvatarUpload from './AvatarUpload';
import BodyGoalsFields from './BodyGoalsFields';
import PlanTargets from './PlanTargets';
import { ThemeSegmented } from '@/components/ui/ThemeSegmented';
import { PushCompact } from '@/features/notifications/components/PushToggleRow';
import { ROUTES } from '@/constants/routes';
import { ACTIVITY_SHORT } from '../utils/Constants';
import { getInitials, formatDate } from '../utils/helper';
import { ProfileViewProps } from '../type';

type Sheet = 'identity' | 'body' | 'plan';

const SHEET_LABELS: Record<Sheet, string> = {
  identity: 'Name and photo',
  body: 'Body and goals',
  plan: 'Your plan',
};

function Tile({
  label,
  icon,
  onOpen,
  className = '',
  children,
}: {
  label: string;
  icon: ReactNode;
  onOpen?: () => void;
  className?: string;
  children: ReactNode;
}) {
  const body = (
    <>
      <span className="flex w-full items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand-ink short:h-6 short:w-6">
          {icon}
        </span>
        <span className="text-sm font-bold text-fg">{label}</span>
        {onOpen && <ChevronRightIcon className="ml-auto h-4 w-4 shrink-0 text-muted" />}
      </span>
      {children}
    </>
  );

  const shell = `flex min-h-0 flex-col gap-2 overflow-hidden rounded-3xl border border-line bg-surface-1 p-4 text-left short:gap-1.5 short:p-3 ${className}`;

  return onOpen ? (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className={`${shell} transition-transform duration-150 active:scale-[0.97]`}
    >
      {body}
    </button>
  ) : (
    <div className={shell}>{body}</div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex min-w-0 flex-col">
      <span className="truncate font-display text-[17px] font-bold leading-tight tabular-nums text-fg">
        {value}
      </span>
      <span className="truncate text-caption text-muted">{label}</span>
    </span>
  );
}

/** Phones: the whole profile on one screen — tiles open a sheet to edit. */
export default function MobileProfile({
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
  const [sheet, setSheet] = useState<Sheet | null>(null);

  const openIdentity = () => {
    onStartNameEdit();
    setSheet('identity');
  };

  const closeSheet = () => {
    if (sheet === 'identity') onCancelNameEdit();
    setSheet(null);
  };

  // Keep the sheet open when a save fails so the error toast points at the field.
  const saveName = async () => {
    if (await onSaveName()) setSheet(null);
  };

  const saveFitness = async () => {
    if (await onSaveFitness()) setSheet(null);
  };

  return (
    <div className="flex h-[calc(100dvh-4rem-68px-2.25rem-env(safe-area-inset-bottom))] min-h-[440px] flex-col gap-3 px-4 py-3 font-ui text-fg short:gap-2.5 short:py-2.5">
      <div className="flex shrink-0 items-center gap-3.5 rounded-3xl border border-line bg-surface-1 p-4 short:p-3">
        <AvatarUpload
          uid={uid}
          url={profile.avatar_url ?? null}
          isEditing={false}
          onUpload={onAvatarUpload}
          initials={getInitials(profile.fullName, profile.email)}
          inputId="profile-photo-row"
          size={72}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[19px] font-bold leading-tight tracking-[-0.02em]">
            {profile.fullName || 'Your name'}
          </p>
          <p className="truncate text-caption text-muted">{profile.email}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
              <span
                className="block h-full rounded-full bg-brand transition-all duration-700"
                style={{ width: `${completion}%` }}
              />
            </span>
            <span className="text-caption font-bold text-brand-ink">{completion}%</span>
          </div>
          {missingBodyCount > 0 && (
            <Link
              href={ROUTES.PLAN_SETUP}
              className="mt-1 block truncate text-caption font-bold text-brand-ink"
            >
              Set up your plan to fill this in →
            </Link>
          )}
        </div>
        <button
          type="button"
          onClick={openIdentity}
          aria-haspopup="dialog"
          aria-label="Edit name and photo"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line-strong bg-surface-2 text-fg-2 transition-transform active:scale-95"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-3 overflow-hidden short:gap-2.5">
        <Tile label="Body" icon={<UserIcon className="h-4 w-4" />} onOpen={() => setSheet('body')}>
          <span className="my-auto grid grid-cols-2 gap-x-2 gap-y-2">
            <Stat label="Age" value={fitness.age ? `${fitness.age}` : '—'} />
            <Stat label="Height" value={fitness.height ? `${fitness.height} cm` : '—'} />
            <Stat label="Gender" value={fitness.gender || '—'} />
            <Stat label="Activity" value={ACTIVITY_SHORT[fitness.activityLevel] ?? '—'} />
          </span>
        </Tile>

        <Tile
          label="Goals"
          icon={<ScaleIcon className="h-4 w-4" />}
          onOpen={() => setSheet('body')}
        >
          <span className="my-auto flex min-w-0 flex-col gap-1.5">
            <Stat
              label={goal ?? 'Set a target weight'}
              value={
                fitness.weight && fitness.targetWeightKg
                  ? `${fitness.weight} → ${fitness.targetWeightKg} kg`
                  : '—'
              }
            />
            <span className="truncate text-caption text-muted">
              By {formatDate(fitness.targetDate)}
            </span>
          </span>
        </Tile>

        <Tile
          label="Your plan"
          icon={<SparklesIcon className="h-4 w-4" />}
          onOpen={() => setSheet('plan')}
          className="col-span-2"
        >
          <PlanTargets fitness={fitness} />
        </Tile>

        <Tile label="Theme" icon={<SwatchIcon className="h-4 w-4" />}>
          <div className="my-auto">
            <ThemeSegmented compact />
          </div>
        </Tile>

        <Tile label="Reminders" icon={<BellIcon className="h-4 w-4" />}>
          <PushCompact />
        </Tile>
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onLogout}
          className="h-12 flex-1 rounded-xl border border-line-strong bg-surface-2 text-sm font-bold text-fg transition-transform active:scale-95 short:h-11"
        >
          Log out
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="h-12 flex-1 rounded-xl border border-danger/40 text-sm font-bold text-danger transition-transform active:scale-95 short:h-11"
        >
          Delete account
        </button>
      </div>

      <BottomSheet
        open={sheet !== null}
        onClose={closeSheet}
        label={sheet ? SHEET_LABELS[sheet] : ''}
      >
        {sheet === 'identity' && (
          <div className="flex flex-col gap-4 pb-4">
            <h2 className="text-lg font-bold text-fg">Name and photo</h2>
            <div className="flex items-center gap-4">
              <AvatarUpload
                uid={uid}
                url={profile.avatar_url ?? null}
                isEditing
                onUpload={onAvatarUpload}
                initials={getInitials(profile.fullName, profile.email)}
                inputId="profile-photo-sheet"
                size={72}
              />
              <label
                htmlFor="profile-photo-sheet"
                className="inline-flex h-11 cursor-pointer items-center rounded-xl border border-line-strong bg-surface-2 px-4 text-sm font-bold text-fg"
              >
                Change photo
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-caption font-semibold text-muted">Full name</span>
              <input
                value={profile.fullName}
                onChange={(e) => onProfileChange({ fullName: e.target.value })}
                placeholder="Your name"
                className="h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-base text-fg outline-none focus:border-brand"
              />
            </label>
            <p className="text-caption text-muted">{profile.email} · email can&apos;t be changed</p>
            <button
              type="button"
              onClick={saveName}
              disabled={!nameEditing || nameSaving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand text-base font-bold text-on-brand disabled:opacity-60"
            >
              {nameSaving && <Spinner className="h-4 w-4" />}
              Save
            </button>
          </div>
        )}

        {sheet === 'body' && (
          <div className="flex flex-col gap-4 pb-4">
            <div>
              <h2 className="text-lg font-bold text-fg">Body and goals</h2>
              <p className="mt-0.5 text-subhead text-muted">
                Changing these re-runs your coach so targets stay accurate.
              </p>
            </div>
            <BodyGoalsFields fitness={fitness} goal={goal} onChange={onFitnessChange} />
            <div className="flex gap-2">
              {fitnessDirty && (
                <button
                  type="button"
                  onClick={onResetFitness}
                  disabled={fitnessSaving}
                  className="h-12 rounded-xl border border-line-strong bg-surface-2 px-5 text-base font-bold text-fg-2 disabled:opacity-60"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={saveFitness}
                disabled={!fitnessDirty || fitnessSaving}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand text-base font-bold text-on-brand disabled:opacity-50"
              >
                {fitnessSaving && <Spinner className="h-4 w-4" />}
                Save and update plan
              </button>
            </div>
          </div>
        )}

        {sheet === 'plan' && (
          <div className="flex flex-col gap-4 pb-4">
            <div>
              <h2 className="text-lg font-bold text-fg">Your plan</h2>
              <p className="mt-0.5 text-subhead text-muted">
                Daily targets your coach set from your body and goals.
              </p>
            </div>
            <PlanTargets fitness={fitness} />
            {fitness.aiCoachAdvice && (
              <p className="text-subhead leading-relaxed text-fg-2">
                <span className="font-bold text-brand-ink">Coach:</span> {fitness.aiCoachAdvice}
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                setSheet(null);
                onConsult();
              }}
              disabled={!canConsult}
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl text-base font-bold disabled:opacity-60 ${
                highlightConsult
                  ? 'bg-brand text-on-brand'
                  : 'border border-line-strong bg-surface-2 text-fg'
              }`}
            >
              <SparklesIcon className="h-5 w-5" />
              Run AI Consult
            </button>
            <Link
              href="/fitness"
              className="inline-flex h-12 items-center justify-center rounded-xl text-base font-bold text-fg-2"
            >
              Open Fitness Hub
            </Link>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
