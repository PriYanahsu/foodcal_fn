'use client';

import Link from 'next/link';
import {
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { ThemeSegmented } from '@/components/ui/ThemeSegmented';
import { PHONE_QUERY, useMediaQuery } from '@/hooks/useMediaQuery';
import { PushRow, usePushState } from '@/features/notifications/components/PushToggleRow';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useUserProfile } from '@/features/userProfile';
import { getInitials } from '@/features/userProfile/utils/helper';
import { isFeatureEnabled } from '@/config';
import { useSettings } from '../hooks/useSettings';
import { SETTING_LINKS } from '../utils/constants';
import DeleteAccountDialog from './DeleteAccountDialog';
import MobileSettings from './MobileSettings';

export default function SettingsClient() {
  const {
    router,
    showDeleteConfirm,
    confirmText,
    setConfirmText,
    isDeleting,
    error,
    canConfirmDelete,
    openDeleteConfirm,
    closeDeleteConfirm,
    handleDeleteAccount,
  } = useSettings();
  const { logout } = useAuth();
  const isPhone = useMediaQuery(PHONE_QUERY);
  const { profile } = useUserProfile();
  const { enabled: pushEnabled, sendTestPush } = usePushState();

  const links = SETTING_LINKS.filter((item) => item.show !== false && item.href !== '/profile');

  const signOut = async () => {
    await logout();
    window.location.href = '/login';
  };

  const dialog = (
    <DeleteAccountDialog
      open={showDeleteConfirm}
      confirmText={confirmText}
      onConfirmTextChange={setConfirmText}
      isDeleting={isDeleting}
      canConfirm={canConfirmDelete}
      error={error}
      onClose={closeDeleteConfirm}
      onConfirm={handleDeleteAccount}
    />
  );

  if (isPhone) {
    return (
      <div className="bg-canvas">
        <MobileSettings
          profile={profile}
          links={links}
          onBack={() => router.back()}
          onSignOut={signOut}
          onDelete={openDeleteConfirm}
        />
        {dialog}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-4 bg-canvas px-4 py-4 pb-8 font-ui text-fg md:gap-5 md:px-8 md:py-8">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-large-title font-bold tracking-[-0.02em] text-fg">
            Settings
          </h1>
          <p className="mt-1 text-subhead text-muted">Your account, look and notifications.</p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="group inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-line-strong bg-surface-2 px-4 text-sm font-bold text-fg-2 transition-colors hover:text-fg"
        >
          <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back
        </button>
      </header>

      <div className="grid gap-4 md:grid-cols-2 md:items-start md:gap-5">
        <div className="flex flex-col gap-4 md:gap-5">
          {isFeatureEnabled('profile') && (
            <Link
              href="/profile"
              className="flex items-center gap-3.5 rounded-3xl border border-line bg-surface-1 p-4 transition-colors hover:border-line-strong"
            >
              {profile.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={profile.avatar_url}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-14 w-14 shrink-0 rounded-full border-2 border-line object-cover"
                />
              ) : (
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-on-brand">
                  {getInitials(profile.fullName, profile.email) || '?'}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[19px] font-bold leading-tight tracking-[-0.02em]">
                  {profile.fullName || 'Your name'}
                </span>
                <span className="block truncate text-caption text-muted">
                  {profile.email || 'Edit your profile'}
                </span>
              </span>
              <ChevronRightIcon className="h-5 w-5 shrink-0 text-muted" />
            </Link>
          )}

          <section className="flex flex-col gap-3 rounded-3xl border border-line bg-surface-1 p-5">
            <div>
              <h2 className="text-lg font-bold text-fg">Appearance</h2>
              <p className="mt-0.5 text-subhead text-muted">
                Applies across FoodCal on this device.
              </p>
            </div>
            <ThemeSegmented />
          </section>

          {isFeatureEnabled('notifications') && (
            <section className="flex flex-col gap-3 rounded-3xl border border-line bg-surface-1 p-5">
              <div>
                <h2 className="text-lg font-bold text-fg">Notifications</h2>
                <p className="mt-0.5 text-subhead text-muted">
                  Meal and goal nudges from your coach.
                </p>
              </div>
              <PushRow />
              {pushEnabled && (
                <button
                  type="button"
                  onClick={() => void sendTestPush()}
                  className="h-10 self-start rounded-xl border border-line-strong bg-surface-2 px-4 text-sm font-bold text-fg transition-colors hover:bg-surface-3"
                >
                  Send test notification
                </button>
              )}
            </section>
          )}
        </div>

        <div className="flex flex-col gap-4 md:gap-5">
          <section className="overflow-hidden rounded-3xl border border-line bg-surface-1">
            {links.map(({ label, description, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3.5 border-b border-line p-4 transition-colors last:border-0 hover:bg-surface-2"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-fg-2">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-fg">{label}</span>
                  <span className="block truncate text-caption text-muted">{description}</span>
                </span>
                <ChevronRightIcon className="h-5 w-5 shrink-0 text-muted" />
              </Link>
            ))}
          </section>

          <section className="flex flex-col gap-3 rounded-3xl border border-line bg-surface-1 p-5">
            <div>
              <h2 className="text-lg font-bold text-fg">Account</h2>
              <p className="mt-0.5 text-subhead text-muted">
                Deleting removes all meals, plans and photos. This can&apos;t be undone.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={signOut}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-line-strong bg-surface-2 text-base font-bold text-fg transition-colors hover:bg-surface-3"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                Log out
              </button>
              <button
                type="button"
                onClick={openDeleteConfirm}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-danger/40 text-base font-bold text-danger transition-colors hover:bg-danger/10"
              >
                <TrashIcon className="h-5 w-5" />
                Delete account
              </button>
            </div>
          </section>
        </div>
      </div>

      {dialog}
    </div>
  );
}
