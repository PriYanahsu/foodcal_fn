'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import AvatarUpload from '@/features/userProfile/components/AvatarUpload';
import { ProfileData } from '../type';
import Link from 'next/link';
import {
  SparklesIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  XMarkIcon,
  ScaleIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { calculateProfileCompletion } from '@/utils/profileCompletion';
import FitnessSetupWizard from '@/features/fitnessProfile/components/setup/FitnessSetupWizard';

export const dynamic = 'force-dynamic';

const GENDERS = ['Male', 'Female', 'Other'] as const;
const GOALS = ['Lose Weight', 'Maintain Weight', 'Gain Muscle'] as const;
const ACTIVITY_LEVELS = [
  'Sedentary',
  'Lightly Active',
  'Moderately Active',
  'Very Active',
] as const;

const ACTIVITY_HINTS: Record<string, string> = {
  Sedentary: 'Little or no exercise',
  'Lightly Active': '1–3 days/week',
  'Moderately Active': '3–5 days/week',
  'Very Active': '6–7 days/week',
};

const MISSING_FIELD_LABELS: Partial<Record<keyof ProfileData, string>> = {
  full_name: 'Full name',
  avatar_url: 'Profile photo',
  gender: 'Gender',
  age: 'Age',
  height: 'Height',
  weight: 'Weight',
  activity_level: 'Activity level',
  goal: 'Fitness goal',
  target_weight: 'Target weight',
  target_date: 'Target date',
};

const selectClass =
  'w-full px-2.5 py-1.5 sm:px-4 sm:py-2.5 text-xs sm:text-base bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] appearance-none';

function getMissingFields(profile: ProfileData): string[] {
  const checks: [keyof ProfileData, unknown][] = [
    ['full_name', profile.full_name],
    ['avatar_url', profile.avatar_url],
    ['gender', profile.gender],
    ['age', profile.age],
    ['height', profile.height],
    ['weight', profile.weight],
    ['activity_level', profile.activity_level],
    ['goal', profile.goal],
    ['target_weight', profile.target_weight],
    ['target_date', profile.target_date],
  ];

  return checks
    .filter(([, value]) => value === null || value === undefined || value === '')
    .map(([key]) => MISSING_FIELD_LABELS[key] ?? key);
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ProfileField({
  label,
  value,
  hint,
  className = '',
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl bg-[var(--input-bg)]/50 border border-[var(--card-border)] px-2.5 py-2 sm:px-4 sm:py-3 min-w-0 ${className}`}
    >
      <p className="text-[9px] sm:text-xs uppercase tracking-wider text-[var(--text-muted)] mb-0.5 sm:mb-1">
        {label}
      </p>
      <p className="text-xs sm:text-base font-medium text-[var(--foreground)] break-words leading-snug">
        {value || '—'}
      </p>
      {hint && (
        <p className="text-[9px] sm:text-xs text-[var(--text-muted)] mt-0.5 sm:mt-1">{hint}</p>
      )}
    </div>
  );
}

function ChoiceChips({
  options,
  value,
  onChange,
  accent = 'primary',
}: {
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
  accent?: 'primary' | 'accent';
}) {
  const activeBorder =
    accent === 'accent' ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-[var(--primary)] bg-[var(--primary)]/10';

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {options.map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border sm:border-2 text-[11px] sm:text-sm transition-all ${
              selected
                ? `${activeBorder} text-white`
                : 'border-[var(--card-border)] text-[var(--text-muted)] hover:border-white/30 hover:text-white'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function parseOptionalNumber(value: string): number | '' {
  if (value === '') return '';
  const n = Number(value);
  return Number.isFinite(n) ? n : '';
}

function deriveGoal(weight: number | '', targetWeight: number | null | undefined): string | null {
  if (weight === '' || !targetWeight) return null;
  if (weight > targetWeight) return 'Lose Weight';
  if (weight < targetWeight) return 'Gain Muscle';
  return 'Maintain Weight';
}

export default function UserProfile() {
  const supabase = createClient();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [savedProfile, setSavedProfile] = useState<ProfileData | null>(null);
  const [profile, setProfile] = useState<ProfileData>({
    username: '',
    full_name: '',
    email: '',
    gender: '',
    age: '',
    height: '',
    weight: '',
    activity_level: '',
    goal: '',
    avatar_url: null,
    target_weight: null,
    target_date: null,
  });
  const [showReminder, setShowReminder] = useState(false);
  const [showConsult, setShowConsult] = useState(false);
  const [offerConsult, setOfferConsult] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const applyProfileData = (data: Record<string, unknown>) => {
    const next: ProfileData = {
      username: (data.username as string) || '',
      full_name: (data.full_name as string) || '',
      email: user?.email || '',
      gender: (data.gender as string) || '',
      age: data.age != null && data.age !== '' ? Number(data.age) : '',
      height: data.height != null && data.height !== '' ? Number(data.height) : '',
      weight: data.weight != null && data.weight !== '' ? Number(data.weight) : '',
      activity_level: (data.activity_level as string) || '',
      goal: (data.goal as string) || '',
      avatar_url: (data.avatar_url as string | null) ?? null,
      target_weight: (data.target_weight as number | null) ?? null,
      target_date: (data.target_date as string | null) ?? null,
    };
    setProfile(next);
    setSavedProfile(next);
    return next;
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        applyProfileData(data);

        const completion = calculateProfileCompletion(data);
        if (completion < 100) {
          setShowReminder(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const completionPercentage = calculateProfileCompletion(profile);
  const missingFields = getMissingFields(profile);

  const startEditing = () => {
    setFeedback(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (savedProfile) setProfile(savedProfile);
    setFeedback(null);
    setIsEditing(false);
  };

  const handleUpdate = async () => {
    if (!profile.full_name.trim()) {
      setFeedback({ type: 'error', message: 'Please enter your full name.' });
      return;
    }

    try {
      setSaving(true);
      setFeedback(null);

      const age = profile.age === '' ? null : Number(profile.age);
      const height = profile.height === '' ? null : Number(profile.height);
      const weight = profile.weight === '' ? null : Number(profile.weight);
      const targetWeight =
        profile.target_weight === null || profile.target_weight === undefined
          ? null
          : Number(profile.target_weight);

      const updates = {
        updated_at: new Date().toISOString(),
        full_name: profile.full_name.trim(),
        gender: profile.gender || null,
        age,
        height,
        weight,
        activity_level: profile.activity_level || null,
        goal: profile.goal || null,
        avatar_url: profile.avatar_url,
        target_weight: targetWeight,
        target_date: profile.target_date || null,
      };

      const { error } = await supabase.from('profiles').update(updates).eq('id', user?.id);

      if (error) throw error;

      const updatedProfile: ProfileData = {
        ...profile,
        full_name: profile.full_name.trim(),
        gender: profile.gender,
        age: age ?? '',
        height: height ?? '',
        weight: weight ?? '',
        activity_level: profile.activity_level,
        goal: profile.goal,
        avatar_url: profile.avatar_url,
        target_weight: targetWeight,
        target_date: profile.target_date || null,
      };
      setProfile(updatedProfile);
      setSavedProfile(updatedProfile);
      setIsEditing(false);
      setOfferConsult(true);
      setFeedback({
        type: 'success',
        message: 'Profile saved. Run AI Consult to refresh your calorie plan.',
      });

      const newCompletion = calculateProfileCompletion(updatedProfile);
      if (newCompletion === 100) setShowReminder(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setFeedback({ type: 'error', message: 'Failed to save profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="page-container max-w-5xl pb-28 md:pb-8">
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
                {!isEditing && (
                  <Button size="sm" onClick={startEditing} className="shrink-0 hidden sm:inline-flex">
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

          {isEditing && (
            <motion.div
              key="editing-bar"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/25">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-white min-w-0">
                  <PencilSquareIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)] shrink-0" />
                  <span className="truncate">Editing — tap Save when done</span>
                </div>
                <button
                  onClick={cancelEditing}
                  className="text-xs sm:text-sm text-[var(--text-muted)] hover:text-white transition-colors shrink-0"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Row 1: Avatar + name */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative z-10 shrink-0">
              <AvatarUpload
                uid={user?.id || ''}
                url={profile.avatar_url ?? null}
                isEditing
                onUpload={(url) => {
                  const newProfile = { ...profile, avatar_url: url };
                  setProfile(newProfile);
                  setSavedProfile((prev) => (prev ? { ...prev, avatar_url: url } : newProfile));
                  supabase.from('profiles').update({ avatar_url: url }).eq('id', user?.id).then();
                  if (calculateProfileCompletion(newProfile) === 100) setShowReminder(false);
                  setFeedback({ type: 'success', message: 'Profile photo updated.' });
                }}
                size={typeof window !== 'undefined' && window.innerWidth < 640 ? 96 : 150}
              />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-3xl font-bold text-white truncate leading-tight">
                {profile.full_name || 'Your Name'}
              </h1>
              <p className="text-xs sm:text-base text-[var(--text-muted)] truncate mt-0.5">@{profile.username || 'username'}</p>
              <p className="text-xs sm:text-base text-[var(--text-muted)] truncate">{profile.email}</p>
            </div>

            {/* Buttons inline on desktop */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              {!isEditing ? (
                <Button onClick={startEditing} className="btn-primary !px-3 !py-2 text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <PencilSquareIcon className="w-3.5 h-3.5" />
                    Edit
                  </span>
                </Button>
              ) : (
                <Button onClick={handleUpdate} disabled={saving} isLoading={saving} className="btn-primary !px-3 !py-2 text-sm">
                  {saving ? '...' : 'Save'}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={async () => { await logout(); window.location.href = '/login'; }}
                className="!px-3 !py-2 text-sm text-red-400 border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-red-500/10 whitespace-nowrap"
              >
                Sign Out
              </Button>
            </div>
          </div>

          {/* Row 2: Buttons on mobile only */}
          <div className="flex sm:hidden items-center gap-2">
            {!isEditing ? (
              <Button onClick={startEditing} className="btn-primary flex-1 py-2 text-sm">
                <span className="inline-flex items-center justify-center gap-1.5">
                  <PencilSquareIcon className="w-4 h-4" />
                  Edit Profile
                </span>
              </Button>
            ) : (
              <Button onClick={handleUpdate} disabled={saving} isLoading={saving} className="btn-primary flex-1 py-2 text-sm">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={async () => { await logout(); window.location.href = '/login'; }}
              className="flex-1 py-2 text-sm text-red-400 border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-red-500/10 whitespace-nowrap"
            >
              Sign Out
            </Button>
          </div>
        </div>

        <div className="flex gap-1.5 sm:gap-3 mb-6 sm:mb-8">
          {[
            { label: 'Age', value: profile.age, unit: 'yrs', wide: false },
            { label: 'Height', value: profile.height, unit: 'cm', wide: false },
            { label: 'Weight', value: profile.weight, unit: 'kg', wide: false },
            { label: 'Goal', value: profile.goal, unit: '', wide: true },
          ].map(({ label, value, unit, wide }) => {
            const shortGoal =
              value === 'Lose Weight'
                ? 'Lose'
                : value === 'Maintain Weight'
                  ? 'Maintain'
                  : value === 'Gain Muscle'
                    ? 'Gain'
                    : value;

            return (
              <button
                key={label}
                type="button"
                onClick={() => !isEditing && startEditing()}
                className={`text-left min-w-0 ${wide ? 'flex-[1.4]' : 'flex-1'}`}
                title={String(value || 'Tap to edit')}
              >
                <Card className="px-1.5 py-2 sm:p-4 bg-[var(--card-bg)] border border-[var(--card-border)] text-center shadow-lg h-full hover:border-[var(--primary)]/40 transition-colors">
                  <p className="text-[var(--text-muted)] text-[9px] sm:text-xs uppercase tracking-wider mb-0.5 sm:mb-1">
                    {label}
                  </p>
                  <p
                    className={`font-bold text-[var(--foreground)] leading-tight ${
                      wide
                        ? 'text-[11px] sm:text-lg'
                        : 'text-xs sm:text-xl truncate'
                    }`}
                  >
                    {wide ? (
                      <>
                        <span className="sm:hidden">{shortGoal || '—'}</span>
                        <span className="hidden sm:inline">{value || '—'}</span>
                      </>
                    ) : (
                      <>
                        {value || '—'}
                        {value && unit && (
                          <span className="text-[9px] sm:text-sm text-[var(--text-muted)] font-normal ml-0.5 sm:ml-1">
                            {unit}
                          </span>
                        )}
                      </>
                    )}
                  </p>
                </Card>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-4 sm:p-6 md:p-8 bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl">
              <h3 className="text-base sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                <span className="w-1 h-5 sm:h-6 bg-[var(--primary)] rounded-full" />
                Account Details
              </h3>

              {isEditing ? (
                <div className="space-y-3 sm:space-y-5">
                  <div className="grid grid-cols-2 gap-2 sm:gap-5">
                    <div className="col-span-2 sm:col-span-1">
                      <Input
                        label="Full Name"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        placeholder="Enter your full name"
                        autoFocus
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1 sm:mb-2">
                        Gender
                      </label>
                      <ChoiceChips
                        options={GENDERS}
                        value={profile.gender}
                        onChange={(gender) => setProfile({ ...profile, gender })}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Input
                        label="Username"
                        value={profile.username}
                        disabled
                        className="opacity-60"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Input label="Email" value={profile.email} disabled className="opacity-60" />
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs text-[var(--text-muted)]">
                    Username and email can&apos;t be changed here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <ProfileField
                    label="Full Name"
                    value={profile.full_name}
                    className="col-span-2 sm:col-span-1"
                  />
                  <ProfileField label="Gender" value={profile.gender} />
                  <ProfileField
                    label="Username"
                    value={profile.username ? `@${profile.username}` : ''}
                    hint="Cannot be changed"
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

            <Card className="p-4 sm:p-6 md:p-8 bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl">
              <div className="flex items-start justify-between gap-3 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-xl font-bold flex items-center gap-2">
                  <span className="w-1 h-5 sm:h-6 bg-[var(--primary)] rounded-full" />
                  <ScaleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
                  Body Metrics
                </h3>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={startEditing}
                    className="text-sm text-[var(--primary)] hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3 sm:space-y-5">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <Input
                      label="Age"
                      type="number"
                      min={1}
                      max={120}
                      value={profile.age}
                      onChange={(e) =>
                        setProfile({ ...profile, age: parseOptionalNumber(e.target.value) })
                      }
                      placeholder="e.g. 28"
                    />
                    <Input
                      label="Height (cm)"
                      type="number"
                      min={50}
                      max={300}
                      value={profile.height}
                      onChange={(e) =>
                        setProfile({ ...profile, height: parseOptionalNumber(e.target.value) })
                      }
                      placeholder="e.g. 175"
                    />
                    <Input
                      label="Weight (kg)"
                      type="number"
                      min={20}
                      max={400}
                      step="0.1"
                      value={profile.weight}
                      onChange={(e) => {
                        const w = parseOptionalNumber(e.target.value);
                        const derived = deriveGoal(w, profile.target_weight);
                        setProfile({ ...profile, weight: w, ...(derived ? { goal: derived } : {}) });
                      }}
                      placeholder="e.g. 70"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-1.5 sm:mb-2">
                      Activity Level
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      {ACTIVITY_LEVELS.map((level) => {
                        const selected = profile.activity_level === level;
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setProfile({ ...profile, activity_level: level })}
                            className={`text-left px-2.5 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border sm:border-2 transition-all ${
                              selected
                                ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                                : 'border-[var(--card-border)] hover:border-white/30'
                            }`}
                          >
                            <p
                              className={`text-[11px] sm:text-sm font-semibold leading-tight ${selected ? 'text-white' : 'text-[var(--foreground)]'}`}
                            >
                              {level}
                            </p>
                            <p className="text-[9px] sm:text-xs text-[var(--text-muted)] mt-0.5 leading-tight">
                              {ACTIVITY_HINTS[level]}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <ProfileField
                    label="Age"
                    value={profile.age !== '' ? `${profile.age} years` : ''}
                  />
                  <ProfileField
                    label="Height"
                    value={profile.height !== '' ? `${profile.height} cm` : ''}
                  />
                  <ProfileField
                    label="Weight"
                    value={profile.weight !== '' ? `${profile.weight} kg` : ''}
                  />
                  <ProfileField
                    label="Activity Level"
                    value={profile.activity_level}
                    hint={
                      profile.activity_level
                        ? ACTIVITY_HINTS[profile.activity_level]
                        : 'Helps calculate calorie needs'
                    }
                  />
                </div>
              )}
            </Card>

            <Card className="p-4 sm:p-6 md:p-8 bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl">
              <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-xl font-bold flex items-center gap-2 whitespace-nowrap">
                  <span className="w-1 h-5 sm:h-6 bg-[var(--primary)] rounded-full shrink-0" />
                  <FireIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)] shrink-0" />
                  Fitness Goals
                </h3>
                {!isEditing && (
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={startEditing}
                      className="text-sm text-[var(--primary)] hover:underline"
                    >
                      Edit
                    </button>
                    {user && (
                      <button
                        type="button"
                        onClick={() => setShowConsult(true)}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg bg-[var(--primary)] text-black shadow-[0_0_14px_rgba(0,255,136,0.3)] hover:opacity-90 active:scale-[0.98] transition-all"
                      >
                        <SparklesIcon className="w-3.5 h-3.5" />
                        Consult
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3 sm:space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)]">
                        Objective
                      </label>
                      {deriveGoal(profile.weight, profile.target_weight ?? null) && (
                        <span className="text-[9px] sm:text-[10px] text-[var(--primary)] font-semibold">
                          Auto-set from weight vs target
                        </span>
                      )}
                    </div>
                    <ChoiceChips
                      options={GOALS}
                      value={profile.goal}
                      onChange={(goal) => setProfile({ ...profile, goal })}
                      accent="accent"
                    />
                    {deriveGoal(profile.weight, profile.target_weight ?? null) && (
                      <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-1 sm:mt-1.5">
                        Current <span className="text-white font-medium">{profile.weight} kg</span> → Target{' '}
                        <span className="text-white font-medium">{profile.target_weight} kg</span> — goal auto-corrected to{' '}
                        <span className="text-[var(--primary)] font-semibold">{profile.goal}</span>
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <Input
                      label="Target Weight (kg)"
                      type="number"
                      min={20}
                      max={400}
                      step="0.1"
                      value={profile.target_weight ?? ''}
                      onChange={(e) => {
                        const next = parseOptionalNumber(e.target.value);
                        const tw = next === '' ? null : (next as number);
                        const derived = deriveGoal(profile.weight, tw);
                        setProfile({
                          ...profile,
                          target_weight: tw,
                          ...(derived ? { goal: derived } : {}),
                        });
                      }}
                      placeholder="e.g. 65"
                    />
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[var(--foreground)] mb-0.5 sm:mb-1">
                        Target Date
                      </label>
                      <input
                        type="date"
                        value={profile.target_date ?? ''}
                        onChange={(e) =>
                          setProfile({ ...profile, target_date: e.target.value || null })
                        }
                        className={selectClass}
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <ProfileField
                    label="Objective"
                    value={profile.goal}
                    className="col-span-2 sm:col-span-1"
                  />
                  <ProfileField
                    label="Target Weight"
                    value={
                      profile.target_weight != null ? `${profile.target_weight} kg` : ''
                    }
                  />
                  <ProfileField
                    label="Target Date"
                    value={formatDate(profile.target_date)}
                  />
                </div>
              )}

              {isEditing && (
                <div className="hidden md:flex gap-3 pt-6">
                  <Button onClick={handleUpdate} disabled={saving} isLoading={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={cancelEditing} disabled={saving}>
                    Cancel
                  </Button>
                </div>
              )}

              {offerConsult && !isEditing && user && (
                <div className="mt-5 p-3.5 rounded-xl border border-[var(--primary)]/25 bg-[var(--primary)]/8 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">Goals saved</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Run AI Consult here — no need to open Fitness Hub.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowConsult(true)}
                    className="w-full sm:w-auto shrink-0 shadow-[0_0_16px_rgba(118,185,0,0.3)]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <SparklesIcon className="w-4 h-4" />
                      Consult AI Plan
                    </span>
                  </Button>
                </div>
              )}
            </Card>

            <Card className="p-5 bg-gradient-to-br from-[var(--primary)]/10 via-[var(--card-bg)] to-transparent border border-[var(--primary)]/20 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] shrink-0">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold">Need AI calorie targets?</h3>
                  <p className="text-[var(--text-muted)] text-sm mt-0.5">
                    Consult from profile to regenerate macros & coach advice without leaving this page.
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
                    {!isEditing && (
                      <Button size="sm" onClick={startEditing} className="w-full mt-3">
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
                Update weight or goals here, then hit <span className="text-[var(--primary)] font-semibold">Consult</span> to refresh AI macros without leaving Profile.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-[var(--card-border)] bg-[var(--card-bg)]/95 backdrop-blur-md p-4">
          <div className="flex gap-3 max-w-5xl mx-auto">
            <Button
              variant="outline"
              onClick={cancelEditing}
              disabled={saving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={saving} isLoading={saving} className="flex-1">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      )}

      {showConsult && user && (
        <FitnessSetupWizard
          userId={user.id}
          onCancel={() => setShowConsult(false)}
          onComplete={() => {
            setShowConsult(false);
            setOfferConsult(false);
            fetchProfile();
          }}
        />
      )}
    </div>
  );
}
