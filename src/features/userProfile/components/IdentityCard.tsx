'use client';

import { Spinner } from '@/components/ui/fc';
import AvatarUpload from './AvatarUpload';
import { getInitials } from '../utils/helper';
import { IdentityCardProps } from '../type';

export default function IdentityCard({
  uid,
  profile,
  isEditing,
  saving,
  completion,
  onChange,
  onStartEdit,
  onCancel,
  onSave,
  onAvatarUpload,
}: IdentityCardProps) {
  return (
    <section className="flex items-center gap-4 rounded-3xl border border-line bg-surface-1 p-5">
      <AvatarUpload
        uid={uid}
        url={profile.avatar_url ?? null}
        isEditing
        onUpload={onAvatarUpload}
        initials={getInitials(profile.fullName, profile.email)}
        inputId="profile-photo-card"
        size={72}
      />

      <div className="min-w-0 flex-1">
        {isEditing ? (
          <input
            value={profile.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="Your name"
            autoFocus
            className="h-11 w-full max-w-xs rounded-xl border border-line bg-surface-2 px-3 text-base text-fg outline-none focus:border-brand"
          />
        ) : (
          <h2 className="truncate font-display text-title font-bold tracking-[-0.02em] text-fg">
            {profile.fullName || 'Your name'}
          </h2>
        )}
        <p className="mt-0.5 truncate text-subhead text-muted">{profile.email || '—'}</p>
      </div>

      <div className="hidden w-40 shrink-0 flex-col gap-1.5 lg:flex">
        <div className="flex items-baseline justify-between text-caption">
          <span className="text-muted">Profile complete</span>
          <span className="font-bold text-brand-ink">{completion}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full rounded-full bg-brand transition-all duration-700"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="h-10 rounded-xl px-4 text-sm font-bold text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-60"
            >
              {saving && <Spinner className="h-4 w-4" />}
              Save
            </button>
          </>
        ) : (
          <>
            <label
              htmlFor="profile-photo-card"
              className="inline-flex h-10 cursor-pointer items-center rounded-xl border border-line-strong bg-surface-2 px-4 text-sm font-bold text-fg transition-colors hover:bg-surface-3"
            >
              Change photo
            </label>
            <button
              type="button"
              onClick={onStartEdit}
              className="inline-flex h-10 items-center rounded-xl border border-line-strong bg-surface-2 px-4 text-sm font-bold text-fg transition-colors hover:bg-surface-3"
            >
              Edit name
            </button>
          </>
        )}
      </div>
    </section>
  );
}
