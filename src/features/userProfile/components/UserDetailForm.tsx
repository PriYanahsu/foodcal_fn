'use client';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import ChoiceChips from './ChoiceChips';
import ProfileField from './ProfileField';
import { GENDERS } from '../utils/Constants';
import { UserDetailFormProps } from '../type';

export default function UserDetailForm({
  profile,
  isEditing,
  saving,
  onChange,
  onStartEdit,
  onCancel,
  onSave,
}: UserDetailFormProps) {
  return (
    <Card className="p-4 sm:p-6 md:p-8 bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl">
      <div className="flex items-start justify-between gap-3 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-xl font-bold flex items-center gap-2">
          <span className="w-1 h-5 sm:h-6 bg-[var(--primary)] rounded-full" />
          Account Details
        </h3>
        {isEditing ? (
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" onClick={onSave} disabled={saving} isLoading={saving}>
              {saving ? 'Updating...' : 'Update'}
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onStartEdit}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3 sm:space-y-5">
          <div className="grid grid-cols-2 gap-2 sm:gap-5">
            <div className="col-span-2 sm:col-span-1">
              <Input
                label="Full Name"
                value={profile.fullName}
                onChange={(e) => onChange({ fullName: e.target.value })}
                placeholder="Enter your full name"
                autoFocus
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Input label="Email" value={profile.email} disabled className="opacity-60" />
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-[var(--text-muted)]">
            email can&apos;t be changed here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <ProfileField
            label="Full Name"
            value={profile.fullName}
            className="col-span-2 sm:col-span-1"
          />
          <ProfileField
            label="Email"
            value={profile.email}
            hint="Cannot be changed"
            className="col-span-2 sm:col-span-1"
          />
        </div>
      )}
    </Card>
  );
}
