'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import AvatarUpload from '@/features/userProfile/AvatarUpload';

interface ProfileData {
  username: string;
  full_name: string;
  email: string;
  gender: string;
  age: number | '';
  height: number | '';
  weight: number | '';
  activity_level: string;
  goal: string;
  avatar_url?: string | null;
}

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
  });

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
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const updates = {
        updated_at: new Date().toISOString(),
        full_name: profile.full_name,
        // username is usually immutable or requires check, keeping it read-only for now or simple update
        // gender is editable
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
        {/* Header Profile Section */}
        <div className="relative mb-10 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="relative z-10">
            <AvatarUpload
              uid={user?.id || ''}
              url={profile.avatar_url ?? null}
              isEditing={true}
              onUpload={(url) => {
                setProfile(prev => ({ ...prev, avatar_url: url }));
                supabase.from('profiles').update({ avatar_url: url }).eq('id', user?.id).then();
              }}
              size={140} /* Slightly smaller on mobile default, component handles responsiveness if needed but fixed size is usually safer */
            />
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg">{profile.full_name || 'Your Name'}</h1>
              <p className="text-gray-200 text-base md:text-lg drop-shadow-md">@{profile.username || 'username'}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
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

            <Card className="p-6 md:p-8 bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-[var(--secondary)] rounded-full" />
                Fitness Profile
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Age</label>
                  <Input
                    type="number"
                    value={profile.age}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value === '' ? '' : Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Height (cm)</label>
                  <Input
                    type="number"
                    value={profile.height}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({ ...profile, height: e.target.value === '' ? '' : Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Weight (kg)</label>
                  <Input
                    type="number"
                    value={profile.weight}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({ ...profile, weight: e.target.value === '' ? '' : Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Activity Level</label>
                  <select
                    disabled={!isEditing}
                    value={profile.activity_level}
                    onChange={(e) => setProfile({ ...profile, activity_level: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50 appearance-none"
                  >
                    <option value="Sedentary">Sedentary (Office Job)</option>
                    <option value="Lightly Active">Lightly Active (1-2 days/week)</option>
                    <option value="Moderately Active">Moderately Active (3-5 days/week)</option>
                    <option value="Very Active">Very Active (6+ days/week)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Primary Goal</label>
                  <select
                    disabled={!isEditing}
                    value={profile.goal}
                    onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50 appearance-none"
                  >
                    <option value="Lose Weight">Lose Weight</option>
                    <option value="Maintain Weight">Maintain Weight</option>
                    <option value="Gain Muscle">Gain Muscle</option>
                  </select>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end pt-8">
                  <Button onClick={handleUpdate} isLoading={saving} variant="primary" className="w-full md:w-auto min-w-[200px]">
                    Save Changes
                  </Button>
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl">
              <h4 className="font-bold text-lg mb-4">Your Progress</h4>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Profile Completion</span>
                  <span className="text-[var(--primary)] font-bold">85%</span>
                </div>
                <div className="w-full bg-[var(--input-bg)] rounded-full h-2">
                  <div className="bg-[var(--primary)] h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  Complete your profile to get more accurate AI nutrition recommendations.
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
