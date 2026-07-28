'use client';

import React, { useEffect, useState } from 'react';
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
  'w-full px-4 py-2.5 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] appearance-none';

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
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl bg-[var(--input-bg)]/50 border border-[var(--card-border)] px-4 py-3">
      <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">{label}</p>
      <p className="text-base font-medium text-[var(--foreground)] break-words">{value || '—'}</p>
      {hint && <p className="text-xs text-[var(--text-muted)] mt-1">{hint}</p>}
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
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`px-3 py-2 rounded-xl border-2 text-sm transition-all ${
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
      setFeedback({ type: 'success', message: 'Profile saved successfully.' });

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
      <div className="px-4 md:px-8">
        {showReminder && (
          <div className="mb-6 animate-slide-up">
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
          </div>
        )}

        {feedback && (
          <div
            className={`mb-6 p-4 rounded-xl border text-sm font-medium ${
              feedback.type === 'success'
                ? 'bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {isEditing && (
          <div className="mb-6 flex items-center justify-between gap-3 p-4 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/25">
            <div className="flex items-center gap-2 text-sm text-white">
              <PencilSquareIcon className="w-5 h-5 text-[var(--primary)] shrink-0" />
              <span>Editing — tap Save when you&apos;re done. Cancel discards changes.</span>
            </div>
            <button
              onClick={cancelEditing}
              className="text-sm text-[var(--text-muted)] hover:text-white transition-colors shrink-0"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="relative mb-8 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="relative z-10">
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
              size={120}
            />
            <p className="text-center text-xs text-[var(--text-muted)] mt-2">
              Tap camera to change photo
            </p>
          </div>

          <div className="flex-1 text-center md:text-left space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {profile.full_name || 'Your Name'}
            </h1>
            <p className="text-[var(--text-muted)]">@{profile.username || 'username'}</p>
            <p className="text-sm text-[var(--text-muted)]">{profile.email}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {!isEditing ? (
              <Button onClick={startEditing} className="btn-primary flex-1 md:flex-none">
                <span className="inline-flex items-center gap-2">
                  <PencilSquareIcon className="w-4 h-4" />
                  Edit Profile
                </span>
              </Button>
            ) : (
              <Button
                onClick={handleUpdate}
                disabled={saving}
                isLoading={saving}
                className="btn-primary flex-1 md:flex-none"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={async () => {
                await logout();
                window.location.href = '/login';
              }}
              className="flex-1 md:flex-none text-red-400 border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-red-500/10"
            >
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Age', value: profile.age, unit: 'yrs' },
            { label: 'Height', value: profile.height, unit: 'cm' },
            { label: 'Weight', value: profile.weight, unit: 'kg' },
            { label: 'Goal', value: profile.goal, unit: '' },
          ].map(({ label, value, unit }) => (
            <button
              key={label}
              type="button"
              onClick={() => !isEditing && startEditing()}
              className="text-left"
              title={!isEditing ? 'Tap to edit' : undefined}
            >
              <Card className="p-4 bg-[var(--card-bg)] border border-[var(--card-border)] text-center shadow-lg h-full hover:border-[var(--primary)]/40 transition-colors">
                <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">
                  {label}
                </p>
                <p className="text-xl font-bold text-[var(--foreground)] truncate">
                  {value || '—'}
                  {value && unit && (
                    <span className="text-sm text-[var(--text-muted)] font-normal ml-1">{unit}</span>
                  )}
                </p>
              </Card>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 md:p-8 bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-[var(--primary)] rounded-full" />
                Account Details
              </h3>

              {isEditing ? (
                <div className="space-y-5">
                  <Input
                    label="Full Name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="Enter your full name"
                    autoFocus
                  />

                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Gender
                    </label>
                    <ChoiceChips
                      options={GENDERS}
                      value={profile.gender}
                      onChange={(gender) => setProfile({ ...profile, gender })}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <Input
                      label="Username"
                      value={profile.username}
                      disabled
                      className="opacity-60"
                    />
                    <Input label="Email" value={profile.email} disabled className="opacity-60" />
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Username and email can&apos;t be changed here.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <ProfileField label="Full Name" value={profile.full_name} />
                  <ProfileField label="Gender" value={profile.gender} />
                  <ProfileField
                    label="Username"
                    value={profile.username ? `@${profile.username}` : ''}
                    hint="Cannot be changed"
                  />
                  <ProfileField label="Email" value={profile.email} hint="Cannot be changed" />
                </div>
              )}
            </Card>

            <Card className="p-6 md:p-8 bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl">
              <div className="flex items-start justify-between gap-3 mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-1 h-6 bg-[var(--primary)] rounded-full" />
                  <ScaleIcon className="w-5 h-5 text-[var(--primary)]" />
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
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                      onChange={(e) =>
                        setProfile({ ...profile, weight: parseOptionalNumber(e.target.value) })
                      }
                      placeholder="e.g. 70"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Activity Level
                    </label>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {ACTIVITY_LEVELS.map((level) => {
                        const selected = profile.activity_level === level;
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setProfile({ ...profile, activity_level: level })}
                            className={`text-left px-4 py-3 rounded-xl border-2 transition-all ${
                              selected
                                ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                                : 'border-[var(--card-border)] hover:border-white/30'
                            }`}
                          >
                            <p
                              className={`text-sm font-semibold ${selected ? 'text-white' : 'text-[var(--foreground)]'}`}
                            >
                              {level}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">
                              {ACTIVITY_HINTS[level]}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
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

            <Card className="p-6 md:p-8 bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl">
              <div className="flex items-start justify-between gap-3 mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-1 h-6 bg-[var(--primary)] rounded-full" />
                  <FireIcon className="w-5 h-5 text-[var(--primary)]" />
                  Fitness Goals
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
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Objective
                    </label>
                    <ChoiceChips
                      options={GOALS}
                      value={profile.goal}
                      onChange={(goal) => setProfile({ ...profile, goal })}
                      accent="accent"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Target Weight (kg)"
                      type="number"
                      min={20}
                      max={400}
                      step="0.1"
                      value={profile.target_weight ?? ''}
                      onChange={(e) => {
                        const next = parseOptionalNumber(e.target.value);
                        setProfile({
                          ...profile,
                          target_weight: next === '' ? null : next,
                        });
                      }}
                      placeholder="e.g. 65"
                    />
                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
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
                <div className="grid md:grid-cols-2 gap-4">
                  <ProfileField label="Objective" value={profile.goal} />
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
            </Card>

            <Card className="p-5 bg-gradient-to-br from-[var(--primary)]/10 via-[var(--card-bg)] to-transparent border border-[var(--primary)]/20 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] shrink-0">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold">Need AI calorie targets?</h3>
                  <p className="text-[var(--text-muted)] text-sm mt-0.5">
                    After updating your stats here, open Fitness Hub to regenerate your AI plan.
                  </p>
                </div>
                <Link href="/fitness" className="w-full sm:w-auto shrink-0">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <span className="inline-flex items-center gap-2">
                      Fitness Hub
                      <ArrowRightIcon className="w-4 h-4" />
                    </span>
                  </Button>
                </Link>
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
                Update your weight weekly here — then refresh your AI plan in Fitness Hub if your
                goal changed.
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
    </div>
  );
}
