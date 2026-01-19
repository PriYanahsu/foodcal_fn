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
import { SparklesIcon } from '@heroicons/react/24/outline';
import { calculateProfileCompletion } from '@/utils/profileCompletion';

export const dynamic = 'force-dynamic';

export default function UserProfile() {
  const supabase = createClient();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    username: '',
    full_name: '',
    email: '',
    gender: '',
    age: '',
    height: '',
    weight: '',
    activity_level: 'Sedentary',
    goal: 'Maintain Weight',
    avatar_url: null,
    target_weight: null,
    target_date: null,
  });
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

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
        setProfile({
          username: data.username || '',
          full_name: data.full_name || '',
          email: user?.email || '',
          gender: data.gender || 'Male',
          age: data.age || '',
          height: data.height || '',
          weight: data.weight || '',
          activity_level: data.activity_level || 'Sedentary',
          goal: data.goal || 'Maintain Weight',
          avatar_url: data.avatar_url,
          target_weight: data.target_weight || null,
          target_date: data.target_date || null,
        });

        // Only show reminder if profile is not 100% complete
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

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const updates = {
        updated_at: new Date().toISOString(),
        full_name: profile.full_name,
        gender: profile.gender,
        age: profile.age === '' ? null : Number(profile.age),
        height: profile.height === '' ? null : Number(profile.height),
        weight: profile.weight === '' ? null : Number(profile.weight),
        activity_level: profile.activity_level,
        goal: profile.goal,
        avatar_url: profile.avatar_url,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);

      if (error) throw error;
      setIsEditing(false);

      // Update reminder state after save
      const newCompletion = calculateProfileCompletion({ ...profile, ...updates });
      if (newCompletion === 100) setShowReminder(false);

    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 pt-10">
      <div className="px-4 md:px-8">
        {/* Completion Reminder Popup */}
        {showReminder && (
          <div className="mb-6 animate-slide-up">
            <div className="bg-gradient-to-r from-[var(--primary)]/20 to-transparent border border-[var(--primary)]/30 p-4 rounded-2xl flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[var(--primary)]/20 text-[var(--primary)]">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Profile Incomplete ({completionPercentage}%)</p>
                  <p className="text-[var(--text-muted)] text-xs">Complete your full profile for 100% accurate AI results.</p>
                </div>
              </div>
              <button
                onClick={() => setShowReminder(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* Header Profile Section */}
        <div className="relative mb-10 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="relative z-10">
            <AvatarUpload
              uid={user?.id || ''}
              url={profile.avatar_url ?? null}
              isEditing={true}
              onUpload={(url) => {
                const newProfile = { ...profile, avatar_url: url };
                setProfile(newProfile);
                supabase.from('profiles').update({ avatar_url: url }).eq('id', user?.id).then();
                if (calculateProfileCompletion(newProfile) === 100) setShowReminder(false);
              }}
              size={140}
            />
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg">{profile.full_name || 'Your Name'}</h1>
              <p className="text-gray-200 text-base md:text-lg drop-shadow-md">@{profile.username || 'username'}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
            {isEditing && (
              <Button
                onClick={handleUpdate}
                disabled={saving}
                className="btn-primary flex-1 md:flex-none"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 md:flex-none border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-[var(--card-border)] text-white shadow-lg"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
            <Button variant="outline" onClick={logout} className="flex-1 md:flex-none text-red-400 border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-red-500/10 shadow-lg">
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Grid - Scrollable on very small screens or grid-cols-2 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-[var(--card-bg)] border border-[var(--card-border)] text-center shadow-lg">
            <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">Age</p>
            <p className="text-xl md:text-2xl font-bold text-[var(--foreground)]">
              {profile.age || '-'} <span className="text-sm text-[var(--text-muted)] font-normal">yrs</span>
            </p>
          </Card>
          <Card className="p-4 bg-[var(--card-bg)] border border-[var(--card-border)] text-center shadow-lg">
            <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">Height</p>
            <p className="text-xl md:text-2xl font-bold text-[var(--foreground)]">
              {profile.height || '-'} <span className="text-sm text-[var(--text-muted)] font-normal">cm</span>
            </p>
          </Card>
          <Card className="p-4 bg-[var(--card-bg)] border border-[var(--card-border)] text-center shadow-lg">
            <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">Weight</p>
            <p className="text-xl md:text-2xl font-bold text-[var(--foreground)]">
              {profile.weight || '-'} <span className="text-sm text-[var(--text-muted)] font-normal">kg</span>
            </p>
          </Card>
          <Card className="p-4 bg-[var(--card-bg)] border border-[var(--card-border)] text-center shadow-lg">
            <p className="text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1">Goal</p>
            <p className="text-base md:text-lg font-bold text-[var(--primary)] truncate">
              {profile.goal}
            </p>
          </Card>
        </div>

        {/* Main Form - Stacked correctly */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-6 md:p-8 bg-[var(--card-bg)] border border-[var(--card-border)] relative overflow-hidden shadow-xl">
              {/* Decorative background removed for cleaner theme matching if requested, or kept subtle */}
              <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" /></svg>
              </div>

              <div className="relative">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-[var(--primary)] rounded-full" />
                  Account Details
                </h3>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Full Name</label>
                      <Input
                        value={profile.full_name}
                        disabled={!isEditing}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Username</label>
                      <Input
                        value={profile.username}
                        disabled={true}
                        className="opacity-60 cursor-not-allowed"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Email</label>
                      <Input
                        value={profile.email}
                        disabled={true}
                        className="opacity-60 cursor-not-allowed"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Gender</label>
                      <select
                        disabled={!isEditing}
                        value={profile.gender}
                        onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                        className="w-full px-4 py-2 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50 appearance-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Compact Fitness Hub Navigation Card */}
            <Card className="p-6 md:p-8 bg-gradient-to-br from-[var(--primary)]/10 via-[var(--card-bg)] to-transparent border border-[var(--primary)]/20 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                <SparklesIcon className="w-24 h-24 text-[var(--primary)]" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] shadow-[0_0_10px_rgba(0,255,136,0.1)]">
                  <SparklesIcon className="w-8 h-8" />
                </div>

                <div className="flex-1 text-center md:text-left space-y-1">
                  <h3 className="text-xl font-black tracking-tight">Fitness <span className="text-[var(--primary)]">Hub</span></h3>
                  <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-sm">
                    AI targets and tracking have moved to a dedicated space.
                  </p>
                </div>

                <Link href="/fitness" className="w-full md:w-auto">
                  <Button variant="primary" className="w-full md:w-auto px-6 py-2.5 text-sm shadow-[0_0_20px_rgba(0,255,136,0.15)]">
                    Enter Hub
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl">
              <h4 className="font-bold text-lg mb-4">Your Progress</h4>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Profile Completion</span>
                  <span className="text-[var(--primary)] font-bold">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-[var(--input-bg)] rounded-full h-2">
                  <div
                    className="bg-[var(--primary)] h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  {completionPercentage < 100
                    ? "Complete your profile to get more accurate AI nutrition recommendations."
                    : "Your profile is fully optimized! AI coaching is at peak accuracy."}
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-[var(--input-bg)] to-[var(--card-bg)] border border-[var(--card-border)] shadow-xl">
              <h4 className="font-bold text-lg mb-2 text-purple-400">Pro Tip</h4>
              <p className="text-sm text-[var(--text-muted)]">
                Updating your weight weekly helps the AI adjust your calorie goals for better results.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
