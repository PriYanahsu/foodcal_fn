'use client';

import Link from 'next/link';
import {
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { ThemeSegmented } from '@/components/ui/ThemeSegmented';
import { Toggle } from '@/components/ui/Toggle';
import { usePushState } from '@/features/notifications/components/PushToggleRow';
import { getInitials } from '@/features/userProfile/utils/helper';
import type { ProfileData } from '@/features/userProfile';
import { isFeatureEnabled } from '@/config';
import type { SettingLink } from '../types';

/** Phones: every setting on one screen — no page scroll. */
export default function MobileSettings({
  profile,
  links,
  onBack,
  onSignOut,
  onDelete,
}: {
  profile: ProfileData;
  links: SettingLink[];
  onBack: () => void;
  onSignOut: () => void;
  onDelete: () => void;
}) {
  const { enabled, blocked, configured, isSubscribing, setEnabled, state } = usePushState();

  return (
    <div className="flex h-[calc(100dvh-4rem-68px-2.25rem-env(safe-area-inset-bottom))] min-h-[440px] flex-col gap-3 px-4 py-3 font-ui text-fg short:gap-2 short:py-2.5">
      <header className="flex shrink-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate font-display text-[22px] font-bold leading-tight tracking-[-0.02em]">
            Settings
          </h1>
          <p className="truncate text-caption text-muted">Account, look and notifications.</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line-strong bg-surface-2 text-fg-2 transition-transform active:scale-95"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
      </header>

      {isFeatureEnabled('profile') && (
        <Link
          href="/profile"
          className="flex shrink-0 items-center gap-3 rounded-2xl border border-line bg-surface-1 p-3 transition-transform active:scale-[0.98]"
        >
          {profile.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={profile.avatar_url}
              alt=""
              referrerPolicy="no-referrer"
              className="h-11 w-11 shrink-0 rounded-full border-2 border-line object-cover"
            />
          ) : (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-on-brand">
              {getInitials(profile.fullName, profile.email) || '?'}
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold">
              {profile.fullName || 'Your name'}
            </span>
            <span className="block truncate text-caption text-muted">
              {profile.email || 'Edit your profile'}
            </span>
          </span>
          <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted" />
        </Link>
      )}

      <div className="flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-line bg-surface-1 px-4 py-3 short:py-2.5">
        <span className="shrink-0 text-sm font-bold">Theme</span>
        <div className="w-44 shrink-0">
          <ThemeSegmented compact />
        </div>
      </div>

      {isFeatureEnabled('notifications') && (
        <div className="flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-line bg-surface-1 px-4 py-3 short:py-2.5">
          <span className="min-w-0">
            <span className="block text-sm font-bold">Push notifications</span>
            <span className="block truncate text-caption text-muted">{state}</span>
          </span>
          <Toggle
            label="Push notifications"
            checked={enabled}
            busy={isSubscribing}
            disabled={blocked || !configured}
            onChange={setEnabled}
          />
        </div>
      )}

      <nav className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-surface-1">
        {links.map(({ label, description, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex min-h-0 flex-1 items-center gap-3 border-b border-line px-4 transition-colors last:border-0 active:bg-surface-2"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-fg-2">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">{label}</span>
              <span className="block truncate text-caption text-muted short:hidden">
                {description}
              </span>
            </span>
            <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted" />
          </Link>
        ))}
      </nav>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onSignOut}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-line-strong bg-surface-2 text-sm font-bold text-fg transition-transform active:scale-95 short:h-11"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Log out
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-danger/40 text-sm font-bold text-danger transition-transform active:scale-95 short:h-11"
        >
          <TrashIcon className="h-5 w-5" />
          Delete
        </button>
      </div>
    </div>
  );
}
